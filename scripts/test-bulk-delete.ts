import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const before = await prisma.invoice.count();
  const ids = await prisma.invoice.findMany({
    take: 2,
    orderBy: { createdAt: "desc" },
    select: { id: true, number: true },
  });

  if (ids.length < 1) {
    console.log("No invoices to delete");
    return;
  }

  const result = await prisma.invoice.deleteMany({
    where: { id: { in: ids.map((i) => i.id) } },
  });

  const after = await prisma.invoice.count();
  console.log(
    JSON.stringify({
      before,
      deletedNumbers: ids.map((i) => i.number),
      deleted: result.count,
      after,
    }),
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
