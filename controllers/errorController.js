const AppError = require("../utils/appError");

// Development environment Error Handling Method
const devErrorHandling = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

// Production environment Error Handling Method
const procErrorHandling = (err, res) => {
  if (err.name === "CastError") {
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

// Validation Database Error Handling
const validationErrorDBHandling = (error) => {
  const errors = Object.values(error.errors).map((el) => el.message);

  const message = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(message, 400);
};

// Cast error Database Handling
const castErrorDBHandling = (error) => {
  const message = `Invalid ${error.path}: ${error.value}.`;
  return new AppError(message, 400);
};

// Duplicate Fields Database Error Handling
const duplicateFieldsDBHandling = (error) => {
  // { name: \"The Forest Hiker'\" }"
  const value = error.errmsg.match(/(["'])(\\?.)*?\1/)[0];

  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

// Main module
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  // Development environment
  if (process.env.NODE_ENV === "development") {
    devErrorHandling(err, res);
    // Production environment
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err };

    if (error.name === "CastError") error = castErrorDBHandling(error);

    // duplicate error code has code = 11000
    if (error.code === 11000) error = duplicateFieldsDBHandling(error);
    if (error.name === "ValidationError")
      error = validationErrorDBHandling(error);

    procErrorHandling(error, res);
  }
};
