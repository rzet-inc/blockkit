export interface ValidationResult {
  valid: boolean;
  message?: string;
  warnings?: string[];
  metadata?: {
    type?: string;
    checksum?: boolean;
    checksumValid?: boolean;
    network?: string;
    normalizedAddress?: string;
  };
}

export interface DetectionResult {
  possibleCoins: CoinPossibility[];
  bestGuess?: string;
  group?: string;
}

export interface CoinPossibility {
  coin: string;
  confidence: number;
  type?: string;
}

export interface CoinInfo {
  name: string;
  group: 'BITCOIN' | 'EVM' | 'UNIQUE' | 'COSMOS';
}

export type SupportedCoin = 
  | 'BTC' | 'BCH' | 'LTC'
  | 'ETH' | 'BNB' | 'MATIC' | 'AVAX' | 'ARB' | 'OP' | 'KAIA' | 'FTM'
  | 'TRX' | 'SOL' | 'XRP' | 'ADA' | 'DOT' | 'ATOM';

export interface ValidatorPatterns {
  [key: string]: RegExp;
}