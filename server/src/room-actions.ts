import { Board, Prisma, PrismaClient } from "@prisma/client";
import {
  BoardPlayerCreatedDTO,
  CreateBoardDTO,
  CreateObjectiveDTO,
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
  console.log({ boardId, password, userId });
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
