import { expenseTotals } from '../lib/billing.js'
import { formatPrice } from '../lib/format.js'

export default function ExpenseSummary({ subscriptions }) {
  const totals = Object.entries(expenseTotals(subscriptions)).sort(([a], [b]) =>
    a.localeCompare(b),
  )
  if (totals.length === 0) return null

  return (
    <section className="totals">
      <div className="totals-currencies">
        {totals.map(([currency, { monthly, yearly }]) => (
          <div key={currency}>
            <p className="total-month">
              <span className="total-amount">{formatPrice(monthly, currency)}</span> a month
            </p>
            <p className="muted">About {formatPrice(yearly, currency)} a year</p>
          </div>
        ))}
      </div>
      <p className="muted totals-note">
        {subscriptions.length === 1
          ? 'Estimated from your 1 subscription.'
          : `Estimated from all ${subscriptions.length} subscriptions, not just the filtered ones.`}
      </p>
    </section>
  )
}
