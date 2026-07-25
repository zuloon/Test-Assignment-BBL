import { PrismaClient } from "@prisma/client";

process.env.DATABASE_URL ??= "file:./prisma/dev.db";

const prisma = new PrismaClient();

async function main() {
  await prisma.user.upsert({
    where: { id: "auth0|user-a" },
    update: {},
    create: {
      id: "auth0|user-a",
      email: "candidate@test.com",
      name: "Candidate User"
    }
  });

  await prisma.user.upsert({
    where: { id: "auth0|user-b" },
    update: {},
    create: {
      id: "auth0|user-b",
      email: "other-user@test.com",
      name: "Other User"
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
