import Link from "next/link";
import { Plus } from "lucide-react";
import { getDashboardStats } from "@/lib/actions/invoices";
import { formatCurrency, formatDate, vehicleLabel } from "@/lib/format";
import { StatusBadge } from "@/components/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PaymentStatusValue } from "@/lib/constants";

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  const cards = [
    { label: "Total invoices", value: String(stats.totalInvoices) },
    { label: "Total invoiced", value: formatCurrency(stats.totalInvoiced) },
    { label: "Payments received", value: formatCurrency(stats.totalPaid) },
    {
      label: "Outstanding",
      value: formatCurrency(stats.outstanding),
      hint: `${stats.unpaidCount} unpaid / partial`,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-[var(--tk-blue)]">
            Techno Keys
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white">
            Dashboard
          </h1>
          <p className="mt-1 text-zinc-400">
            Create invoices fast and keep every job organized.
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

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-white/10 bg-black/30 p-5"
          >
            <p className="text-sm text-zinc-400">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold text-white">{card.value}</p>
            {card.hint ? (
              <p className="mt-1 text-xs text-zinc-500">{card.hint}</p>
            ) : null}
          </div>
        ))}
      </div>

      <section className="rounded-xl border border-white/10 bg-black/25">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 className="text-lg font-semibold text-white">Recent invoices</h2>
          <Link href="/invoices" className="text-sm text-[var(--tk-blue)] hover:underline">
            View all
          </Link>
        </div>
        {stats.recent.length === 0 ? (
          <div className="px-5 py-12 text-center text-zinc-400">
            No invoices yet.{" "}
            <Link href="/invoices/new" className="text-[var(--tk-blue)] hover:underline">
              Create your first invoice
            </Link>
            .
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-zinc-500">
                <tr className="border-b border-white/10">
                  <th className="px-5 py-3 font-medium">Invoice</th>
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Vehicle</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Total</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-white/5 hover:bg-white/[0.03]">
                    <td className="px-5 py-3">
                      <Link
                        href={`/invoices/${invoice.id}`}
                        className="font-medium text-[var(--tk-blue)] hover:underline"
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
                      <StatusBadge status={invoice.paymentStatus as PaymentStatusValue} />
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
