import { BECH32_ALPHABET } from '../constants';

const BECH32_GENERATOR = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];

/**
 * Bech32 체크섬을 위한 다항식 모드
 */
function polymod(values: number[]): number {
  let chk = 1;
  for (const value of values) {
    const top = chk >> 25;
    chk = (chk & 0x1ffffff) << 5 ^ value;
    for (let i = 0; i < 5; i++) {
      if ((top >> i) & 1) {
        chk ^= BECH32_GENERATOR[i];
      }
    }
  }
  return chk;
}

/**
 * HRP(Human Readable Part) 확장
 */
function hrpExpand(hrp: string): number[] {
  const result: number[] = [];
  for (let i = 0; i < hrp.length; i++) {
    result.push(hrp.charCodeAt(i) >> 5);
  }
  result.push(0);
  for (let i = 0; i < hrp.length; i++) {
    result.push(hrp.charCodeAt(i) & 31);
  }
  return result;
}

/**
 * Bech32 체크섬 검증
 */
function verifyChecksum(hrp: string, data: number[], encoding: 'bech32' | 'bech32m' = 'bech32'): boolean {
  const checksum = encoding === 'bech32' ? 1 : 0x2bc830a3;
  return polymod(hrpExpand(hrp).concat(data)) === checksum;
}

/**
 * Bech32 체크섬 생성
 */
function createChecksum(hrp: string, data: number[], encoding: 'bech32' | 'bech32m' = 'bech32'): number[] {
  const values = hrpExpand(hrp).concat(data).concat([0, 0, 0, 0, 0, 0]);
  const checksum = encoding === 'bech32' ? 1 : 0x2bc830a3;
  const mod = polymod(values) ^ checksum;
  const result: number[] = [];
  for (let i = 0; i < 6; i++) {
    result.push((mod >> 5 * (5 - i)) & 31);
  }
  return result;
}

/**
 * Bech32 인코딩
 */
export function bech32Encode(hrp: string, data: number[]): string {
  const combined = data.concat(createChecksum(hrp, data));
  let result = hrp + '1';
  for (const value of combined) {
    result += BECH32_ALPHABET[value];
  }
  return result;
}

/**
 * Bech32 디코딩
 */
export function bech32Decode(bech32String: string, encoding?: 'bech32' | 'bech32m' | 'auto'): { hrp: string; data: number[]; encoding?: 'bech32' | 'bech32m' } | null {
  // 대소문자 검사
  let hasLower = false;
  let hasUpper = false;
  for (const char of bech32String) {
    if (char >= 'a' && char <= 'z') hasLower = true;
    if (char >= 'A' && char <= 'Z') hasUpper = true;
  }
  if (hasLower && hasUpper) return null;
  
  // 소문자로 정규화
  bech32String = bech32String.toLowerCase();
  
  // 구분자 찾기
  const pos = bech32String.lastIndexOf('1');
  if (pos < 1 || pos + 7 > bech32String.length || bech32String.length > 130) {
    return null;
  }
  
  const hrp = bech32String.slice(0, pos);
  const data: number[] = [];
  
  for (let i = pos + 1; i < bech32String.length; i++) {
    const d = BECH32_ALPHABET.indexOf(bech32String[i]);
    if (d === -1) return null;
    data.push(d);
  }
  
  // 인코딩 타입 결정
  let detectedEncoding: 'bech32' | 'bech32m' | undefined;
  if (encoding === 'auto' || !encoding) {
    // 두 형식 모두 시도
    if (verifyChecksum(hrp, data, 'bech32')) {
      detectedEncoding = 'bech32';
    } else if (verifyChecksum(hrp, data, 'bech32m')) {
      detectedEncoding = 'bech32m';
    } else {
      return null;
    }
  } else {
    if (!verifyChecksum(hrp, data, encoding)) return null;
    detectedEncoding = encoding;
  }
  
  return { hrp, data: data.slice(0, -6), encoding: detectedEncoding };
}

/**
 * 5비트 배열을 8비트 배열로 변환
 */
export function convertBits(
  data: number[],
  fromBits: number,
  toBits: number,
  pad: boolean
): number[] | null {
  let acc = 0;
  let bits = 0;
  const result: number[] = [];
  const maxv = (1 << toBits) - 1;
  const maxAcc = (1 << (fromBits + toBits)) - 1;
  
  for (const value of data) {
    if (value < 0 || (value >> fromBits) !== 0) {
      return null;
    }
    acc = ((acc << fromBits) | value) & maxAcc;
    bits += fromBits;
    while (bits >= toBits) {
      bits -= toBits;
      result.push((acc >> bits) & maxv);
    }
  }
  
  if (pad) {
    if (bits > 0) {
      result.push((acc << (toBits - bits)) & maxv);
    }
  } else if (bits >= fromBits || ((acc << (toBits - bits)) & maxv)) {
    return null;
  }
  
  return result;
}

/**
 * Segwit 주소 인코딩
 */
export function segwitEncode(hrp: string, version: number, program: number[]): string | null {
  const values = [version].concat(convertBits(program, 8, 5, true) || []);
  if (values.length < 2) return null;
  return bech32Encode(hrp, values);
}

/**
 * Segwit 주소 디코딩
 */
export function segwitDecode(addr: string): { hrp: string; version: number; program: number[] } | null {
  const decoded = bech32Decode(addr, 'auto');
  if (!decoded) return null;
  
  const { hrp, data, encoding } = decoded;
  if (data.length < 1) return null;
  
  const version = data[0];
  if (version > 16) return null;
  
  // Taproot (v1) 주소는 bech32m을 사용해야 함
  if (version === 1 && encoding !== 'bech32m') return null;
  if (version === 0 && encoding !== 'bech32') return null;
  
  const program = convertBits(data.slice(1), 5, 8, false);
  if (!program) return null;
  
  // 프로그램 길이 검증
  if (program.length < 2 || program.length > 40) return null;
  if (version === 0 && program.length !== 20 && program.length !== 32) return null;
  if (version === 1 && program.length !== 32) return null; // Taproot는 32바이트
  
  return { hrp, version, program };
}