import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { writeAsStringAsync, cacheDirectory } from 'expo-file-system/legacy';

export async function shareMonitoringPdf(html: string, dialogTitle: string): Promise<void> {
  const { uri } = await Print.printToFileAsync({ html, base64: false });
  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    throw new Error('Sharing is not available on this device');
  }
  await Sharing.shareAsync(uri, {
    mimeType: 'application/pdf',
    dialogTitle,
    UTI: 'com.adobe.pdf',
  });
}

export async function shareMonitoringCsv(csv: string, filename: string): Promise<void> {
  const base = cacheDirectory;
  if (!base) {
    throw new Error('File cache is not available on this device');
  }
  const uri = `${base}${filename}`;
  await writeAsStringAsync(uri, csv, { encoding: 'utf8' });
  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    throw new Error('Sharing is not available on this device');
  }
  await Sharing.shareAsync(uri, {
    mimeType: 'text/csv',
    dialogTitle: 'Share fleet report',
  });
}
