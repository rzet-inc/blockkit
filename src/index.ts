// Main APIs
export { validate } from './validate';
export { detect } from './detect';
export { 
  normalize, 
  toChecksumAddress,
  getSupportedCoins, 
  getCoinInfo,
  getCoinsByGroup,
  isAddressInGroup
} from './utils';

// Types
export type {
  ValidationResult,
  DetectionResult,
  CoinPossibility,
  CoinInfo,
  SupportedCoin
} from './types';

// Constants
export { SUPPORTED_COINS } from './constants';