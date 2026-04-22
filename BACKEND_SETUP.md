# Firebase + Railway Setup

## 1) Firebase

1. Create a Firebase project.
2. Enable **Authentication** with Email/Password.
3. In Project Settings -> General -> Your apps, create a Web app and copy config values.
4. Create `.env` in `mobile/` from `.env.example` and fill Firebase keys.

## 2) Backend (local)

1. Go to `mobile/backend`.
2. Copy `.env.example` to `.env`.
3. Create a Firebase service account key JSON from Firebase Console -> Project settings -> Service accounts.
4. Put full JSON in `FIREBASE_SERVICE_ACCOUNT_JSON` (single line).
5. Run:

```bash
npm install
npm run start
```

API test: `GET http://localhost:4000/health`

## 3) Railway deployment

1. Push this project to GitHub.
2. On Railway create a new project from GitHub repo.
3. Set Root Directory to `backend`.
4. Add environment variable:
   - `FIREBASE_SERVICE_ACCOUNT_JSON` = full service account JSON string
5. Deploy and copy generated URL.

## 4) Connect mobile app to Railway API

In `mobile/.env` set:

```
EXPO_PUBLIC_API_BASE_URL=https://your-railway-domain.up.railway.app
```

Then restart Expo (`npx expo start -c`).
