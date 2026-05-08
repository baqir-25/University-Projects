class ApiResponse {
  static success(res, { statusCode = 200, message = "OK", data = null, meta = null } = {}) {
    const payload = {
      success: true,
      message,
      data,
    };

    if (meta) {
      payload.meta = meta;
    }

    return res.status(statusCode).json(payload);
  }

  static error(res, { statusCode = 500, message = "Internal server error", errors = null } = {}) {
    const payload = {
      success: false,
      message,
    };

    if (errors) {
      payload.errors = errors;
    }

    return res.status(statusCode).json(payload);
  }
}

module.exports = ApiResponse;
