const errorHandler = (err, req, res, next) => {
  console.error("Error occurred:", err);

  let error = {
    success: false,
    message: "Internal Server Error",
  };

  // Handle specific error types
  if (err.name === "ValidationError") {
    error.message = "Validation Error";
    error.details = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json(error);
  }

  if (err.code === 11000) {
    error.message = "Duplicate field value";
    return res.status(400).json(error);
  }

  if (err.status === 429) {
    error.message = "Too many requests, please try again later";
    return res.status(429).json(error);
  }

  // Development vs Production
  if (process.env.NODE_ENV === "development") {
    error.stack = err.stack;
    error.details = err.message;
  }

  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json(error);
};

const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
};

module.exports = {
  errorHandler,
  notFoundHandler,
};

export { errorHandler, notFoundHandler };
