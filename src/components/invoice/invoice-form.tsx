"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PAYMENT_METHODS, PRESET_SERVICES } from "@/lib/constants";
import { calculateInvoiceTotals, lineTotal } from "@/lib/invoice-math";
import { formatCurrency } from "@/lib/format";
import { createInvoice, updateInvoice, type InvoiceInput } from "@/lib/actions/invoices";
import { cn } from "@/lib/utils";

type LineState = {
  key: string;
  preset: string;
  description: string;
  quantity: string;
  unitPrice: string;
};

type FormState = {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: string;
  vehicleYear: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleVin: string;
  invoiceDate: string;
  dueDate: string;
  taxRate: string;
  discount: string;
  paymentStatus: "PAID" | "UNPAID" | "PARTIAL";
  paymentMethod: string;
  notes: string;
  lines: LineState[];
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function newLine(preset = "Key Programming"): LineState {
  return {
    key: crypto.randomUUID(),
    preset,
    description: preset === "Other / Custom Service" ? "" : preset,
    quantity: "1",
    unitPrice: "",
  };
}

export function InvoiceForm({
  mode,
  invoiceId,
  initial,
  defaultTaxRate = 0,
  defaultNotes = "",
}: {
  mode: "create" | "edit";
  invoiceId?: string;
  initial?: Partial<InvoiceInput> & {
    lines?: Array<{ description: string; quantity: number; unitPrice: number }>;
  };
  defaultTaxRate?: number;
  defaultNotes?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [showOptional, setShowOptional] = useState(false);

  const [form, setForm] = useState<FormState>(() => ({
    customerName: initial?.customerName ?? "",
    customerPhone: initial?.customerPhone ?? "",
    customerEmail: initial?.customerEmail ?? "",
    customerAddress: initial?.customerAddress ?? "",
    vehicleYear: initial?.vehicleYear ?? "",
    vehicleMake: initial?.vehicleMake ?? "",
    vehicleModel: initial?.vehicleModel ?? "",
    vehicleVin: initial?.vehicleVin ?? "",
    invoiceDate: initial?.invoiceDate ?? todayISO(),
    dueDate: initial?.dueDate ?? "",
    taxRate: String(initial?.taxRate ?? defaultTaxRate ?? 0),
    discount: String(initial?.discount ?? 0),
    paymentStatus: initial?.paymentStatus ?? "UNPAID",
    paymentMethod: initial?.paymentMethod ?? "",
    notes: initial?.notes ?? defaultNotes ?? "",
    lines:
      initial?.lines?.map((line) => ({
        key: crypto.randomUUID(),
        preset: PRESET_SERVICES.includes(line.description as (typeof PRESET_SERVICES)[number])
          ? line.description
          : "Other / Custom Service",
        description: line.description,
        quantity: String(line.quantity),
        unitPrice: String(line.unitPrice),
      })) ?? [newLine()],
  }));

  const totals = useMemo(() => {
    const lines = form.lines.map((line) => ({
      quantity: Number(line.quantity) || 0,
      unitPrice: Number(line.unitPrice) || 0,
    }));
    return calculateInvoiceTotals({
      lines,
      taxRate: Number(form.taxRate) || 0,
      discount: Number(form.discount) || 0,
    });
  }, [form.lines, form.taxRate, form.discount]);

  function updateLine(key: string, patch: Partial<LineState>) {
    setForm((prev) => ({
      ...prev,
      lines: prev.lines.map((line) =>
        line.key === key ? { ...line, ...patch } : line,
      ),
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.customerName.trim()) {
      toast.error("Customer name is required");
      return;
    }

    const lines = form.lines
      .map((line) => ({
        description: line.description.trim(),
        quantity: Number(line.quantity),
        unitPrice: Number(line.unitPrice),
      }))
      .filter((line) => line.description);

    if (!lines.length) {
      toast.error("Add at least one service");
      return;
    }

    if (lines.some((line) => !line.quantity || line.unitPrice < 0)) {
      toast.error("Check quantity and price on each service line");
      return;
    }

    const payload: InvoiceInput = {
      customerName: form.customerName.trim(),
      customerPhone: form.customerPhone || null,
      customerEmail: form.customerEmail || null,
      customerAddress: form.customerAddress || null,
      vehicleYear: form.vehicleYear || null,
      vehicleMake: form.vehicleMake || null,
      vehicleModel: form.vehicleModel || null,
      vehicleVin: form.vehicleVin || null,
      invoiceDate: form.invoiceDate,
      dueDate: form.dueDate || null,
      taxRate: Number(form.taxRate) || 0,
      discount: Number(form.discount) || 0,
      paymentStatus: form.paymentStatus,
      paymentMethod: form.paymentMethod || null,
      notes: form.notes || null,
      lines,
    };

    startTransition(async () => {
      try {
        const saved =
          mode === "edit" && invoiceId
            ? await updateInvoice(invoiceId, payload)
            : await createInvoice(payload);
        toast.success(mode === "edit" ? "Invoice updated" : "Invoice created");
        router.push(`/invoices/${saved.id}`);
        router.refresh();
      } catch (err) {
        console.error(err);
        toast.error("Could not save invoice");
      }
    });
  }

  const fieldClass =
    "border-white/10 bg-black/30 text-zinc-100 placeholder:text-zinc-500";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="rounded-xl border border-white/10 bg-black/25 p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-white">Customer</h2>
            <p className="text-sm text-zinc-400">Only the name is required.</p>
          </div>
          <button
            type="button"
            onClick={() => setShowOptional((v) => !v)}
            className="text-sm text-[var(--tk-blue)] hover:underline"
          >
            {showOptional ? "Hide optional fields" : "Show optional fields"}
          </button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="customerName">Customer / Business Name *</Label>
            <Input
              id="customerName"
              autoFocus
              className={fieldClass}
              value={form.customerName}
              onChange={(e) => setForm({ ...form, customerName: e.target.value })}
              placeholder="Dealership or customer name"
              required
            />
          </div>
          {showOptional ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="customerPhone">Phone</Label>
                <Input
                  id="customerPhone"
                  className={fieldClass}
                  value={form.customerPhone}
                  onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerEmail">Email</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  className={fieldClass}
                  value={form.customerEmail}
                  onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="customerAddress">Address</Label>
                <Input
                  id="customerAddress"
                  className={fieldClass}
                  value={form.customerAddress}
                  onChange={(e) => setForm({ ...form, customerAddress: e.target.value })}
                />
              </div>
            </>
          ) : null}
        </div>
      </section>

      <section className="rounded-xl border border-white/10 bg-black/25 p-5">
        <h2 className="mb-1 text-lg font-semibold text-white">Vehicle</h2>
        <p className="mb-4 text-sm text-zinc-400">Optional — fill in what you have.</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="vehicleYear">Year</Label>
            <Input
              id="vehicleYear"
              className={fieldClass}
              value={form.vehicleYear}
              onChange={(e) => setForm({ ...form, vehicleYear: e.target.value })}
              placeholder="2022"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vehicleMake">Make</Label>
            <Input
              id="vehicleMake"
              className={fieldClass}
              value={form.vehicleMake}
              onChange={(e) => setForm({ ...form, vehicleMake: e.target.value })}
              placeholder="BMW"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vehicleModel">Model</Label>
            <Input
              id="vehicleModel"
              className={fieldClass}
              value={form.vehicleModel}
              onChange={(e) => setForm({ ...form, vehicleModel: e.target.value })}
              placeholder="X5"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vehicleVin">VIN</Label>
            <Input
              id="vehicleVin"
              className={fieldClass}
              value={form.vehicleVin}
              onChange={(e) => setForm({ ...form, vehicleVin: e.target.value })}
            />
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-white/10 bg-black/25 p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Services</h2>
            <p className="text-sm text-zinc-400">Select a preset or enter a custom service.</p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="border-white/15 bg-transparent"
            onClick={() =>
              setForm((prev) => ({ ...prev, lines: [...prev.lines, newLine()] }))
            }
          >
            <Plus className="size-4" />
            Add service
          </Button>
        </div>

        <div className="space-y-4">
          {form.lines.map((line, index) => (
            <div
              key={line.key}
              className="grid gap-3 rounded-lg border border-white/10 bg-black/20 p-4 md:grid-cols-[1.2fr_1.4fr_0.6fr_0.8fr_auto]"
            >
              <div className="space-y-2">
                <Label>Service type</Label>
                <Select
                  value={line.preset}
                  onValueChange={(value) => {
                    const preset = value ?? "Other / Custom Service";
                    updateLine(line.key, {
                      preset,
                      description:
                        preset === "Other / Custom Service" ? line.description : preset,
                    });
                  }}
                >
                  <SelectTrigger className={cn(fieldClass, "w-full")}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRESET_SERVICES.map((service) => (
                      <SelectItem key={service} value={service}>
                        {service}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  className={fieldClass}
                  value={line.description}
                  onChange={(e) => updateLine(line.key, { description: e.target.value })}
                  placeholder="Service description"
                />
              </div>
              <div className="space-y-2">
                <Label>Qty</Label>
                <Input
                  type="number"
                  min="0.01"
                  step="0.01"
                  className={fieldClass}
                  value={line.quantity}
                  onChange={(e) => updateLine(line.key, { quantity: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Unit price</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  className={fieldClass}
                  value={line.unitPrice}
                  onChange={(e) => updateLine(line.key, { unitPrice: e.target.value })}
                  placeholder="0.00"
                />
                <p className="text-xs text-zinc-500">
                  Line:{" "}
                  {formatCurrency(
                    lineTotal(Number(line.quantity) || 0, Number(line.unitPrice) || 0),
                  )}
                </p>
              </div>
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={form.lines.length === 1}
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      lines: prev.lines.filter((l) => l.key !== line.key),
                    }))
                  }
                  aria-label={`Remove service ${index + 1}`}
                >
                  <Trash2 className="size-4 text-zinc-400" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-white/10 bg-black/25 p-5">
        <h2 className="mb-4 text-lg font-semibold text-white">Invoice details</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="invoiceDate">Invoice date</Label>
            <Input
              id="invoiceDate"
              type="date"
              className={fieldClass}
              value={form.invoiceDate}
              onChange={(e) => setForm({ ...form, invoiceDate: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due date (optional)</Label>
            <Input
              id="dueDate"
              type="date"
              className={fieldClass}
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="taxRate">Tax % (optional)</Label>
            <Input
              id="taxRate"
              type="number"
              min="0"
              step="0.01"
              className={fieldClass}
              value={form.taxRate}
              onChange={(e) => setForm({ ...form, taxRate: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="discount">Discount $ (optional)</Label>
            <Input
              id="discount"
              type="number"
              min="0"
              step="0.01"
              className={fieldClass}
              value={form.discount}
              onChange={(e) => setForm({ ...form, discount: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Payment status</Label>
            <Select
              value={form.paymentStatus}
              onValueChange={(value) =>
                setForm({
                  ...form,
                  paymentStatus: (value as FormState["paymentStatus"]) ?? "UNPAID",
                })
              }
            >
              <SelectTrigger className={cn(fieldClass, "w-full")}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UNPAID">Unpaid</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
                <SelectItem value="PARTIAL">Partially Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Payment method (optional)</Label>
            <Select
              value={form.paymentMethod || undefined}
              onValueChange={(value) =>
                setForm({ ...form, paymentMethod: value ?? "" })
              }
            >
              <SelectTrigger className={cn(fieldClass, "w-full")}>
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((method) => (
                  <SelectItem key={method} value={method}>
                    {method}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              className={cn(fieldClass, "min-h-20")}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4 border-t border-white/10 pt-5 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1 text-sm text-zinc-300">
            <div className="flex justify-between gap-8">
              <span className="text-zinc-400">Subtotal</span>
              <span>{formatCurrency(totals.subtotal)}</span>
            </div>
            <div className="flex justify-between gap-8">
              <span className="text-zinc-400">Tax</span>
              <span>{formatCurrency(totals.taxAmount)}</span>
            </div>
            <div className="flex justify-between gap-8">
              <span className="text-zinc-400">Discount</span>
              <span>-{formatCurrency(totals.discount)}</span>
            </div>
            <div className="flex justify-between gap-8 text-base font-semibold text-white">
              <span>Grand total</span>
              <span className="text-[var(--tk-blue)]">{formatCurrency(totals.total)}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={cn(buttonVariants({ variant: "outline" }), "border-white/15")}
              onClick={() => router.back()}
              disabled={pending}
            >
              Cancel
            </button>
            <Button
              type="submit"
              disabled={pending}
              className="bg-[var(--tk-blue)] text-black hover:bg-[var(--tk-blue-hover)]"
            >
              {pending
                ? "Saving…"
                : mode === "edit"
                  ? "Save Invoice"
                  : "Generate Invoice"}
            </Button>
          </div>
        </div>
      </section>
    </form>
  );
}
