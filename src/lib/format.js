// Turns a stored "YYYY-MM-DD" date into MM/DD/YYYY for display, on screen and in reminders.
// Built by hand so it looks the same in every browser and on the server that sends reminders.
export function formatDate(dateStr) {
  const [y, m, d] = dateStr.split('-')
  return `${m}/${d}/${y}`
}

export function formatPrice(price, currency) {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(price)
}
