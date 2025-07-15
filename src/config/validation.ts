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

  // 🧠 Только OAuth 2.0 Client
  GOOGLE_CLIENT_ID: Joi.string().required(),
  GOOGLE_CLIENT_SECRET: Joi.string().required(),
  GOOGLE_REDIRECT_URI: Joi.string().uri().required(),
  GOOGLE_REFRESH_TOKEN: Joi.string().required(),

  // 🎯 Папка и владелец
  GOOGLE_DRIVE_PARENT_FOLDER_ID: Joi.string().required(),
  GOOGLE_DRIVE_OWNER: Joi.string().email().required(),

  FRONTEND_URL: Joi.string().uri().default('http://localhost:5173'),
});
