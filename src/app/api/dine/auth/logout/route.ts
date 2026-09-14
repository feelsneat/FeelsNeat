import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(req: Request) {
  const res = NextResponse.redirect(new URL('/dine-admin', req.url));
  res.cookies.set('feelsneat_restaurant_session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return res;
}
