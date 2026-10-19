"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateCompanySettings } from "@/lib/actions/settings";

type Settings = {
  companyName: string;
  businessAddress: string;
  phone: string;
  email: string;
  taxId: string;
  logoPath: string;
  defaultNotes: string;
  defaultTaxRate: number;
};

export function SettingsForm({ initial }: { initial: Settings }) {
  const [form, setForm] = useState(initial);
  const [pending, startTransition] = useTransition();
  const fieldClass = "border-white/10 bg-black/30 text-zinc-100";

  return (
    <form
      className="space-y-5 rounded-xl border border-white/10 bg-black/25 p-5 md:p-6"
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          try {
            await updateCompanySettings(form);
            toast.success("Settings saved");
          } catch {
            toast.error("Could not save settings");
          }
        });
      }}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="companyName">Company name</Label>
          <Input
            id="companyName"
            className={fieldClass}
            value={form.companyName}
            onChange={(e) => setForm({ ...form, companyName: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="businessAddress">Business address</Label>
          <Input
            id="businessAddress"
            className={fieldClass}
            value={form.businessAddress}
            onChange={(e) => setForm({ ...form, businessAddress: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            className={fieldClass}
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            className={fieldClass}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="taxId">Tax ID / EIN</Label>
          <Input
            id="taxId"
            className={fieldClass}
            value={form.taxId}
            onChange={(e) => setForm({ ...form, taxId: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="logoPath">Logo path</Label>
          <Input
            id="logoPath"
            className={fieldClass}
            value={form.logoPath}
            onChange={(e) => setForm({ ...form, logoPath: e.target.value })}
            placeholder="/logo.png"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="defaultTaxRate">Default tax rate (%)</Label>
          <Input
            id="defaultTaxRate"
            type="number"
            min="0"
            step="0.01"
            className={fieldClass}
            value={form.defaultTaxRate}
            onChange={(e) =>
              setForm({ ...form, defaultTaxRate: Number(e.target.value) || 0 })
            }
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="defaultNotes">Default invoice notes</Label>
          <Textarea
            id="defaultNotes"
            className={`${fieldClass} min-h-24`}
            value={form.defaultNotes}
            onChange={(e) => setForm({ ...form, defaultNotes: e.target.value })}
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={pending}
        className="bg-[var(--tk-blue)] text-black hover:bg-[var(--tk-blue-hover)]"
      >
        {pending ? "Saving…" : "Save settings"}
      </Button>
    </form>
  );
}
