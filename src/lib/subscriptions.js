import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  writeBatch,
} from 'firebase/firestore'
import { db } from '../firebase.js'
import { nextPaymentDate, previousPaidDate, todayString } from './billing.js'

function subscriptionsRef(uid) {
  return collection(db, 'users', uid, 'subscriptions')
}

function subscriptionRef(uid, id) {
  return doc(db, 'users', uid, 'subscriptions', id)
}

// Calls onChange with the full list now and again on every change. Returns an unsubscribe function.
export function watchSubscriptions(uid, onChange, onError) {
  return onSnapshot(
    subscriptionsRef(uid),
    (snapshot) => onChange(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))),
    onError,
  )
}

export function addSubscription(uid, data) {
  return addDoc(subscriptionsRef(uid), { ...data, lastPaidDate: null })
}

export function updateSubscription(uid, id, data) {
  return updateDoc(subscriptionRef(uid, id), data)
}

// Pays the oldest unpaid periods, one history entry each.
// A payment's ID is its due date, so a period can't be paid twice.
export function recordPayments(uid, subscription, count = 1) {
  const ref = subscriptionRef(uid, subscription.id)
  const batch = writeBatch(db)
  let lastPaidDate = subscription.lastPaidDate
  for (let i = 0; i < count; i += 1) {
    const dueDate = nextPaymentDate({ ...subscription, lastPaidDate })
    batch.set(doc(ref, 'payments', dueDate), {
      dueDate,
      paidOn: todayString(),
      amount: subscription.price,
      currency: subscription.currency,
    })
    lastPaidDate = dueDate
  }
  batch.update(ref, { lastPaidDate })
  return batch.commit()
}

// Removes the most recent payment and moves lastPaidDate back one period.
export function undoLastPayment(uid, subscription) {
  const ref = subscriptionRef(uid, subscription.id)
  const batch = writeBatch(db)
  batch.delete(doc(ref, 'payments', subscription.lastPaidDate))
  batch.update(ref, { lastPaidDate: previousPaidDate(subscription) })
  return batch.commit()
}

// Newest period first. Returns an unsubscribe function.
export function watchPayments(uid, id, onChange, onError) {
  return onSnapshot(
    query(collection(subscriptionRef(uid, id), 'payments'), orderBy('dueDate', 'desc')),
    (snapshot) => onChange(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))),
    onError,
  )
}

// Firestore does not delete subcollections with their parent, so remove the payments too.
export async function deleteSubscription(uid, id) {
  const ref = subscriptionRef(uid, id)
  const payments = await getDocs(collection(ref, 'payments'))
  const batch = writeBatch(db)
  payments.forEach((payment) => batch.delete(payment.ref))
  batch.delete(ref)
  await batch.commit()
}
