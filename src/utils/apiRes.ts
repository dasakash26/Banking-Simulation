import { HttpStatus } from "./apiError";

interface ApiResponseData {
  statusCode: HttpStatus;
  success: boolean;
  message: string;
  data: any;
  meta?: any;
  timestamp: string;
}

class ApiResponse implements ApiResponseData {
  readonly statusCode: HttpStatus;
  readonly success: boolean;
  readonly message: string;
  readonly data: any;
  readonly meta?: any;
  readonly timestamp: string;

  constructor({
    data = "",
    message = "Success",
    statusCode = HttpStatus.OK,
    success = true,
    meta = null,
    timestamp = new Date().toISOString(),
  } = {}) {
    this.statusCode = statusCode;
    this.success = success;
    this.message = message;
    this.data = data;
    this.meta = meta;
    this.timestamp = timestamp;
  }

  static success(data:any = "", message = "Success", meta = null) {
    return new ApiResponse({
      data,
      message,
      statusCode: HttpStatus.OK,
      meta,
    });
  }

  static created(
    data:any = "",
    message = "Resource created successfully",
    meta = null
  ) {
    return new ApiResponse({
      data,
      message,
      statusCode: HttpStatus.CREATED,
      meta,
    });
  }

  static error(
    message = "Internal Server Error",
    statusCode = HttpStatus.INTERNAL_SERVER_ERROR,
    meta = null
  ) {
    return new ApiResponse({
      data: "",
      message:
        process.env.NODE_ENV === "development"
          ? message
          : "An unexpected error occurred. Please try again later.",
      statusCode,
      success: false,
      meta,
    });
  }

  toJSON(): ApiResponseData {
    const response: ApiResponseData = {
      statusCode: this.statusCode,
      success: this.success,
      message: this.message,
      data: this.data,
      timestamp: this.timestamp,
    };

    if (this.meta) response.meta = this.meta;
    return response;
  }
}

export type { ApiResponseData };
export default ApiResponse;
