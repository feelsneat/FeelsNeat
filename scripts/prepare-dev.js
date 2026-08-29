const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, 'dev-db-node.ts');
const dest = path.join(__dirname, '../src/app/api/dev-db/route.ts');

try {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  console.log('[Prepare-Dev] Restored Node.js dev-db proxy route successfully.');
} catch (err) {
  console.error('[Prepare-Dev] Failed to restore dev-db proxy route:', err);
}
