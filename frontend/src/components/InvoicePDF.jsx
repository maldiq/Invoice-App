import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { company } from '../config/company';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#1f2937',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottom: '1px solid #e5e7eb',
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  tagline: {
    fontSize: 10,
    color: '#6b7280',
    fontStyle: 'italic',
    marginTop: 2,
  },
  invoiceTitle: {
    fontSize: 28,
    fontWeight: 'normal',
    color: '#9ca3af',
    letterSpacing: 1,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#6b7280',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  table: {
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    padding: 8,
    fontWeight: 'bold',
    borderBottom: '1px solid #e5e7eb',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottom: '1px solid #e5e7eb',
  },
  colDesc: { flex: 3 },
  colQty: { flex: 1, textAlign: 'center' },
  colPrice: { flex: 1, textAlign: 'right' },
  colAmount: { flex: 1, textAlign: 'right' },
  totals: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  totalRow: {
    flexDirection: 'row',
    width: 200,
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  grandTotal: {
    flexDirection: 'row',
    width: 200,
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderTop: '1px solid #d1d5db',
    marginTop: 4,
    fontWeight: 'bold',
    fontSize: 11,
  },
  notes: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f9fafb',
  },
  footer: {
    marginTop: 40,
    paddingTop: 16,
    borderTop: '1px solid #e5e7eb',
  },
  bankInfo: {
    fontSize: 10,
    color: '#374151',
    marginBottom: 24,
  },
  footerMessage: {
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1f2937',
    letterSpacing: 0.5,
  },
  metaText: {
    fontSize: 9,
    color: '#374151',
    marginBottom: 2,
  },
  metaLabel: {
    color: '#6b7280',
  },
});

function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function InvoicePDF({ invoice }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.companyName}>{company.name}</Text>
            <Text style={styles.tagline}>{company.tagline}</Text>
          </View>
          <Text style={styles.invoiceTitle}>INVOICE</Text>
        </View>

        <View style={styles.metaRow}>
          <View>
            <Text style={styles.sectionTitle}>Bill To</Text>
            <Text style={{ fontWeight: 'bold' }}>{invoice.client_name}</Text>
            {invoice.client_email && <Text>{invoice.client_email}</Text>}
            {invoice.client_address && <Text>{invoice.client_address}</Text>}
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.metaText}>
              <Text style={styles.metaLabel}>Invoice #: </Text>
              {invoice.invoice_number}
            </Text>
            <Text style={styles.metaText}>
              <Text style={styles.metaLabel}>Date: </Text>
              {formatDate(invoice.date)}
            </Text>
            <Text style={styles.metaText}>
              <Text style={styles.metaLabel}>Due: </Text>
              {formatDate(invoice.due_date)}
            </Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colDesc}>Description</Text>
            <Text style={styles.colQty}>Qty</Text>
            <Text style={styles.colPrice}>Unit Price</Text>
            <Text style={styles.colAmount}>Amount</Text>
          </View>
          {(invoice.items || []).map((item, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={styles.colDesc}>{item.description}</Text>
              <Text style={styles.colQty}>{item.quantity}</Text>
              <Text style={styles.colPrice}>{formatCurrency(item.unit_price)}</Text>
              <Text style={styles.colAmount}>{formatCurrency(item.quantity * item.unit_price)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text>Subtotal</Text>
            <Text>{formatCurrency(invoice.subtotal || 0)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>Tax ({invoice.tax_rate || 0}%)</Text>
            <Text>{formatCurrency(invoice.tax || 0)}</Text>
          </View>
          <View style={styles.grandTotal}>
            <Text>Total</Text>
            <Text>{formatCurrency(invoice.total || 0)}</Text>
          </View>
        </View>

        {invoice.notes && (
          <View style={styles.notes}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text>{invoice.notes}</Text>
          </View>
        )}

        <View style={styles.footer}>
          <View style={styles.bankInfo}>
            <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>Transfer ke rekening:</Text>
            <Text>{company.bank.name}</Text>
            <Text>Norek: {company.bank.accountNumber}</Text>
            <Text>A/n: {company.bank.accountHolder}</Text>
          </View>
          <Text style={styles.footerMessage}>{company.footerMessage}</Text>
        </View>
      </Page>
    </Document>
  );
}
