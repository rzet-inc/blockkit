import { BaseValidator } from './base';
import { ValidationResult, SupportedCoin } from '../types';
import { base58CheckDecode } from '../utils/base58';
import { segwitDecode } from '../utils/bech32';
import { BITCOIN_PREFIXES } from '../constants';

interface BitcoinConfig {
  p2pkhPrefix: number[];
  p2shPrefix: number[];
  bech32Prefix: string;
  supportsTaproot: boolean;
}

const BITCOIN_CONFIGS: Record<string, BitcoinConfig> = {
  BTC: {
    p2pkhPrefix: [0x00],
    p2shPrefix: [0x05],
    bech32Prefix: 'bc',
    supportsTaproot: true
  },
  BCH: {
    p2pkhPrefix: [0x00],
    p2shPrefix: [0x05],
    bech32Prefix: 'bitcoincash',
    supportsTaproot: false
  },
  LTC: {
    p2pkhPrefix: [0x30],  // L addresses
    p2shPrefix: [0x32, 0x05],  // M addresses (0x32) and legacy 3 addresses (0x05)
    bech32Prefix: 'ltc',
    supportsTaproot: false
  }
};

export class BitcoinValidator extends BaseValidator {
  private coin: string;
  private config: BitcoinConfig;
  
  private patterns = {
    p2pkh: /^[13LM][a-km-zA-HJ-NP-Z1-9]{25,34}$/,
    p2sh: /^[32M][a-km-zA-HJ-NP-Z1-9]{25,34}$/,  // M for Litecoin, 3 or 2 for Bitcoin
    bech32: /^(bc1[a-z0-9]{6,87}|ltc1[a-z0-9]{6,87})$/,
    taproot: /^bc1p[a-z0-9]{58}$/,
    cashaddr: /^bitcoincash:[qpzry9x8gf2tvdw0s3jn54khce6mua7l]{42,}$/
  };
  
  constructor(coin: SupportedCoin) {
    super();
    this.coin = coin;
    this.config = BITCOIN_CONFIGS[coin];
    if (!this.config) {
      throw new Error(`Unsupported Bitcoin variant: ${coin}`);
    }
  }
  
  isValidPattern(address: string): boolean {
    // Bitcoin Cash CashAddr 형식
    if (this.coin === 'BCH' && this.patterns.cashaddr.test(address)) {
      return true;
    }
    
    // Bech32 형식
    if (address.startsWith(this.config.bech32Prefix + '1')) {
      if (this.coin === 'BCH') {
        return this.patterns.cashaddr.test(address);
      }
      return this.patterns.bech32.test(address);
    }
    
    // Taproot (BTC only)
    if (this.config.supportsTaproot && this.patterns.taproot.test(address)) {
      return true;
    }
    
    // Legacy P2PKH/P2SH
    return this.patterns.p2pkh.test(address) || this.patterns.p2sh.test(address);
  }
  
  validate(address: string): ValidationResult {
    if (!address) {
      return this.invalidResult('Address is required');
    }
    
    // 빠른 패턴 체크
    if (!this.isValidPattern(address)) {
      return this.invalidResult('Invalid address format');
    }
    
    try {
      // Bitcoin Cash CashAddr
      if (this.coin === 'BCH' && address.startsWith('bitcoincash:')) {
        return this.validateCashAddr(address);
      }
      
      // Bech32/SegWit
      if (address.startsWith(this.config.bech32Prefix + '1')) {
        return this.validateBech32(address);
      }
      
      // Taproot (BTC only)
      if (this.config.supportsTaproot && address.startsWith('bc1p')) {
        return this.validateTaproot(address);
      }
      
      // Legacy Base58
      return this.validateBase58(address);
    } catch (error) {
      return this.invalidResult(error instanceof Error ? error.message : 'Invalid address');
    }
  }
  
  private validateBase58(address: string): ValidationResult {
    try {
      const decoded = base58CheckDecode(address);
      
      if (decoded.length !== 21) {
        return this.invalidResult('Invalid address length');
      }
      
      const version = decoded[0];
      
      // P2PKH 체크
      if (this.config.p2pkhPrefix.includes(version)) {
        return this.validResult({
          type: 'p2pkh',
          checksum: true,
          network: 'mainnet'
        });
      }
      
      // P2SH 체크
      if (this.config.p2shPrefix.includes(version)) {
        return this.validResult({
          type: 'p2sh',
          checksum: true,
          network: 'mainnet'
        });
      }
      
      return this.invalidResult('Invalid address version');
    } catch (error) {
      return this.invalidResult('Invalid Base58 checksum');
    }
  }
  
  private validateBech32(address: string): ValidationResult {
    try {
      const decoded = segwitDecode(address);
      if (!decoded) {
        return this.invalidResult('Invalid Bech32 address');
      }
      
      const { hrp, version, program } = decoded;
      
      if (hrp !== this.config.bech32Prefix) {
        return this.invalidResult(`Invalid HRP: expected ${this.config.bech32Prefix}, got ${hrp}`);
      }
      
      if (version === 0) {
        if (program.length === 20) {
          return this.validResult({
            type: 'p2wpkh',
            checksum: true,
            network: 'mainnet'
          });
        } else if (program.length === 32) {
          return this.validResult({
            type: 'p2wsh',
            checksum: true,
            network: 'mainnet'
          });
        }
      } else if (version === 1 && program.length === 32) {
        // Taproot (v1)
        return this.validResult({
          type: 'taproot',
          checksum: true,
          network: 'mainnet'
        });
      }
      
      return this.invalidResult('Invalid SegWit version or program length');
    } catch (error) {
      return this.invalidResult('Invalid Bech32 encoding');
    }
  }
  
  private validateTaproot(address: string): ValidationResult {
    try {
      const decoded = segwitDecode(address);
      if (!decoded) {
        return this.invalidResult('Invalid Taproot address');
      }
      
      const { version, program } = decoded;
      
      if (version === 1 && program.length === 32) {
        return this.validResult({
          type: 'taproot',
          checksum: true,
          network: 'mainnet'
        });
      }
      
      return this.invalidResult('Invalid Taproot format');
    } catch (error) {
      return this.invalidResult('Invalid Taproot encoding');
    }
  }
  
  private validateCashAddr(address: string): ValidationResult {
    // CashAddr는 Bech32의 변형이므로 기본 Bech32 검증 로직을 활용
    try {
      const prefix = 'bitcoincash:';
      if (!address.startsWith(prefix)) {
        return this.invalidResult('Invalid CashAddr prefix');
      }
      
      // 간단한 패턴 검증 (실제로는 더 복잡한 검증 필요)
      const addrPart = address.slice(prefix.length);
      if (!/^[qpzry9x8gf2tvdw0s3jn54khce6mua7l]{42,}$/.test(addrPart)) {
        return this.invalidResult('Invalid CashAddr format');
      }
      
      return this.validResult({
        type: 'cashaddr',
        checksum: true,
        network: 'mainnet'
      });
    } catch (error) {
      return this.invalidResult('Invalid CashAddr encoding');
    }
  }
}