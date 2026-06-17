/**
 * Global Express error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Log error for internal tracking (exclude 404s to avoid log spam)
  if (statusCode !== 404) {
    console.error(`[Error] ${req.method} ${req.originalUrl} >> ${message}`);
    if (process.env.NODE_ENV !== 'production' || statusCode >= 500) {
      console.error(err.stack);
    }
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = {
  errorHandler
};
