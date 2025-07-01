import { BaseValidator } from './base';
import { ValidationResult } from '../types';
import { keccak256, toHex } from '../utils/keccak256';

export class EVMValidator extends BaseValidator {
  private pattern = /^0x[a-fA-F0-9]{40}$/;
  
  isValidPattern(address: string): boolean {
    return this.pattern.test(address);
  }
  
  validate(address: string): ValidationResult {
    if (!address) {
      return this.invalidResult('Address is required');
    }
    
    // 기본 형식 검증
    if (!this.isValidPattern(address)) {
      return this.invalidResult('Invalid EVM address format');
    }
    
    // 체크섬 검증
    const hasUpperCase = /[A-F]/.test(address);
    const hasLowerCase = /[a-f]/.test(address.slice(2)); // 0x 제외
    
    const normalizedAddress = this.toChecksumAddress(address);
    
    if (hasUpperCase && hasLowerCase) {
      // 혼합된 대소문자 = 체크섬 주소
      const isValidChecksum = this.verifyChecksum(address);
      
      if (!isValidChecksum) {
        return this.createResult(true, 'Valid address format (checksum mismatch)', {
          type: 'account',
          checksum: false,
          checksumValid: false,
          network: 'mainnet',
          normalizedAddress
        });
      }
      
      return this.validResult({
        type: 'account',
        checksum: true,
        checksumValid: true,
        network: 'mainnet',
        normalizedAddress
      });
    }
    
    // 모두 소문자 또는 모두 대문자 = 체크섬 없는 유효한 주소
    return this.createResult(true, undefined, {
      type: 'account',
      checksum: false,
      network: 'mainnet',
      normalizedAddress
    });
  }
  
  normalize(address: string): string {
    if (!this.isValidPattern(address)) {
      return address;
    }
    
    // EIP-55 체크섬 적용
    return this.toChecksumAddress(address);
  }
  
  private verifyChecksum(address: string): boolean {
    const checksumAddress = this.toChecksumAddress(address);
    return address === checksumAddress;
  }
  
  private toChecksumAddress(address: string): string {
    // 0x 제거하고 소문자로 변환
    const addr = address.toLowerCase().slice(2);
    
    // Keccak256 해시 계산
    const hash = keccak256(new TextEncoder().encode(addr));
    const hashHex = toHex(hash);
    
    // 체크섬 적용
    let checksumAddress = '0x';
    for (let i = 0; i < addr.length; i++) {
      const char = addr[i];
      const hashByte = parseInt(hashHex[i], 16);
      
      if (/[a-f]/.test(char)) {
        // 문자인 경우: 해시값이 8 이상이면 대문자
        if (hashByte >= 8) {
          checksumAddress += char.toUpperCase();
        } else {
          checksumAddress += char;
        }
      } else {
        // 숫자인 경우: 그대로 유지
        checksumAddress += char;
      }
    }
    
    return checksumAddress;
  }
}