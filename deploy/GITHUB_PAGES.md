# GitHub Pages + Cloudflare Worker / KV

Boss summary and staff daily input share one static site; business data lives in Cloudflare KV (same pattern as cafestorybook-tickets).

```text
https://<user>.github.io/inventory-management-project/        → Boss UI
https://<user>.github.io/inventory-management-project/staff   → Staff UI
https://inventory-api.<account>.workers.dev                   → Worker API → KV
```

## 1. Cloudflare (once)

```bash
cd worker
npm install
npx wrangler login
npx wrangler kv namespace create STORE
```

Paste the namespace id into `worker/wrangler.toml` (`id` and `preview_id`).

```bash
npx wrangler deploy
```

Save the Worker URL, e.g. `https://inventory-api.xxx.workers.dev`.

## 2. GitHub repo settings

1. **Settings → Pages** → Source: **GitHub Actions**
2. **Settings → Secrets and variables → Actions**
   - Secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`
   - Variables: `VITE_API_URL` = Worker URL (no trailing `/`)

Push `main` to build Pages and deploy the Worker.

## 3. Local development

Root `.env.local`:

```env
VITE_API_URL=http://127.0.0.1:8787
```

```bash
npm install
npm install --prefix worker
# terminal 1
npm run dev:worker
# terminal 2
npm run dev
```

- Boss: http://localhost:3000/ (PIN `2468`)
- Staff: http://localhost:3000/staff (PIN `1234`)
- API: http://127.0.0.1:8787

## 4. Default PINs

| Role  | Default |
|-------|---------|
| Boss  | `2468`  |
| Staff | `1234`  |

Change them in Settings → Cloud sync after first login.
