import Link from "next/link";
import { Suspense } from "react";
import { Plus } from "lucide-react";
import { listInvoices } from "@/lib/actions/invoices";
import { formatCurrency, formatDate, vehicleLabel } from "@/lib/format";
import { StatusBadge } from "@/components/status-badge";
import { InvoiceSearch } from "@/components/invoice/invoice-search";
import { InvoiceActions } from "@/components/invoice/invoice-actions";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PaymentStatusValue } from "@/lib/constants";

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const invoices = await listInvoices(q);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            Invoice History
          </h1>
          <p className="mt-1 text-zinc-400">
            Search, view, edit, and download past invoices.
          </p>
        </div>
        <Link
          href="/invoices/new"
          className={cn(
            buttonVariants({ size: "lg" }),
            "bg-[var(--tk-blue)] text-black hover:bg-[var(--tk-blue-hover)]",
          )}
        >
          <Plus className="size-4" />
          Create Invoice
        </Link>
      </div>

      <Suspense fallback={null}>
        <InvoiceSearch />
      </Suspense>

      <section className="rounded-xl border border-white/10 bg-black/25">
        {invoices.length === 0 ? (
          <div className="px-5 py-16 text-center text-zinc-400">
            {q ? (
              <>No invoices match “{q}”.</>
            ) : (
              <>
                No invoices yet.{" "}
                <Link href="/invoices/new" className="text-[var(--tk-blue)] hover:underline">
                  Create one
                </Link>
                .
              </>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-zinc-500">
                <tr className="border-b border-white/10">
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
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-white/5 hover:bg-white/[0.03]">
                    <td className="px-5 py-3 font-medium text-white">{invoice.number}</td>
                    <td className="px-5 py-3 text-zinc-200">{invoice.customerName}</td>
                    <td className="px-5 py-3 text-zinc-400">{vehicleLabel(invoice)}</td>
                    <td className="px-5 py-3 text-zinc-400">
                      {formatDate(invoice.invoiceDate)}
                    </td>
                    <td className="px-5 py-3 text-zinc-100">
                      {formatCurrency(invoice.total)}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={invoice.paymentStatus as PaymentStatusValue} />
                    </td>
                    <td className="px-5 py-3">
                      <InvoiceActions id={invoice.id} number={invoice.number} compact />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
