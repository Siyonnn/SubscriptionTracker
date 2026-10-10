import { addCycles, todayString } from './billing.js'
import { formatDate } from './format.js'

export const MAX_PRICE = 1_000_000

// Older dates would start a subscription dozens of periods overdue.
export function earliestFirstDueDate(today = todayString()) {
  return addCycles(today, 'monthly', -3)
}

function isValidUrl(value) {
  try {
    const { protocol } = new URL(value)
    return protocol === 'http:' || protocol === 'https:'
  } catch {
    return false
  }
}

// Returns one message per invalid field. An empty object means the values are valid.
export function validateSubscription(values, minDate) {
  const errors = {}
  const price = Number(values.price)

  if (!values.subscriptionName.trim()) {
    errors.subscriptionName = 'Enter a name for the subscription.'
  }
  if (values.image.trim() && !isValidUrl(values.image.trim())) {
    errors.image = 'Enter a full link starting with http:// or https://, or leave this blank.'
  }
  if (values.price === '' || !Number.isFinite(price) || price <= 0) {
    errors.price = 'Enter a price greater than 0.'
  } else if (!/^\d+(\.\d{1,2})?$/.test(values.price.trim())) {
    // Also rejects forms like "1e3" that a number field accepts.
    errors.price = 'Use digits with at most 2 decimal places, such as 549.50.'
  } else if (price > MAX_PRICE) {
    errors.price = `Enter a price of ${MAX_PRICE.toLocaleString()} or less.`
  }
  if (!values.firstDueDate) {
    errors.firstDueDate = 'Choose a date.'
  } else if (values.firstDueDate < minDate) {
    errors.firstDueDate = `Choose ${formatDate(minDate)} or later.`
  }
  return errors
}
