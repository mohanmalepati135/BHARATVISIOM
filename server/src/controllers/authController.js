const asyncHandler = require('express-async-handler');
const authService = require('../services/authService');
const { cookieOptions } = require('../utils/token');
const { ROLES } = require('../constants');

const sendAuthResponse = (res, statusCode, token, user, extra = {}) => {
  res.cookie('token', token, cookieOptions());
  res.status(statusCode).json({
    success: true,
    token,
    user: user.toSafeObject(),
    ...extra,
  });
};

const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { token, user } = await authService.loginWithRole(email, password, ROLES.ADMIN);
  sendAuthResponse(res, 200, token, user);
});

const participantRegister = asyncHandler(async (req, res) => {
  const { token, user, participant } = await authService.registerParticipant(req.body);
  sendAuthResponse(res, 201, token, user, { participant });
});

const participantLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { token, user } = await authService.loginWithRole(email, password, ROLES.PARTICIPANT);
  sendAuthResponse(res, 200, token, user);
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const resetToken = await authService.requestPasswordReset(email);
  // In production this token is emailed via nodemailer, never returned directly.
  // Returned here only when not in production, to support local testing without SMTP.
  res.status(200).json({
    success: true,
    message: 'If an account exists for this email, a password reset link has been sent.',
    ...(process.env.NODE_ENV !== 'production' && resetToken ? { devResetToken: resetToken } : {}),
  });
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  const { token: authToken, user } = await authService.resetPassword(token, password);
  sendAuthResponse(res, 200, authToken, user);
});

const logout = asyncHandler(async (req, res) => {
  res.clearCookie('token');
  res.status(200).json({ success: true, message: 'Logged out successfully.' });
});

const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, user: req.user.toSafeObject() });
});

module.exports = {
  adminLogin,
  participantRegister,
  participantLogin,
  forgotPassword,
  resetPassword,
  logout,
  getMe,
};
