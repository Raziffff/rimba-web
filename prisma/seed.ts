import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL as string;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash("admin12345", 10);

  await prisma.user.upsert({
    where: {
      email: "admin@rimba.com",
    },
    update: {},
    create: {
      name: "Admin RIMBA",
      email: "admin@rimba.com",
      passwordHash,
      role: "ADMIN",
    },
  });

  console.log("Admin berhasil dibuat");
  console.log("Email: admin@rimba.com");
  console.log("Password: admin12345");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });