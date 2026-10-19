import Link from "next/link";
import { notFound } from "next/navigation";
import { getInvoice } from "@/lib/actions/invoices";
import { getCompanySettings } from "@/lib/actions/settings";
import { formatCurrency, formatDate, vehicleLabel } from "@/lib/format";
import { StatusBadge } from "@/components/status-badge";
import { InvoiceActions } from "@/components/invoice/invoice-actions";
import { InvoiceForm } from "@/components/invoice/invoice-form";
import type { PaymentStatusValue } from "@/lib/constants";

export default async function InvoiceDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ edit?: string }>;
}) {
  const { id } = await params;
  const { edit } = await searchParams;
  const [invoice, settings] = await Promise.all([
    getInvoice(id),
    getCompanySettings(),
  ]);

  if (!invoice) notFound();

  if (edit === "1") {
    return (
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <p className="text-sm text-[var(--tk-blue)]">{invoice.number}</p>
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            Edit Invoice
          </h1>
        </div>
        <InvoiceForm
          mode="edit"
          invoiceId={invoice.id}
          defaultTaxRate={settings.defaultTaxRate}
          defaultNotes={settings.defaultNotes}
          initial={{
            customerName: invoice.customerName,
            customerPhone: invoice.customerPhone,
            customerEmail: invoice.customerEmail,
            customerAddress: invoice.customerAddress,
            vehicleYear: invoice.vehicleYear,
            vehicleMake: invoice.vehicleMake,
            vehicleModel: invoice.vehicleModel,
            vehicleVin: invoice.vehicleVin,
            invoiceDate: invoice.invoiceDate.toISOString().slice(0, 10),
            dueDate: invoice.dueDate
              ? invoice.dueDate.toISOString().slice(0, 10)
              : null,
            taxRate: invoice.taxRate,
            discount: invoice.discount,
            paymentStatus: invoice.paymentStatus,
            paymentMethod: invoice.paymentMethod,
            notes: invoice.notes,
            lines: invoice.lines.map((line) => ({
              description: line.description,
              quantity: line.quantity,
              unitPrice: line.unitPrice,
            })),
          }}
        />
      </div>
    );
  }

  const pdfUrl = `/api/invoices/${invoice.id}/pdf`;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-[var(--tk-blue)]">
            Invoice
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white">
            {invoice.number}
          </h1>
          <p className="mt-1 text-zinc-400">
            {invoice.customerName} · {formatDate(invoice.invoiceDate)}
          </p>
        </div>
        <InvoiceActions id={invoice.id} number={invoice.number} showView={false} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-black/25 p-5 md:col-span-2">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <h2 className="text-xs uppercase tracking-wide text-[var(--tk-blue)]">
                Bill to
              </h2>
              <p className="mt-2 font-medium text-white">{invoice.customerName}</p>
              {invoice.customerPhone ? (
                <p className="text-sm text-zinc-400">{invoice.customerPhone}</p>
              ) : null}
              {invoice.customerEmail ? (
                <p className="text-sm text-zinc-400">{invoice.customerEmail}</p>
              ) : null}
              {invoice.customerAddress ? (
                <p className="text-sm text-zinc-400">{invoice.customerAddress}</p>
              ) : null}
            </div>
            <div>
              <h2 className="text-xs uppercase tracking-wide text-[var(--tk-blue)]">
                Vehicle
              </h2>
              <p className="mt-2 font-medium text-white">{vehicleLabel(invoice)}</p>
              {invoice.vehicleVin ? (
                <p className="text-sm text-zinc-400">VIN: {invoice.vehicleVin}</p>
              ) : null}
              <div className="mt-4">
                <StatusBadge status={invoice.paymentStatus as PaymentStatusValue} />
              </div>
            </div>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-zinc-500">
                <tr className="border-b border-white/10">
                  <th className="py-2 pr-3 font-medium">Service</th>
                  <th className="py-2 px-3 font-medium text-right">Qty</th>
                  <th className="py-2 px-3 font-medium text-right">Unit</th>
                  <th className="py-2 pl-3 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.lines.map((line) => (
                  <tr key={line.id} className="border-b border-white/5">
                    <td className="py-3 pr-3 text-zinc-100">{line.description}</td>
                    <td className="py-3 px-3 text-right text-zinc-400">{line.quantity}</td>
                    <td className="py-3 px-3 text-right text-zinc-400">
                      {formatCurrency(line.unitPrice)}
                    </td>
                    <td className="py-3 pl-3 text-right text-zinc-100">
                      {formatCurrency(line.lineTotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 ml-auto w-full max-w-xs space-y-1 text-sm">
            <div className="flex justify-between text-zinc-400">
              <span>Subtotal</span>
              <span>{formatCurrency(invoice.subtotal)}</span>
            </div>
            {invoice.discount > 0 ? (
              <div className="flex justify-between text-zinc-400">
                <span>Discount</span>
                <span>-{formatCurrency(invoice.discount)}</span>
              </div>
            ) : null}
            <div className="flex justify-between text-zinc-400">
              <span>Tax ({invoice.taxRate}%)</span>
              <span>{formatCurrency(invoice.taxAmount)}</span>
            </div>
            <div className="flex justify-between border-t border-white/10 pt-2 text-base font-semibold text-white">
              <span>Total</span>
              <span className="text-[var(--tk-blue)]">
                {formatCurrency(invoice.total)}
              </span>
            </div>
          </div>

          {invoice.notes ? (
            <div className="mt-6 rounded-lg border border-white/10 bg-black/20 p-4 text-sm text-zinc-300">
              <p className="mb-1 text-xs uppercase tracking-wide text-[var(--tk-blue)]">
                Notes
              </p>
              {invoice.notes}
            </div>
          ) : null}
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-white/10 bg-black/25 p-5">
            <h2 className="text-sm font-semibold text-white">Preview PDF</h2>
            <p className="mt-1 text-sm text-zinc-400">
              Open the US Letter invoice for download or print.
            </p>
            <iframe
              title={`Preview ${invoice.number}`}
              src={pdfUrl}
              className="mt-4 h-[420px] w-full rounded-md border border-white/10 bg-white"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <a
                href={pdfUrl}
                download={`${invoice.number}.pdf`}
                className="text-sm text-[var(--tk-blue)] hover:underline"
              >
                Download PDF
              </a>
              <span className="text-zinc-600">·</span>
              <Link href={`/invoices/${invoice.id}?edit=1`} className="text-sm text-[var(--tk-blue)] hover:underline">
                Edit invoice
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
