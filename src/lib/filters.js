export const NO_FILTERS = { search: '', category: '', status: '', renewsBy: '' }

// Each row is { subscription, payment }, where payment comes from getPaymentStatus.
// An empty filter value means "don't filter on this".
export function filterSubscriptions(rows, filters) {
  const search = filters.search.trim().toLowerCase()

  return rows.filter(({ subscription, payment }) => {
    if (search && !subscription.subscriptionName.toLowerCase().includes(search)) return false
    if (filters.category && subscription.category !== filters.category) return false
    if (filters.status && payment.status !== filters.status) return false
    if (filters.renewsBy && payment.nextPaymentDate > filters.renewsBy) return false
    return true
  })
}
