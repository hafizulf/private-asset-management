import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();
const defaultEnvPath = path.resolve(__dirname, '../../.env');

if (fs.existsSync(defaultEnvPath)) {
  console.log(`Loading environment file: ${defaultEnvPath}`);
  dotenv.config({ path: defaultEnvPath });
} else {
  console.error('No .env file found! Please create one to set environment variables.');
  process.exit(1);
}

const requiredEnvVars = ['APP_ENV', 'APP_HOST', 'APP_PORT', 'APP_API_PREFIX', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'DB_HOST', 'DB_PORT', 'DB_DIALECT', 'JWT_SECRET_KEY', 'JWT_REFRESH_SECRET_KEY', 'JWT_SECRET_TTL', 'JWT_REFRESH_SECRET_TTL'];

const optionalEnvVars: string [] = [];

requiredEnvVars.forEach((key) => {
  if (!process.env[key]) {
    console.error(`Environment variable ${key} is not defined!`);
    process.exit(1);
  }
});

optionalEnvVars.forEach((key) => {
  if (!process.env[key]) {
    console.warn(`Optional environment variable ${key} is not defined. Proceeding without it.`);
  }
});

export const APP_ENV = process.env.APP_ENV!
export const APP_HOST = process.env.APP_HOST!
export const APP_PORT = process.env.APP_PORT!
export const APP_API_PREFIX = process.env.APP_API_PREFIX!

// Database
export const DB_CONFIG = {
  db_user: process.env.DB_USER!,
  db_password: process.env.DB_PASSWORD!,
  db_name: process.env.DB_NAME!,
  config: {
    host: process.env.DB_HOST!,
    port: process.env.DB_PORT!,
    dialect: process.env.DB_DIALECT!,
  },
};

// json web token
export const JWT_REFRESH_SECRET_KEY = process.env.JWT_REFRESH_SECRET_KEY!
export const JWT_REFRESH_SECRET_TTL = parseInt(process.env.JWT_REFRESH_SECRET_TTL!)
export const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY!
export const JWT_SECRET_TTL = parseInt(process.env.JWT_SECRET_TTL!)

// MQTT
export const MQTT_SERVER = process.env.MQTT_SERVER!
export const MQTT_PORT = process.env.MQTT_PORT!
export const MQTT_USERNAME = process.env.MQTT_USERNAME!
export const MQTT_PASSWORD = process.env.MQTT_PASSWORD!
