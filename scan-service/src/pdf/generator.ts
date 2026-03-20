import puppeteer, { type Browser } from 'puppeteer';
import { buildReportHtml, type ReportData } from './template.js';

let pdfBrowser: Browser | null = null;

async function getPdfBrowser(): Promise<Browser> {
  if (!pdfBrowser || !pdfBrowser.isConnected()) {
    pdfBrowser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });
  }
  return pdfBrowser;
}

export async function generatePdf(data: ReportData): Promise<Buffer> {
  const html = buildReportHtml(data);
  const browser = await getPdfBrowser();
  const page = await browser.newPage();

  try {
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        bottom: '20mm',
        left: '15mm',
        right: '15mm',
      },
    });

    return Buffer.from(pdf);
  } finally {
    await page.close();
  }
}
