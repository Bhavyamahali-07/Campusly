class ApiError extends Error {
  constructor(statusCode, message, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message, code) {
    return new ApiError(400, message, code || 'BAD_REQUEST');
  }

  static unauthorized(message) {
    return new ApiError(401, message || 'Unauthorized', 'AUTH_REQUIRED');
  }

  static forbidden(message) {
    return new ApiError(403, message || 'Forbidden', 'FORBIDDEN');
  }

  static notFound(message) {
    return new ApiError(404, message || 'Resource not found', 'NOT_FOUND');
  }

  static conflict(message) {
    return new ApiError(409, message, 'CONFLICT');
  }

  static tooMany(message) {
    return new ApiError(429, message || 'Too many requests', 'RATE_LIMIT');
  }

  static internal(message) {
    return new ApiError(500, message || 'Internal server error', 'INTERNAL_ERROR');
  }
}

export default ApiError;
