import { ServerClient } from "postmark";
import { config } from "./config";

console.log(new ServerClient(config.dev.postmarkApiToken));
