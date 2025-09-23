'use strict';

// PUBLIC_INTERFACE
function errorHandler(err, req, res, next) {
  /** Global error handler returning standardized envelope. */
  const status = err.status || 500;
  const code = err.code || (status === 500 ? 'INTERNAL_ERROR' : 'ERROR');
  const message = err.message || 'Internal Server Error';
  if (process.env.NODE_ENV !== 'production') {
    console.error(err);
  }
  res.status(status).json({ status: 'error', error: { code, message } });
}

module.exports = errorHandler;
