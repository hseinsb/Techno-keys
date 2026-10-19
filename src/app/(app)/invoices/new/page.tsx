import { InvoiceForm } from "@/components/invoice/invoice-form";
import { getCompanySettings } from "@/lib/actions/settings";

export default async function NewInvoicePage() {
  const settings = await getCompanySettings();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          Create Invoice
        </h1>
        <p className="mt-1 text-zinc-400">
          Enter the essentials, generate, then download or print.
        </p>
      </div>
      <InvoiceForm
        mode="create"
        defaultTaxRate={settings.defaultTaxRate}
        defaultNotes={settings.defaultNotes}
      />
    </div>
  );
}
