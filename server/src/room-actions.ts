import { Prisma, PrismaClient } from "@prisma/client";
import {
  BoardObjectivesDTO,
  BoardPlayerCreatedDTO,
  CreateBoardDTO,
  CreateObjectiveDTO,
  GetBoardPlayerDTO,
  MyGamesDTO,
} from "shared/types";

const prisma = new PrismaClient();

export async function createBoard(args: CreateBoardDTO) {
  const { createdById, name, password, gameType } = args;
  // get user by ID
  // find what city/district they're in
  // grab 25 objectives that pertain to that city/district
  // create BoardObjectives

  const result = await prisma.board.create({
    data: {
      name,
      password,
      gameType,
      createdById,
    },
  });

  return result;
}

export async function getRecentBoards() {
  // find boards "greater than or equal to yesterday"
  const result = await prisma.board.findMany({
    where: {
      createdAt: {
        gte: new Date(Date.now() - 8.64e7),
      },
    },
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

  return result;
}

export async function bulkCreateObjectives(
  objectives: CreateObjectiveDTO[]
): Promise<Prisma.BatchPayload | void> {
  try {
    // const { displayName, districtId, creatorId, countable, countLimit } = args;
    const result = await prisma.objective.createMany({ data: objectives });
    return result;
  } catch (error) {
    console.log(error);
  }
}

export async function findBoardAndJoin({
  boardId,
  password,
  userId,
}: {
  boardId: string;
  password: string;
  userId: number;
}): Promise<{
  passwordMatch: boolean;
  joiningUserId: number;
  joiningBoardId: string;
}> {
  const board = await prisma.board.findFirst({
    where: { id: boardId },
    select: { password: true, id: true },
  });

  if (board?.password !== password) {
    // respond with passwordMatch false
    return {
      passwordMatch: false,
      joiningUserId: userId,
      joiningBoardId: boardId,
    };
  }
  // if the password does match:
  // - add the user as a board player
  // - return the board with all board players
  return {
    passwordMatch: true,
    joiningUserId: userId,
    joiningBoardId: boardId,
  };
}

export async function addUserToBoard({
  boardId,
  userId,
}: {
  boardId: string;
  userId: number;
}): Promise<BoardPlayerCreatedDTO> {
  const boardPlayer = await prisma.boardPlayer.create({
    data: {
      userId,
      boardId,
    },
    include: {
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

  return boardPlayer;
}

export async function getBoardPlayers({
  boardId,
}: {
  boardId: string;
}): Promise<GetBoardPlayerDTO[]> {
  const boardPlayers: GetBoardPlayerDTO[] = await prisma.boardPlayer.findMany({
    where: {
      boardId,
    },
    select: {
      user: {
        select: {
          id: true,
          email: true,
          username: true,
        },
      },
      board: {
        select: { id: true },
      },
      socketId: true,
      color: true,
    },
    // include: {
    // },
  });

  return boardPlayers;
}

export async function getMyGames({
  userId,
}: {
  userId: number;
}): Promise<MyGamesDTO[]> {
  const myGames: MyGamesDTO[] = await prisma.board.findMany({
    where: {
      boardPlayers: {
        some: {
          userId,
        },
      },
    },
    select: {
      createdBy: {
        select: {
          email: true,
          username: true,
        },
      },
      updatedAt: true,
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
  return myGames;
}

export async function updatePlayerReady({
  color,
  userId,
  boardId,
}: {
  color: string;
  userId: number;
  boardId: string;
}) {
  await prisma.boardPlayer.update({
    where: {
      boardPlayerId: {
        userId,
        boardId,
      },
    },
    data: {
      color,
    },
  });
}
export async function updatePlayerSocketId({
  socketId,
  userId,
  boardId,
}: {
  socketId: string;
  userId: number;
  boardId: string;
}): Promise<GetBoardPlayerDTO> {
  // seems I can't simply use index if a composite id is also expected
  // let where, data;
  // if (socketId && !userId) {
  //   where = {
  //     socketId,
  //   };
  //   data = {
  //     socketId: null,
  //   };
  // } else {
  //   where = {
  //     boardPlayerId: {
  //       userId,
  //       boardId,
  //     },
  //   };
  //   data = {
  //     socketId,
  //   };
  // }
  return await prisma.boardPlayer.update({
    where: {
      boardPlayerId: {
        userId,
        boardId,
      },
    },
    data: {
      socketId,
    },
    select: {
      user: {
        select: {
          id: true,
          email: true,
          username: true,
        },
      },
      board: {
        select: {
          id: true,
        },
      },
      socketId: true,
      boardId: true,
      color: true,
    },
  });
}

export async function getRandomObjectives({ boardId }: { boardId: string }) {
  const objectiveIds = await prisma.$queryRaw<
    { id: number }[]
  >`SELECT id FROM objectives ORDER BY RANDOM() LIMIT 25`;

  const boardObjectives: {
    cellX: number;
    cellY: number;
    boardId: string;
    objectiveId: number;
  }[] = [];
  let index = 0;
  for (let x = 0; x < 5; x++) {
    for (let y = 0; y < 5; y++) {
      const bo = {
        cellX: x,
        cellY: y,
        boardId,
        objectiveId: objectiveIds[index].id,
      };
      boardObjectives.push(bo);
      index++;
    }
  }
  return boardObjectives;
}

export async function createBoardObjectives({
  boardId,
}: {
  boardId: string;
}): Promise<BoardObjectivesDTO[]> {
  const objectiveInput = await getRandomObjectives({ boardId });
  await prisma.boardObjective.createMany({
    data: objectiveInput,
  });

  const boardObjectives = await getBoardObjectives({ boardId });

  return boardObjectives;
}

export async function getBoardObjectives({
  boardId,
}: {
  boardId: string;
}): Promise<BoardObjectivesDTO[]> {
  return await prisma.boardObjective.findMany({
    where: {
      boardId,
    },
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
}
