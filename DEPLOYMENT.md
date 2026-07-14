# Deployment Guide

This guide covers deploying BharatVision's backend (Express API) and
frontend (Vite/React SPA) separately, which is the simplest path for most
teams.

## 1. MongoDB

Use [MongoDB Atlas](https://www.mongodb.com/atlas) (recommended) or a
self-hosted instance.

1. Create a cluster and a database user.
2. Whitelist your backend host's IP (or `0.0.0.0/0` while testing).
3. Copy the connection string into `MONGO_URI`.

## 2. Cloudinary

1. Create a free Cloudinary account.
2. Copy `Cloud name`, `API Key`, `API Secret` from the dashboard into the
   backend `.env`.

## 3. Backend deployment (Render / Railway / Fly.io / EC2 / etc.)

```bash
cd server
npm install --production
npm run seed      # run once, against your production database
npm start
```

Required environment variables (see `server/.env.example`):

```
NODE_ENV=production
PORT=5000
CLIENT_URL=https://your-frontend-domain.com
MONGO_URI=...
JWT_SECRET=<long random string>
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
SEED_ADMIN_EMAIL=...
SEED_ADMIN_PASSWORD=<strong password, rotate after first login>
RATE_LIMIT_WINDOW_MINUTES=15
RATE_LIMIT_MAX=300
```

Notes:

- The API trusts `CLIENT_URL` for CORS — set it to your deployed frontend's
  exact origin.
- Behind a reverse proxy (Render, Railway, Nginx), `secure` cookies require
  HTTPS; the JWT cookie is set with `secure: true` automatically when
  `NODE_ENV=production`.
- Run `npm run seed` once against production Mongo to create the initial
  admin account, then change that password from the Settings/Admin login
  flow (or directly in the database) before sharing access.

## 4. Frontend deployment (Vercel / Netlify / static hosting)

```bash
cd client
npm install
npm run build   # outputs to client/dist
```

Set `VITE_API_URL` to your deployed backend's `/api` base, e.g.
`https://api.yourdomain.com/api`, **before** running the build (Vite inlines
env vars at build time).

Deploy the contents of `client/dist` to any static host. If using Vercel or
Netlify, point the build command to `npm run build` and the output directory
to `dist`.

## 5. Post-deploy checklist

- [ ] Change the seeded admin password.
- [ ] Confirm `CLIENT_URL` (backend) and `VITE_API_URL` (frontend) match your real domains.
- [ ] Verify image uploads land in Cloudinary correctly (upload a test image via Prompt → Image upload).
- [ ] Create a test evaluation session end-to-end: prompt → images → session → publish → participant evaluation → results/leaderboard.
- [ ] Set up HTTPS on both frontend and backend domains.
- [ ] Review `RATE_LIMIT_MAX` for your expected participant concurrency.
- [ ] Back up MongoDB on a regular schedule (Atlas provides this out of the box).

## 6. Scaling notes

- The blind-evaluation randomization (`Assignment` collection) is generated
  lazily per participant/prompt and cached, so re-visiting a prompt doesn't
  reshuffle images.
- Analytics/leaderboard aggregation currently computes on read
  (`analyticsService.js`). For very large response volumes, consider adding
  a scheduled job that materializes leaderboard snapshots into the
  `Settings`-style collection pattern already used in the codebase.
