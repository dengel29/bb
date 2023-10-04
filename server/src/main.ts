import express, { Request } from "express";
import path from "path";
import http from "http";
import cors from "cors";
import { Server, ServerOptions } from "socket.io";
import Context from "./middleware/context";
import { fileURLToPath } from "url";
import { createBoard, bulkCreateObjectives } from "./room-actions";
import { magicLogin } from "./magic-login";
import passport from "passport";
import { PrismaClient } from "@prisma/client";
import session, { Store } from "express-session";
import connectPgSimple from "connect-pg-simple";
import { config } from "../config";

const pgSession = connectPgSimple(session);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = process.env.PORT || 3000;
const buildPath =
  process.env.NODE_ENV === "development"
    ? path.normalize(path.join(__dirname, "../.."))
    : path.normalize(path.join(__dirname, "../build"));
const publicPath = path.normalize(path.join(__dirname, "../../public"));
const app = express();
app.use(cors());
app.use(express.json());

// socket.io stuff
const httpServer = http.createServer(app);

interface IOServerOptions extends Partial<ServerOptions> {
  cors: {
    origin: string | string[];
  };
}

const serverOptions: IOServerOptions = {
  cors: {
    origin: ["http://localhost:5173"],
  },
};

const io = new Server(httpServer, serverOptions);
// app.use((req: Request, res: any, next: any) => {
//   Context.bind(req);
//   next();
// });

app.use(
  session({
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    },
    secret: config.dev.sessionSecret,
    resave: false,
    saveUninitialized: true,
    store: new pgSession({
      conString: config.dev.db,
      tableName: "sessions",
    }),
  })
);

app.get("/api/v1/hello", (_req, res) => {
  return res.json({ message: "Hello, world!" });
});

app.post("/api/create-room", async (req, res) => {
  console.log("request:", req.body);
  const createdBoard = await createBoard(req.body);
  res.status(200).json(createdBoard);
});

app.post("/api/create-objectives", async (req, res) => {
  console.log("request:", req.body);
  const createdObjectives = await bulkCreateObjectives(req.body);
  res.status(200).json(createdObjectives);
});

// TODO: finish SES approval to send emails
app.post("/auth/magiclogin", magicLogin.send);

app.get("/auth/magiclogin/callback", (_req, res) => {
  return res.json({ message: "You're in!" });
});

app.use(express.static(buildPath));

app.get("/home", (_req, res) => {
  res.sendFile(path.join(buildPath, "home.html"));
});

app.get("/", (_req, res) => {
  // this works
  // return res.json({ message: "Hello, world!" });
  // this works too
  res.sendFile(path.join(__dirname, "index.html"));
});

// The standard passport callback setup
app.get("/auth/magiclogin/callback", passport.authenticate("magiclogin"));
passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(async function (id: number, done) {
  const p = new PrismaClient();
  const user = await p.user.findFirst({ where: { id: id } });
  done(new Error("whatever"), user);
  //User.findById(id, function (err, user) {
  //done(err, user);
  // });
});
io.on("connection", (socket) => {
  // initial message to connector
  io.to(socket.id).emit("new_message", {
    id: "999",
    msg: "You are connected, your Id is " + socket.id,
  });
  console.log("a user connected, id: ", socket.id);

  socket.on("cellClicked", (payload) => {
    console.log("broadcasting colorCell message");
    socket.broadcast.emit("colorCell", payload);
  });

  socket.on("roomCreated", (payload) => {
    // creates a room on the db with a name, password, seed, timeLimit
  });
});

httpServer.listen(port, () => {
  console.log("Server listening on port", port);
});

/**
 * Some predefined delay values (in milliseconds).
 */
export enum Delays {
  Short = 500,
  Medium = 2000,
  Long = 5000,
}

/**
 * Returns a Promise<string> that resolves after a given time.
 *
 * @param {string} name - A name.
 * @param {number=} [delay=Delays.Medium] - A number of milliseconds to delay resolution of the Promise.
 * @returns {Promise<string>}
 */
function delayedHello(
  name: string,
  delay: number = Delays.Medium
): Promise<string | undefined> {
  return new Promise((resolve: (value?: string) => void) =>
    setTimeout(() => resolve(`Hello, ${name}`), delay)
  );
}

// Please see the comment in the .eslintrc.json file about the suppressed rule!
// Below is an example of how to use ESLint errors suppression. You can read more
// at https://eslint.org/docs/latest/user-guide/configuring/rules#disabling-rules

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export async function greeter(name: string) {
  // eslint-disable-line @typescript-eslint/no-explicit-any
  // The name parameter should be of type string. Any is used only to trigger the rule.
  return await delayedHello(name, Delays.Long);
}
