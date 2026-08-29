import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
  return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
}

export async function POST() {
  return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
}
