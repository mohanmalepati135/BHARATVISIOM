# BharatVision

**Internal AI Evaluation Platform — Josh Talks AI**

BharatVision is a research tool used to evaluate how well AI image generation
models understand and represent Indian culture. Administrators upload
AI-generated images for curated cultural prompts (festivals, states,
traditions); participants then perform **blind, randomized A/B/C
comparisons**, scoring each image across six dimensions without ever knowing
which model produced it. Results feed an analytics dashboard and leaderboard.

> This is **not** an image generation tool. Only admins upload images, which
> must already be AI-generated elsewhere. The platform's job is evaluation,
> not generation.

---

## Tech stack

**Frontend** — React 19, Vite, TypeScript, Tailwind CSS v4, React Router,
TanStack Query, React Hook Form, Framer Motion, Lucide Icons, Recharts

**Backend** — Node.js, Express, MongoDB + Mongoose, JWT auth, Multer +
Cloudinary, Zod validation, Helmet, rate limiting, Morgan

---

## Project structure

```
bharatvision/
├── server/                     # Express API
│   └── src/
│       ├── config/             # DB + Cloudinary config
│       ├── constants/          # Roles, statuses, model sources
│       ├── controllers/        # Route handlers
│       ├── middlewares/        # auth, validation, upload, error handling
│       ├── models/             # Mongoose schemas
│       ├── repositories/       # Data-access helpers
│       ├── routes/             # Express routers
│       ├── services/           # Business logic (auth, evaluation, analytics)
│       ├── seed/               # Seed script + sample cultural prompts
│       ├── utils/               # Token, CSV, shuffle, ApiError helpers
│       ├── validators/         # Zod schemas
│       ├── app.js
│       └── server.js
└── client/                     # React app
    └── src/
        ├── components/
        │   ├── ui/              # Button, Card, Input, Modal, Slider, etc.
        │   └── shared/          # PageHeader, forms, route guards
        ├── context/             # Auth, Theme, Toast providers
        ├── layouts/             # AdminLayout (sidebar), ParticipantLayout
        ├── pages/
        │   ├── admin/           # Dashboard, Sessions, Prompts, Results, ...
        │   ├── participant/     # Consent, Evaluation, Home
        │   └── auth/            # Login / register / forgot password
        ├── lib/                 # axios client, cn() utility
        └── types/               # Shared TypeScript types
```

---

## Getting started

### 1. Prerequisites

- Node.js 18+
- A MongoDB instance (local or [Atlas](https://www.mongodb.com/atlas))
- A [Cloudinary](https://cloudinary.com) account (free tier is enough) for image storage

### 2. Backend setup

```bash
cd server
cp .env.example .env    # fill in MONGO_URI, JWT_SECRET, CLOUDINARY_* keys
npm install
npm run seed             # creates an admin account + 6 sample cultural prompts
npm run dev               # starts the API on http://localhost:5000
```

The seed script prints the admin and demo participant credentials it creates.
By default:

- Admin: `admin@joshtalks.ai` / `ChangeMe123!` (override via `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`)
- Demo participant: `participant.demo@joshtalks.ai` / `Participant123!`

**Change the admin password immediately in a real deployment.**

### 3. Frontend setup

```bash
cd client
cp .env.example .env    # VITE_API_URL, defaults to http://localhost:5000/api
npm install
npm run dev               # starts on http://localhost:5173
```

### 4. Using the platform

1. Log in as admin at `/admin/login`.
2. Go to **Prompt management** → create a prompt (festival, state, category, full prompt text).
3. Open the prompt → **Image upload** → upload exactly 3 images (OpenAI GPT Image 1, Gemini 2.5 Flash Image, Gemini 3.1 Flash Image Preview).
4. Go to **Evaluation sessions** → create a session → attach prompts → assign participants.
5. Click **Publish** — this locks the attached prompts/images so the evaluation set can't change mid-cycle.
6. Participants log in at `/login` (or register at `/register`), complete the consent form, and start evaluating.
7. Watch responses roll in under **Evaluation results**, **Analytics**, and **Leaderboard**. Export the leaderboard as CSV from the Leaderboard page.

---

## How blind evaluation works

- Every prompt has exactly 3 images, one per model (`Image` collection).
- The first time a participant opens a prompt, the backend creates an
  `Assignment` document with a **randomized** mapping of `imageA / imageB /
  imageC` → real image documents (Fisher–Yates shuffle, see
  `server/src/utils/shuffle.js`).
- The participant-facing API (`GET /api/evaluation/sessions/:id/current`)
  only ever returns slot letters and URLs — company and model name are never
  sent to the client.
- Once a session is **published**, its prompts and images are flagged
  `isLocked` and can't be edited or deleted until the session is closed.
- Admin-only endpoints (`GET /api/results/sessions/:id`) join the hidden
  `Assignment` mapping back to real model identity for reporting.

---

## Environment variables

See `server/.env.example` and `client/.env.example` for the full list.
Key ones:

| Variable | Where | Purpose |
|---|---|---|
| `MONGO_URI` | server | MongoDB connection string |
| `JWT_SECRET` | server | Secret used to sign auth tokens — use a long random value |
| `CLOUDINARY_CLOUD_NAME` / `_API_KEY` / `_API_SECRET` | server | Image storage |
| `CLIENT_URL` | server | Allowed CORS origin |
| `VITE_API_URL` | client | Base URL the frontend calls |

---

## Security notes

- Passwords hashed with bcrypt (12 rounds).
- JWT auth via `Authorization: Bearer` header or httpOnly cookie.
- Helmet, `express-rate-limit`, and `express-mongo-sanitize` are applied globally.
- All admin-only routes are protected by role-based middleware (`authorize('admin')`).
- Zod validates every request body before it reaches a controller.
- Upload middleware restricts file type (PNG/JPEG/WEBP) and size (10MB).

See `DEPLOYMENT.md` for production hardening notes.
