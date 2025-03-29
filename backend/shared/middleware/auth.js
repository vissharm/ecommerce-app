const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');

/**
 * Generic authentication middleware
 * @param {Object} options - Configuration options
 * @param {Function} options.onSuccess - Callback function when authentication succeeds
 * @param {Function} options.onError - Custom error handler
 * @param {Array} options.requiredRoles - Array of required roles for authorization
 */
const auth = (options = {}) => {
  return (req, res, next) => {
    try {
      console.log('Auth middleware executing...');
      console.log('Headers:', req.headers);
      
      const authHeader = req.header(jwtConfig.tokenHeader);
      if (!authHeader) {
        console.log('No auth header found');
        return res.status(401).json({ message: 'No token, authorization denied' });
      }

      const token = authHeader.replace(`${jwtConfig.tokenPrefix}`, '');
      const secret = jwtConfig.secret();
      
      const decoded = jwt.verify(token, secret, {
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience
      });
      
      // Check if token is expired
      const currentTime = Math.floor(Date.now() / 1000);
      if (decoded.exp && decoded.exp < currentTime) {
        return res.status(401).json({ message: 'Token has expired' });
      }

      // Check roles if required
      if (options.requiredRoles && options.requiredRoles.length > 0) {
        const hasRequiredRole = options.requiredRoles.some(role => 
          decoded.roles && decoded.roles.includes(role)
        );
        if (!hasRequiredRole) {
          return res.status(403).json({ message: 'Insufficient permissions' });
        }
      }

      req.user = decoded;

      // Custom success handler if provided
      if (options.onSuccess) {
        return options.onSuccess(req, res, next);
      }

      next();
    } catch (error) {
      if (options.onError) {
        return options.onError(error, req, res, next);
      }

      console.error('Auth middleware error:', error);
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Invalid token' });
      }
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token has expired' });
      }
      res.status(401).json({ message: 'Token is not valid' });
    }
  };
};

module.exports = auth;





