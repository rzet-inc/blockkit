import { BaseValidator } from './base';
import { ValidationResult } from '../types';
import { base58Decode } from '../utils/base58';

export class SolanaValidator extends BaseValidator {
  private pattern = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
  
  isValidPattern(address: string): boolean {
    return this.pattern.test(address);
  }
  
  validate(address: string): ValidationResult {
    if (!address) {
      return this.invalidResult('Address is required');
    }
    
    // 기본 형식 검증
    if (!this.isValidPattern(address)) {
      return this.invalidResult('Invalid Solana address format');
    }
    
    try {
      // Base58 디코딩 (체크섬 없음)
      const decoded = base58Decode(address);
      
      // Solana 주소는 32바이트 (Ed25519 공개키)
      if (decoded.length !== 32) {
        return this.invalidResult('Invalid address length: Solana addresses must be 32 bytes');
      }
      
      return this.validResult({
        type: 'account',
        checksum: false, // Solana는 체크섬 없음
        network: 'mainnet'
      });
    } catch (error) {
      return this.invalidResult('Invalid Base58 encoding');
    }
  }
}