import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const findOrCreateUserByEmail = async (email: string) => {
  const user = await prisma.user.findFirst({
    where: { email },
  });
  if (!user) {
    return await prisma.user.create({
      data: {
        email,
      },
      select: {
        id: true,
        email: true,
      },
    });
  } else {
    return user;
  }
};
