// Registers this browser to receive payment reminders.
// Each browser that turns reminders on gets a token from Firebase Cloud Messaging, saved at
// users/{uid}/devices/{token}. The daily job sends to every saved token.
import { deleteDoc, doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { getMessaging, getToken, isSupported } from 'firebase/messaging'
import { db } from '../firebase.js'

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY
const STORAGE_KEY = 'remindersToken'

function deviceRef(uid, token) {
  return doc(db, 'users', uid, 'devices', token)
}

function readToken() {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

function writeToken(token) {
  try {
    if (token) localStorage.setItem(STORAGE_KEY, token)
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Without storage the reminders still work; the button just won't remember being on.
  }
}

// False when the key from the Firebase console isn't set, or the browser can't receive push.
// iPhones can only receive push once the site is added to the Home Screen.
export async function canUseReminders() {
  return Boolean(VAPID_KEY) && (await isSupported())
}

export function remindersAreOn() {
  return Notification.permission === 'granted' && Boolean(readToken())
}

async function registerDevice(uid) {
  await navigator.serviceWorker.register('/reminders-sw.js')
  const serviceWorkerRegistration = await navigator.serviceWorker.ready
  const token = await getToken(getMessaging(), { vapidKey: VAPID_KEY, serviceWorkerRegistration })

  const previous = readToken()
  if (previous && previous !== token) await deleteDoc(deviceRef(uid, previous))
  await setDoc(deviceRef(uid, token), {
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    updatedAt: serverTimestamp(),
  })
  writeToken(token)
}

// Returns false if the person blocks notifications.
export async function turnOnReminders(uid) {
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return false
  await registerDevice(uid)
  return true
}

export async function turnOffReminders(uid) {
  const token = readToken()
  writeToken(null)
  if (token) await deleteDoc(deviceRef(uid, token))
}

// Run when the dashboard opens. Firebase can replace a token, and the person may have moved
// time zones or blocked notifications since, so the saved record is brought up to date.
export async function refreshReminders(uid) {
  if (!readToken()) return
  if (Notification.permission !== 'granted') {
    await turnOffReminders(uid)
    return
  }
  await registerDevice(uid)
}
