# Jotform Enterprise Quote Generator

Internal quote generator for creating customer-ready Jotform Enterprise quote
PDFs.

## Local Development

```bash
pnpm install
pnpm run dev
```

Open `http://localhost:3000`.

## Deployment

1. Push this folder to a GitHub repository.
2. Connect the repository to your deployment provider.
3. Use these commands:

```bash
pnpm install
pnpm run build
```

After deployment, share the generated test URL with the employee who needs to
test it.

## App Password

Set this environment variable to turn on the built-in password screen:

- Name: `QUOTE_ACCESS_PASSWORD`
- Value: the password testers should enter

If `QUOTE_ACCESS_PASSWORD` is not set, the app stays open.

## Cloudflare/Sites Build

The original Cloudflare/Vinext setup is still available:

```bash
pnpm run dev:cloudflare
pnpm run build:cloudflare
pnpm run start:cloudflare
```
