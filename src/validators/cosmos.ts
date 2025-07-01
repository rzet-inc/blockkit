import { BaseValidator } from './base';
import { ValidationResult } from '../types';
import { bech32Decode } from '../utils/bech32';

export class CosmosValidator extends BaseValidator {
  private patterns = {
    cosmos: /^cosmos1[a-z0-9]{38,59}$/,
    cosmosvaloper: /^cosmosvaloper1[a-z0-9]{38,59}$/,
    cosmosvalcons: /^cosmosvalcons1[a-z0-9]{58,100}$/  // consensus 주소는 더 길 수 있음
  };
  
  isValidPattern(address: string): boolean {
    return Object.values(this.patterns).some(pattern => pattern.test(address));
  }
  
  validate(address: string): ValidationResult {
    if (!address) {
      return this.invalidResult('Address is required');
    }
    
    // 기본 형식 검증
    if (!this.isValidPattern(address)) {
      return this.invalidResult('Invalid Cosmos address format');
    }
    
    try {
      // Bech32 디코딩 (Cosmos는 기본 bech32 사용)
      const decoded = bech32Decode(address, 'bech32');
      if (!decoded) {
        return this.invalidResult('Invalid Bech32 encoding');
      }
      
      const { hrp, data } = decoded;
      
      // HRP 검증
      let addressType = 'account';
      if (hrp === 'cosmos') {
        addressType = 'account';
      } else if (hrp === 'cosmosvaloper') {
        addressType = 'validator';
      } else if (hrp === 'cosmosvalcons') {
        addressType = 'consensus';
      } else {
        return this.invalidResult('Invalid Cosmos HRP prefix');
      }
      
      // 데이터 길이 검증
      // Bech32 5-bit encoding에서 20 바이트는 32개의 5-bit 그룹
      if (data.length < 32) {
        return this.invalidResult('Invalid address data length');
      }
      
      return this.validResult({
        type: addressType,
        checksum: true,
        network: 'mainnet'
      });
    } catch (error) {
      return this.invalidResult('Invalid Cosmos address encoding');
    }
  }
}