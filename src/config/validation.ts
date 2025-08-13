import * as Joi from 'joi';

export const validationSchema = Joi.object({
  PORT: Joi.number().default(3000),

  MONGODB_URI: Joi.string().required().messages({
    'any.required': '"MONGODB_URI" обязателен!',
  }),

  USER_FILES_ROOT: Joi.string().required().messages({
    'any.required': '"USER_FILES_ROOT" обязателен!',
  }),

  JWT_SECRET: Joi.string().required().messages({
    'any.required': '"JWT_SECRET" обязателен!',
  }),
  JWT_ACCESS_EXPIRES_IN: Joi.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('30d'),

  ROOT_ADMIN_EMAIL: Joi.string().email().required(),
  ROOT_ADMIN_PASSWORD: Joi.string().min(6).required(),

  FRONTEND_URL: Joi.string().uri().default('http://localhost:5173'),
});
