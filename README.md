# Jotform Enterprise Quote Generator

Internal quote generator for creating customer-ready Jotform Enterprise quote
PDFs.

## Local Development

```bash
pnpm install
pnpm run dev
```

Open `http://localhost:3000`.

## Vercel Testing Deployment

1. Push this folder to a GitHub repository.
2. In Vercel, choose **Add New > Project**.
3. Import the GitHub repository.
4. Keep the framework preset as **Next.js**.
5. Deploy.

Vercel will use the settings in `vercel.json`:

- Install command: `pnpm install`
- Build command: `pnpm run build`
- Development command: `pnpm run dev`

After deployment, share the generated Vercel preview URL with the employee who
needs to test it.

## App Password

Set this Vercel Environment Variable to turn on the built-in password screen:

- Name: `QUOTE_ACCESS_PASSWORD`
- Value: the password testers should enter
- Environment: Production

After adding or changing the variable, create a new deployment from Vercel or
push a new commit to GitHub. If `QUOTE_ACCESS_PASSWORD` is not set, the app stays
open.

## Cloudflare/Sites Build

The original Cloudflare/Vinext setup is still available:

```bash
pnpm run dev:cloudflare
pnpm run build:cloudflare
pnpm run start:cloudflare
```
