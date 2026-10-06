import { NextRequest, NextResponse } from 'next/server';
import { getR2Object } from '@/lib/ecommerce/digital-file-storage';

export const runtime = 'edge';

async function loadProfile(profileId: string, req: NextRequest): Promise<Record<string, unknown> | null> {
  try {
    const { getRequestContext } = await import('@cloudflare/next-on-pages');
    const kv = getRequestContext().env?.FEELSNEAT_CMS_KV;
    const value = await kv?.get(`profile:${profileId}`);
    if (value) return JSON.parse(value) as Record<string, unknown>;
  } catch (error) {
    if (process.env.NODE_ENV !== 'development') {
      console.error('Pet profile image storage lookup failed:', error);
      throw error;
    }
  }

  if (process.env.NODE_ENV === 'development') {
    const response = await fetch(new URL('/api/dev-db?type=profiles', req.url));
    if (!response.ok) throw new Error(`Local profile storage returned ${response.status}.`);
    const profiles: unknown = await response.json();
    if (Array.isArray(profiles)) {
      const profile = profiles.find((item) => item?.profile_id === profileId);
      return profile && typeof profile === 'object' ? profile as Record<string, unknown> : null;
    }
  }
  return null;
}

export async function GET(req: NextRequest) {
  const profileId = new URL(req.url).searchParams.get('profileId') || '';
  if (!/^[A-Za-z0-9]{1,32}$/.test(profileId)) {
    return NextResponse.json({ error: 'Pet profile image not found.' }, { status: 404 });
  }

  try {
    const profile = await loadProfile(profileId, req);
    if (!profile || profile.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Pet profile image not found.' }, { status: 404 });
    }
    const reference = typeof profile.pet_photo === 'string' ? profile.pet_photo : '';
    const match = /^r2:\/\/customer-uploads\/([A-Za-z0-9-]{1,64})\/([0-9a-f-]{36}|[0-9a-f]{64})$/i.exec(reference);
    if (!match) return NextResponse.json({ error: 'Pet profile image not found.' }, { status: 404 });
    const object = await getR2Object(`customer-uploads/${match[1]}/${match[2]}`);
    if (!object) return NextResponse.json({ error: 'Pet profile image not found.' }, { status: 404 });
    const contentType = object.httpMetadata?.contentType;
    if (!contentType || !['image/jpeg', 'image/png', 'image/webp'].includes(contentType)) {
      return NextResponse.json({ error: 'Pet profile image not found.' }, { status: 404 });
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
    console.error('Pet profile image request failed:', error);
    return NextResponse.json({ error: 'Pet profile image is temporarily unavailable.' }, { status: 500 });
  }
}
