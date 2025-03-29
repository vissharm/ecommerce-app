const getJwtSecret = () => {
  // Primary source: environment variable for the shared config
  if (process.env.SHARED_JWT_SECRET) {
    return process.env.SHARED_JWT_SECRET;
  }
  
  // Fallback: service-specific JWT_SECRET from .env
  if (process.env.JWT_SECRET) {
    console.warn('Using service-specific JWT_SECRET. Consider using SHARED_JWT_SECRET instead.');
    return process.env.JWT_SECRET;
  }
  
  // Last resort: hardcoded default (not recommended for production)
  console.warn('No JWT secret configured. Using default secret. This is not secure for production!');
  return 'demo_assignment_app_jwt_secret';
};

module.exports = {
  getJwtSecret,  // Export the function
  JWT_EXPIRATION: '5m',
  TOKEN_HEADER: 'Authorization',
  TOKEN_PREFIX: 'Bearer ',
};

