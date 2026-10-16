# CNSP Prep Portal

A study portal for the **Certified Network Security Practitioner (CNSP)** exam, featuring practice questions, mock exams, flashcards, and topic-based reviews to help you prepare.

## Features

- **Practice Questions & Quizzes** — drill on randomized question sets
- **Mock Exams** — simulated exam runs with scoring and pass-rate tracking
- **Flashcards** — quick-fire review mode
- **Topic Reviews** — focused revision by subject (e.g. network security, cryptography, threats)
- **Progress Tracking** — monitor your performance over time
- **Google OAuth Login** — sign in securely to persist your progress

The application itself is password-protected with [Staticrypt](https://github.com/robinmoisson/staticrypt) so the static content is encrypted at rest and only unlocked with the site password.

## Tech Stack

- **Frontend:** Vite + React (bundled static assets in `assets/`)
- **Encryption:** Staticrypt-encrypted `index.html`
- **Backend:** Node.js + Express
- **Auth:** Google OAuth 2.0 (`google-auth-library` + JWT session cookies, `cookie-parser`)

## Getting Started

### Prerequisites

- Node.js (recent LTS)
- A Google Cloud OAuth app with credentials

### Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Set the required environment variables (or via your hosting platform):

   ```bash
   export GOOGLE_CLIENT_ID="<your-client-id>"
   export GOOGLE_CLIENT_SECRET="<your-client-secret>"
   export SESSION_SECRET="<a-random-secret>"
   # Optional: base URL used for OAuth redirect, e.g. https://your-app.example.com
   export APP_URL="https://your-app.example.com"
   ```

3. Build the frontend:

   ```bash
   npm run build
   ```

4. Start the server:

   ```bash
   npm start
   ```

   The app will be served at `http://localhost:3000`.

> **Note:** The OAuth callback, session cookie, and auth endpoints live in `server.cjs`. In development the Vite dev middleware is used automatically when `NODE_ENV` is not `production`; in production the built `dist/` folder is served.

## Scripts

| Command        | Description                                      |
| -------------- | ------------------------------------------------ |
| `npm run dev`  | Start the development server with Vite middleware |
| `npm run build`| Build the production static bundle               |
| `npm start`    | Start the production server                      |

## Project Structure

```
.
├── index.html          # Staticrypt-encrypted entry page
├── assets/             # Built JS/CSS bundles
│   ├── index-*.js
│   └── index-*.css
├── server.cjs          # Express server + Google OAuth auth
└── README.md
```

## Environment Variables

| Variable             | Required | Description                              |
| -------------------- | -------- | ---------------------------------------- |
| `GOOGLE_CLIENT_ID`   | Yes      | Google OAuth client ID                   |
| `GOOGLE_CLIENT_SECRET`| Yes     | Google OAuth client secret               |
| `SESSION_SECRET`     | No*      | JWT signing secret (dev default provided)|
| `APP_URL`            | No       | Base URL for the OAuth redirect URI      |
| `NODE_ENV`           | No       | `production` serves the built bundle      |

\* Always set a strong `SESSION_SECRET` in production.

## License

Copyright © 2026. All rights reserved.
