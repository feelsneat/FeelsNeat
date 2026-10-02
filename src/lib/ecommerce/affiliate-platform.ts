export type SupportedAffiliatePlatform = 'AMAZON' | 'MEESHO';

function inferAffiliatePlatform(merchantName?: string, affiliateUrl?: string): SupportedAffiliatePlatform | null {
  const merchantAndUrl = `${merchantName || ''} ${affiliateUrl || ''}`.toLowerCase();
  if (merchantAndUrl.includes('amazon') || merchantAndUrl.includes('amzn')) return 'AMAZON';
  if (merchantAndUrl.includes('meesho')) return 'MEESHO';
  return null;
}

export function getAffiliatePlatformSelection(
  platform?: string,
  merchantName?: string,
  affiliateUrl?: string
): SupportedAffiliatePlatform {
  if (platform === 'AMAZON' || platform === 'MEESHO') return platform;
  return inferAffiliatePlatform(merchantName, affiliateUrl) || 'AMAZON';
}

export function getAffiliatePlatformLabel(
  platform?: string,
  merchantName?: string,
  affiliateUrl?: string
): string {
  if (platform && platform !== 'CUSTOM') return platform;
  return inferAffiliatePlatform(merchantName, affiliateUrl) || 'Partner';
}
