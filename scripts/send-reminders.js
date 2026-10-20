// Sends today's payment reminders. Runs once a day from .github/workflows/reminders.yml.
//
// Needs FIREBASE_SERVICE_ACCOUNT: the full JSON of a service account key, from the Firebase
// console under Project settings > Service accounts. Set DRY_RUN=1 to check everything
// without sending anything.
import { cert, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getMessaging } from 'firebase-admin/messaging'
import { dateInTimeZone, remindersFor } from '../src/lib/reminders.js'

if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
  console.error(
    'FIREBASE_SERVICE_ACCOUNT is not set. Add the service account key as a repository secret ' +
      'with that name, under Settings > Secrets and variables > Actions.',
  )
  process.exit(1)
}

const dryRun = process.env.DRY_RUN === '1'
initializeApp({ credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) })
const db = getFirestore()
const messaging = getMessaging()
const now = new Date()

// Firebase reports these for a browser that turned off notifications or no longer exists.
const GONE = new Set([
  'messaging/registration-token-not-registered',
  'messaging/invalid-registration-token',
])

// A person can have several devices, so each person's subscriptions are read once.
const subscriptionsByUser = new Map()
async function subscriptionsOf(userRef) {
  if (!subscriptionsByUser.has(userRef.id)) {
    const snapshot = await userRef.collection('subscriptions').get()
    subscriptionsByUser.set(
      userRef.id,
      snapshot.docs.map((d) => ({ id: d.id, ...d.data() })),
    )
  }
  return subscriptionsByUser.get(userRef.id)
}

const devices = await db.collectionGroup('devices').get()
let sent = 0
let removed = 0
let failed = 0

for (const device of devices.docs) {
  // One device failing (such as a record with a bad time zone) shouldn't stop the others.
  try {
    const today = dateInTimeZone(now, device.get('timeZone'))
    const reminders = remindersFor(await subscriptionsOf(device.ref.parent.parent), today)
    if (reminders.length === 0) continue

    const messages = reminders.map((reminder) => ({ token: device.id, data: { ...reminder, url: '/' } }))
    const result = await messaging.sendEach(messages, dryRun)
    sent += result.successCount

    const errors = result.responses.filter((r) => !r.success).map((r) => r.error)
    if (errors.some((error) => GONE.has(error.code))) {
      if (!dryRun) await device.ref.delete()
      removed += 1
    } else if (errors.length > 0) {
      failed += 1
      console.error(`A device could not be sent to: ${errors[0].message}`)
    }
  } catch (error) {
    failed += 1
    console.error(`A device could not be processed: ${error.message}`)
  }
}

// Only counts are logged, never names or prices, since workflow logs are visible on GitHub.
console.log(
  `${dryRun ? '[Dry run] ' : ''}Devices: ${devices.size}. Reminders sent: ${sent}. ` +
    `Devices removed: ${removed}. Failed: ${failed}.`,
)
// A failure marks the workflow run as failed, so GitHub emails you about it.
if (failed > 0) process.exitCode = 1
