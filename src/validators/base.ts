import { ValidationResult } from '../types';

export abstract class BaseValidator {
  /**
   * 주소 검증
   */
  abstract validate(address: string): ValidationResult;
  
  /**
   * 주소 정규화 (선택적)
   */
  normalize?(address: string): string;
  
  /**
   * 주소 패턴 매칭 (빠른 사전 검증용)
   */
  abstract isValidPattern(address: string): boolean;
  
  /**
   * 기본 검증 결과 생성 헬퍼
   */
  protected createResult(
    valid: boolean,
    message?: string,
    metadata?: ValidationResult['metadata']
  ): ValidationResult {
    const result: ValidationResult = { valid };
    if (message) result.message = message;
    if (metadata) result.metadata = metadata;
    return result;
  }
  
  /**
   * 유효하지 않은 결과 생성 헬퍼
   */
  protected invalidResult(message: string): ValidationResult {
    return this.createResult(false, message);
  }
  
  /**
   * 유효한 결과 생성 헬퍼
   */
  protected validResult(metadata?: ValidationResult['metadata']): ValidationResult {
    return this.createResult(true, undefined, metadata);
  }
}