import { useState } from 'react'
import { todayString } from '../lib/billing.js'
import { CATEGORIES } from '../lib/categories.js'
import { MAX_PRICE, earliestFirstDueDate, validateSubscription } from '../lib/validation.js'

const CURRENCIES = ['PHP', 'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'SGD']

const BILLING_CYCLES = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
]

function FieldError({ id, message }) {
  if (!message) return null
  return (
    <span id={id} className="field-error" role="alert">
      {message}
    </span>
  )
}

export default function SubscriptionForm({ subscription, onSave, onCancel }) {
  const [subscriptionName, setSubscriptionName] = useState(subscription?.subscriptionName ?? '')
  const [image, setImage] = useState(subscription?.image ?? '')
  const [price, setPrice] = useState(subscription?.price ?? '')
  const [currency, setCurrency] = useState(subscription?.currency ?? CURRENCIES[0])
  const [billingCycle, setBillingCycle] = useState(subscription?.billingCycle ?? 'monthly')
  const [category, setCategory] = useState(subscription?.category ?? CATEGORIES[0])
  const [firstDueDate, setFirstDueDate] = useState(subscription?.firstDueDate ?? todayString())
  const [errors, setErrors] = useState({})

  // Later due dates are counted from the first one, so the schedule is fixed once a payment exists.
  const hasPayments = Boolean(subscription?.lastPaidDate)

  // A subscription saved before the date limit existed keeps its own date as the limit.
  const earliest = earliestFirstDueDate()
  const minDate =
    subscription && subscription.firstDueDate < earliest ? subscription.firstDueDate : earliest

  function handleSubmit(event) {
    event.preventDefault()
    const values = { subscriptionName, image, price: String(price), firstDueDate }
    const found = validateSubscription(values, minDate)
    setErrors(found)
    // Errors come back in form order, so the first key is the first invalid field on screen.
    const firstInvalid = Object.keys(found)[0]
    if (firstInvalid) {
      event.currentTarget.elements[firstInvalid].focus()
      return
    }

    onSave({
      subscriptionName: subscriptionName.trim(),
      image: image.trim(),
      price: Number(price),
      currency,
      billingCycle,
      category,
      firstDueDate,
    })
  }

  // The form shows its own messages under each field, so the browser's popups are turned off.
  return (
    <form onSubmit={handleSubmit} className="sub-form" noValidate>
      <label>
        Name
        <input
          name="subscriptionName"
          value={subscriptionName}
          onChange={(e) => setSubscriptionName(e.target.value)}
          placeholder="e.g. Netflix"
          maxLength={60}
          aria-invalid={Boolean(errors.subscriptionName)}
          aria-describedby="error-name"
        />
        <FieldError id="error-name" message={errors.subscriptionName} />
      </label>

      <label>
        Image link (optional)
        <input
          type="url"
          name="image"
          value={image}
          onChange={(e) => setImage(e.target.value)}
          placeholder="e.g. https://example.com/logo.png"
          aria-invalid={Boolean(errors.image)}
          aria-describedby="error-image"
        />
        <FieldError id="error-image" message={errors.image} />
      </label>

      <div className="form-row">
        <label>
          Price
          <input
            type="number"
            name="price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            min="0.01"
            max={MAX_PRICE}
            step="0.01"
            aria-invalid={Boolean(errors.price)}
            aria-describedby="error-price"
          />
          <FieldError id="error-price" message={errors.price} />
        </label>

        <label>
          Currency
          <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
            {CURRENCIES.map((code) => (
              <option key={code}>{code}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="form-row">
        <label>
          Billing cycle
          <select
            value={billingCycle}
            onChange={(e) => setBillingCycle(e.target.value)}
            disabled={hasPayments}
          >
            {BILLING_CYCLES.map((cycle) => (
              <option key={cycle.value} value={cycle.value}>
                {cycle.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Category
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
        </label>
      </div>

      <label>
        First payment date
        <input
          type="date"
          name="firstDueDate"
          value={firstDueDate}
          onChange={(e) => setFirstDueDate(e.target.value)}
          min={minDate}
          disabled={hasPayments}
          aria-invalid={Boolean(errors.firstDueDate)}
          aria-describedby="error-date hint-date"
        />
        <FieldError id="error-date" message={errors.firstDueDate} />
        <span id="hint-date" className="field-hint">
          {hasPayments
            ? "This and the billing cycle can't be changed after a payment is recorded."
            : 'The first charge you want to track. Later dates are counted from it.'}
        </span>
      </label>

      <div className="form-actions">
        <button type="submit">
          {subscription ? 'Save changes' : 'Add subscription'}
        </button>
        <button type="button" className="secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}
