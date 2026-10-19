import { Badge } from "@/components/ui/badge";
import { PAYMENT_STATUS_LABELS, type PaymentStatusValue } from "@/lib/constants";

export function StatusBadge({ status }: { status: PaymentStatusValue }) {
  const variant =
    status === "PAID"
      ? "default"
      : status === "PARTIAL"
        ? "secondary"
        : "outline";

  const className =
    status === "PAID"
      ? "bg-emerald-600/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-600/20"
      : status === "PARTIAL"
        ? "bg-[var(--tk-blue)]/15 text-[var(--tk-blue)] border-[var(--tk-blue)]/30 hover:bg-[var(--tk-blue)]/15"
        : "bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/10";

  return (
    <Badge variant={variant} className={className}>
      {PAYMENT_STATUS_LABELS[status]}
    </Badge>
  );
}
