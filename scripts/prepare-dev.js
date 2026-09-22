const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, 'dev-db-node.ts');
const dest = path.join(__dirname, '../src/app/api/dev-db/route.ts');
const catchAllPage = path.join(__dirname, '../src/app/[[...slug]]/page.tsx');

try {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  const pageContent = fs.readFileSync(catchAllPage, 'utf-8');
  fs.writeFileSync(catchAllPage, pageContent.replace("export const runtime = 'edge';", "export const runtime = 'nodejs';"), 'utf-8');
  console.log('[Prepare-Dev] Restored Node.js dev-db proxy route successfully.');
} catch (err) {
  console.error('[Prepare-Dev] Failed to restore dev-db proxy route:', err);
}
