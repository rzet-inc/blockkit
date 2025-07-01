import { CoinInfo, SupportedCoin } from './types';

export const SUPPORTED_COINS: Record<SupportedCoin, CoinInfo> = {
  // Bitcoin 계열
  'BTC': { name: 'Bitcoin', group: 'BITCOIN' },
  'BCH': { name: 'Bitcoin Cash', group: 'BITCOIN' },
  'LTC': { name: 'Litecoin', group: 'BITCOIN' },
  
  // EVM 계열 (Ethereum 호환)
  'ETH': { name: 'Ethereum', group: 'EVM' },
  'BNB': { name: 'BNB Smart Chain', group: 'EVM' },
  'MATIC': { name: 'Polygon', group: 'EVM' },
  'AVAX': { name: 'Avalanche', group: 'EVM' },
  'ARB': { name: 'Arbitrum', group: 'EVM' },
  'OP': { name: 'Optimism', group: 'EVM' },
  'KAIA': { name: 'Kaia', group: 'EVM' },
  'FTM': { name: 'Fantom', group: 'EVM' },
  
  // 독자 형식
  'TRX': { name: 'Tron', group: 'UNIQUE' },
  'SOL': { name: 'Solana', group: 'UNIQUE' },
  'XRP': { name: 'Ripple', group: 'UNIQUE' },
  'ADA': { name: 'Cardano', group: 'UNIQUE' },
  'DOT': { name: 'Polkadot', group: 'UNIQUE' },
  'ATOM': { name: 'Cosmos', group: 'COSMOS' }
};

// 테스트용 유효한 주소 예시
export const TEST_ADDRESSES: Record<SupportedCoin, string> = {
  'BTC': 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
  'BCH': 'bitcoincash:qpm2qsznhks23z7629mms6s4cwef74vcwvy22gdx6a',
  'LTC': 'ltc1qw508d6qejxtdg4y5r3zarvary0c5xw7kgmn4n9',
  'ETH': '0x742d35Cc6634C0532925a3b844Bc9e7595f1e6C0',
  'BNB': '0x742d35Cc6634C0532925a3b844Bc9e7595f1e6C0',
  'MATIC': '0x742d35Cc6634C0532925a3b844Bc9e7595f1e6C0',
  'AVAX': '0x742d35Cc6634C0532925a3b844Bc9e7595f1e6C0',
  'ARB': '0x742d35Cc6634C0532925a3b844Bc9e7595f1e6C0',
  'OP': '0x742d35Cc6634C0532925a3b844Bc9e7595f1e6C0',
  'KAIA': '0x742d35Cc6634C0532925a3b844Bc9e7595f1e6C0',
  'FTM': '0x742d35Cc6634C0532925a3b844Bc9e7595f1e6C0',
  'TRX': 'TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9',
  'SOL': '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
  'XRP': 'rEb8TK3gBgk5auZkwc6sHnwrGVJH8DuaLh',
  'ADA': 'addr1qx2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3n0d3vllmyqwsx5wktcd8cc3sq835lu7drv2xwl2wywfgse35a3x',
  'DOT': '15oF4uVJwmo4TdGW7VfQxNLavjCXviqxT9S1MgbjMNHr6Sp5',
  'ATOM': 'cosmos1vx8knpllrj7n963p9ttd80w47kpacrhuts497x'
};

// Bitcoin 주소 prefixes
export const BITCOIN_PREFIXES = {
  BTC: {
    mainnet: {
      p2pkh: [0x00],      // 1...
      p2sh: [0x05],       // 3...
      bech32: 'bc1',      // bc1...
      taproot: 'bc1p'     // bc1p...
    }
  },
  LTC: {
    mainnet: {
      p2pkh: [0x30],      // L...
      p2sh: [0x32],       // M...
      p2sh2: [0x05],      // 3... (deprecated)
      bech32: 'ltc1'      // ltc1...
    }
  }
};

// Base58 알파벳
export const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

// Bech32 알파벳
export const BECH32_ALPHABET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';