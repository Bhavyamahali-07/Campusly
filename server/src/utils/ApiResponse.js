class ApiResponse {
  static success(res, data, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      data,
      message,
    });
  }

  static created(res, data, message = 'Created successfully') {
    return res.status(201).json({
      success: true,
      data,
      message,
    });
  }

  static paginated(res, data, pagination, message = 'Success') {
    return res.status(200).json({
      success: true,
      data,
      pagination,
      message,
    });
  }

  static error(res, statusCode, message, code = null) {
    return res.status(statusCode).json({
      success: false,
      message,
      code,
    });
  }
}

export default ApiResponse;
