import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.OWNER_EMAIL ?? "admin@technokeys.com";
  const password = process.env.OWNER_PASSWORD ?? "TechnoKeys2026!";
  const passwordHash = await hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    update: { passwordHash },
    create: {
      email,
      passwordHash,
      name: "Techno Keys Owner",
    },
  });

  await prisma.companySettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      companyName: "Techno Keys",
      businessAddress: "15978 Merriman Road, Livonia, MI 48154",
      phone: "313-574-7294",
      email: "admin@technokeys.com",
      taxId: "41-3721740",
      logoPath: "/logo.png",
      defaultNotes: "Thank you for choosing Techno Keys.",
      defaultTaxRate: 0,
      nextInvoiceNumber: 1,
    },
  });

  console.log(`Seeded owner: ${email}`);
  console.log("Seeded company settings for Techno Keys");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
