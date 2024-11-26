const mongoose = require("mongoose");
const httpStatus = require("http-status");
const logger = require("../config/logger");
const ApiError = require("../utils/apiError");

// Error Converter Middleware
const errorConverter = (err, req, res, next) => {
  let error = err;
  
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || error instanceof mongoose.Error
      ? httpStatus.BAD_REQUEST
      : httpStatus.INTERNAL_SERVER_ERROR;
    const message = error.message || httpStatus[statusCode];
    error = new ApiError(statusCode, message, false, err.stack);
  }

  next(error);
};

// Global Error Handler Middleware
const errorHandler = (err, req, res, next) => {
  const { statusCode, message } = err;

  // Check if the error is operational (expected), otherwise make it a 500
  const responseStatus = statusCode || httpStatus.INTERNAL_SERVER_ERROR;
  const responseMessage = message || httpStatus[responseStatus];

  res.locals.errorMessage = err.message;

  const response = {
    code: responseStatus,
    message: responseMessage,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }), // Include stack trace in development mode
  };

  logger.error(err);

  res.status(responseStatus).send(response);
};

module.exports = {
  errorConverter,
  errorHandler,
};
