import { defineConfig } from "../defineConfig.js";

export function createProdConfig() {
  return defineConfig({
    JWT_SECRET: process.env.JWT_SECRET as string,
    SESSION_SECRET: process.env.SESSION_SECRET as string,
    POSTMARK_API_TOKEN: process.env.POSTMARK_API_TOKEN as string,
    DATABASE_URL: process.env.DATABASE_URL as string,
    BARE_DOMAIN: "dngl",
    DOMAIN: "https://bb-api.dngl.cc",
    CLIENT: "https://bb.dngl.cc",
  });
}
