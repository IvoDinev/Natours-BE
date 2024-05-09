const AppError = require('../utils/appError');

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // Operational error is an expected error, an error that we intentionally throw
  // Examples: no data for given ID, failed schema validation
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.log(err);
    // Generic error handling for unexpected errors: bugs in our or in external code
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong!',
    });
  }
};

// Handle Mongoose cast error
const handleDBCastError = (error) => {
  const message = `Invalid ${error.path}: ${error.value}`;

  return new AppError(message, 400);
};

const handleDBDuplicateFields = (error) => {
  const value = error.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];

  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleDBValidationError = (error) => {
  const errors = Object.values(error.errors).map(
    (fieldError) => fieldError.message
  );

  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

// Global error handler - callback which is called by the error handling middleware in app.js
module.exports = (err, req, res, next) => {
  // Shows us where the error happened
  // console.log(err.stack);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Distinguish between errors on dev and prod
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let newError = { ...err };
    if (err.name === 'CastError') {
      newError = handleDBCastError(err);
    }
    // 11000 - code for duplicate field value
    if (err.code === 11000) {
      newError = handleDBDuplicateFields(err);
    }
    // Catch Mongoose validation errors
    if (err.name === 'ValidationError') {
      newError = handleDBValidationError(err);
    }
    sendErrorProd(newError, res);
  }
};
