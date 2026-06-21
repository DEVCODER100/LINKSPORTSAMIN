# LinkSports Admin Dashboard

A standalone admin panel for **linksports.in**. It talks to the existing backend
(`https://linksports-backend.vercel.app/api/v1`) and lets an admin view & manage all data:
members, athletes, coaches, organizations, predictions/votes, and approvals.

It is a separate app from the public site — deploy it as its own Vercel project
(e.g. `linksports-admin.vercel.app`).

## Local development
```bash
npm install
npm run dev        # http://localhost:3000
```
`NEXT_PUBLIC_API_URL` defaults to the production backend (see `.env.local`).

## Deploy to Vercel
1. Push this folder to a **new GitHub repo**.
2. In Vercel → **Add New Project** → import that repo.
3. Set the env var **`NEXT_PUBLIC_API_URL`** = `https://linksports-backend.vercel.app/api/v1`.
4. Deploy. CORS already allows any `*.vercel.app` origin, so it works immediately.

## Admin login
Sign in with an account whose role is `admin`. If you don't have one, in the **backend** folder
(`LinkSports-main/backend`) run:
```bash
npm run make-admin -- you@example.com YourPassword123   # creates/promotes an admin
```
(There is also a seeded `admin@linksports.in` / `admin123` if the DB seed was ever run.)

## Sections
- **Overview** — platform stats + send announcements
- **Members** — all users: search, filter, create, edit (role/verify), suspend, delete
- **Athletes / Coaches / Organizations** — full profiles (search + detail drawer)
- **Predictions** — every bracket submission: who picked what, champion distribution, win/lose filter
- **Approvals** — verify pending organizations and review pending listings
