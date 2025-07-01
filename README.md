# BlockKit - Universal Crypto Address Validator

The most accurate and lightweight crypto address validator with zero dependencies.

[![npm version](https://img.shields.io/npm/v/@rzet/blockkit)](https://www.npmjs.com/package/@rzet/blockkit)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/@rzet/blockkit)](https://bundlephobia.com/package/@rzet/blockkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- ✅ **Zero Dependencies** - No external libraries required
- ✅ **Lightweight** - Only 2-3KB per chain
- ✅ **TypeScript Support** - Full type definitions included
- ✅ **Comprehensive Validation** - Checksum, format, and pattern validation
- ✅ **Auto-Detection** - Automatically detect coin type from address
- ✅ **18 Blockchains** - Support for major cryptocurrencies

## Installation

```bash
npm install @rzet/blockkit
```

or

```bash
yarn add @rzet/blockkit
```

## Quick Start

```javascript
import { validate, detect, toChecksumAddress } from '@rzet/blockkit';

// Validate an address
const result = validate('0x742d35cc6634c0532925a3b844bc9e7595f1e6c0', 'ETH');
console.log(result); 
// { 
//   valid: true, 
//   metadata: { 
//     type: 'account', 
//     checksum: false,
//     checksumValid: false,
//     normalizedAddress: '0x742d35cc6634c0532925a3B844BC9e7595F1e6c0'
//   } 
// }

// Auto-detect coin type
const detection = detect('TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9');
console.log(detection); 
// { 
//   possibleCoins: [{ coin: 'TRX', confidence: 1.0 }],
//   bestGuess: 'TRX',
//   group: 'UNIQUE'
// }

// Apply EVM checksum
const checksum = toChecksumAddress('0x742d35cc6634c0532925a3b844bc9e7595f1e6c0');
console.log(checksum); // '0x742d35cc6634c0532925a3B844BC9e7595F1e6c0'
```

## Supported Blockchains

| Blockchain | Symbol | Example Address |
|------------|--------|-----------------|
| Bitcoin | BTC | `bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh` |
| Bitcoin Cash | BCH | `bitcoincash:qpm2qsznhks23z7629mms6s4cwef74vcwvy22gdx6a` |
| Litecoin | LTC | `LUWPbpM43E2p7ZSh8cyTBEkvpHmr3cB8Ez` |
| Ethereum | ETH | `0x742d35cc6634c0532925a3B844BC9e7595F1e6c0` |
| BNB Smart Chain | BNB | `0x742d35cc6634c0532925a3B844BC9e7595F1e6c0` |
| Polygon | MATIC | `0x742d35cc6634c0532925a3B844BC9e7595F1e6c0` |
| Avalanche | AVAX | `0x742d35cc6634c0532925a3B844BC9e7595F1e6c0` |
| Arbitrum | ARB | `0x742d35cc6634c0532925a3B844BC9e7595F1e6c0` |
| Optimism | OP | `0x742d35cc6634c0532925a3B844BC9e7595F1e6c0` |
| Kaia | KAIA | `0x742d35cc6634c0532925a3B844BC9e7595F1e6c0` |
| Fantom | FTM | `0x742d35cc6634c0532925a3B844BC9e7595F1e6c0` |
| Tron | TRX | `TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9` |
| Solana | SOL | `7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU` |
| Ripple | XRP | `rEb8TK3gBgk5auZkwc6sHnwrGVJH8DuaLh` |
| Cardano | ADA | `addr1qx2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3n0d3vllmyqwsx5wktcd8cc3sq835lu7drv2xwl2wywfgse35a3x` |
| Polkadot | DOT | `15oF4uVJwmo4TdGW7VfQxNLavjCXviqxT9S1MgbjMNHr6Sp5` |
| Cosmos | ATOM | `cosmos1vx8knpllrj7n963p9ttd80w47kpacrhuts497x` |

> **Note**: EVM-compatible chains (ETH, BNB, MATIC, AVAX, ARB, OP, KAIA, FTM) share the same address format. An address valid for one EVM chain is valid for all EVM chains.

## API Reference

### validate(address: string, coin: string): ValidationResult

Validates a cryptocurrency address for a specific coin.

```typescript
interface ValidationResult {
  valid: boolean;
  message?: string;
  warnings?: string[];
  metadata?: {
    type?: string;        // Address type (p2pkh, p2sh, account, etc.)
    checksum?: boolean;   // Whether address has checksum
    checksumValid?: boolean;  // Whether checksum is valid
    network?: string;     // Network type (mainnet, testnet)
    normalizedAddress?: string;  // Address with correct checksum
  };
}
```

**Example:**
```javascript
const result = validate('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', 'BTC');
// { valid: true, metadata: { type: 'p2pkh', checksum: true, network: 'mainnet' } }
```

### detect(address: string): DetectionResult

Automatically detects possible cryptocurrencies for a given address.

```typescript
interface DetectionResult {
  possibleCoins: CoinPossibility[];
  bestGuess?: string;
  group?: string;
}

interface CoinPossibility {
  coin: string;
  confidence: number;  // 0.0 to 1.0
  type?: string;
}
```

**Example:**
```javascript
const detection = detect('bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh');
// { 
//   possibleCoins: [{ coin: 'BTC', confidence: 1.0, type: 'p2wpkh' }],
//   bestGuess: 'BTC',
//   group: 'BITCOIN'
// }
```

### toChecksumAddress(address: string): string

Applies EIP-55 checksum to an Ethereum address.

**Example:**
```javascript
const checksummed = toChecksumAddress('0x742d35cc6634c0532925a3b844bc9e7595f1e6c0');
// Returns: '0x742d35cc6634c0532925a3B844BC9e7595F1e6c0'
```

### normalize(address: string, coin?: string): string

Normalizes an address (removes whitespace, applies checksum for EVM chains, converts to lowercase for Bech32).

**Example:**
```javascript
normalize('  0x742d35cc6634c0532925a3b844bc9e7595f1e6c0  ');
// Returns: '0x742d35cc6634c0532925a3B844BC9e7595F1e6c0'

normalize('BC1QXY2KGDYGJRSQTZQ2N0YRF2493P83KKFJHX0WLH');
// Returns: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'
```

### getSupportedCoins(): string[]

Returns an array of all supported coin symbols.

**Example:**
```javascript
const coins = getSupportedCoins();
// ['BTC', 'ETH', 'BNB', 'MATIC', ...]
```

### getCoinInfo(coin: string): CoinInfo | null

Returns detailed information about a specific cryptocurrency.

```typescript
interface CoinInfo {
  name: string;
  group: string;
}
```

**Example:**
```javascript
const info = getCoinInfo('BTC');
// { name: 'Bitcoin', group: 'BITCOIN' }
```

## Advanced Usage

### Handling Validation Results

```javascript
const result = validate(address, 'ETH');

if (result.valid) {
  if (result.metadata?.checksumValid === false) {
    console.warn('Valid address but incorrect checksum');
    console.log('Correct checksum:', result.metadata.normalizedAddress);
  }
} else {
  console.error('Invalid address:', result.message);
}
```

### Working with Multi-Chain Addresses

```javascript
// Check if address is valid for any EVM chain
const evmCoins = ['ETH', 'BNB', 'MATIC', 'AVAX', 'ARB', 'OP', 'KAIA', 'FTM'];
const isValidEVM = evmCoins.some(coin => validate(address, coin).valid);

// Detect all possible coins for an address
const detection = detect(address);
if (detection.group === 'EVM') {
  console.log('This is an EVM address valid for:', evmCoins.join(', '));
}
```

## Performance

BlockKit is designed to be extremely lightweight:

- **Zero dependencies** - No external libraries
- **Tree-shakeable** - Import only what you need
- **Small bundle size** - ~2-3KB per blockchain
- **Fast validation** - Pattern matching + checksum verification

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

**RZet, Inc.**

- Website: [https://rzet.com](https://rzet.com)
- GitHub: [@rzet-inc](https://github.com/rzet-inc)
- NPM: [@rzet](https://www.npmjs.com/org/rzet)

## Acknowledgments

- Bitcoin address validation based on [BIP-173](https://github.com/bitcoin/bips/blob/master/bip-0173.mediawiki)
- Ethereum checksum implementation follows [EIP-55](https://eips.ethereum.org/EIPS/eip-55)
- Cosmos address format based on [Bech32](https://github.com/cosmos/cosmos-sdk/blob/master/docs/architecture/adr-028-public-key-addresses.md)

---

Made with ❤️ by RZet, Inc.