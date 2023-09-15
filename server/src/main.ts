import express from "express";
import path from "path";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";

import { fileURLToPath } from "url";

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

// socket.io stuff
const httpServer = http.createServer(app);
const io = new Server(httpServer);

app.get("/api/v1/hello", (_req, res) => {
  res.json({ message: "Hello, world!" });
});

// TODO: finish SES approval to send emails
// app.post('/auth/magiclogin', magicLogin.send);

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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("cellClicked", (payload) => {
    console.log("broadcasting colorCell message");
    socket.broadcast.emit("colorCell", payload);
    // socket.emit('colorCell', payload);
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
