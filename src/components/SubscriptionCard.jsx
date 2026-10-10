import { useState } from 'react'
import { daysBetween, getPaymentStatus, todayString } from '../lib/billing.js'
import { formatDate, formatPrice } from '../lib/format.js'
import Modal from './Modal.jsx'
import PaymentHistory from './PaymentHistory.jsx'

const CYCLE_LABELS = {
  weekly: 'week',
  monthly: 'month',
  yearly: 'year',
}

function DueLine({ subscription }) {
  const { status, nextPaymentDate, overduePeriods } = getPaymentStatus(subscription)
  const date = formatDate(nextPaymentDate)

  if (status === 'paid') {
    return (
      <p className="due">
        <span className="due-paid">Paid</span> <span className="muted">Next {date}</span>
      </p>
    )
  }
  if (status === 'overdue') {
    return (
      <p className="due">
        <span className="due-overdue">
          Overdue{overduePeriods > 1 && `, ${overduePeriods} periods`}
        </span>{' '}
        <span className="muted">since {date}</span>
      </p>
    )
  }
  if (status === 'dueSoon') {
    const days = daysBetween(todayString(), nextPaymentDate)
    const label = days === 0 ? 'Due today' : days === 1 ? 'Due tomorrow' : `Due in ${days} days`
    return (
      <p className="due">
        <mark className="due-soon">{label}</mark> <span className="muted">{date}</span>
      </p>
    )
  }
  return <p className="due">Due {date}</p>
}

export default function SubscriptionCard({
  uid,
  subscription,
  onMarkPaid,
  onUndoPayment,
  onEdit,
  onDelete,
}) {
  const [imageFailed, setImageFailed] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const { status } = getPaymentStatus(subscription)
  const name = subscription.subscriptionName
  const showImage = subscription.image && !imageFailed

  return (
    <article className="card">
      <div className="card-heading">
        {showImage ? (
          <img
            className="card-image"
            src={subscription.image}
            alt=""
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="card-image card-image-fallback" aria-hidden="true">
            {subscription.subscriptionName.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="card-title">
          <h3>{subscription.subscriptionName}</h3>
          <p className="muted">{subscription.category}</p>
        </div>
      </div>

      <p className="card-price">
        {formatPrice(subscription.price, subscription.currency)}{' '}
        <span className="muted">/ {CYCLE_LABELS[subscription.billingCycle]}</span>
      </p>
      <DueLine subscription={subscription} />

      {/* The labels name the subscription so each button is distinct in a screen reader's list. */}
      <div className="card-footer">
        <div className="card-links">
          <button
            type="button"
            className="text"
            aria-label={`History for ${name}`}
            onClick={() => setShowHistory(true)}
          >
            History
          </button>
          <button type="button" className="text" aria-label={`Edit ${name}`} onClick={onEdit}>
            Edit
          </button>
          <button
            type="button"
            className="text text-danger"
            aria-label={`Delete ${name}`}
            onClick={onDelete}
          >
            Delete
          </button>
        </div>
        {status !== 'paid' && (
          <button
            type="button"
            className="small"
            aria-label={`Mark paid, ${name}`}
            onClick={onMarkPaid}
          >
            Mark paid
          </button>
        )}
      </div>

      {showHistory && (
        <Modal
          title={`${subscription.subscriptionName} payments`}
          onClose={() => setShowHistory(false)}
        >
          <PaymentHistory uid={uid} subscription={subscription} onUndo={onUndoPayment} />
        </Modal>
      )}
    </article>
  )
}
