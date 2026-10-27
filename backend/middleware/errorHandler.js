/**
 * Global API Error Handling Middleware
 */

const errorHandler = (err, req, res, next) => {
  console.error('Unhandled Application Error:', err);

  // Handle unique constraint violations from Postgres
  if (err.code === '23505') {
    return res.status(409).json({
      success: false,
      message: 'A record with these unique details already exists.',
      detail: err.detail,
    });
  }

  // Handle foreign key constraint violations
  if (err.code === '23503') {
    return res.status(400).json({
      success: false,
      message: 'Referenced entity does not exist or cannot be modified due to dependent records.',
      detail: err.detail,
    });
  }

  // Handle check constraint violations
  if (err.code === '23514') {
    return res.status(400).json({
      success: false,
      message: 'Database check constraint failed: invalid value or reading logic violated.',
      detail: err.detail,
    });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
