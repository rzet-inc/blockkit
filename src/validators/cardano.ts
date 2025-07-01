import { BaseValidator } from './base';
import { ValidationResult } from '../types';
import { bech32Decode } from '../utils/bech32';

export class CardanoValidator extends BaseValidator {
  private patterns = {
    // Shelley era addresses
    mainnet: /^addr1[a-z0-9]{50,}$/,
    testnet: /^addr_test1[a-z0-9]{50,}$/,
    // Byron era addresses (legacy)
    byron: /^(Ae2|DdzFF)[a-km-zA-HJ-NP-Z1-9]{51,}$/
  };
  
  isValidPattern(address: string): boolean {
    return Object.values(this.patterns).some(pattern => pattern.test(address));
  }
  
  validate(address: string): ValidationResult {
    if (!address) {
      return this.invalidResult('Address is required');
    }
    
    // Byron era (legacy) addresses
    if (this.patterns.byron.test(address)) {
      return this.validResult({
        type: 'byron',
        checksum: true,
        network: 'mainnet'
      });
    }
    
    // Shelley era addresses (Bech32)
    if (address.startsWith('addr1') || address.startsWith('addr_test1')) {
      try {
        const decoded = bech32Decode(address, 'bech32');
        if (!decoded) {
          return this.invalidResult('Invalid Bech32 encoding');
        }
        
        const { hrp } = decoded;
        const network = hrp === 'addr' ? 'mainnet' : 'testnet';
        
        return this.validResult({
          type: 'shelley',
          checksum: true,
          network
        });
      } catch (error) {
        return this.invalidResult('Invalid Cardano Shelley address');
      }
    }
    
    return this.invalidResult('Invalid Cardano address format');
  }
}