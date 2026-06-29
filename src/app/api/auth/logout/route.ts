import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const response = NextResponse.redirect(new URL('/admin', req.url));
  response.cookies.delete('feelsneat_session');
  return response;
}
