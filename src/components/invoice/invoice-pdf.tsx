import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
} from "@react-pdf/renderer";
import { formatCurrency, formatDate, vehicleLabel } from "@/lib/format";
import { PAYMENT_STATUS_LABELS, type PaymentStatusValue } from "@/lib/constants";

Font.registerHyphenationCallback((word) => [word]);

const colors = {
  black: "#111111",
  charcoal: "#1a1f26",
  blue: "#00A3E0",
  gray: "#5a6270",
  lightGray: "#e8ecf0",
  border: "#d0d7de",
  white: "#ffffff",
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 48,
    paddingHorizontal: 44,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: colors.black,
    backgroundColor: colors.white,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 22,
  },
  logo: {
    width: 150,
    height: 70,
    objectFit: "contain",
  },
  companyBlock: {
    alignItems: "flex-end",
    maxWidth: 220,
  },
  companyName: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: colors.charcoal,
    marginBottom: 4,
  },
  companyLine: {
    fontSize: 9,
    color: colors.gray,
    textAlign: "right",
    marginBottom: 2,
  },
  accentBar: {
    height: 3,
    backgroundColor: colors.blue,
    marginBottom: 18,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  metaCard: {
    width: "48%",
  },
  sectionLabel: {
    fontSize: 8,
    letterSpacing: 1.2,
    color: colors.blue,
    fontFamily: "Helvetica-Bold",
    marginBottom: 6,
    textTransform: "uppercase",
  },
  metaTitle: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: colors.charcoal,
    marginBottom: 6,
  },
  metaLine: {
    fontSize: 10,
    marginBottom: 3,
    color: colors.black,
  },
  muted: {
    color: colors.gray,
  },
  statusPaid: {
    color: "#0a7a3e",
    fontFamily: "Helvetica-Bold",
  },
  statusUnpaid: {
    color: "#b45309",
    fontFamily: "Helvetica-Bold",
  },
  statusPartial: {
    color: colors.blue,
    fontFamily: "Helvetica-Bold",
  },
  table: {
    marginTop: 8,
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: colors.charcoal,
    color: colors.white,
    paddingVertical: 7,
    paddingHorizontal: 8,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  colDesc: { width: "46%" },
  colQty: { width: "14%", textAlign: "right" },
  colPrice: { width: "20%", textAlign: "right" },
  colTotal: { width: "20%", textAlign: "right" },
  headerCell: {
    fontSize: 8,
    letterSpacing: 0.8,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
  },
  totalsWrap: {
    marginLeft: "auto",
    width: 220,
    marginBottom: 20,
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  grandRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 2,
    borderTopColor: colors.blue,
    paddingTop: 8,
    marginTop: 4,
  },
  grandLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
  },
  grandValue: {
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
    color: colors.blue,
  },
  notes: {
    marginTop: 8,
    padding: 10,
    backgroundColor: colors.lightGray,
    borderLeftWidth: 3,
    borderLeftColor: colors.blue,
  },
  footer: {
    position: "absolute",
    bottom: 28,
    left: 44,
    right: 44,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
    alignItems: "center",
  },
  footerText: {
    fontSize: 9,
    color: colors.gray,
  },
  footerBrand: {
    fontSize: 9,
    color: colors.blue,
    fontFamily: "Helvetica-Bold",
    marginTop: 2,
  },
});

export type InvoicePdfData = {
  number: string;
  invoiceDate: Date | string;
  dueDate?: Date | string | null;
  customerName: string;
  customerPhone?: string | null;
  customerEmail?: string | null;
  customerAddress?: string | null;
  vehicleYear?: string | null;
  vehicleMake?: string | null;
  vehicleModel?: string | null;
  vehicleVin?: string | null;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  total: number;
  paymentStatus: PaymentStatusValue;
  paymentMethod?: string | null;
  notes?: string | null;
  lines: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
};

export type CompanyPdfData = {
  companyName: string;
  businessAddress: string;
  phone: string;
  email: string;
  taxId?: string | null;
  logoPath?: string | null;
  defaultNotes?: string | null;
};

function statusStyle(status: PaymentStatusValue) {
  if (status === "PAID") return styles.statusPaid;
  if (status === "PARTIAL") return styles.statusPartial;
  return styles.statusUnpaid;
}

export function InvoicePdfDocument({
  invoice,
  company,
  logoSrc,
}: {
  invoice: InvoicePdfData;
  company: CompanyPdfData;
  logoSrc?: string;
}) {
  return (
    <Document
      title={`${invoice.number} — ${company.companyName}`}
      author={company.companyName}
    >
      <Page size="LETTER" style={styles.page}>
        <View style={styles.headerRow}>
          <View>
            {logoSrc ? (
              // eslint-disable-next-line jsx-a11y/alt-text
              <Image src={logoSrc} style={styles.logo} />
            ) : (
              <Text style={styles.companyName}>{company.companyName}</Text>
            )}
          </View>
          <View style={styles.companyBlock}>
            <Text style={styles.companyName}>{company.companyName}</Text>
            <Text style={styles.companyLine}>{company.businessAddress}</Text>
            <Text style={styles.companyLine}>{company.phone}</Text>
            <Text style={styles.companyLine}>{company.email}</Text>
            {company.taxId ? (
              <Text style={styles.companyLine}>EIN: {company.taxId}</Text>
            ) : null}
          </View>
        </View>

        <View style={styles.accentBar} />

        <View style={styles.metaRow}>
          <View style={styles.metaCard}>
            <Text style={styles.sectionLabel}>Bill To</Text>
            <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 12, marginBottom: 4 }}>
              {invoice.customerName}
            </Text>
            {invoice.customerPhone ? (
              <Text style={styles.metaLine}>{invoice.customerPhone}</Text>
            ) : null}
            {invoice.customerEmail ? (
              <Text style={styles.metaLine}>{invoice.customerEmail}</Text>
            ) : null}
            {invoice.customerAddress ? (
              <Text style={styles.metaLine}>{invoice.customerAddress}</Text>
            ) : null}
            <Text style={[styles.sectionLabel, { marginTop: 12 }]}>Vehicle</Text>
            <Text style={styles.metaLine}>{vehicleLabel(invoice)}</Text>
            {invoice.vehicleVin ? (
              <Text style={[styles.metaLine, styles.muted]}>VIN: {invoice.vehicleVin}</Text>
            ) : null}
          </View>

          <View style={styles.metaCard}>
            <Text style={styles.sectionLabel}>Invoice</Text>
            <Text style={styles.metaTitle}>{invoice.number}</Text>
            <Text style={styles.metaLine}>
              Date: <Text style={styles.muted}>{formatDate(invoice.invoiceDate)}</Text>
            </Text>
            {invoice.dueDate ? (
              <Text style={styles.metaLine}>
                Due: <Text style={styles.muted}>{formatDate(invoice.dueDate)}</Text>
              </Text>
            ) : null}
            <Text style={styles.metaLine}>
              Status:{" "}
              <Text style={statusStyle(invoice.paymentStatus)}>
                {PAYMENT_STATUS_LABELS[invoice.paymentStatus]}
              </Text>
            </Text>
            {invoice.paymentMethod ? (
              <Text style={styles.metaLine}>
                Method: <Text style={styles.muted}>{invoice.paymentMethod}</Text>
              </Text>
            ) : null}
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, styles.colDesc]}>Service</Text>
            <Text style={[styles.headerCell, styles.colQty]}>Qty</Text>
            <Text style={[styles.headerCell, styles.colPrice]}>Unit Price</Text>
            <Text style={[styles.headerCell, styles.colTotal]}>Total</Text>
          </View>
          {invoice.lines.map((line, index) => (
            <View key={index} style={styles.tableRow} wrap={false}>
              <Text style={styles.colDesc}>{line.description}</Text>
              <Text style={styles.colQty}>{line.quantity}</Text>
              <Text style={styles.colPrice}>{formatCurrency(line.unitPrice)}</Text>
              <Text style={styles.colTotal}>{formatCurrency(line.lineTotal)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalsWrap}>
          <View style={styles.totalsRow}>
            <Text style={styles.muted}>Subtotal</Text>
            <Text>{formatCurrency(invoice.subtotal)}</Text>
          </View>
          {invoice.discount > 0 ? (
            <View style={styles.totalsRow}>
              <Text style={styles.muted}>Discount</Text>
              <Text>-{formatCurrency(invoice.discount)}</Text>
            </View>
          ) : null}
          {invoice.taxAmount > 0 || invoice.taxRate > 0 ? (
            <View style={styles.totalsRow}>
              <Text style={styles.muted}>Tax ({invoice.taxRate}%)</Text>
              <Text>{formatCurrency(invoice.taxAmount)}</Text>
            </View>
          ) : null}
          <View style={styles.grandRow}>
            <Text style={styles.grandLabel}>Total Due</Text>
            <Text style={styles.grandValue}>{formatCurrency(invoice.total)}</Text>
          </View>
        </View>

        {invoice.notes ? (
          <View style={styles.notes}>
            <Text style={styles.sectionLabel}>Notes</Text>
            <Text>{invoice.notes}</Text>
          </View>
        ) : null}

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            {company.defaultNotes || "Thank you for choosing Techno Keys."}
          </Text>
          <Text style={styles.footerBrand}>
            Programming · Scanning · Calibration
          </Text>
        </View>
      </Page>
    </Document>
  );
}
