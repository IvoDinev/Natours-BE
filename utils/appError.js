// Extends the built-in Error class
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = statusCode.toString().startsWith('4') ? 'fail' : 'error';
    // Using this property to distinguish predictable errors like unhandled route,
    // DB connection error etc, from actual bugs like trying to read value of undefined etc
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor)
  }
}

module.exports = AppError;
