import { Prisma } from "@prisma/client";

export type Score = Map<"mine" | "theirs", Set<number>>;

export type PlayerMap = Map<string, GetBoardPlayerDTO>;

export type BroadcastClickArgs = {
  cellId: number;
  eventType: "unclaim" | "claim";
};

// This is Prisma's recommended solution for creating type variations based on db models
// @see https://www.prisma.io/docs/concepts/components/prisma-client/advanced-type-safety/operating-against-partial-structures-of-model-types#problem-using-variations-of-the-generated-model-type
const BoardDTO = Prisma.validator<Prisma.BoardDefaultArgs>()({
  select: {
    createdById: true,
    name: true,
    password: true,
    gameType: true,
  },
});

export type CreateBoardDTO = Prisma.BoardGetPayload<typeof BoardDTO>;

const ObjectiveDTO = Prisma.validator<Prisma.ObjectiveDefaultArgs>()({
  select: {
    displayName: true,
    // districtId: true,
    creatorId: true,
    countable: true,
    countLimit: true,
  },
});

export type CreateObjectiveDTO = Prisma.ObjectiveGetPayload<
  typeof ObjectiveDTO
>;

const GetBoard = Prisma.validator<Prisma.BoardDefaultArgs>()({
  select: {
    name: true,
    id: true,
    gameType: true,
    createdBy: {
      select: {
        id: true,
        email: true,
        username: true,
      },
    },
  },
});

export type GetBoardDTO = Prisma.BoardGetPayload<typeof GetBoard>;

const BoardPlayerCreated = Prisma.validator<Prisma.BoardPlayerDefaultArgs>()({
  select: {
    user: {
      select: {
        id: true,
      },
    },
    board: {
      select: {
        id: true,
        name: true,
        createdBy: {
          select: {
            username: true,
            id: true,
          },
        },
      },
    },
  },
});

export type BoardPlayerCreatedDTO = Prisma.BoardPlayerGetPayload<
  typeof BoardPlayerCreated
>;

export type JoinBoardDTO = { password: string; boardId: string };

const GetBoardPlayer = Prisma.validator<Prisma.BoardPlayerDefaultArgs>()({
  select: {
    user: {
      select: {
        id: true,
        email: true,
        username: true,
      },
    },
    board: { select: { id: true } },
    socketId: true,
  },
});

export type GetBoardPlayerDTO = Prisma.BoardPlayerGetPayload<
  typeof GetBoardPlayer
>;

declare global {
  namespace Express {
    interface User {
      email: string;
      id: number;
    }
  }
}
// old: this was my original model for the board DTO, without using Prisma's API
// prefer the Prisma method above as it seems more well-equipped to handle changing models
// export interface CreateBoardDTO {
//   user: {
//     id: number;
//   };
//   roomName: string;
//   roomPassword: string;
//   seed?: number;
//   gameType: "LOCKOUT" | "STANDARD" | "BLACKOUT";
// }
