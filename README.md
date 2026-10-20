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
- Push notification reminders 3 days before a payment, on the day it's due, and daily while it's overdue

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

## Payment reminders

A GitHub Actions workflow runs `scripts/send-reminders.js` every day at 9:00 AM Philippine time and sends reminders through Firebase Cloud Messaging. People turn reminders on for each browser with the **Turn on reminders** button on the dashboard.

To set it up:

1. In the Firebase console, open **Project settings → Cloud Messaging → Web configuration** and generate a Web Push key pair. Put the key in `.env` as `VITE_FIREBASE_VAPID_KEY`, then build and deploy again.
2. In **Project settings → Service accounts**, generate a new private key. This downloads a JSON file with full access to the project, so keep it private and never commit it.
3. In the GitHub repository, open **Settings → Secrets and variables → Actions** and add a secret named `FIREBASE_SERVICE_ACCOUNT` containing the whole JSON file. Then delete the downloaded file.
4. Test it from the **Actions** tab: choose **Send payment reminders → Run workflow**. "Check everything without sending" is ticked by default; untick it to send for real.

To change the time, edit the `cron` line in `.github/workflows/reminders.yml`. It's in UTC.

On iPhone and iPad, reminders only work after adding the site to the Home Screen (Share → Add to Home Screen), on iOS 16.4 or later. The button appears once the site is opened from there.
