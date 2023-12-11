import { io } from "socket.io-client";
import { domain } from "./domain";

export const socket = io(domain);
