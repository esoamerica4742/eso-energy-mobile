import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { formatCurrency } from '@/esopay/utils/currency';

export type PaymentReceiptData = {
  providerName: string;
  customerName: string | null;
  accountNumber: string;
  amountKobo: number;
  paymentReference: string;
  transactionReference?: string | null;
  tokenOrReceipt: string | null;
  paidAt: string;
  status: string;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function buildReceiptHtml(data: PaymentReceiptData): string {
  const rows = [
    ['Provider', data.providerName],
    ['Customer', data.customerName ?? '—'],
    ['Account / meter', data.accountNumber],
    ['Amount', formatCurrency(data.amountKobo)],
    ['Reference', data.paymentReference],
    ...(data.transactionReference
      ? [['Transaction', data.transactionReference] as const]
      : []),
    ['Status', data.status],
    ['Date', new Date(data.paidAt).toLocaleString('en-NG')],
    ...(data.tokenOrReceipt ? [['Token / receipt', data.tokenOrReceipt] as const] : []),
  ];

  const bodyRows = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:10px 0;color:#888;font-size:12px;text-transform:uppercase;letter-spacing:1px;">${escapeHtml(label)}</td><td style="padding:10px 0;color:#111;font-size:15px;text-align:right;font-weight:600;">${escapeHtml(value)}</td></tr>`,
    )
    .join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>ESO Pay Receipt</title>
</head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f7f4ef;padding:32px;">
  <div style="max-width:520px;margin:0 auto;background:#fff;border:1px solid #d4af37;border-radius:16px;padding:28px;">
    <div style="text-align:center;margin-bottom:24px;">
      <div style="font-size:11px;letter-spacing:2px;color:#b8860b;text-transform:uppercase;">ESO Pay</div>
      <h1 style="margin:8px 0 0;font-size:28px;color:#111;">Payment Receipt</h1>
    </div>
    <table style="width:100%;border-collapse:collapse;">${bodyRows}</table>
    <p style="margin-top:28px;font-size:11px;color:#888;text-align:center;line-height:1.5;">
      Debited from your Eso Pay wallet. Keep this receipt for your records.
    </p>
  </div>
</body>
</html>`;
}

export async function createReceiptPdfUri(data: PaymentReceiptData): Promise<string> {
  const html = buildReceiptHtml(data);
  const { uri } = await Print.printToFileAsync({ html, base64: false });
  return uri;
}

export async function shareReceiptPdf(data: PaymentReceiptData): Promise<void> {
  const uri = await createReceiptPdfUri(data);
  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    throw new Error('Sharing is not available on this device');
  }
  await Sharing.shareAsync(uri, {
    mimeType: 'application/pdf',
    dialogTitle: 'Share ESO Pay receipt',
    UTI: 'com.adobe.pdf',
  });
}

export async function printReceipt(data: PaymentReceiptData): Promise<void> {
  const html = buildReceiptHtml(data);
  await Print.printAsync({ html });
}
