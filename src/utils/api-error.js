class ApiError extends Error {
  /**
   * Constructor for ApiError class.
   * @param {Number} statusCode - The HTTP status code for the response
   * @param {String} [message="Something went wrong"] - The message to be included in the response
   * @param {Array} [errors=[]] - The errors to be included in the response
   * @param {String} [stack=""] - The error stack to be included in the response
   */
  constructor(
    statusCode,
    message = 'Something went wrong',
    errors = [],
    stack = '',
  ) {
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.message = message;
    this.success = false;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };
