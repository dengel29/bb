import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function createEntities() {
  const country = await prisma.country.create({
    data: { name: "Taiwan" },
  });

  const city = await prisma.city.create({
    data: { name: "Taipei", countryId: country.id },
  });

  await prisma.user.create({
    data: {
      username: "dengel",
      email: "dan@dengel.io",
      firstName: "Dan",
      lastName: "Engel",
      cityId: city.id,
      countryId: country.id,
    },
  });
}

createEntities()
  .then((res) => {
    console.log(res);
  })
  .catch((err) => {
    console.log(err);
  });
