import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import localDb from '@/lib/content-db.json';

export const runtime = 'edge';

// Global Symbol to persist local CMS edits in-memory for the dev server session lifecycle
const globalSymbol = Symbol.for('feelsneat.content_db');
if (process.env.NODE_ENV === 'development' && !(globalThis as any)[globalSymbol]) {
  (globalThis as any)[globalSymbol] = JSON.parse(JSON.stringify(localDb));
}

async function authenticate(req: NextRequest): Promise<boolean> {
  const sessionCookie = req.cookies.get('feelsneat_session');
  if (!sessionCookie || !sessionCookie.value) return false;
  
  // Use config secret, or fallback to dev dummy key in development mode
  const authSecret = process.env.AUTH_SECRET || (
    process.env.NODE_ENV === 'development' 
      ? 'local_dev_secret_key_needs_to_be_long_and_secure_32_chars' 
      : undefined
  );
  
  if (!authSecret) return false;
  
  const decoded = await verifySession(sessionCookie.value, authSecret);
  return decoded !== null;
}

export async function GET(req: NextRequest) {
  const isAuthed = await authenticate(req);
  if (!isAuthed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(req.url);
  const loadDefault = url.searchParams.get('default') === 'true';

  if (loadDefault) {
    return NextResponse.json(localDb);
  }

  // In local development, fallback to the session database store
  if (process.env.NODE_ENV === 'development') {
    const memoryDb = (globalThis as any)[globalSymbol];
    if (memoryDb) {
      return NextResponse.json(memoryDb);
    }
  }

  try {
    const { getRequestContext } = await import('@cloudflare/next-on-pages');
    const context = getRequestContext();
    const env = context?.env;
    if (env && env.FEELSNEAT_CMS_KV) {
      const kvData = await env.FEELSNEAT_CMS_KV.get('content_db');
      if (kvData) {
        return NextResponse.json(JSON.parse(kvData));
      }
    }
  } catch (e) {
    console.warn('Admin API GET KV resolution fallback:', e);
  }

  return NextResponse.json(localDb);
}

export async function POST(req: NextRequest) {
  const isAuthed = await authenticate(req);
  if (!isAuthed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid content data payload' }, { status: 400 });
    }

    // Try Cloudflare KV storage first
    try {
      const { getRequestContext } = await import('@cloudflare/next-on-pages');
      const context = getRequestContext();
      const env = context?.env;
      if (env && env.FEELSNEAT_CMS_KV) {
        await env.FEELSNEAT_CMS_KV.put('content_db', JSON.stringify(body));
        return NextResponse.json({ success: true, message: 'Content database updated successfully in Cloudflare KV.' });
      }
    } catch (kvError) {
      console.warn('KV context resolution skipped:', kvError);
    }

    // Local development session-persistence fallback (avoids edge fs sandboxing errors)
    if (process.env.NODE_ENV === 'development') {
      (globalThis as any)[globalSymbol] = body;
      return NextResponse.json({ 
        success: true, 
        message: 'Content database updated in-memory for this dev session. (To persist, click Export Backup).' 
      });
    }

    return NextResponse.json({ error: 'Cloudflare KV storage is not available in this runtime.' }, { status: 500 });
  } catch (e) {
    console.error('Admin API POST error:', e);
    return NextResponse.json({ error: 'An error occurred while saving content.' }, { status: 500 });
  }
}
