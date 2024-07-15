import * as dotenv from "dotenv";
dotenv.config()

export const jwtSecret: string= process.env.JWT_SECRET_KEY

export const GeminiKey: string= process.env.GEMINI_API_KEY

export const GeminiModel: string= process.env.GEMINI_MODEL
