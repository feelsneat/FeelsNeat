import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId || clientId.startsWith('placeholder')) {
    return new NextResponse('Google OAuth is not configured. Please add GOOGLE_CLIENT_ID to your environment.', { status: 500 });
  }

  // Detect site URL dynamically to handle preview environments
  const url = new URL(req.url);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || `${url.protocol}//${url.host}`;
  const redirectUri = `${siteUrl}/api/auth/callback`;

  const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${encodeURIComponent(clientId)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code` +
    `&scope=${encodeURIComponent('openid email')}` +
    `&prompt=select_account`;

  return NextResponse.redirect(oauthUrl);
}
