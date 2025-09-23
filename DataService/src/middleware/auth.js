'use strict';

const jwt = require('jsonwebtoken');

const rolesHierarchy = ['viewer', 'editor', 'admin'];

// PUBLIC_INTERFACE
function requireAuth(req, res, next) {
  /** Authenticate requests via Bearer JWT, attach req.user. */
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.substring(7) : null;
  if (!token) return res.status(401).json({ status: 'error', error: { code: 'UNAUTHORIZED', message: 'Missing token' } });
  try {
    const decoded = jwt.verify(token, process.env.JWT_PUBLIC_KEY || process.env.JWT_SECRET || 'dev_secret');
    req.user = decoded;
    return next();
  } catch (e) {
    return res.status(401).json({ status: 'error', error: { code: 'INVALID_TOKEN', message: 'Invalid token' } });
  }
}

// PUBLIC_INTERFACE
function requireRole(minRole) {
  /** Authorize request by RBAC role comparing against minRole. */
  return (req, res, next) => {
    const role = (req.user && req.user.role) || 'viewer';
    if (rolesHierarchy.indexOf(role) >= rolesHierarchy.indexOf(minRole)) return next();
    return res.status(403).json({ status: 'error', error: { code: 'FORBIDDEN', message: 'Insufficient privileges' } });
  };
}

module.exports = { requireAuth, requireRole };
