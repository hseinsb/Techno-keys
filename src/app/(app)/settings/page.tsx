import { getCompanySettings } from "@/lib/actions/settings";
import { SettingsForm } from "@/components/settings/settings-form";

export default async function SettingsPage() {
  const settings = await getCompanySettings();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          Company Settings
        </h1>
        <p className="mt-1 text-zinc-400">
          These details appear on every invoice PDF.
        </p>
      </div>
      <SettingsForm
        initial={{
          companyName: settings.companyName,
          businessAddress: settings.businessAddress,
          phone: settings.phone,
          email: settings.email,
          taxId: settings.taxId,
          logoPath: settings.logoPath,
          defaultNotes: settings.defaultNotes,
          defaultTaxRate: settings.defaultTaxRate,
        }}
      />
    </div>
  );
}
