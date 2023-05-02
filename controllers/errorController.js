const AppError = require("../utils/appError");

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  // Development environment
  if (process.env.NODE_ENV === "development") {
    if (!err.isOperational)
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        error: err,
        stack: err.stack,
      });

    // Production environment
  } else if (process.env.NODE_ENV === "production") {
    // Operational error is Trusted error: Send this error
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });

      // Programming error is UnTrusted error: Don't leak error details
    } else {
      res.status(500).json({
        status: "error",
        message: "Something wrong!",
      });
    }
  }
};
