const crypto = require('crypto');
const { User, Participant } = require('../models');
const { ROLES } = require('../constants');
const { signToken } = require('../utils/token');
const ApiError = require('../utils/ApiError');

const loginWithRole = async (email, password, requiredRole) => {
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password.');
  }
  if (requiredRole && user.role !== requiredRole) {
    throw new ApiError(403, `This login is only for ${requiredRole} accounts.`);
  }
  if (!user.isActive) {
    throw new ApiError(403, 'This account has been deactivated. Contact an administrator.');
  }
  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  const token = signToken({ id: user._id, role: user.role });
  return { token, user };
};

const registerParticipant = async ({ fullName, email, password, age, state, occupation }) => {
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw new ApiError(409, 'An account with this email already exists.');
  }

  const user = await User.create({
    name: fullName,
    email,
    password,
    role: ROLES.PARTICIPANT,
  });

  const participant = await Participant.create({
    user: user._id,
    fullName,
    email,
    age,
    state,
    occupation,
  });

  const token = signToken({ id: user._id, role: user.role });
  return { token, user, participant };
};

const requestPasswordReset = async (email) => {
  const user = await User.findOne({ email: email.toLowerCase() });
  // Always behave the same way whether or not the user exists, to avoid leaking account info.
  if (!user) return null;

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
  await user.save({ validateBeforeSave: false });

  return resetToken;
};

const resetPassword = async (rawToken, newPassword) => {
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  }).select('+password');

  if (!user) {
    throw new ApiError(400, 'This password reset link is invalid or has expired.');
  }

  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  const token = signToken({ id: user._id, role: user.role });
  return { token, user };
};

module.exports = { loginWithRole, registerParticipant, requestPasswordReset, resetPassword };
