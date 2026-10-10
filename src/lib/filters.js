import { getPaymentStatus, todayString } from './billing.js'

export const NO_FILTERS = { search: '', category: '', status: '', renewsBy: '' }

// An empty filter value means "don't filter on this".
export function filterSubscriptions(subscriptions, filters, today = todayString()) {
  const search = filters.search.trim().toLowerCase()

  return subscriptions.filter((subscription) => {
    const { status, nextPaymentDate } = getPaymentStatus(subscription, today)

    if (search && !subscription.subscriptionName.toLowerCase().includes(search)) return false
    if (filters.category && subscription.category !== filters.category) return false
    if (filters.status && status !== filters.status) return false
    if (filters.renewsBy && nextPaymentDate > filters.renewsBy) return false
    return true
  })
}
