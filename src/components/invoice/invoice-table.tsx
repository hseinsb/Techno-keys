"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { InvoiceActions } from "@/components/invoice/invoice-actions";
import { Button } from "@/components/ui/button";
import { deleteInvoices } from "@/lib/actions/invoices";
import { formatCurrency, formatDate, vehicleLabel } from "@/lib/format";
import type { PaymentStatusValue } from "@/lib/constants";
import { cn } from "@/lib/utils";

export type InvoiceRow = {
  id: string;
  number: string;
  customerName: string;
  vehicleYear?: string | null;
  vehicleMake?: string | null;
  vehicleModel?: string | null;
  invoiceDate: Date | string;
  total: number;
  paymentStatus: PaymentStatusValue;
};

export function InvoiceTable({ invoices }: { invoices: InvoiceRow[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();

  const allIds = useMemo(() => invoices.map((invoice) => invoice.id), [invoices]);
  const allSelected = allIds.length > 0 && selected.size === allIds.length;
  const someSelected = selected.size > 0 && selected.size < allIds.length;

  useEffect(() => {
    const available = new Set(allIds);
    setSelected((prev) => {
      const next = new Set([...prev].filter((id) => available.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [allIds]);

  function toggleAll() {
    setSelected((prev) => {
      if (prev.size === allIds.length) return new Set();
      return new Set(allIds);
    });
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function clearSelection() {
    setSelected(new Set());
  }

  function handleBulkDelete() {
    const ids = [...selected];
    if (!ids.length) return;

    const label =
      ids.length === 1
        ? "this invoice"
        : `${ids.length} selected invoices`;
    if (!confirm(`Delete ${label}? This cannot be undone.`)) return;

    startTransition(async () => {
      try {
        const result = await deleteInvoices(ids);
        toast.success(
          result.deleted === 1
            ? "Invoice deleted"
            : `${result.deleted} invoices deleted`,
        );
        clearSelection();
        router.refresh();
      } catch {
        toast.error("Could not delete selected invoices");
      }
    });
  }

  return (
    <div>
      {selected.size > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-[var(--tk-blue)]/10 px-5 py-3">
          <p className="text-sm text-zinc-200">
            <span className="font-medium text-white">{selected.size}</span>{" "}
            selected
            {allSelected ? (
              <span className="text-zinc-400"> (all on this page)</span>
            ) : null}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-white/15"
              disabled={pending}
              onClick={clearSelection}
            >
              Clear
            </Button>
            {!allSelected ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-white/15"
                disabled={pending}
                onClick={() => setSelected(new Set(allIds))}
              >
                Select all
              </Button>
            ) : null}
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={pending}
              onClick={handleBulkDelete}
            >
              <Trash2 className="size-4" />
              {pending ? "Deleting…" : `Delete selected (${selected.size})`}
            </Button>
          </div>
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px] text-left text-sm">
          <thead className="text-xs uppercase tracking-wide text-zinc-500">
            <tr className="border-b border-white/10">
              <th className="w-12 px-5 py-3">
                <input
                  type="checkbox"
                  aria-label="Select all invoices"
                  className="size-4 cursor-pointer accent-[var(--tk-blue)]"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected;
                  }}
                  onChange={toggleAll}
                />
              </th>
              <th className="px-5 py-3 font-medium">Invoice</th>
              <th className="px-5 py-3 font-medium">Customer</th>
              <th className="px-5 py-3 font-medium">Vehicle</th>
              <th className="px-5 py-3 font-medium">Date</th>
              <th className="px-5 py-3 font-medium">Total</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => {
              const isSelected = selected.has(invoice.id);
              return (
                <tr
                  key={invoice.id}
                  className={cn(
                    "border-b border-white/5 hover:bg-white/[0.03]",
                    isSelected && "bg-[var(--tk-blue)]/5",
                  )}
                >
                  <td className="px-5 py-3">
                    <input
                      type="checkbox"
                      aria-label={`Select ${invoice.number}`}
                      className="size-4 cursor-pointer accent-[var(--tk-blue)]"
                      checked={isSelected}
                      onChange={() => toggleOne(invoice.id)}
                    />
                  </td>
                  <td className="px-5 py-3 font-medium text-white">
                    <Link
                      href={`/invoices/${invoice.id}`}
                      className="text-[var(--tk-blue)] hover:underline"
                    >
                      {invoice.number}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-zinc-200">{invoice.customerName}</td>
                  <td className="px-5 py-3 text-zinc-400">{vehicleLabel(invoice)}</td>
                  <td className="px-5 py-3 text-zinc-400">
                    {formatDate(invoice.invoiceDate)}
                  </td>
                  <td className="px-5 py-3 text-zinc-100">
                    {formatCurrency(invoice.total)}
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge status={invoice.paymentStatus} />
                  </td>
                  <td className="px-5 py-3">
                    <InvoiceActions
                      id={invoice.id}
                      number={invoice.number}
                      compact
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
