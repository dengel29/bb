import passport from "passport";
import MagicLoginStrategy from "passport-magic-login";
import { sendEmail } from "./email-actions.js";
import { findOrCreateUserByEmail } from "./auth.js";
import { loadConfig } from "../load-config.js";

const config = loadConfig();

export const magicLogin = new MagicLoginStrategy.default({
  // Used to encrypt the authentication token. Needs to be long, unique and (duh) secret.
  secret: config[`${process.env.NODE_ENV}_JWT_SECRET`],

  // The authentication callback URL
  callbackUrl: "/auth/magiclogin/callback",

  // Called with th e generated magic link so you can send it to the user
  // "destination" is what you POST-ed from the client
  // "href" is your confirmUrl with the confirmation token,
  // for example "/auth/magiclogin/confirm?token=<longtoken>"
  sendMagicLink: async (destination: string, href: string) => {
    await sendEmail({
      to: destination,
      from: "dan@dngl.cc",
      subject: "Sign In To BingoBike",
      textBody: `Click this link to finish logging in: http://localhost:3000${href}&email=${destination}`,
    });
  },

  // Once the user clicks on the magic link and verifies their login attempt,
  // you have to match their email to a user record in the database.
  // If it doesn't exist yet they are trying to sign up so you have to create a new one.
  // "payload" contains { "destination": "email" }
  // In standard passport fashion, call callback with the error as the first argument (if there was one)
  // and the user data as the second argument!
  verify: (payload: any, callback: (err: any, user?: Express.User) => void) => {
    // Get or create a user with the provided email from the database
    findOrCreateUserByEmail(payload.destination)
      .then((user) => {
        callback(null, user);
      })
      .catch((err) => {
        callback(err);
      });
  },

  // Optional: options passed to the jwt.sign call (https://github.com/auth0/node-jsonwebtoken#jwtsignpayload-secretorprivatekey-options-callback)
  jwtOptions: {
    expiresIn: "2 days",
  },
});

// Add the passport-magic-login strategy to Passport
passport.use(magicLogin);
