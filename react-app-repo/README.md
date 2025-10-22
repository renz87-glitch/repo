This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Toolsets via Headbar Tabs

- The headbar shows selectable tabs for available toolsets.
- Current toolsets: `Login`, `Network Test`.
- URL query `?tool=login` (or `?tool=network`) selects the active tab directly.
- To add a new toolset, edit `react-app-repo/app/components/toolsets.tsx` and append `{ id, label, element }`.

Auth context is provided globally from `app/layout.tsx` using `AuthProvider`.

## Configurare il server di destinazione

- Dalla UI: nella tab `Login`, compila il campo "Server API" (es. `https://mio-server.example.com`). Il valore viene salvato nel browser e usato sia per il login che per il Network Test.
- Da variabile d'ambiente: imposta `NEXT_PUBLIC_API_URL` (es. in `react-app-repo/.env.local`) per definire il valore iniziale.

Esempio `.env.local`:

```
NEXT_PUBLIC_API_URL=https://mio-server.example.com
```

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
