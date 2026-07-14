const ApiError = require('../utils/ApiError');

/**
 * Wraps a Zod schema and validates req.body (or a custom source).
 * Usage: router.post('/', validate(loginSchema), controller)
 */
const validate = (schema, source = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[source]);
  if (!result.success) {
    const details = result.error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    return next(new ApiError(400, 'Validation failed. Please check the highlighted fields.', details));
  }
  req[source] = result.data;
  return next();
};

module.exports = validate;
