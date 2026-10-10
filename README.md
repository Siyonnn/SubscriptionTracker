# Subscription Tracker

A web app for tracking recurring subscriptions such as Netflix, Spotify, and Claude. It shows when each one is next due, which are overdue, and what they cost you per month and per year.

**Live site:** https://subscription-tracker-6f6ec.web.app

Built with React, Vite, Firebase Authentication, and Cloud Firestore.

## Features

- Sign up, log in, and log out with email and password
- Add, edit, and delete subscriptions
- Mark a billing period as paid, with a payment history and undo
- A status for each subscription: paid, due soon, overdue, or upcoming
- Estimated monthly and yearly totals, grouped by currency
- Search by name, and filter by category, status, or renewal date

## Running it locally

You need Node.js 20.19 or later and a Firebase project with Email/Password sign-in and Cloud Firestore turned on.

1. Install the dependencies:

   ```
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in the values from the Firebase console, under **Project settings → General → Your apps → Config**.

3. Start the app:

   ```
   npm run dev
   ```

Run the tests with `npm test`.

## Deploying

```
npx firebase-tools login
npm run build
npx firebase-tools deploy
```

The login step is only needed once per computer. The deploy publishes both the site and the Firestore rules.
