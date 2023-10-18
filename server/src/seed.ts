import { PrismaClient } from "@prisma/client";
import { objectives } from "./objectives";
const prisma = new PrismaClient();

async function createEntities() {
  const country = await prisma.country.create({
    data: { name: "Taiwan" },
  });

  const city = await prisma.city.create({
    data: { name: "Taipei", countryId: country.id },
  });

  const creator = await prisma.user.create({
    data: {
      username: "dengel",
      email: "dan@dengel.io",
      firstName: "Dan",
      lastName: "Engel",
      cityId: city.id,
      countryId: country.id,
    },
  });

  const unsavedObjectives = objectives.map((o) => {
    o.creatorId = creator.id;
    return o;
  });

  await prisma.objective.createMany({
    data: unsavedObjectives,
  });
}

createEntities()
  .then((res) => {
    console.log(res);
  })
  .catch((err) => {
    console.log(err);
  });
