"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const settingsSchema = z.object({
  companyName: z.string().min(1),
  businessAddress: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email(),
  taxId: z.string().optional().default(""),
  logoPath: z.string().optional().default("/logo.png"),
  defaultNotes: z.string().optional().default(""),
  defaultTaxRate: z.coerce.number().min(0).max(100).default(0),
});

export async function getCompanySettings() {
  await requireAuth();
  let settings = await prisma.companySettings.findUnique({
    where: { id: "default" },
  });
  if (!settings) {
    settings = await prisma.companySettings.create({
      data: { id: "default" },
    });
  }
  return settings;
}

export async function updateCompanySettings(raw: unknown) {
  await requireAuth();
  const data = settingsSchema.parse(raw);

  const settings = await prisma.companySettings.upsert({
    where: { id: "default" },
    update: data,
    create: { id: "default", ...data },
  });

  revalidatePath("/");
  revalidatePath("/settings");
  revalidatePath("/invoices");
  return settings;
}

async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return session;
}
