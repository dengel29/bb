import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const findOrCreateUserByEmail = async (email: string) => {
  console.log("what");
  const user = await prisma.user.findFirst({
    where: { email },
  });
  if (!user) {
    console.log("userbeingcreated", email);
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
    console.log("user being returned");
    return user;
  }
  // get user by email
  //  db.get('SELECT * FROM users WHERE email = ?', [
  //   user.email
  // ], function(err, row) {
  //   if (err) { return reject(err); }
  //   if (!row) {
  //     db.run('INSERT INTO users (email, email_verified) VALUES (?, ?)', [
  //       user.email,
  //       1
  //     ], function(err) {
  //       if (err) { return reject(err); }
  //       var id = this.lastID;
  //       var obj = {
  //         id: id,
  //         email: user.email
  //       };
  //       return resolve(obj);
  //     });
  //   } else {
  //     return resolve(row);
  //   }
  // });
};
