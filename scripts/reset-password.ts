// Run with: npm run reset-password -- --email=owner@bajomart.com --password=NewPassword123!
// A developer runs this script manually when someone is locked out and email isn't set up yet.

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function getArg(name: string): string | undefined {
  const arg = process.argv.find((a) => a.startsWith(`--${name}=`));
  return arg?.split("=")[1];
}

async function main() {
  const email = getArg("email");
  const password = getArg("password");

  if (!email || !password) {
    console.error("Usage: npm run reset-password -- --email=someone@example.com --password=NewPassword123!");
    process.exit(1);
  }

  if (password.length < 10) {
    console.error("Password must be at least 10 characters.");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.update({
    where: { email: email.toLowerCase() },
    data: { passwordHash },
  });

  console.log(`Password updated for ${user.email}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
