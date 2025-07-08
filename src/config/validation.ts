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

  ROOT_ADMIN_EMAIL: Joi.string().email().required(),
  ROOT_ADMIN_PASSWORD: Joi.string().min(6).required(),

  GOOGLE_KEY_FILE: Joi.string().required(),
  GOOGLE_DRIVE_SHARE_EMAIL: Joi.string().email().required(),
  GOOGLE_DRIVE_OWNER: Joi.string().email().required(),
  GOOGLE_SERVICE_EMAIL: Joi.string().email().required(),
  GOOGLE_DRIVE_PARENT_FOLDER_ID: Joi.string().required(),

  FRONTEND_URL: Joi.string().uri().default('http://localhost:5173'),
});
