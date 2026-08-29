const fs = require('fs');
const path = require('path');

const dest = path.join(__dirname, '../src/app/api/dev-db/route.ts');
const dummyContent = `import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
  return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
}

export async function POST() {
  return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
}
`;

try {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, dummyContent, 'utf-8');
  console.log('[Prepare-Build] Replaced dev-db proxy with dummy edge route for production build.');
} catch (err) {
  console.error('[Prepare-Build] Failed to replace dev-db proxy route:', err);
}
