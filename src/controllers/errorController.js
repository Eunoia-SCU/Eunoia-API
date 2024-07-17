const AppError = require('./../utils/appError');

const sendErrorDev = (err, res) => {
  return res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // Operational , trusted error :send message to client
  if (err.isOperational) {
    console.log(err);
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });

    // Programming or other unknown error: don't leak for security
  } else {
    // 1 Log error

    console.error('ERROR', err);

    process.on('unhandledRejection', (err) => {
      console.log('UNHANDLER REJECTION 🤷‍♂️ Shutting down...');
      console.log(err);
      server.close(() => {
        process.exit(1);
      });
    });

    res.status(500).json({
      status: 'error',
      message: 'Somthing went very wrong!',
    });
  }
};

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}:${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.keyValue.email;
  const message = ` ${value}. already exist, Please Login !`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid Input data. ${errors.join(' && ')}`;
  return new AppError(message, 400);
};

const handleJwtInvalidSignature = () =>
  new AppError('Invalid token, please login again...', 401);

const handleJwtExpiredError = () =>
  new AppError('Expired token, please login again...', 401);

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if (err instanceof AppError) {
    // Respond with the error message and status code
    return res.status(err.statusCode).json({
      status: err.status,
      isAuthenticated: err.isAuthenticated,
      message: err.message,
    });
  }

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);

    if (error._message == 'User validation failed') {
      error = handleValidationErrorDB(error); // Pass the entire error object
    }
    if (error._message == 'Service validation failed') {
      error = handleValidationErrorDB(error); // Pass the entire error object
    }
    if (error.name == 'User validation failed') {
      error = handleValidationErrorDB(error); // Pass the entire error object
    }
    if (error.name === 'JsonWebTokenError') error = handleJwtInvalidSignature();
    if (error.name === 'JsonWebExpiredError') error = handleJwtExpiredError();
    return sendErrorProd(error, res);
  }
};
