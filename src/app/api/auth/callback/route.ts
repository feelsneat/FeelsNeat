import { NextRequest, NextResponse } from 'next/server';
import { signSession } from '@/lib/auth';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  
  if (!code) {
    return NextResponse.redirect(new URL('/admin?error=missing_code', req.url));
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const authSecret = process.env.AUTH_SECRET;
  const allowedEmailsStr = process.env.ALLOWED_EMAILS || '';

  if (!clientId || !clientSecret || !authSecret) {
    return new NextResponse('Server configuration error (missing client credentials or auth secret).', { status: 500 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || `${url.protocol}//${url.host}`;
  const redirectUri = `${siteUrl}/api/auth/callback`;

  try {
    // Exchange auth code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokens = await tokenRes.json();
    if (!tokenRes.ok || !tokens.access_token) {
      console.error('Token exchange error:', tokens);
      return NextResponse.redirect(new URL('/admin?error=token_exchange_failed', req.url));
    }

    // Get user email info
    const userinfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    const userInfo = await userinfoRes.json();
    if (!userinfoRes.ok || !userInfo.email) {
      console.error('Userinfo fetch error:', userInfo);
      return NextResponse.redirect(new URL('/admin?error=userinfo_failed', req.url));
    }

    const email = userInfo.email.toLowerCase();
    const allowedEmails = allowedEmailsStr.split(',').map(e => e.trim().toLowerCase());

    if (!allowedEmails.includes(email)) {
      console.warn(`Unauthorized login attempt from: ${email}`);
      return NextResponse.redirect(new URL(`/admin?error=unauthorized&email=${encodeURIComponent(email)}`, req.url));
    }

    // Sign session token using native Crypto HMAC
    const sessionToken = await signSession(email, authSecret);

    // Set secure HTTP-only cookie
    const response = NextResponse.redirect(new URL('/admin', req.url));
    response.cookies.set('feelsneat_session', sessionToken, {
      httpOnly: true,
      secure: true, // Always secure for modern browsers/Edge
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error('OAuth Callback general error:', error);
    return NextResponse.redirect(new URL('/admin?error=auth_failed', req.url));
  }
}
