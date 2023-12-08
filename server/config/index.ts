import { createLocalConfig } from "./envs/dev.js";
import { createProdConfig } from "./envs/prod.js";

export const appConfig = getConfig();

function getConfig() {
  switch (process.env.APP_ENV) {
    case "prod":
      return createProdConfig();
    case "dev":
      return createLocalConfig();
    default:
      throw new Error(`Invalid APP_ENV "${process.env.APP_ENV}"`);
  }
}
