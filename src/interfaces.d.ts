export interface ValidationError {
  path: string;
  message: string;
  value?: any;
}

export interface Validator {
  validate(value: any, path?: string): ValidationError[]
}