import { ValidationResult, SupportedCoin } from './types';
import { SUPPORTED_COINS } from './constants';
import {
  BitcoinValidator,
  EVMValidator,
  TronValidator,
  SolanaValidator,
  RippleValidator,
  CardanoValidator,
  PolkadotValidator,
  CosmosValidator
} from './validators';

// Validator 인스턴스 캐싱
const validatorCache = new Map<string, any>();

/**
 * 코인에 맞는 Validator 인스턴스 가져오기
 */
export function getValidator(coin: string): any {
  if (validatorCache.has(coin)) {
    return validatorCache.get(coin);
  }
  
  const coinInfo = SUPPORTED_COINS[coin as SupportedCoin];
  if (!coinInfo) {
    return null;
  }
  
  let validator: any;
  
  switch (coinInfo.group) {
    case 'BITCOIN':
      validator = new BitcoinValidator(coin as SupportedCoin);
      break;
    case 'EVM':
      validator = new EVMValidator();
      break;
    case 'UNIQUE':
      switch (coin) {
        case 'TRX':
          validator = new TronValidator();
          break;
        case 'SOL':
          validator = new SolanaValidator();
          break;
        case 'XRP':
          validator = new RippleValidator();
          break;
        case 'ADA':
          validator = new CardanoValidator();
          break;
        case 'DOT':
          validator = new PolkadotValidator();
          break;
        case 'ATOM':
          validator = new CosmosValidator();
          break;
        default:
          return null;
      }
      break;
    case 'COSMOS':
      validator = new CosmosValidator();
      break;
    default:
      return null;
  }
  
  validatorCache.set(coin, validator);
  return validator;
}

/**
 * 주소가 특정 코인에 유효한지 검증
 * @param address - 검증할 주소
 * @param coin - 코인 심볼 (BTC, ETH, KAIA 등)
 * @returns 검증 결과
 */
export function validate(address: string, coin: string): ValidationResult {
  // 입력 검증
  if (!address || typeof address !== 'string') {
    return {
      valid: false,
      message: 'Address is required and must be a string'
    };
  }
  
  if (!coin || typeof coin !== 'string') {
    return {
      valid: false,
      message: 'Coin symbol is required and must be a string'
    };
  }
  
  // 코인 심볼 대문자로 정규화
  const normalizedCoin = coin.toUpperCase();
  
  // 지원하지 않는 코인 체크
  if (!SUPPORTED_COINS[normalizedCoin as SupportedCoin]) {
    return {
      valid: false,
      message: `Unsupported coin: ${coin}`
    };
  }
  
  // Validator 가져오기
  const validator = getValidator(normalizedCoin);
  if (!validator) {
    return {
      valid: false,
      message: `No validator available for coin: ${coin}`
    };
  }
  
  // 주소 검증
  try {
    return validator.validate(address.trim());
  } catch (error) {
    return {
      valid: false,
      message: error instanceof Error ? error.message : 'Validation error'
    };
  }
}