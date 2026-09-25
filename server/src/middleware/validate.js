import ApiError from '../utils/ApiError.js';

/**
 * Creates a validation middleware from a Zod schema.
 * Validates req.body by default, but can validate req.query or req.params.
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const result = schema.parse(req[source]);
      req[source] = result; // Replace with parsed/cleaned data
      next();
    } catch (error) {
      if (error.name === 'ZodError') {
        const messages = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
        throw ApiError.badRequest(messages.join(', '), 'VALIDATION_ERROR');
      }
      next(error);
    }
  };
};

export default validate;
