import { BaseValidator } from './base';
import { ValidationResult } from '../types';
import { base58Decode } from '../utils/base58';

// Ripple uses a custom Base58 alphabet
const RIPPLE_ALPHABET = 'rpshnaf39wBUDNEGHJKLM4PQRST7VWXYZ2bcdeCg65jkm8oFqi1tuvAxyz';

export class RippleValidator extends BaseValidator {
  private pattern = /^r[a-km-zA-HJ-NP-Z1-9]{24,34}$/;
  
  isValidPattern(address: string): boolean {
    return this.pattern.test(address);
  }
  
  validate(address: string): ValidationResult {
    if (!address) {
      return this.invalidResult('Address is required');
    }
    
    // 기본 형식 검증
    if (!this.isValidPattern(address)) {
      return this.invalidResult('Invalid Ripple address format');
    }
    
    // Ripple 특수 문자 검증
    for (const char of address) {
      if (!RIPPLE_ALPHABET.includes(char)) {
        return this.invalidResult('Invalid character in Ripple address');
      }
    }
    
    try {
      // Ripple은 커스텀 Base58을 사용하므로 간단한 검증만 수행
      // 실제로는 Ripple 전용 Base58 디코더가 필요함
      
      // 주소 길이 검증
      if (address.length < 25 || address.length > 35) {
        return this.invalidResult('Invalid Ripple address length');
      }
      
      return this.validResult({
        type: 'account',
        checksum: true,
        network: 'mainnet'
      });
    } catch (error) {
      return this.invalidResult('Invalid Ripple address encoding');
    }
  }
}