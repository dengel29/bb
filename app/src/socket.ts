import { io } from "socket.io-client";
const URL =
  process.env.APP_ENV === "prod"
    ? "https://bingo-server-gylc.onrender.com"
    : "http://localhost:3000";

export const socket = io(URL);
