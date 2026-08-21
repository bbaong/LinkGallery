export class ApiError extends Error {
  statusCode: number;
  code: string;

  constructor(statusCode: number, code: string, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }

  static badRequest(message: string, code = "VALIDATION_ERROR") {
    return new ApiError(400, code, message);
  }

  static unauthorized(message = "로그인이 필요합니다.", code = "UNAUTHORIZED") {
    return new ApiError(401, code, message);
  }

  static forbidden(message = "접근 권한이 없습니다.", code = "FORBIDDEN") {
    return new ApiError(403, code, message);
  }

  static notFound(message = "요청한 리소스를 찾을 수 없습니다.", code = "NOT_FOUND") {
    return new ApiError(404, code, message);
  }

  static conflict(message: string, code = "CONFLICT") {
    return new ApiError(409, code, message);
  }

  static internal(message = "서버 오류가 발생했습니다.", code = "INTERNAL_ERROR") {
    return new ApiError(500, code, message);
  }
}
