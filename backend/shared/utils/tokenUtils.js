const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');

const generateToken = (payload) => {
  const secret = jwtConfig.secret();
  return jwt.sign(
    payload,
    secret,
    {
      expiresIn: jwtConfig.expiresIn,
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience
    }
  );
};

const verifyToken = (token) => {
  const secret = jwtConfig.secret();
  return jwt.verify(token, secret, {
    issuer: jwtConfig.issuer,
    audience: jwtConfig.audience
  });
};

module.exports = {
  generateToken,
  verifyToken
};