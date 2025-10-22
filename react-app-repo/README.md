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

## Dev su rete locale (frontend + backend)

- Backend .NET (appsettings.json):
  - `Cors.Mode`: metti `Static` per consentire un front-end su un altro host della LAN.
  - `CorsPolicies.DevFront.AllowedOrigins`: aggiungi l'IP della macchina front-end, es. `http://192.168.1.50:3000`.
  - In alternativa lascia `Dynamic` se front-end gira sulla stessa macchina del backend.

- Frontend Next.js:
  - Avvio in LAN: `npm run dev -- -H 0.0.0.0 -p 3000`
  - Imposta "Server API" in login all'URL del backend, es. `http://192.168.1.10:5051`.

- Firewall Windows (facoltativo):
  - Esegui `scripts/open-firewall-dev.ps1` per aprire le porte 3000/5051/5071 sul profilo `Private`.
  - Personalizza con `-Ports` e `-Profile` se necessario.

## Build e Publish per IIS

- Batch di build: `scripts\build_and_publish.bat`
  - Uso: `scripts\build_and_publish.bat [frontend_env] [publish_dir]`
    - `frontend_env`: `production` (default) oppure `intranet` (usa `npm run build-intranet`).
    - `publish_dir`: cartella di output, default `./artifacts/publish`.
  - Cosa fa:
    - Installa dipendenze e builda il frontend Next.js (con postexport negli asset statici in `wwwroot`).
    - Esegue `dotnet publish -c Release -o [publish_dir]` e, se manca, genera un `web.config` minimale per IIS.
  - Requisiti macchina di build: `dotnet`, `node`, `npm` disponibili nel PATH.
  - Nota env: gli script npm usano dotenv. Sono inclusi file di esempio:
    - `react-app-repo/.env.production`
    - `react-app-repo/.env.intranet`
    Modifica `NEXT_PUBLIC_API_URL` secondo il tuo ambiente oppure imposta l’host via UI (campo Server API) a runtime.

- Deploy IIS:
  - Installa l'"ASP.NET Core Hosting Bundle" sulla macchina IIS.
  - Crea un sito/app che punti alla cartella `publish_dir` prodotta dallo script.
  - Verifica che l'App Pool abbia diritti di lettura sulla cartella.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
