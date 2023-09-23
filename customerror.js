class CustomError extends Error {
    constructor(message) {
      super(message);
      this.statusCode = 404;
      this.isOperational = true; // Indicates if this is an operational error
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  class ValidationError extends Error {
    constructor(message) {
      super(message);
      this.statusCode = 400;
      this.isOperational = true; 
      Error.captureStackTrace(this, this.constructor);
    }
  }
  module.exports={CustomError,ValidationError};