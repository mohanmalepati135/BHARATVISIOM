const { User } = require('../models');

const findByEmail = (email, withPassword = false) => {
  const query = User.findOne({ email: email.toLowerCase() });
  return withPassword ? query.select('+password') : query;
};

const findById = (id) => User.findById(id);

const create = (data) => User.create(data);

module.exports = { findByEmail, findById, create };
