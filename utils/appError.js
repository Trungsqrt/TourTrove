class AppError extends Error {
  constructor(message, statusCode) {
    // super(message);
    console.log(super(message));
    this.statusCode = statusCode;
    // EX: 400, 404 is fail || 500 is error
    this.status = `${statusCode}`.startsWith("4") ? "failed" : "error";

    // Error has 2 type. Operational error and Programmer errors
    // SUB: Operational error: can fix without restart program
    // SUB: Operational error: need restart
    this.isOperational = true;

    // Track stack trace, and record it for analyse after
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
