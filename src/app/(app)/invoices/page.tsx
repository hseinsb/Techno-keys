import Link from "next/link";
import { Suspense } from "react";
import { Plus } from "lucide-react";
import { listInvoices } from "@/lib/actions/invoices";
import { InvoiceSearch } from "@/components/invoice/invoice-search";
import { InvoiceTable } from "@/components/invoice/invoice-table";
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
            Search, select, edit, download, or delete past invoices.
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
          <InvoiceTable
            invoices={invoices.map((invoice) => ({
              id: invoice.id,
              number: invoice.number,
              customerName: invoice.customerName,
              vehicleYear: invoice.vehicleYear,
              vehicleMake: invoice.vehicleMake,
              vehicleModel: invoice.vehicleModel,
              invoiceDate: invoice.invoiceDate,
              total: invoice.total,
              paymentStatus: invoice.paymentStatus as PaymentStatusValue,
            }))}
          />
        )}
      </section>
    </div>
  );
}
