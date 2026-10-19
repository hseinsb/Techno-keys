import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { readFile } from "fs/promises";
import path from "path";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { InvoicePdfDocument } from "@/components/invoice/invoice-pdf";
import type { PaymentStatusValue } from "@/lib/constants";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { lines: { orderBy: { sortOrder: "asc" } } },
  });

  if (!invoice) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const company = await prisma.companySettings.findUnique({
    where: { id: "default" },
  });

  if (!company) {
    return NextResponse.json({ error: "Company settings missing" }, { status: 500 });
  }

  let logoSrc: string | undefined;
  try {
    const logoPath = path.join(process.cwd(), "public", "logo.png");
    const buffer = await readFile(logoPath);
    logoSrc = `data:image/png;base64,${buffer.toString("base64")}`;
  } catch {
    logoSrc = undefined;
  }

  const pdfBuffer = await renderToBuffer(
    InvoicePdfDocument({
      invoice: {
        ...invoice,
        paymentStatus: invoice.paymentStatus as PaymentStatusValue,
      },
      company,
      logoSrc,
    }),
  );

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${invoice.number}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
