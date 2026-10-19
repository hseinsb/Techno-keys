"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export function InvoiceSearch() {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const current = params.get("q") ?? "";

  return (
    <form
      className="flex w-full max-w-xl gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        const q = String(form.get("q") || "").trim();
        startTransition(() => {
          const url = q ? `/invoices?q=${encodeURIComponent(q)}` : "/invoices";
          router.push(url);
        });
      }}
    >
      <Input
        name="q"
        defaultValue={current}
        placeholder="Search by customer, invoice #, or VIN"
        className="border-white/10 bg-black/30 text-white"
      />
      <Button
        type="submit"
        disabled={pending}
        className="bg-[var(--tk-blue)] text-black hover:bg-[var(--tk-blue-hover)]"
      >
        <Search className="size-4" />
        Search
      </Button>
    </form>
  );
}
