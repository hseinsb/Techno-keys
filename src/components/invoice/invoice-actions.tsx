"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import {
  Copy,
  Download,
  Eye,
  Pencil,
  Printer,
  Trash2,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { deleteInvoice, duplicateInvoice } from "@/lib/actions/invoices";
import { cn } from "@/lib/utils";

export function InvoiceActions({
  id,
  number,
  compact = false,
  showView = true,
}: {
  id: string;
  number: string;
  compact?: boolean;
  showView?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const pdfUrl = `/api/invoices/${id}/pdf`;

  return (
    <div className={cn("flex flex-wrap gap-2", compact && "justify-end")}>
      {showView ? (
        <Link
          href={`/invoices/${id}`}
          className={cn(buttonVariants({ variant: "outline", size: compact ? "sm" : "default" }), "border-white/15")}
        >
          <Eye className="size-4" />
          {!compact ? "View" : null}
        </Link>
      ) : null}
      <Link
        href={`/invoices/${id}?edit=1`}
        className={cn(buttonVariants({ variant: "outline", size: compact ? "sm" : "default" }), "border-white/15")}
      >
        <Pencil className="size-4" />
        {!compact ? "Edit" : null}
      </Link>
      <a
        href={pdfUrl}
        target="_blank"
        rel="noreferrer"
        className={cn(buttonVariants({ variant: "outline", size: compact ? "sm" : "default" }), "border-white/15")}
      >
        <Download className="size-4" />
        {!compact ? "PDF" : null}
      </a>
      <Button
        type="button"
        variant="outline"
        size={compact ? "sm" : "default"}
        className="border-white/15"
        disabled={pending}
        onClick={() => {
          startTransition(async () => {
            try {
              const copy = await duplicateInvoice(id);
              toast.success(`Duplicated as ${copy.number}`);
              router.push(`/invoices/${copy.id}`);
              router.refresh();
            } catch {
              toast.error("Could not duplicate invoice");
            }
          });
        }}
      >
        <Copy className="size-4" />
        {!compact ? "Duplicate" : null}
      </Button>
      {!compact ? (
        <Button
          type="button"
          variant="outline"
          className="border-white/15"
          onClick={() => window.open(pdfUrl, "_blank")}
        >
          <Printer className="size-4" />
          Print
        </Button>
      ) : null}
      <Button
        type="button"
        variant="destructive"
        size={compact ? "sm" : "default"}
        disabled={pending}
        onClick={() => {
          if (!confirm(`Delete invoice ${number}? This cannot be undone.`)) return;
          startTransition(async () => {
            try {
              await deleteInvoice(id);
              toast.success("Invoice deleted");
              if (!compact) {
                router.push("/invoices");
              }
              router.refresh();
            } catch {
              toast.error("Could not delete invoice");
            }
          });
        }}
      >
        <Trash2 className="size-4" />
        {!compact ? "Delete" : null}
      </Button>
    </div>
  );
}
