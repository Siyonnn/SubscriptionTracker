// All dates are "YYYY-MM-DD" strings. String comparison is safe for this format.

const DAY_MS = 24 * 60 * 60 * 1000
const UPCOMING_WINDOW_DAYS = 7

const MONTHLY_FACTOR = {
  weekly: 52 / 12,
  monthly: 1,
  yearly: 1 / 12,
}

function parseDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function toDateString(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function todayString(now = new Date()) {
  return toDateString(now)
}

function daysBetween(fromStr, toStr) {
  return Math.round((parseDate(toStr) - parseDate(fromStr)) / DAY_MS)
}

// Adds months to the anchor and clamps to the month's last day,
// e.g. Jan 31 + 1 month = Feb 28. Always computed from the anchor, so it does not drift.
function addMonthsClamped(dateStr, months) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const target = new Date(y, m - 1 + months, 1)
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate()
  return toDateString(new Date(target.getFullYear(), target.getMonth(), Math.min(d, lastDay)))
}

// The due date of the period n cycles after firstDueDate.
export function addCycles(firstDueDate, billingCycle, n) {
  if (billingCycle === 'weekly') {
    const date = parseDate(firstDueDate)
    date.setDate(date.getDate() + 7 * n)
    return toDateString(date)
  }
  if (billingCycle === 'monthly') return addMonthsClamped(firstDueDate, n)
  if (billingCycle === 'yearly') return addMonthsClamped(firstDueDate, 12 * n)
  throw new Error(`Unknown billing cycle: ${billingCycle}`)
}

// How many cycles lie between firstDueDate and a later due date.
function cyclesBetween(firstDueDate, laterDueDate, billingCycle) {
  if (billingCycle === 'weekly') {
    return Math.round(daysBetween(firstDueDate, laterDueDate) / 7)
  }
  const [fy, fm] = firstDueDate.split('-').map(Number)
  const [ly, lm] = laterDueDate.split('-').map(Number)
  const months = (ly - fy) * 12 + (lm - fm)
  return billingCycle === 'yearly' ? months / 12 : months
}

// The next unpaid due date. Before any payment it is the first due date.
// After a payment it is one cycle after the last paid due date.
export function nextPaymentDate({ firstDueDate, billingCycle, lastPaidDate }) {
  if (!lastPaidDate) return firstDueDate
  const paidCycles = cyclesBetween(firstDueDate, lastPaidDate, billingCycle)
  return addCycles(firstDueDate, billingCycle, paidCycles + 1)
}

// What lastPaidDate was before the most recent payment. Null if that was the only payment.
export function previousPaidDate({ firstDueDate, billingCycle, lastPaidDate }) {
  const paidCycles = cyclesBetween(firstDueDate, lastPaidDate, billingCycle)
  return paidCycles === 0 ? null : addCycles(firstDueDate, billingCycle, paidCycles - 1)
}

// Number of unpaid periods whose due date has already passed. A period due today is not overdue yet.
function countOverduePeriods(subscription, today) {
  const { firstDueDate, billingCycle, lastPaidDate } = subscription
  const firstUnpaidIndex = lastPaidDate
    ? cyclesBetween(firstDueDate, lastPaidDate, billingCycle) + 1
    : 0
  let count = 0
  while (addCycles(firstDueDate, billingCycle, firstUnpaidIndex + count) < today) {
    count += 1
  }
  return count
}

// Everything the screens need to know about where a subscription stands today.
// Status priority: paid, overdue, due soon, upcoming.
export function getPaymentStatus(subscription, today = todayString()) {
  const next = nextPaymentDate(subscription)
  const daysUntilDue = daysBetween(today, next)

  let status = 'upcoming'
  if (subscription.lastPaidDate && today < next) status = 'paid'
  else if (next < today) status = 'overdue'
  else if (daysUntilDue <= UPCOMING_WINDOW_DAYS) status = 'dueSoon'

  return {
    status,
    nextPaymentDate: next,
    daysUntilDue,
    overduePeriods: status === 'overdue' ? countOverduePeriods(subscription, today) : 0,
  }
}

// Totals per currency. Yearly is monthly * 12. Amounts are not converted between currencies.
export function expenseTotals(subscriptions) {
  const totals = {}
  for (const sub of subscriptions) {
    const monthly = sub.price * MONTHLY_FACTOR[sub.billingCycle]
    const current = totals[sub.currency] ?? { monthly: 0, yearly: 0 }
    totals[sub.currency] = {
      monthly: current.monthly + monthly,
      yearly: current.yearly + monthly * 12,
    }
  }
  return totals
}
