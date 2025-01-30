enum HttpStatus {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  TOO_MANY_REQUESTS = 429,
  INTERNAL_SERVER_ERROR = 500,
}

const DEFAULT_MESSAGES:any = {
  [HttpStatus.BAD_REQUEST]: 'Bad Request',
  [HttpStatus.UNAUTHORIZED]: 'Unauthorized Access',
  [HttpStatus.FORBIDDEN]: 'Forbidden Access',
  [HttpStatus.NOT_FOUND]: 'Resource Not Found',
  [HttpStatus.CONFLICT]: 'Resource Conflict',
  [HttpStatus.UNPROCESSABLE_ENTITY]: 'Validation Error',
  [HttpStatus.TOO_MANY_REQUESTS]: 'Too Many Requests',
  [HttpStatus.INTERNAL_SERVER_ERROR]: 'Internal Server Error',
} as const;

interface ApiErrorData {
  success: boolean;
  statusCode: HttpStatus;
  errorCode?: string;
  status: string;
  message: string;
  errors: Record<string, any>[];
  data: any;
  stack?: string;
  timestamp: string;  // Add timestamp
}

class ApiError extends Error implements ApiErrorData {
  readonly statusCode: HttpStatus;
  readonly status: string;
  readonly success: boolean = false;
  readonly errorCode?: string;
  readonly errors: Record<string, any>[];
  readonly data: any;
  readonly timestamp: string;

  constructor(
    statusCode: HttpStatus,
    message: string = DEFAULT_MESSAGES[statusCode],
    options: {
      errorCode?: string;
      errors?: Record<string, any>[];
      data?: any;
      stack?: string;
      timestamp?: string;
    } = {}
  ) {
    super(message);

    this.statusCode = statusCode;
    this.status = this.getStatusText(statusCode);
    this.errorCode = options.errorCode;
    this.errors = options.errors || [];
    this.data = options.data || null;
    this.timestamp = options.timestamp || new Date().toISOString();

    if (options.stack) {
      this.stack = options.stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  private getStatusText(statusCode: HttpStatus): string {
    return `${statusCode}`.startsWith('4') ? 'fail' : 'error';
  }

  // Factory methods
  static badRequest(message?: string, options?: Partial<ApiErrorData>): ApiError {
    return new ApiError(HttpStatus.BAD_REQUEST, message, options);
  }

  static unauthorized(message?: string, options?: Partial<ApiErrorData>): ApiError {
    return new ApiError(HttpStatus.UNAUTHORIZED, message, options);
  }

  static forbidden(message?: string, options?: Partial<ApiErrorData>): ApiError {
    return new ApiError(HttpStatus.FORBIDDEN, message, options);
  }

  static notFound(message?: string, options?: Partial<ApiErrorData>): ApiError {
    return new ApiError(HttpStatus.NOT_FOUND, message, options);
  }

  static validationError(message?: string, options?: Partial<ApiErrorData>): ApiError {
    return new ApiError(HttpStatus.UNPROCESSABLE_ENTITY, message, options);
  }

  static internalError(message?: string, options?: Partial<ApiErrorData>): ApiError {
    return new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, message, options);
  }

  static rateLimitExceeded(message?: string, options?: Partial<ApiErrorData>): ApiError {
    return new ApiError(HttpStatus.TOO_MANY_REQUESTS, message, options);
  }

  static conflict(message?: string, options?: Partial<ApiErrorData>): ApiError {
    return new ApiError(HttpStatus.CONFLICT, message, options);
  }

  toJSON(): Partial<ApiErrorData> {
    const response: Partial<ApiErrorData> = {
      success: this.success,
      statusCode: this.statusCode,
      message: this.message,
      timestamp: this.timestamp,
    };

    if (this.errorCode) response.errorCode = this.errorCode;
    if (this.errors.length > 0) response.errors = this.errors;
    if (this.data) response.data = this.data;
    if (process.env.NODE_ENV === 'development') response.stack = this.stack;

    return response;
  }

  static isApiError(error: unknown): error is ApiError {
    return error instanceof ApiError;
  }
}

export { ApiError, HttpStatus };
export type { ApiErrorData };
