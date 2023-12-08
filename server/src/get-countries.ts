import { PrismaClient } from "@prisma/client";
import { SessionData, Store } from "express-session";

const prisma = new PrismaClient();

prisma.country
  .findMany({
    include: {
      cities: true,
    },
  })
  .then((res) => {
    console.log(res);
  });

// module.exports = Store;

// function Store() {
//   EventEmitter;
// }

// Store.prototype.dan = () => {
//   console.log("dan");
// };

declare class PStore<M extends string = "session"> extends Store {
  get(
    sid: string,
    callback: (err: any, session?: SessionData | null | undefined) => void
  ): void;
  set(
    sid: string,
    session: SessionData,
    callback?: ((err?: any) => void) | undefined
  ): void;
  destroy(sid: string, callback?: ((err?: any) => void) | undefined): void;
}

const littleP = new PStore();

function printStore(s: Store) {
  console.log(s);
}

printStore(littleP);
