const fs = require('fs');
const path = require('path');

const dest = path.join(__dirname, '../src/app/api/dev-db/route.ts');
const catchAllPage = path.join(__dirname, '../src/app/[...slug]/page.tsx');
const homePage = path.join(__dirname, '../src/app/page.tsx');
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
  const pageContent = fs.readFileSync(catchAllPage, 'utf-8');
  fs.writeFileSync(catchAllPage, pageContent.replace("export const runtime = 'nodejs';", "export const runtime = 'edge';"), 'utf-8');
  const homeContent = fs.readFileSync(homePage, 'utf-8');
  fs.writeFileSync(homePage, homeContent.replace("export const runtime = 'nodejs';", "export const runtime = 'edge';"), 'utf-8');
  console.log('[Prepare-Build] Replaced dev-db proxy with dummy edge route for production build.');
} catch (err) {
  console.error('[Prepare-Build] Failed to replace dev-db proxy route:', err);
}
