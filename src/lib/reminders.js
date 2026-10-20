// Decides which payment reminders a device should get today. Used by the daily job in
// scripts/send-reminders.js, so it follows the same date rules as the dashboard.
import { getPaymentStatus } from './billing.js'
import { formatDate, formatPrice } from './format.js'

export const REMIND_DAYS_BEFORE = 3

// Today's date as "YYYY-MM-DD" in the given time zone, such as "Asia/Manila".
// This is the app's internal date format, used to compare against due dates, so it must
// stay YYYY-MM-DD. How dates look to people is set by formatDate in format.js.
export function dateInTimeZone(now, timeZone) {
  // The Canadian English format happens to be YYYY-MM-DD.
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now)
}

// One reminder per subscription that is due in 3 days, due today, or overdue.
export function remindersFor(subscriptions, today) {
  const reminders = []
  for (const subscription of subscriptions) {
    const { status, nextPaymentDate, daysUntilDue, overduePeriods } = getPaymentStatus(
      subscription,
      today,
    )
    const price = formatPrice(subscription.price, subscription.currency)

    let body = null
    if (status === 'overdue') {
      body =
        overduePeriods > 1
          ? `${overduePeriods} payments overdue, since ${formatDate(nextPaymentDate)}`
          : `${price} overdue since ${formatDate(nextPaymentDate)}`
    } else if (daysUntilDue === 0) {
      body = `${price} due today`
    } else if (daysUntilDue === REMIND_DAYS_BEFORE) {
      body = `${price} due in ${REMIND_DAYS_BEFORE} days, on ${formatDate(nextPaymentDate)}`
    }

    if (body) {
      // The tag makes a repeat reminder on the same day replace the earlier one.
      reminders.push({ title: subscription.subscriptionName, body, tag: `${subscription.id}:${today}` })
    }
  }
  return reminders
}
