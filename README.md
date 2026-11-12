# GrewTube

Paste a YouTube link and GrewTube pulls the video's stats and its top 100 comments, then:

- scores the description and each comment as positive or negative (TensorFlow.js sentiment model)
- counts votes left in comments as `A1`, `B2` or `C*3` and picks the winner
- saves analysed videos to your account and charts winning votes on the dashboard

Built with Next.js 14 (App Router), MongoDB/Mongoose, NextAuth, Tailwind and Stripe.

## Run it locally

You need **Node.js 18.18+** (20 LTS recommended) and **Docker** (for MongoDB).

```bash
npm install
cp .env.example .env        # then fill in the values, see below
docker compose up -d        # starts MongoDB on localhost:27017
npm run dev                 # http://localhost:3000
```

To stop MongoDB: `docker compose down` (your data is kept in a Docker volume).

### Environment variables

| Variable | Needed for | Where to get it |
|---|---|---|
| `MONGO_URL` | Everything | Leave the default if you use Docker |
| `NEXTAUTH_URL` | Login | `http://localhost:3000` locally |
| `NEXTAUTH_SECRET` | Login | `openssl rand -base64 32` |
| `YOUTUBE_API_KEY` | Analysing videos | Google Cloud Console, enable YouTube Data API v3, create an API key |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | The `/admin` page (optional) | Pick any values |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | "Sign up with Google" (optional) | Google Cloud Console OAuth client, redirect URI `http://localhost:3000/api/auth/callback/google` |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Upgrade page checkout (optional) | Stripe dashboard in test mode |

The minimum to use the app is MongoDB, the two NextAuth values and a YouTube key. Optional features switch themselves off when their keys are missing.

## Using it

1. Go to `/signup` and create an account, then log in at `/login`.
2. On the dashboard, paste a YouTube URL and analyse it.
3. To see the admin page, log in with `ADMIN_EMAIL` / `ADMIN_PASSWORD`, then open `/admin`.

## Project layout

```
app/
  page.tsx, login/, signup/, dashboard/, admin/, upgrade/   pages
  components/                                              charts
  api/analyze/            YouTube fetch, sentiment, vote counting
  api/auth/               NextAuth config (email/password, optional Google, env admin)
  api/users/              signup, profile, saved URLs, votes, password, delete account
  api/admin/              list and delete users (admin only)
  api/checkout, webhook/  Stripe
dbConfig/                 MongoDB connection
models/userModel.tsx      the only Mongoose model (users and their saved links)
```

## Known limitations

- **Stripe upgrades don't do anything yet.** Checkout works, but the webhook only logs events; nothing marks a user as Pro.
- **Sentiment has two labels only.** The model was trained on IMDB movie reviews and has no "neutral", so short comments like a bare `A1` vote tend to count as negative.
- **Only the first 100 comments** are analysed (one YouTube API page).
- **Facebook and Apple buttons** on the signup page are placeholders.
- **Next.js 14:** `npm audit` still flags issues that are only fully fixed in Next 15/16. None affect local development, but upgrade before deploying publicly.
