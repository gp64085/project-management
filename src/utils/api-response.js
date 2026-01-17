class ApiResponse {
  constructor(statusCode, message = 'Success', data = null, errors = []) {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.message = message;
    if (data !== null) this.data = data;
    if (errors.length > 0) this.errors = errors;
  }
}

export { ApiResponse };
