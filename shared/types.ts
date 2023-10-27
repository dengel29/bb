import { Board, Prisma } from "@prisma/client";

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
    color: true,
    socketId: true,
  },
});

export type GetBoardPlayerDTO = Prisma.BoardPlayerGetPayload<
  typeof GetBoardPlayer
>;

const MyGames = Prisma.validator<Prisma.BoardDefaultArgs>()({
  select: {
    createdBy: {
      select: {
        email: true,
        username: true,
      },
    },
    updatedAt: true,
    createdAt: true,
    name: true,
    id: true,
    boardPlayers: {
      select: {
        user: {
          select: {
            email: true,
          },
        },
      },
    },
  },
});

export type MyGamesDTO = Prisma.BoardGetPayload<typeof MyGames>;

const BoardObjectives = Prisma.validator<Prisma.BoardObjectiveDefaultArgs>()({
  include: {
    objective: {
      select: {
        displayName: true,
        id: true,
        countable: true,
        countLimit: true,
      },
    },
  },
});

export type BoardObjectivesDTO = Prisma.BoardObjectiveGetPayload<
  typeof BoardObjectives
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

export type ObjectValues<T extends Record<string, unknown>> = T[keyof T];
//Then use it like this: type Values = ObjectValues<typeof KeyToVal>

export type SocketPayload = {
  "player:ready": { userId: number; boardId: string; color: string };
  "objectives:created": BoardObjectivesDTO[];
  "player:joined": { newPlayer: GetBoardPlayerDTO; socketId: string };
  "room:joined": {
    player: Partial<GetBoardPlayerDTO>;
    boardId: string;
    color?: string | undefined;
  };
  "player:left": {
    socketId: string;
  };
  "player:waiting": { userId: number; socketId: string; color: string };
  "cell:toggled": {
    userId: number;
    cellId: BroadcastClickArgs["cellId"];
    objectiveId: BroadcastClickArgs["cellId"];
    eventType: BroadcastClickArgs["eventType"];
    boardId: string;
  };
  "cell:clicked": {
    userId: number;
    cellId: BroadcastClickArgs["cellId"];
    objectiveId: BroadcastClickArgs["cellId"];
    eventType: BroadcastClickArgs["eventType"];
    boardId: string;
  };
  "game:started": {
    boardId: string;
  };
  error: {
    message: string;
    errorType: errorEnum;
    redirectPath: PathPrefixedString;
  };
};

type errorEnum = "unable-to-join";

export type SocketAction = keyof SocketPayload;

export type PossiblePayloads = ObjectValues<SocketPayload>;

export type PathPrefixedString = `/${string}`;

// TODO: find out if this is kosher
// export type PossiblePayloads = SocketPayload[SocketAction];
