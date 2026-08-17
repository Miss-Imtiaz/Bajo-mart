import { PrismaClient, VendorGroup } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const ownerPasswordHash = await bcrypt.hash("ChangeMe123!Owner", 10);
  const partnerPasswordHash = await bcrypt.hash("ChangeMe123!Partner", 10);

  await prisma.user.upsert({
    where: { email: "owner@bajomart.com" },
    update: {},
    create: { name: "Owner", email: "owner@bajomart.com", passwordHash: ownerPasswordHash },
  });

  await prisma.user.upsert({
    where: { email: "partner@bajomart.com" },
    update: {},
    create: { name: "Partner", email: "partner@bajomart.com", passwordHash: partnerPasswordHash },
  });

  console.log("Users seeded. Change these placeholder emails/passwords from the Settings page after logging in.");

  const operating = [
    "ADIL", "ALL LICENCE FEE", "APPLECARD GS BANK", "CINTAS", "COMCAST",
    "GARBAGE", "IMRAN", "INSURANCE", "INSURANCE S&R", "MAINTANCE",
    "MANORA DISTRIBUTOR", "PAYROLL TAX", "QUALITY NOZZLE", "RENT",
  ];

  const wholesale = [
    "AAA WHOLESALE", "ACCOUNTANT FEE", "ALDI", "ASK WHOLESALE",
    "BARGAIN WHOLESALE", "BRAMAN TERMITE", "EBT MACHINE Fees", "G&L TRUCKING",
    "HOME DEPOT", "MANCHESTAR TOBACCO", "MONTANA DISTRIBUTOR",
    "NEW ENGLAND COFFEE", "PAYROLL SALARY", "RESTURANT DEPOT",
  ];

  const snacksBeverage = [
    "BEVERAGE EXPRESS", "BIMBO & CSJ SNACKS", "BON APPETTI", "COCAL COLA",
    "FRITO LAY", "NEW ENG ICE CREAM", "PEPSI", "POLAR EXPRESS", "RED BULL",
    "SAM CULB", "SNACKS", "SOUTHERN GAS", "UI", "SUPERMARKET",
  ];

  const seedGroup = async (names: string[], group: VendorGroup) => {
    for (let i = 0; i < names.length; i++) {
      const existing = await prisma.vendor.findFirst({ where: { name: names[i], group } });
      if (existing) {
        await prisma.vendor.update({ where: { id: existing.id }, data: { sortOrder: i } });
      } else {
        await prisma.vendor.create({ data: { name: names[i], group, sortOrder: i, isActive: true } });
      }
    }
  };

  await seedGroup(operating, VendorGroup.OPERATING);
  await seedGroup(wholesale, VendorGroup.WHOLESALE);
  await seedGroup(snacksBeverage, VendorGroup.SNACKS_BEVERAGE);

  console.log(
    `Vendors seeded: ${operating.length} operating, ${wholesale.length} wholesale, ${snacksBeverage.length} snacks/beverage. (42 total)`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
