# Subscription Tracker

A web app for tracking recurring subscriptions such as Netflix, Spotify, and Claude. It shows when each one is next due, which are overdue, and what they cost you per month and per year.

Built with React, Vite, Firebase Authentication, and Cloud Firestore. The full behavior is described in [SPEC.md](SPEC.md).

## Features

- Sign up, log in, and log out with email and password, with a password reset email
- Add, edit, and delete subscriptions
- Mark a billing period as paid, with a payment history and undo
- A status for each subscription: paid, due soon, overdue, or upcoming
- Estimated monthly and yearly totals, grouped by currency
- Search by name, and filter by category, status, or renewal date

## Requirements

- Node.js 20.19 or later, or 22.12 or later
- A Firebase project with **Authentication** (Email/Password provider) and **Cloud Firestore** enabled

## Setup

1. Install the dependencies:

   ```
   npm install
   ```

2. Copy `.env.example` to `.env`:

   ```
   cp .env.example .env
   ```

3. Fill in `.env` with the values from the Firebase console, under **Project settings → General → Your apps → SDK setup and configuration → Config**. Use no quotes and no spaces around the `=`.

4. Start the app:

   ```
   npm run dev
   ```

   Open the address it prints, usually `http://localhost:5173`.

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Starts the app locally and reloads on changes |
| `npm test` | Runs the unit tests |
| `npm run build` | Builds the app into `dist/` |
| `npm run preview` | Serves the built app locally |

## Deploying

The app is hosted on Firebase Hosting. The project ID is set in `.firebaserc`.

1. Log in to Firebase. You only need to do this once per computer:

   ```
   npx firebase-tools login
   ```

2. Build the app. The values in `.env` are built into the files, so build on a computer that has the right `.env`:

   ```
   npm run build
   ```

3. Deploy the site and the Firestore rules:

   ```
   npx firebase-tools deploy
   ```

   The command prints the live address when it finishes.

To deploy only one part, add `--only hosting` or `--only firestore:rules`.

## Project layout

| Path | Contents |
|---|---|
| `src/components/` | The screens and their parts |
| `src/lib/` | Date and status rules, filters, validation, and the Firestore calls, with their tests |
| `src/firebase.js` | Firebase setup, read from `.env` |
| `firestore.rules` | Who can read and write what in the database |
| `firebase.json` | Hosting and rules deployment settings |

## Security notes

- Each user can read and write only their own subscriptions. This is enforced by `firestore.rules`, not by the app.
- The Firebase values in `.env` identify the project and are not passwords. `.env` is still kept out of git.
- Anyone who can open the site can create an account. To stop that, turn off sign-up in the Firebase console under **Authentication → Settings → User actions**.
- The pause after three wrong passwords runs in the browser. It slows down guessing on one device and is not a server-side limit.
