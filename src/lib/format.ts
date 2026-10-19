export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount || 0);
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

export function formatInvoiceNumber(sequence: number): string {
  return `TK-${String(sequence).padStart(4, "0")}`;
}

export function vehicleLabel(invoice: {
  vehicleYear?: string | null;
  vehicleMake?: string | null;
  vehicleModel?: string | null;
}): string {
  const parts = [invoice.vehicleYear, invoice.vehicleMake, invoice.vehicleModel]
    .map((p) => p?.trim())
    .filter(Boolean);
  return parts.length ? parts.join(" ") : "—";
}
