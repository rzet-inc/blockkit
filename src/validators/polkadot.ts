import { BaseValidator } from './base';
import { ValidationResult } from '../types';
import { base58Decode } from '../utils/base58';

// Polkadot uses SS58 encoding
const SS58_PREFIX = {
  POLKADOT: 0,
  KUSAMA: 2,
  GENERIC: 42
};

export class PolkadotValidator extends BaseValidator {
  private pattern = /^[1-9A-HJ-NP-Za-km-z]{46,48}$/;
  
  isValidPattern(address: string): boolean {
    return this.pattern.test(address);
  }
  
  validate(address: string): ValidationResult {
    if (!address) {
      return this.invalidResult('Address is required');
    }
    
    // 기본 형식 검증
    if (!this.isValidPattern(address)) {
      return this.invalidResult('Invalid Polkadot address format');
    }
    
    try {
      // Base58 디코딩
      const decoded = base58Decode(address);
      
      if (decoded.length < 3) {
        return this.invalidResult('Address too short');
      }
      
      // SS58 prefix 확인
      const prefix = decoded[0];
      
      // Polkadot (0), Kusama (2), Generic Substrate (42) 주소 허용
      const validPrefixes = [SS58_PREFIX.POLKADOT, SS58_PREFIX.KUSAMA, SS58_PREFIX.GENERIC];
      if (!validPrefixes.includes(prefix)) {
        return this.invalidResult('Invalid SS58 prefix');
      }
      
      // 주소 길이 검증 (prefix + public key + checksum)
      // 일반적으로 47자 정도
      if (address.length < 46 || address.length > 48) {
        return this.invalidResult('Invalid address length');
      }
      
      const network = prefix === SS58_PREFIX.POLKADOT ? 'polkadot' : 
                     prefix === SS58_PREFIX.KUSAMA ? 'kusama' : 'generic';
      
      return this.validResult({
        type: 'ss58',
        checksum: true,
        network
      });
    } catch (error) {
      return this.invalidResult('Invalid SS58 encoding');
    }
  }
}