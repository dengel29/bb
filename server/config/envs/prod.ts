import { defineConfig } from "../defineConfig.js";

export function createProdConfig() {
  return defineConfig({
    JWT_SECRET: process.env.JWT_SECRET as string,
    SESSION_SECRET: process.env.SESSION_SECRET as string,
    POSTMARK_API_TOKEN: process.env.POSTMARK_API_TOKEN as string,
    DB_ADDRESS: process.env.DB_ADDRESS as string,
    DOMAIN: "https://bingo-server-gylc.onrender.com",
  });
}
