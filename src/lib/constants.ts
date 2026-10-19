export const PRESET_SERVICES = [
  "Key Programming",
  "Diagnostic Scanning",
  "ADAS Calibration",
  "ECU Programming",
  "Module Programming",
  "Other / Custom Service",
] as const;

export const PAYMENT_METHODS = [
  "Cash",
  "Check",
  "Credit Card",
  "Debit Card",
  "Zelle",
  "Venmo",
  "Bank Transfer",
  "Other",
] as const;

export type PaymentStatusValue = "PAID" | "UNPAID" | "PARTIAL";

export const PAYMENT_STATUS_LABELS: Record<PaymentStatusValue, string> = {
  PAID: "Paid",
  UNPAID: "Unpaid",
  PARTIAL: "Partially Paid",
};
