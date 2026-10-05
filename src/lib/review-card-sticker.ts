import QRCode from 'qrcode';
import type { ReviewCardMaterial } from './review-card-types';

export const REVIEW_CARD_STICKER_WIDTH_MM = 50;
export const REVIEW_CARD_STICKER_HEIGHT_MM = 30;
export const REVIEW_CARD_STICKER_DPI = 203;

function escapeXml(value: string): string {
  return value.replace(/[<>&"']/g, (character) => ({
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    '"': '&quot;',
    "'": '&apos;',
  })[character] || character);
}

function fitText(value: string, maxCharacters: number): string {
  const text = value.trim();
  if (text.length <= maxCharacters) return text;
  return `${text.slice(0, Math.max(1, maxCharacters - 1))}…`;
}

export function createReviewCardStickerSvg(
  reviewUrl: string,
  businessName: string,
  stickerText: string,
  material: ReviewCardMaterial,
  logoDataUrl = ''
): string {
  const qr = QRCode.create(reviewUrl, { errorCorrectionLevel: 'M' });
  if (qr.modules.size > 49) {
    throw new Error('Use a shorter Google review link so the printed QR code remains scannable at 203 dpi.');
  }
  const qrSize = 216;
  const quietZoneModules = 4;
  const moduleSize = qrSize / (qr.modules.size + quietZoneModules * 2);
  const qrX = 265;
  const qrY = 33;
  let qrPath = '';

  for (let row = 0; row < qr.modules.size; row += 1) {
    for (let column = 0; column < qr.modules.size; column += 1) {
      if (qr.modules.get(row, column)) {
        const x = qrX + (column + quietZoneModules) * moduleSize;
        const y = qrY + (row + quietZoneModules) * moduleSize;
        qrPath += `M${x.toFixed(2)} ${y.toFixed(2)}h${moduleSize.toFixed(2)}v${moduleSize.toFixed(2)}h-${moduleSize.toFixed(2)}z`;
      }
    }
  }

  const shop = fitText(businessName || 'Your shop', 17);
  const customText = fitText(stickerText || 'Review us on Google', 30);
  const transparentBackground = material === 'TRANSPARENT';
  const logo = logoDataUrl
    ? `<image href="${escapeXml(logoDataUrl)}" x="20" y="72" width="118" height="74" preserveAspectRatio="xMidYMid meet"/>`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${REVIEW_CARD_STICKER_WIDTH_MM}mm" height="${REVIEW_CARD_STICKER_HEIGHT_MM}mm" viewBox="0 0 500 300" role="img" aria-label="Google review sticker for ${escapeXml(shop)}">
<title>Google review sticker — ${escapeXml(shop)}</title>
${transparentBackground ? '' : '<rect width="500" height="300" fill="#fff"/>'}
<g fill="#000">
${logo}
<text x="20" y="${logo ? 178 : 118}" font-family="Arial,Helvetica,sans-serif" font-size="${logo ? 25 : 31}" font-weight="700">${escapeXml(shop)}</text>
<text x="20" y="218" font-family="Arial,Helvetica,sans-serif" font-size="19" font-weight="700">${escapeXml(customText)}</text>
<text x="20" y="254" font-family="Arial,Helvetica,sans-serif" font-size="14">SCAN TO REVIEW</text>
<path d="${qrPath}"/>
</g>
</svg>`;
}
