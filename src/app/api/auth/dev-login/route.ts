import { NextRequest, NextResponse } from 'next/server';
import { signSession } from '@/lib/auth';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  // Strict check: only allow this route in development mode
  if (process.env.NODE_ENV !== 'development') {
    return new NextResponse('Forbidden', { status: 403 });
  }

  const allowedEmailsStr = process.env.ALLOWED_EMAILS || 'admin@feelsneat.dev';
  const firstEmail = allowedEmailsStr.split(',')[0].trim().toLowerCase();
  
  // Use configured secret or fallback to dev secret for zero-config out-of-the-box local testing
  const authSecret = process.env.AUTH_SECRET || 'local_dev_secret_key_needs_to_be_long_and_secure_32_chars';

  try {
    const sessionToken = await signSession(firstEmail, authSecret);

    const response = NextResponse.redirect(new URL('/admin', req.url));
    response.cookies.set('feelsneat_session', sessionToken, {
      httpOnly: true,
      secure: false, // Disabled secure flag for local HTTP development (localhost)
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Dev Login Error:', error);
    return new NextResponse('Dev Sign-In Error', { status: 500 });
  }
}
