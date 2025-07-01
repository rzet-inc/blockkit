import { BASE58_ALPHABET } from '../constants';
import { sha256 } from './hash';

const BASE58_MAP = new Map<string, number>();
for (let i = 0; i < BASE58_ALPHABET.length; i++) {
  BASE58_MAP.set(BASE58_ALPHABET[i], i);
}

/**
 * Base58 디코딩
 */
export function base58Decode(encoded: string): Uint8Array {
  if (encoded.length === 0) return new Uint8Array(0);
  
  // 입력 검증
  for (const char of encoded) {
    if (!BASE58_MAP.has(char)) {
      throw new Error(`Invalid character: ${char}`);
    }
  }
  
  // 선행 '1' 카운트 (0x00 바이트)
  let leadingZeros = 0;
  for (const char of encoded) {
    if (char === '1') leadingZeros++;
    else break;
  }
  
  // 큰 정수로 변환
  const size = Math.ceil((encoded.length * Math.log(58)) / Math.log(256));
  const result = new Array(size).fill(0);
  
  for (const char of encoded) {
    let carry = BASE58_MAP.get(char)!;
    for (let i = result.length - 1; i >= 0; i--) {
      carry += result[i] * 58;
      result[i] = carry % 256;
      carry = Math.floor(carry / 256);
    }
  }
  
  // 결과에서 선행 0 제거
  let skipZeros = 0;
  for (const byte of result) {
    if (byte === 0) skipZeros++;
    else break;
  }
  
  // 최종 바이트 배열 생성
  const bytes = new Uint8Array(leadingZeros + result.length - skipZeros);
  bytes.fill(0, 0, leadingZeros);
  for (let i = 0; i < result.length - skipZeros; i++) {
    bytes[leadingZeros + i] = result[skipZeros + i];
  }
  
  return bytes;
}

/**
 * Base58 인코딩
 */
export function base58Encode(bytes: Uint8Array): string {
  if (bytes.length === 0) return '';
  
  // 선행 0 바이트 카운트
  let leadingZeros = 0;
  for (const byte of bytes) {
    if (byte === 0) leadingZeros++;
    else break;
  }
  
  // 큰 정수로 변환
  const size = Math.ceil((bytes.length * Math.log(256)) / Math.log(58));
  const result = new Array(size).fill(0);
  
  for (const byte of bytes) {
    let carry = byte;
    for (let i = result.length - 1; i >= 0; i--) {
      carry += result[i] * 256;
      result[i] = carry % 58;
      carry = Math.floor(carry / 256);
    }
  }
  
  // 결과에서 선행 0 제거
  let skipZeros = 0;
  for (const digit of result) {
    if (digit === 0) skipZeros++;
    else break;
  }
  
  // 최종 문자열 생성
  let encoded = '1'.repeat(leadingZeros);
  for (let i = skipZeros; i < result.length; i++) {
    encoded += BASE58_ALPHABET[result[i]];
  }
  
  return encoded;
}

/**
 * Base58Check 디코딩 (체크섬 검증 포함)
 */
export function base58CheckDecode(encoded: string): Uint8Array {
  const decoded = base58Decode(encoded);
  
  if (decoded.length < 5) {
    throw new Error('Invalid Base58Check: too short');
  }
  
  const payload = decoded.slice(0, -4);
  const checksum = decoded.slice(-4);
  
  // 체크섬 검증
  const hash = sha256(sha256(payload));
  const expectedChecksum = hash.slice(0, 4);
  
  for (let i = 0; i < 4; i++) {
    if (checksum[i] !== expectedChecksum[i]) {
      throw new Error('Invalid Base58Check: checksum mismatch');
    }
  }
  
  return payload;
}

/**
 * Base58Check 인코딩 (체크섬 추가)
 */
export function base58CheckEncode(payload: Uint8Array): string {
  const hash = sha256(sha256(payload));
  const checksum = hash.slice(0, 4);
  
  const combined = new Uint8Array(payload.length + 4);
  combined.set(payload);
  combined.set(checksum, payload.length);
  
  return base58Encode(combined);
}