'use strict';

// PUBLIC_INTERFACE
function ok(data) {
  /** Wrap success response in a standard envelope */
  return { status: 'success', data };
}

// PUBLIC_INTERFACE
function error(code, message) {
  /** Wrap error response in a standard envelope */
  return { status: 'error', error: { code, message } };
}

module.exports = { ok, error };
