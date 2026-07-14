const jwt = require('jsonwebtoken');

const signToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const verifyToken = (token) => jwt.verify(token, process.env.JWT_SECRET);

const cookieOptions = () => {
  const days = Number(process.env.JWT_COOKIE_EXPIRES_DAYS || 7);
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    expires: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
  };
};

module.exports = { signToken, verifyToken, cookieOptions };
