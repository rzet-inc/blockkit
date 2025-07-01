import { BaseValidator } from './base';
import { ValidationResult } from '../types';
import { base58CheckDecode } from '../utils/base58';

export class TronValidator extends BaseValidator {
  private pattern = /^T[a-km-zA-HJ-NP-Z1-9]{33}$/;
  
  isValidPattern(address: string): boolean {
    return this.pattern.test(address);
  }
  
  validate(address: string): ValidationResult {
    if (!address) {
      return this.invalidResult('Address is required');
    }
    
    // 기본 형식 검증
    if (!this.isValidPattern(address)) {
      return this.invalidResult('Invalid Tron address format');
    }
    
    try {
      // Base58Check 디코딩
      const decoded = base58CheckDecode(address);
      
      if (decoded.length !== 21) {
        return this.invalidResult('Invalid address length');
      }
      
      // Tron 주소는 0x41로 시작
      if (decoded[0] !== 0x41) {
        return this.invalidResult('Invalid Tron address prefix');
      }
      
      return this.validResult({
        type: 'account',
        checksum: true,
        network: 'mainnet'
      });
    } catch (error) {
      return this.invalidResult('Invalid Base58 checksum');
    }
  }
}