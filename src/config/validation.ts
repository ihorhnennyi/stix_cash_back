import * as Joi from 'joi';

export const validationSchema = Joi.object({
  PORT: Joi.number().default(3000),

  MONGODB_URI: Joi.string().required().messages({
    'any.required': '"MONGODB_URI" обязателен!',
  }),

  JWT_SECRET: Joi.string().required().messages({
    'any.required': '"JWT_SECRET" обязателен!',
  }),

  JWT_ACCESS_EXPIRES_IN: Joi.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('30d'),
});
