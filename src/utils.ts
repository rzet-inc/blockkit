import { CoinInfo, SupportedCoin } from './types';
import { SUPPORTED_COINS } from './constants';
import { EVMValidator } from './validators/evm';
import { getValidator } from './validate';

/**
 * EVM 주소에 체크섬 적용
 * @param address - 체크섬을 적용할 주소
 * @returns 체크섬이 적용된 주소
 */
export function toChecksumAddress(address: string): string {
  if (!address || typeof address !== 'string') {
    return address;
  }
  
  // EVM 주소인지 확인
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return address;
  }
  
  const evmValidator = new EVMValidator();
  return evmValidator.normalize(address);
}

/**
 * 주소 정규화 (공백, 대소문자 처리)
 * @param address - 정규화할 주소
 * @param coin - 선택적 코인 심볼 (더 정확한 정규화를 위해)
 * @returns 정규화된 주소
 */
export function normalize(address: string, coin?: string): string {
  if (!address || typeof address !== 'string') {
    return address;
  }
  
  // 공백 제거
  const trimmed = address.trim();
  
  // EVM 주소인 경우 체크섬 적용
  if (/^0x[a-fA-F0-9]{40}$/.test(trimmed)) {
    const evmValidator = new EVMValidator();
    return evmValidator.normalize(trimmed);
  }
  
  // Bech32 주소는 소문자로 정규화 (Bitcoin, Cardano, Cosmos)
  const lowerTrimmed = trimmed.toLowerCase();
  if (lowerTrimmed.startsWith('bc1') || 
      lowerTrimmed.startsWith('ltc1') || 
      lowerTrimmed.startsWith('addr1') || 
      lowerTrimmed.startsWith('cosmos')) {
    return lowerTrimmed;
  }
  
  // 기타 주소는 그대로 반환
  return trimmed;
}

/**
 * 지원 코인 목록 조회
 * @returns 지원하는 코인 심볼 배열
 */
export function getSupportedCoins(): string[] {
  return Object.keys(SUPPORTED_COINS);
}

/**
 * 코인 정보 조회
 * @param coin - 코인 심볼
 * @returns 코인 정보 또는 null
 */
export function getCoinInfo(coin: string): CoinInfo | null {
  if (!coin || typeof coin !== 'string') {
    return null;
  }
  
  const normalizedCoin = coin.toUpperCase();
  return SUPPORTED_COINS[normalizedCoin as SupportedCoin] || null;
}

/**
 * 코인 그룹별로 분류
 * @returns 그룹별 코인 목록
 */
export function getCoinsByGroup(): Record<string, string[]> {
  const groups: Record<string, string[]> = {};
  
  for (const [coin, info] of Object.entries(SUPPORTED_COINS)) {
    if (!groups[info.group]) {
      groups[info.group] = [];
    }
    groups[info.group].push(coin);
  }
  
  return groups;
}

/**
 * 주소가 특정 그룹에 속하는지 확인
 * @param address - 확인할 주소
 * @param group - 그룹 이름
 * @returns 속하는지 여부
 */
export function isAddressInGroup(address: string, group: string): boolean {
  if (!address || !group) {
    return false;
  }
  
  const normalizedGroup = group.toUpperCase();
  
  switch (normalizedGroup) {
    case 'EVM':
      return /^0x[a-fA-F0-9]{40}$/.test(address);
    case 'BITCOIN':
      return /^[13LMbc][a-km-zA-HJ-NP-Z1-9]{25,}$/.test(address) ||
             /^bitcoincash:/.test(address) ||
             /^bc1[a-z0-9]{39,}$/.test(address.toLowerCase()) ||
             /^ltc1[a-z0-9]{39,}$/.test(address.toLowerCase());
    case 'UNIQUE':
      return /^T[a-km-zA-HJ-NP-Z1-9]{33}$/.test(address) || // TRX
             /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address) || // SOL
             /^r[a-km-zA-HJ-NP-Z1-9]{24,34}$/.test(address) || // XRP
             /^addr1/.test(address) || // ADA
             /^[1-9A-HJ-NP-Za-km-z]{46,48}$/.test(address); // DOT
    case 'COSMOS':
      return /^cosmos/.test(address);
    default:
      return false;
  }
}