# Subscription Tracker: Specification

A web app for tracking recurring subscriptions (Netflix, Spotify, Claude, etc.), their billing dates, and estimated spending. Built with React, Vite, Firebase Authentication, and Cloud Firestore.

## Subscription fields

| Field | Type | Notes |
|---|---|---|
| `image` | URL (optional) | Shows a default icon when blank |
| `subscriptionName` | string | Required |
| `price` | number | Required, greater than 0, at most 1,000,000. Also enforced by the Firestore rules |
| `currency` | string | ISO code, e.g. `PHP`, `USD` |
| `billingCycle` | `weekly` \| `monthly` \| `yearly` | Required |
| `category` | string | e.g. Streaming, Music, Software |
| `firstDueDate` | date | Entered by the user; anchor for all later dates. No earlier than 3 months before today |
| `lastPaidDate` | date \| null | Due date of the most recent paid period; null until first payment |

Computed, not stored: `nextPaymentDate`, status, overdue count, expense totals.

## Dates

- `nextPaymentDate`: if nothing has been paid, it equals `firstDueDate`. After a payment, it is one billing cycle after `lastPaidDate`.
- Always calculated from `firstDueDate`, never by stepping from the previous result, so month-end anchors (e.g. Jan 31) do not drift.
- Dates are calendar dates without a time. Comparisons use the user's local date.

## Payments and history

- Marking a payment pays the oldest unpaid period and advances by one billing cycle.
- A subscription three cycles behind needs three payments. The card shows "3 periods overdue" until caught up.
- When more than one period is overdue, "Mark paid" asks whether to pay all of them at once or only the oldest. Either way, each period gets its own history entry.
- Each history entry (subcollection under the subscription): `dueDate` (period paid), `paidOn` (day paid), `amount`.

## Status

Evaluated in this order:

1. **Paid:** there is a payment and `nextPaymentDate` is after today. The period you're in is covered.
2. **Overdue:** `nextPaymentDate` is before today. Show the number of periods behind.
3. **Due soon:** `nextPaymentDate` is today or within the next 7 days.
4. **Upcoming:** anything later.

## Expense totals

- Only active subscriptions count. Paid status does not affect totals.
- Monthly equivalent: monthly = price, yearly = price / 12, weekly = price * 52 / 12.
- Yearly = monthly total * 12.
- Grouped by currency. No conversion. Labeled "estimated."

## Deleting

- Asks for confirmation in a dialog. Permanent. Undoing a payment asks the same way.
- Deletes the subscription and all its history entries in one batch.

## Auth and security

- Firebase Authentication with email and password: register, log in, log out, and a password reset email.
- Three wrong passwords in a row pause log in for 30 seconds. The count is kept in the browser, so it slows guessing on that device but is not a server-side limit.
- The Firestore rules also check each subscription's name, price, currency, billing cycle, and dates.
- Firestore rules: a user can read and write only their own data (`users/{uid}/subscriptions/...`).

## Out of scope for v1

Email or push reminders, image uploads, currency conversion, CSV export, charts.

## Build order

1. Project setup (Vite + React, Firebase config). Verify: app runs and connects to Firebase.
2. Auth (register, log in, log out, protected routes). Verify: logged-out users cannot reach the dashboard.
3. Security rules. Verify: a second test account cannot read the first account's data.
4. Subscription CRUD with delete confirmation. Verify: data persists after refresh.
5. Date, status, and overdue logic as pure functions with unit tests. Verify: tests pass for month-end dates, late payments, and the 7-day window.
6. Mark as paid and history. Verify: history matches period and amount; next date advances.
7. Totals, search, filters (name, category, status, renewal date). Verify: totals match hand calculations.
8. Polish: empty states, error messages, phone-width layout.
