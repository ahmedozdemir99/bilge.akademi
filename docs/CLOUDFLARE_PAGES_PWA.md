# Cloudflare Pages — Bilge Akademi

## Build
- Project type: **Pages** (not Workers)
- Repository: `ahmedozdemir99/bilge.akademi`
- Branch (preview): `fix/main-cloudflare-prayer-safe` (merge after tests; production branch remains `main`)
- Framework preset: **Vite**
- Build command: `npm run build`
- Output directory: `dist`
- Root directory: repository root
- Node.js: **22**

## Environment
- Add **GEMINI_API_KEY** as an encrypted **Secret** under Pages → Settings → Variables and Secrets for Production and, if testing AI on branch preview, Preview. Never use a `VITE_` prefix.
- This branch uses `functions/api/[[path]].ts` for Gemini requests on Pages; **API_ORIGIN is not needed**.
- Do not put the API key in GitHub or browser code.

## Firebase Google sign-in
- Keep `firebase-applet-config.json` and `src/lib/firebase.ts` unchanged.
- Firebase Console → Authentication → Settings → Authorized domains: add the **exact hostname** of each production/preview URL used to sign in (without `https://` or path), and any custom domain.
- Verify Google sign-in, sign-out, Firestore read/write and AI endpoints after deploying. Firebase Auth redirects may need an appropriate authorized-domain/redirect setup depending on browser privacy restrictions.

## PWA
- `/icon.svg` premium app icon, `/manifest.webmanifest`, and `/sw.js` are published from `public/`.
- Service worker only provides offline navigation fallback. It does **not** cache Firebase, Gemini, or student records.
- SVG icons work in many browsers; for the broadest iOS/Android support, add 192px/512px PNG and an Apple touch icon in a follow-up.

## Release checklist
1. Confirm Cloudflare build success and verify `/manifest.webmanifest`, `/icon.svg`, `/api/health`.
2. Test Google login and Gemini with a real authorized account.
3. Check namaz photos on a narrow mobile viewport; qiyam/ruku currently use **temporary representative images** until accurate photos are supplied.
4. Merge the tested pull request into `main` and redeploy production.
