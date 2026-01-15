class ApiResponse {
  /**
   * Constructor for ApiResponse class.
   * @param {Number} statusCode - The HTTP status code for the response
   * @param {String} message - The message to be included in the response
   * @param {object} data - The data to be included in the response
   */
  constructor(statusCode, message, data) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.success = statusCode < 400;
  }

  /**
   * Creates a successful API response with a status code of 200 and the given data and message.
   * @param {object} data - The data to be included in the response
   * @param {String} message - The message to be included in the response (defaults to 'Request successful')
   * @returns {ApiResponse} - The successful API response
   */
  static success(data, message = 'Request successful') {
    return new ApiResponse(200, message, data);
  }

  /**
   * Creates an error API response with a status code of 500 and the given message.
   * @param {String} message - The message to be included in the response (defaults to 'An error occurred')
   * @param {Number} status - The HTTP status code for the response (defaults to 500)
   * @returns {ApiResponse} - The error API response
   */
  static error(message = 'An error occurred', status = 500) {
    return new ApiResponse(status, message, null);
  }
}

export { ApiResponse };
