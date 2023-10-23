import { PossiblePayloads, SocketAction } from "shared/types";
import { socket } from "./socket";

export function socketEmit(event: SocketAction, payload: PossiblePayloads) {
  socket.emit(event, payload);
}

export function socketOn(
  event: SocketAction,
  callback: (payload: PossiblePayloads) => void
) {
  socket.on(event, callback);
}

// on("player:waiting", (payload) => {
//   if ("userId" in payload && "socketId" in payload && "color" in payload) {
//     const { userId, socketId, color } = payload;
//     console.log({ userId, socketId, color });
//   }
// });
