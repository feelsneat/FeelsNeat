export function isValidGoogleReviewUrl(value: string): boolean {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    return url.protocol === 'https:' &&
      (host === 'g.page' ||
        host === 'goo.gl' ||
        host === 'maps.app.goo.gl' ||
        host === 'google.com' ||
        host.endsWith('.google.com') ||
        host === 'google.co.in' ||
        host.endsWith('.google.co.in'));
  } catch {
    return false;
  }
}
