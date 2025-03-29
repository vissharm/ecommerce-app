const getJwtSecret = () => {
  const secret = 'demo_assignment_app_jwt_secret' || process.env.SHARED_JWT_SECRET || process.env.JWT_SECRET;
  console.log('Using JWT Secret:', secret);
  return secret;
};

const jwtConfig = {
  secret: getJwtSecret,
  expiresIn: process.env.JWT_EXPIRATION || '1h',
  tokenHeader: 'Authorization',
  tokenPrefix: 'Bearer ',
  issuer: 'ecommerce-app',
  audience: 'ecommerce-users'
};

module.exports = jwtConfig;
