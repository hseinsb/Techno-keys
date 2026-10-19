export type LineInput = {
  quantity: number;
  unitPrice: number;
};

export function lineTotal(quantity: number, unitPrice: number): number {
  return roundMoney((quantity || 0) * (unitPrice || 0));
}

export function calculateInvoiceTotals(input: {
  lines: LineInput[];
  taxRate?: number;
  discount?: number;
}): {
  subtotal: number;
  taxAmount: number;
  discount: number;
  total: number;
} {
  const subtotal = roundMoney(
    input.lines.reduce((sum, line) => sum + lineTotal(line.quantity, line.unitPrice), 0),
  );
  const discount = roundMoney(Math.max(0, input.discount || 0));
  const taxable = Math.max(0, subtotal - discount);
  const taxRate = Math.max(0, input.taxRate || 0);
  const taxAmount = roundMoney(taxable * (taxRate / 100));
  const total = roundMoney(taxable + taxAmount);

  return { subtotal, taxAmount, discount, total };
}

export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
