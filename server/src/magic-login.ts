import passport from "passport";
// import MagicLink from "passport-magic-link";
import MagicLoginStrategy from "passport-magic-login";
import { config } from "../config";
import { sendEmail } from "./email-actions";
import { findOrCreateUserByEmail } from "./auth";

export const magicLogin = new MagicLoginStrategy({
  // Used to encrypt the authentication token. Needs to be long, unique and (duh) secret.
  secret: config.dev.jwtSecret,

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
      subject: "Sign In, bb",
      textBody: `Click this link to finish logging in: http://localhost:3000${href}`,
    });
  },

  // Once the user clicks on the magic link and verifies their login attempt,
  // you have to match their email to a user record in the database.
  // If it doesn't exist yet they are trying to sign up so you have to create a new one.
  // "payload" contains { "destination": "email" }
  // In standard passport fashion, call callback with the error as the first argument (if there was one)
  // and the user data as the second argument!
  verify: (payload, callback) => {
    // Get or create a user with the provided email from the database
    console.log(payload);
    const pl = payload;
    findOrCreateUserByEmail(pl.destination)
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

// const MagicLinkStrategy = magicLink.Strategy;

// function send(user, token) {
//   const link = 'http://localhost:3000/login/email/verify?token=' + token;
//   const msgOptions = {
//     to: user.email,
//     from: config.fromEmail,
//     subject: 'Sign in',
//     htmlBody: '<h3>Hello!</h3><p>Click the link below to finish signing in to Todos.</p><p><a href="' + link + '">Sign in</a></p>',
//   }
//   sendEmail(msgOptions)
// }

// function verify(user) {
//   return new Promise(function(resolve, reject) {
//     findOrCreateUserByEmail(user.email)
//   });
// }

// export const magicLogin = () => {
//   passport.use(new MagicLinkStrategy({
//     secret: 'secretidpasswordnonsense',
//     userFields: ['email'],
//     tokenField: 'token',
//     verifyUserAfterToken: true
//   }, send(user, token), verify(user)))
// };
