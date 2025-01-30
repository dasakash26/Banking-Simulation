import { z } from 'zod';

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

export interface ValidationError {
  code: string;
  path: (string | number)[];
  message: string;
}

export type ApiValidationError = ApiResponse<ValidationError[]>;
export type ApiErrorResponse = ApiResponse<never>;
