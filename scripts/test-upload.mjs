import fs from 'fs';
import path from 'path';

if (process.argv.length < 6) {
  console.error('Usage: node scripts/test-upload.mjs <FUNCTION_URL> <FILE_PATH> <ENTITY_TYPE> <ENTITY_ID>');
  process.exit(2);
}

const [,, url, filePath, entityType, entityId] = process.argv;

const full = path.resolve(filePath);
if (!fs.existsSync(full)) {
  console.error('File not found:', full);
  process.exit(2);
}

const fileStream = fs.createReadStream(full);
const form = new (await import('form-data')).default();
form.append('file', fileStream);
form.append('entity_type', entityType);
form.append('entity_id', String(entityId));

const headers = form.getHeaders();

const res = await fetch(url, { method: 'POST', body: form, headers });
const text = await res.text();
console.log('Status:', res.status);
console.log(text);
