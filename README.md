# Lynx — Attachments & Uploads

This repository includes an attachments upload flow using Netlify Functions + Supabase Storage (private buckets) with signed URL delivery and optional Redis caching.

This README lists required environment variables, setup steps, how to test locally and remotely, and CI guidance.

## Required environment variables (Netlify / production)
- SUPABASE_URL=https://<your-project>.supabase.co
- SUPABASE_SERVICE_ROLE_KEY=<service-role-key>  # *always secret, never push to git*
- SUPABASE_ANON_KEY=<anon-key>                 # used by client-side proxies where needed
- REDIS_URL (optional)                          # if you want shared cache for signed URLs

Note: Do NOT expose SERVICE_ROLE_KEY to frontend or GitHub public repos.

## Supabase setup
1. Create 4 private buckets:
   - site-photos
   - audit-photos
   - risk-photos
   - equipment-photos
2. Make sure buckets are PRIVATE (not public).
3. Update attachments table schema:

```sql
ALTER TABLE attachments ADD COLUMN IF NOT EXISTS bucket text;
ALTER TABLE attachments ADD COLUMN IF NOT EXISTS file_path text;
CREATE INDEX IF NOT EXISTS idx_attachments_entity ON attachments(entity_type, entity_id);
```

## Local development
- Install dependencies:
  - pnpm install

- Dev server:
  - pnpm dev

- Netlify functions local testing (optional):
  - You can use `netlify dev` or run the functions indirectly via the server if your local environment proxies calls.

## Health checks
- Server /express (dev/prod): GET `/api/health` — checks Supabase + Redis (if configured).
- Netlify function: GET `/.netlify/functions/attachments` — returns a small health JSON when called with GET.

## Upload testing (two options)
- Curl helper (POSIX):

```bash
./scripts/test-upload.sh <FUNCTION_URL> <FILE_PATH> <ENTITY_TYPE> <ENTITY_ID>
# Example:
# ./scripts/test-upload.sh https://<site>/.netlify/functions/attachments ./tests/sample.jpg site 123
```

- Node helper:

```bash
node scripts/test-upload.mjs <FUNCTION_URL> <FILE_PATH> <ENTITY_TYPE> <ENTITY_ID>
```

Both helpers POST multipart/form-data to the Netlify function which will (1) store the file in Supabase private bucket, (2) insert the attachments row (bucket + file_path) and return the created record.

## Client usage
- PhotoUploader component uses the Netlify function endpoint `/.netlify/functions/attachments` to upload files.
- The UI fetches signed URLs from `GET /api/attachments/:id/url` (server route under `/api/attachments`) which uses the Supabase service role to generate signed URLs and caches them (Redis optional).

## CI (GitHub Actions)
A sample workflow is included `.github/workflows/ci.yml` which runs install, test and build. It can optionally run the health-check if you configure `HEALTH_URL` as a repository secret.

## Recommended production checklist
- Ensure Netlify env vars are set (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY, optional REDIS_URL)
- Verify buckets exist and are private
- Verify DB migrations applied
- Add monitoring (Sentry) and logging to functions if needed

## Security notes
- SERVICE_ROLE_KEY is powerful: keep it secret and rotate if leaked.
- Signed URLs are short-lived and cached server-side to reduce Supabase calls.

## Need help?
If you want, I can:
- Add a small README section with sample SQL migration file
- Create a GitHub Action job that runs the `scripts/test-upload` against a deployed function URL you provide as a repo secret

