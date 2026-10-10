export function formatDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { dateStyle: 'medium' })
}

export function formatPrice(price, currency) {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(price)
}
