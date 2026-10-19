"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatInvoiceNumber } from "@/lib/format";
import { calculateInvoiceTotals, lineTotal } from "@/lib/invoice-math";
import { PaymentStatus } from "@prisma/client";
import { z } from "zod";

const lineSchema = z.object({
  description: z.string().min(1),
  quantity: z.coerce.number().positive(),
  unitPrice: z.coerce.number().min(0),
});

const invoiceSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  customerPhone: z.string().optional().nullable(),
  customerEmail: z.string().optional().nullable(),
  customerAddress: z.string().optional().nullable(),
  vehicleYear: z.string().optional().nullable(),
  vehicleMake: z.string().optional().nullable(),
  vehicleModel: z.string().optional().nullable(),
  vehicleVin: z.string().optional().nullable(),
  invoiceDate: z.string().min(1),
  dueDate: z.string().optional().nullable(),
  taxRate: z.coerce.number().min(0).default(0),
  discount: z.coerce.number().min(0).default(0),
  paymentStatus: z.enum(["PAID", "UNPAID", "PARTIAL"]).default("UNPAID"),
  paymentMethod: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  lines: z.array(lineSchema).min(1, "Add at least one service"),
});

export type InvoiceInput = z.infer<typeof invoiceSchema>;

async function requireAuth() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  return session;
}

function emptyToNull(value?: string | null) {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

export async function getDashboardStats() {
  await requireAuth();
  const invoices = await prisma.invoice.findMany({
    orderBy: { createdAt: "desc" },
  });

  const totalInvoices = invoices.length;
  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.total, 0);
  const totalPaid = invoices
    .filter((inv) => inv.paymentStatus === "PAID")
    .reduce((sum, inv) => sum + inv.total, 0);
  const outstanding = invoices
    .filter((inv) => inv.paymentStatus === "UNPAID" || inv.paymentStatus === "PARTIAL")
    .reduce((sum, inv) => sum + inv.total, 0);
  const unpaidCount = invoices.filter(
    (inv) => inv.paymentStatus === "UNPAID" || inv.paymentStatus === "PARTIAL",
  ).length;

  return {
    totalInvoices,
    totalInvoiced,
    totalPaid,
    outstanding,
    unpaidCount,
    recent: invoices.slice(0, 8),
  };
}

export async function listInvoices(search?: string) {
  await requireAuth();
  const q = search?.trim();

  if (!q) {
    return prisma.invoice.findMany({
      orderBy: { createdAt: "desc" },
      include: { lines: { orderBy: { sortOrder: "asc" } } },
    });
  }

  return prisma.invoice.findMany({
    where: {
      OR: [
        { customerName: { contains: q } },
        { number: { contains: q } },
        { vehicleVin: { contains: q } },
        { vehicleMake: { contains: q } },
        { vehicleModel: { contains: q } },
      ],
    },
    orderBy: { createdAt: "desc" },
    include: { lines: { orderBy: { sortOrder: "asc" } } },
  });
}

export async function getInvoice(id: string) {
  await requireAuth();
  return prisma.invoice.findUnique({
    where: { id },
    include: { lines: { orderBy: { sortOrder: "asc" } } },
  });
}

export async function createInvoice(raw: unknown) {
  await requireAuth();
  const data = invoiceSchema.parse(raw);
  const totals = calculateInvoiceTotals({
    lines: data.lines,
    taxRate: data.taxRate,
    discount: data.discount,
  });

  const invoice = await prisma.$transaction(async (tx) => {
    const settings = await tx.companySettings.upsert({
      where: { id: "default" },
      update: {},
      create: { id: "default" },
    });

    const number = formatInvoiceNumber(settings.nextInvoiceNumber);

    await tx.companySettings.update({
      where: { id: "default" },
      data: { nextInvoiceNumber: settings.nextInvoiceNumber + 1 },
    });

    return tx.invoice.create({
      data: {
        number,
        invoiceDate: new Date(data.invoiceDate),
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        customerName: data.customerName.trim(),
        customerPhone: emptyToNull(data.customerPhone),
        customerEmail: emptyToNull(data.customerEmail),
        customerAddress: emptyToNull(data.customerAddress),
        vehicleYear: emptyToNull(data.vehicleYear),
        vehicleMake: emptyToNull(data.vehicleMake),
        vehicleModel: emptyToNull(data.vehicleModel),
        vehicleVin: emptyToNull(data.vehicleVin),
        subtotal: totals.subtotal,
        taxRate: data.taxRate,
        taxAmount: totals.taxAmount,
        discount: totals.discount,
        total: totals.total,
        paymentStatus: data.paymentStatus as PaymentStatus,
        paymentMethod: emptyToNull(data.paymentMethod),
        notes: emptyToNull(data.notes),
        lines: {
          create: data.lines.map((line, index) => ({
            description: line.description.trim(),
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            lineTotal: lineTotal(line.quantity, line.unitPrice),
            sortOrder: index,
          })),
        },
      },
      include: { lines: true },
    });
  });

  revalidatePath("/");
  revalidatePath("/invoices");
  return invoice;
}

export async function updateInvoice(id: string, raw: unknown) {
  await requireAuth();
  const data = invoiceSchema.parse(raw);
  const totals = calculateInvoiceTotals({
    lines: data.lines,
    taxRate: data.taxRate,
    discount: data.discount,
  });

  const invoice = await prisma.$transaction(async (tx) => {
    await tx.invoiceLine.deleteMany({ where: { invoiceId: id } });

    return tx.invoice.update({
      where: { id },
      data: {
        invoiceDate: new Date(data.invoiceDate),
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        customerName: data.customerName.trim(),
        customerPhone: emptyToNull(data.customerPhone),
        customerEmail: emptyToNull(data.customerEmail),
        customerAddress: emptyToNull(data.customerAddress),
        vehicleYear: emptyToNull(data.vehicleYear),
        vehicleMake: emptyToNull(data.vehicleMake),
        vehicleModel: emptyToNull(data.vehicleModel),
        vehicleVin: emptyToNull(data.vehicleVin),
        subtotal: totals.subtotal,
        taxRate: data.taxRate,
        taxAmount: totals.taxAmount,
        discount: totals.discount,
        total: totals.total,
        paymentStatus: data.paymentStatus as PaymentStatus,
        paymentMethod: emptyToNull(data.paymentMethod),
        notes: emptyToNull(data.notes),
        lines: {
          create: data.lines.map((line, index) => ({
            description: line.description.trim(),
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            lineTotal: lineTotal(line.quantity, line.unitPrice),
            sortOrder: index,
          })),
        },
      },
      include: { lines: true },
    });
  });

  revalidatePath("/");
  revalidatePath("/invoices");
  revalidatePath(`/invoices/${id}`);
  return invoice;
}

export async function deleteInvoice(id: string) {
  await requireAuth();
  await prisma.invoice.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/invoices");
}

export async function duplicateInvoice(id: string) {
  await requireAuth();
  const existing = await prisma.invoice.findUnique({
    where: { id },
    include: { lines: { orderBy: { sortOrder: "asc" } } },
  });
  if (!existing) throw new Error("Invoice not found");

  const copy = await createInvoice({
    customerName: existing.customerName,
    customerPhone: existing.customerPhone,
    customerEmail: existing.customerEmail,
    customerAddress: existing.customerAddress,
    vehicleYear: existing.vehicleYear,
    vehicleMake: existing.vehicleMake,
    vehicleModel: existing.vehicleModel,
    vehicleVin: existing.vehicleVin,
    invoiceDate: new Date().toISOString().slice(0, 10),
    dueDate: null,
    taxRate: existing.taxRate,
    discount: existing.discount,
    paymentStatus: "UNPAID",
    paymentMethod: null,
    notes: existing.notes,
    lines: existing.lines.map((line) => ({
      description: line.description,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
    })),
  });

  return copy;
}
