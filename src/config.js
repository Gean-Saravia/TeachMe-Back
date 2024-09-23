import { config } from "dotenv";
config();

export const PORT = process.env.PORT || 3000;
export const DB_USER = process.env.DB_USER || "sa";
export const DB_PASSWORD = process.env.DB_PASSWORD || "yourStrong#Password";
export const DB_SERVER = process.env.DB_SERVER || "teachme.database.windows.net";
export const DB_DATABASE = process.env.DB_DATABASE || "TeachMe";
export const SECRET_JWT_KEY = process.env.SECRET_JWT_KEY;
export const APP_URL = process.env.APP_URL || 'http://localhost:5501/'