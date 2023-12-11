import express, { Request } from "express";
import fetch from "node-fetch";
import pkg from "simple-xml-to-json";
const { convertXML } = pkg;
// @ts-ignore
import iso31662 from "iso-3166-2";
import http, { ServerResponse } from "http";
import cors from "cors";
import { Server, ServerOptions } from "socket.io";
import {
  createBoard,
  bulkCreateObjectives,
  getRecentBoards,
  findBoardAndJoin,
  addUserToBoard,
  getBoardPlayers,
  getMyGames,
  updatePlayerReady,
  updatePlayerSocketId,
  createBoardObjectives,
  getBoardObjectives,
  claimObjective,
  createOrUpdateCountryCity,
  updateUserCountry,
} from "./room-actions.js";
import { magicLogin } from "./magic-login.js";
import passport from "passport";
import { Prisma, PrismaClient } from "@prisma/client";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { GetBoardPlayerDTO, SocketPayload } from "shared/types.js";
// import { loadConfig, env } from "../config/load-config.js";
import { appConfig } from "../config/index.js";

// const config = await loadConfig();
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

const client =
  process.env.NODE_ENV === "PROD"
    ? "https://bingo-app-2rtu.onrender.com"
    : "http://localhost:5173";

const port = process.env.PORT || 3000;
// const buildPath =
//   process.env.NODE_ENV === "development"
//     ? path.normalize(path.join(__dirname, "../.."))
//     : path.normalize(path.join(__dirname, "../build"));
const app = express();
const allowedOrigins = [
  "http://localhost:5173",
  "https://bingo-app-2rtu.onrender.com",
];

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

const pgSession = connectPgSimple(session);
app.use(
  session({
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      httpOnly: true,
      sameSite: true,
    },
    secret: appConfig.SESSION_SECRET,
    name: "bingoToken",
    resave: false,
    saveUninitialized: false,
    store: new pgSession({
      conString: appConfig.DB_ADDRESS,
      tableName: "sessions",
    }),
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser(async function (user: Express.User, done) {
  const foundUser = await prisma.user.findFirst({
    where: { id: user.id },
    select: {
      id: true,
      email: true,
      country: {
        select: {
          id: true,
          name: true,
          localName: true,
        },
      },
      city: {
        select: {
          id: true,
          name: true,
          localName: true,
        },
      },
    },
  });
  if (foundUser) {
    done(null, foundUser);
  } else {
    done(new Error("No user found"), null);
  }
});

app.get("/api/v1/hello", (_req, res) => {
  return res.json({ success: true, data: { message: "Hello, world!" } });
});

app.post("/api/create-room", async (req, res) => {
  // TODO: user req.user instead of using useCurrentUser hook on client
  try {
    if (!req.isAuthenticated) {
      return res.status(401).json({
        success: false,
        data: { error: "Unauthorized, please sign in and try again" },
      });
    }
    const createdBoard = await createBoard(req.body);
    return res
      .status(201)
      .json({ success: true, data: { createdBoard } })
      .send();
  } catch (err: any) {
    return res
      .status(500)
      .json({ success: false, data: { error: err?.message } });
  }
});

app.get("/api/get-rooms", async (req, res, _next) => {
  console.log(req?.user);
  try {
    const boards = await getRecentBoards();
    return res.status(200).json({ success: true, data: boards });
  } catch (err: any) {
    return res
      .status(500)
      .json({ success: false, data: { error: err?.message } });
  }
});

app.post("/api/board-objectives/create", async (req, res) => {
  try {
    // should return the location that these resources can be found
    await createBoardObjectives({
      boardId: req.body.boardId,
    });
    res.status(201).json({
      success: true,
      data: { boardLocation: `${client}/play/${req.body.boardId}` },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      data: { error: "Something went wrong, please try again in a moment." },
    });
  }
});

async function getCountryFromCoordinates({
  lat,
  long,
}: {
  lat: number;
  long: number;
}) {
  try {
    console.log("latlong");
    console.log(lat);
    console.log(long);
    // get XML location data from lat-long
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${long}`
    );
    const data = await res.text();

    // convert XML to JSON
    const geoJson = convertXML(data);

    // pull out country and city data from information from JSON
    if (!geoJson.reversegeocode.children) {
      throw new Error("The location API call to OSM failed, please try again");
    }
    const [_, { addressparts }] = geoJson.reversegeocode.children;
    type LocationAddress = {
      house_number: string;
      road: string;
      neighbourhood: string;
      suburb: string;
      village: string;
      city: string;
      "ISO3166-2-lvl4": string;
      postcode: string;
      country: string;
      country_code: string;
    };
    const address: LocationAddress = {
      house_number: "",
      road: "",
      neighbourhood: "",
      suburb: "",
      village: "",
      city: "",
      "ISO3166-2-lvl4": "",
      postcode: "",
      country: "",
      country_code: "",
    };
    // address object will looks like this:
    // {
    //   house_number: '12號',
    //   road: '南京東路五段',
    //   neighbourhood: '吉祥里',
    //   suburb: '松山區',
    //   village: '中崙',
    //   city: '臺北市',
    //   'ISO3166-2-lvl4': 'TW-TPE',
    //   postcode: '105',
    //   country: '臺灣',
    //   country_code: 'tw'
    // }
    addressparts.children.forEach((item: any) => {
      const key = Object.keys(item)[0] as keyof LocationAddress;
      address[key] = item[key].content;
    });
    const countryLocalName = address.country;
    const cityLocalName = address.city;
    const { name: cityName, countryName } = iso31662.subdivision(
      address["ISO3166-2-lvl4"]
    );

    // save countryLocalName, cityLocalName, name (ie cityName) and countryName
    const cityAndCountry = await createOrUpdateCountryCity({
      countryLocalName,
      cityLocalName,
      cityName,
      countryName,
    });
    return cityAndCountry;
  } catch (err) {
    console.log(err);
  }
}
app.post("/api/coords-to-country", async (req, res) => {
  if (!req.isAuthenticated || !req.user) {
    return res.status(401).send();
  }

  const result = await getCountryFromCoordinates({
    lat: req.body.latitude,
    long: req.body.longitude,
  });

  if (result) {
    await updateUserCountry({
      userId: req.user?.id,
      countryId: result.country.id,
      cityId: result.city.id,
    });
  } else {
    console.log("no address coordins", result);
  }

  res.status(201).json({ success: true, data: result });
});
app.post("/api/create-objectives", async (req, res) => {
  // TODO: return error to client if errors
  const createdObjectives = await bulkCreateObjectives(req.body);
  res.status(201).json({ success: true, data: createdObjectives });
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

// app.use(express.static(buildPath));

// app.get("/home", (_req, res) => {
//   res.sendFile(path.join(buildPath, "home.html"));
// });

// app.get("/", (_req, res) => {
//   // this works
//   // return res.json({ message: "Hello, world!" });
//   // this works too
//   res.sendFile(path.join(__dirname, "index.html"));
// });

app.get("/api/ping", (_req, res) => {
  return res.json({ success: true, data: { message: "pong" } });
});

app.post("/api/rooms/join", async (req, res) => {
  // get the information over the wire:
  // - id of board to be joined
  // - password for board
  // - route should be authenticated so user is already in request
  try {
    if (!req.isAuthenticated || !req.user) {
      return res.status(401).send({
        success: false,
        data: { error: "Unauthorized, please sign in and try again" },
      });
    }
    const { body, user } = req;
    const { password, boardId } = body;
    const { passwordMatch, joiningBoardId, joiningUserId } =
      await findBoardAndJoin({
        boardId,
        password,
        userId: user.id,
      });

    if (!passwordMatch)
      return res
        .status(401)
        .send({ success: false, data: { error: "Password doesn't match" } });

    const boardPlayerWithBoard = await addUserToBoard({
      boardId: joiningBoardId,
      userId: joiningUserId,
    });

    // tried to do a server side redirect but kept getting access-control-allow-origin related errors
    // res.setHeader("Access-Control-Allow-Origin", "localhost");
    // res..status(302).location(`http://localhost:5173/play/${boardPlayerWithBoard.board.id}`);
    return res.status(200).json({ success: true, data: boardPlayerWithBoard });
  } catch (err: any) {
    return res.status(500).send(err?.message);
  }
});

app.get("/api/rooms/players", async (req, res) => {
  try {
    if (!req.isAuthenticated || !req.user) {
      return res.status(401).send({
        success: false,
        data: { error: "Unauthorized, please sign in and try again" },
      });
    }
    const boardId = req.query.board as string;
    const boardPlayers = await getBoardPlayers({ boardId });
    return res.status(201).json({ success: true, data: boardPlayers });
  } catch (err) {
    return res.status(501).send({
      success: false,
      data: { error: "Server error, try again in a moment" },
    });
  }
});

app.get("/api/rooms/objectives", async (req, res) => {
  try {
    if (!req.isAuthenticated || !req.user) {
      return res.status(401).send({
        success: false,
        data: { error: "Unauthorized, please sign in and try again" },
      });
    }
    const boardId = req.query.board as string;
    const objectives = await getBoardObjectives({ boardId });
    return res.status(201).json({ success: true, data: objectives });
  } catch (err) {
    return res.status(501).send({
      success: false,
      data: { error: "Server error, try again in a moment" },
    });
  }
});

app.get("/user/me", (req, res) => {
  // access to req.isAuthenticated(): boolean
  // access to req.user: {email: string, id: number ...}
  try {
    if (!req.isAuthenticated || !req.user) {
      return res.status(401).send({
        success: false,
        data: { error: "Unauthorized, please sign in and try again" },
      });
    }
    let country, city;
    if (req.user.country) {
      country = req.user.country;
      city = req.user.country;
    }
    res.status(200).json({
      success: true,
      data: {
        email: req.user.email,
        id: req.user.id,
        country: country ? { ...country } : null,
        city: city ? { ...city } : null,
      },
    });
  } catch (err) {
    return res.status(501).send({
      success: false,
      data: { error: "Server error, try again in a moment" },
    });
  }
});

app.get("/api/games", async (req, res, _next) => {
  try {
    if (!req.isAuthenticated || !req.user) {
      return res.status(401).send({
        success: false,
        data: { error: "Unauthorized, please sign in and try again" },
      });
    }
    const userId = Number(req.query.userId);
    const myGames = await getMyGames({ userId });
    return res.status(201).json({ success: true, data: myGames });
  } catch (err) {
    return res.status(501).json({
      success: false,
      data: { error: "Server error, please try again" },
    });
  }
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
    return res.status(205).send();
  });
});

io.on("connection", (socket) => {
  // initial message to connector
  // io.to(socket.id).emit("new_message", {
  //   id: "999",
  //   msg: "You are connected, your Id is " + socket.id,
  // });
  // console.log("a user connected, id: ", socket.id);

  socket.on("cell:clicked", async (payload: SocketPayload["cell:toggled"]) => {
    const { boardId, userId, objectiveId, eventType } = payload;
    await claimObjective({
      boardId,
      userId,
      objectiveId,
      eventType: eventType,
    });
    socket.to(`board-${boardId}`).emit("cell:toggled", payload);
  });

  socket.on(
    "player:ready",
    async ({ userId, boardId, color }: SocketPayload["player:ready"]) => {
      // update boardPlayer with color
      // emit to others that we're ready WITH color
      console.log({ userId, socketId: socket.id, color });
      await updatePlayerReady({ userId, boardId, color });
      socket
        .to(`board-${boardId}`)
        .emit("player:waiting", { userId, socketId: socket.id, color });
    }
  );

  socket.on(
    "room:joined",
    async ({ boardId, player }: SocketPayload["room:joined"]) => {
      if (!player.user) {
        return;
      }
      try {
        // TODO: if we need more security in rooms, can check to see if user is a BoardPlayer on this for "authentication"
        const userId = player.user.id;
        const socketId = socket.id;
        const updatedPlayer = await updatePlayerSocketId({
          userId,
          boardId,
          socketId,
        });

        const newPlayer: GetBoardPlayerDTO = {
          socketId: socket.id,
          user: {
            id: player.user.id,
            email: player.user.email,
            username: player.user.username,
          },
          board: {
            id: boardId,
          },
          color: updatedPlayer.color,
        };
        socket.join(`board-${boardId}`);
        socket.to(`board-${boardId}`).emit("player:joined", {
          newPlayer,
          socketId: socket.id,
        });
      } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError) {
          if (err.code === "P2025") {
            io.to(socket.id).emit("error", {
              message:
                "You arent allowed to enter this room without a password",
              errorType: "unable-to-join",
              redirectPath: "/play",
            });
          }
        } else {
          console.log(err);
        }
      }
    }
  );

  socket.on("game:started", (payload: SocketPayload["game:started"]) => {
    const { boardId } = payload;
    createBoardObjectives({ boardId }).then((boardObjectives) => {
      if (boardObjectives instanceof Error) {
        io.sockets.in(`board-${boardId}`).emit("error", {
          message: "There arent enough objectives for your city yet.",
          errorType: "objective-amount",
          redirectPath: "/create-objectives",
          suggestion: "create some more objectives",
        });
      } else {
        io.sockets
          .in(`board-${boardId}`)
          .emit("objectives:created", boardObjectives);
      }
    });
  });

  socket.on("disconnecting", async () => {
    const [socketId, boardId] = socket.rooms;
    // nullify their socket id
    // const player = await updatePlayerSocketId({ boardId, socketId });
    // console.log("disconnecting player, after disconnect: ", player);
    socket.to(boardId).emit("player:left", { socketId });
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
