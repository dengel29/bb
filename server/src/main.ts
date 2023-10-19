import express, { Request } from "express";
import path from "path";
import http, { ServerResponse } from "http";
import cors from "cors";
import { Server, ServerOptions } from "socket.io";
import { fileURLToPath } from "url";
import {
  createBoard,
  bulkCreateObjectives,
  getRecentBoards,
  findBoardAndJoin,
  addUserToBoard,
  getBoardPlayers,
  getMyGames,
} from "./room-actions";
import { magicLogin } from "./magic-login";
import passport from "passport";
import { PrismaClient, User } from "@prisma/client";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { config } from "../config";
import { GetBoardPlayerDTO } from "shared/types";

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
const allowedOrigins = ["http://localhost:5173"];

const headers = (req: Request, res: ServerResponse, next: () => void) => {
  const origin: string = req.headers.origin!;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Methods", "GET, POST");
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }
  next();
};

app.use(headers);
app.use(
  cors({
    credentials: true,
    origin: allowedOrigins,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  })
);
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

const prisma = new PrismaClient();
const io = new Server(httpServer, serverOptions);

app.use(
  session({
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      httpOnly: true,
      sameSite: true,
    },
    secret: config.dev.sessionSecret,
    name: "bingoToken",
    resave: false,
    saveUninitialized: true,
    store: new pgSession({
      conString: config.dev.db,
      tableName: "sessions",
    }),
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser(async function (user: User, done) {
  const foundUser = await prisma.user.findFirst({ where: { id: user.id } });
  if (foundUser) {
    done(null, foundUser);
  } else {
    done(new Error("No user found"), null);
  }
});

app.get("/api/v1/hello", (_req, res) => {
  return res.json({ message: "Hello, world!" });
});

app.post("/api/create-room", async (req, res) => {
  // TODO: user req.user instead of using useCurrentUser hook on client
  try {
    if (!req.isAuthenticated) {
      return res.status(401).send("Unauthorized, please sign in and try again");
    }
    const createdBoard = await createBoard(req.body);
    return res.status(200).json(createdBoard).send();
  } catch (err) {
    return res.status(500).send(err?.message);
  }
});

app.get("/api/get-rooms", async (req, res, next) => {
  console.log(req?.user);
  try {
    const boards = await getRecentBoards();
    return res.status(200).json(boards);
  } catch (err) {
    return res.status(500).send(err?.message);
  }
});

app.post("/api/create-objectives", async (req, res) => {
  const createdObjectives = await bulkCreateObjectives(req.body);
  res.status(200).json(createdObjectives);
});

// magicLogin.send maps to the sendEmail option
app.post("/auth/magiclogin", magicLogin.send);

// passport.authenticate("magicLogin") maps to verify in the options of magic-login
app.get(
  "/auth/magiclogin/callback",
  passport.authenticate("magiclogin", {
    successRedirect: "http://localhost:5173/login-success",
    failureRedirect: "http://localhost:5173/",
  })
);

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

app.post("/api/rooms/join", async (req, res) => {
  // get the information over the wire:
  // - id of board to be joined
  // - password for board
  // - route should be authenticated so user is already in request
  try {
    if (!req.isAuthenticated || !req.user) {
      return res.status(401).send("Unauthorized, please sign in and try again");
    }
    const { body, user } = req;
    const { password, boardId } = body;
    const { passwordMatch, joiningBoardId, joiningUserId } =
      await findBoardAndJoin({
        boardId,
        password,
        userId: user.id,
      });
    if (!passwordMatch) {
      return res.status(401).send("Password doesn't match");
    }
    const boardPlayerWithBoard = await addUserToBoard({
      boardId: joiningBoardId,
      userId: joiningUserId,
    });
    // tried to do a server side redirect but kept getting access-control-allow-origin related errors
    // res.setHeader("Access-Control-Allow-Origin", "localhost");
    // res..status(302).location(`http://localhost:5173/play/${boardPlayerWithBoard.board.id}`);
    return res.status(200).json(boardPlayerWithBoard).send();
  } catch (err) {
    return res.status(500).send(err?.message);
  }
});

app.get("/api/rooms/players", async (req, res, next) => {
  try {
    if (!req.isAuthenticated || !req.user) {
      return res.status(401).send("Unauthorized, please sign in and try again");
    }
    const boardId = req.query.board as string;
    const boardPlayers = await getBoardPlayers({ boardId });
    return res.status(201).json(boardPlayers);
  } catch (err) {}
});

app.get("/user/me", (req, res, next) => {
  // access to req.isAuthenticated(): boolean
  // access to req.user: {email: string, id: number ...}
  if (req.user) {
    res.status(200).json({ email: req.user.email, id: req.user.id });
  } else {
    return res.status(401).send();
  }
});

app.get("/api/games", async (req, res, next) => {
  try {
    console.log("api/games", req.query);
    if (!req.isAuthenticated || !req.user) {
      return res.status(401).send("Unauthorized, please sign in and try again");
    }
    const userId = Number(req.query.userId);
    const myGames = await getMyGames({ userId });
    return res.status(201).json(myGames);
  } catch (err) {}
});

app.post("/log-out", (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.clearCookie("bingoToken", {
      domain: "localhost",
      path: "/",
      sameSite: true,
      httpOnly: true,
    });
    res.redirect("http://localhost:5173/home");
  });
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

  socket.on("room-exited", (payload) => {
    console.log("room exited on server");
    socket
      .to(`board-${payload.boardId}`)
      .emit("playerLeft", { exitedPlayer: payload.player });
  });

  socket.on("room-joined", async (payload) => {
    // TODO: if we need more security in rooms, can check to see if user is a BoardPlayer on this for "authentication"

    await prisma.boardPlayer.update({
      where: {
        boardPlayerId: {
          userId: payload.player.user.id,
          boardId: payload.boardId,
        },
      },
      data: {
        socketId: socket.id,
      },
    });

    const newPlayer: GetBoardPlayerDTO = {
      socketId: socket.id,
      user: {
        id: payload.player.user.id,
        email: payload.player.user.email,
        username: null,
      },
      board: {
        id: payload.boardId,
      },
    };
    socket.join(`board-${payload.boardId}`);
    socket.to(`board-${payload.boardId}`).emit("playerJoined", {
      newPlayer,
      socketId: socket.id,
    });
  });

  socket.on("disconnecting", () => {
    const [socketId, boardId] = socket.rooms;
    socket.to(boardId).emit("playerLeft", { socketId });
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
