import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import { getR2Object } from '@/lib/ecommerce/digital-file-storage';

export const runtime = 'edge';

async function isAdmin(req: NextRequest): Promise<boolean> {
  const session = req.cookies.get('feelsneat_session')?.value;
  const secret = process.env.AUTH_SECRET || (
    process.env.NODE_ENV === 'development'
      ? 'local_dev_secret_key_needs_to_be_long_and_secure_32_chars'
      : undefined
  );
  return Boolean(session && secret && await verifySession(session, secret));
}

export async function GET(req: NextRequest) {
  if (!await isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const reference = new URL(req.url).searchParams.get('reference') || '';
  const match = /^r2:\/\/customer-uploads\/([A-Za-z0-9-]{1,64})\/([0-9a-f-]{36}|[0-9a-f]{64})$/i.exec(reference);
  if (!match) return NextResponse.json({ error: 'Customer image not found.' }, { status: 404 });

  try {
    const object = await getR2Object(`customer-uploads/${match[1]}/${match[2]}`);
    if (!object) return NextResponse.json({ error: 'Customer image not found.' }, { status: 404 });
    const contentType = object.httpMetadata?.contentType;
    if (!contentType || !['image/jpeg', 'image/png', 'image/webp'].includes(contentType)) {
      return NextResponse.json({ error: 'Customer image not found.' }, { status: 404 });
    }
    return new Response(object.body, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
        ...(object.size !== undefined ? { 'Content-Length': String(object.size) } : {}),
      },
    });
  } catch (error) {
    console.error('Admin customer image request failed:', error);
    return NextResponse.json({ error: 'Customer image is temporarily unavailable.' }, { status: 500 });
  }
}
