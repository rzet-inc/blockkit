import { DetectionResult, CoinPossibility, SupportedCoin } from './types';
import { SUPPORTED_COINS } from './constants';
import { validate } from './validate';

// 각 코인의 고유 패턴
const UNIQUE_PATTERNS: Record<string, RegExp> = {
  // Tron - T로 시작, 34자
  TRX: /^T[a-km-zA-HJ-NP-Z1-9]{33}$/,
  
  // Solana - Base58, 32-44자
  SOL: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/,
  
  // Ripple - r로 시작
  XRP: /^r[a-km-zA-HJ-NP-Z1-9]{24,34}$/,
  
  // Cardano - addr1 또는 DdzFF/Ae2로 시작
  ADA: /^(addr1[a-z0-9]{50,}|addr_test1[a-z0-9]{50,}|(Ae2|DdzFF)[a-km-zA-HJ-NP-Z1-9]{51,})$/,
  
  // Polkadot - SS58 형식
  DOT: /^[1-9A-HJ-NP-Za-km-z]{46,48}$/,
  
  // Cosmos - cosmos1로 시작
  ATOM: /^(cosmos1|cosmosvaloper1|cosmosvalcons1)[a-z0-9]{38}$/
};

// 그룹 패턴
const GROUP_PATTERNS = {
  // EVM - 0x + 40자 hex
  EVM: /^0x[a-fA-F0-9]{40}$/,
  
  // Bitcoin 계열 - 다양한 형식
  BITCOIN: {
    p2pkh: /^[13LM][a-km-zA-HJ-NP-Z1-9]{25,34}$/,
    p2sh: /^[3M2][a-km-zA-HJ-NP-Z1-9]{25,34}$/,
    bech32_btc: /^bc1[a-z0-9]{39,59}$/,
    bech32_ltc: /^ltc1[a-z0-9]{39,59}$/,
    taproot: /^bc1p[a-z0-9]{57}$/,
    cashaddr: /^bitcoincash:[qpzry9x8gf2tvdw0s3jn54khce6mua7l]{42,}$/
  }
};

/**
 * 주소로부터 가능한 코인들을 감지
 * @param address - 감지할 주소
 * @returns 가능한 코인 목록
 */
export function detect(address: string): DetectionResult {
  if (!address || typeof address !== 'string') {
    return {
      possibleCoins: []
    };
  }
  
  const trimmedAddress = address.trim();
  const possibleCoins: CoinPossibility[] = [];
  
  // 1. 고유 패턴 매칭
  for (const [coin, pattern] of Object.entries(UNIQUE_PATTERNS)) {
    if (pattern.test(trimmedAddress)) {
      // 실제 검증 수행
      const result = validate(trimmedAddress, coin);
      if (result.valid) {
        possibleCoins.push({
          coin,
          confidence: 1.0,
          type: result.metadata?.type
        });
      }
    }
  }
  
  // 2. EVM 그룹 패턴 매칭
  if (GROUP_PATTERNS.EVM.test(trimmedAddress)) {
    const evmCoins = Object.entries(SUPPORTED_COINS)
      .filter(([_, info]) => info.group === 'EVM')
      .map(([coin]) => coin);
    
    // 모든 EVM 코인은 동일한 주소 형식 사용
    const result = validate(trimmedAddress, 'ETH');
    if (result.valid) {
      for (const coin of evmCoins) {
        possibleCoins.push({
          coin,
          confidence: 0.9,
          type: result.metadata?.type
        });
      }
    }
  }
  
  // 3. Bitcoin 그룹 패턴 매칭
  const bitcoinMatch = checkBitcoinPatterns(trimmedAddress);
  if (bitcoinMatch) {
    const bitcoinCoins = Object.entries(SUPPORTED_COINS)
      .filter(([_, info]) => info.group === 'BITCOIN')
      .map(([coin]) => coin);
    
    for (const coin of bitcoinCoins) {
      const result = validate(trimmedAddress, coin);
      if (result.valid) {
        possibleCoins.push({
          coin,
          confidence: bitcoinMatch.confidence,
          type: result.metadata?.type
        });
      }
    }
  }
  
  // 4. 신뢰도 기준 정렬 및 중복 제거
  const uniqueCoins = new Map<string, CoinPossibility>();
  for (const possibility of possibleCoins) {
    const existing = uniqueCoins.get(possibility.coin);
    if (!existing || existing.confidence < possibility.confidence) {
      uniqueCoins.set(possibility.coin, possibility);
    }
  }
  
  const sortedCoins = Array.from(uniqueCoins.values())
    .sort((a, b) => b.confidence - a.confidence);
  
  // 5. 최상위 추측 및 그룹 결정
  let bestGuess: string | undefined;
  let group: string | undefined;
  
  if (sortedCoins.length > 0) {
    bestGuess = sortedCoins[0].coin;
    const coinInfo = SUPPORTED_COINS[bestGuess as SupportedCoin];
    if (coinInfo) {
      group = coinInfo.group;
    }
  }
  
  return {
    possibleCoins: sortedCoins,
    bestGuess,
    group
  };
}

/**
 * Bitcoin 패턴 체크
 */
function checkBitcoinPatterns(address: string): { type: string; confidence: number } | null {
  for (const [type, pattern] of Object.entries(GROUP_PATTERNS.BITCOIN)) {
    if (pattern.test(address)) {
      // 패턴별 신뢰도 설정
      const confidence = type === 'cashaddr' ? 1.0 : // Bitcoin Cash 전용
                        type === 'taproot' ? 1.0 :    // Bitcoin 전용
                        type.startsWith('bech32_') ? 0.95 : // 특정 코인 Bech32
                        0.85; // 일반 P2PKH/P2SH
      
      return { type, confidence };
    }
  }
  return null;
}