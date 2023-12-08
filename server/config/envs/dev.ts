import { defineConfig } from "../defineConfig.js";

export function createLocalConfig() {
  return defineConfig({
    JWT_SECRET:
      "2a055b890b33e796266b87af40e24b6a3fcdfb03fad0798ec634c8f6d7dcdf07",
    SESSION_SECRET:
      "604cedeecbddc60129f1727dab0fb646e1cefbf7d9fb2dc73d70d823bb65da9f",
    POSTMARK_API_TOKEN: process.env.POSTMARK_API_TOKEN as string,
    DB_ADDRESS: process.env.DATABASE_URL as string,
    DOMAIN: "http://localhost:3000",
  });
}
