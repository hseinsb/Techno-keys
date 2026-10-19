import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { formatInvoiceNumber } from "../src/lib/format";

const prisma = new PrismaClient();

async function main() {
  const settings = await prisma.companySettings.findUnique({
    where: { id: "default" },
  });
  const sequence = settings?.nextInvoiceNumber ?? 1;
  const number = formatInvoiceNumber(sequence);

  await prisma.companySettings.update({
    where: { id: "default" },
    data: { nextInvoiceNumber: sequence + 1 },
  });

  const inv = await prisma.invoice.create({
    data: {
      number,
      customerName: "Livonia Collision Center",
      customerPhone: "313-555-0100",
      vehicleYear: "2021",
      vehicleMake: "Ford",
      vehicleModel: "F-150",
      vehicleVin: "1FTFW1E84MFA12345",
      subtotal: 250,
      taxRate: 0,
      taxAmount: 0,
      discount: 0,
      total: 250,
      paymentStatus: "UNPAID",
      notes: "Thank you for choosing Techno Keys.",
      lines: {
        create: [
          {
            description: "Key Programming",
            quantity: 1,
            unitPrice: 250,
            lineTotal: 250,
            sortOrder: 0,
          },
        ],
      },
    },
  });

  console.log(`${inv.id} ${inv.number}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
