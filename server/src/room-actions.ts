import { Prisma, PrismaClient } from "@prisma/client";
import { CreateBoardDTO, CreateObjectiveDTO } from "shared/types";

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
