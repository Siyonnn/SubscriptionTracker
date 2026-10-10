// Pauses log in for a short time after repeated wrong passwords.
// This runs in the browser, so it slows down guessing on this device. It is not a security boundary:
// clearing site data or using another browser resets it. Firebase applies its own limits on the server.

export const MAX_ATTEMPTS = 3
export const LOCK_SECONDS = 30
const STORAGE_KEY = 'loginLockout'

export const NO_FAILURES = { failures: 0, lockedUntil: 0 }

// The third wrong attempt starts the lock and gives a fresh set of tries for when it ends.
export function afterFailure(state, now) {
  const failures = state.failures + 1
  if (failures >= MAX_ATTEMPTS) {
    return { failures: 0, lockedUntil: now + LOCK_SECONDS * 1000 }
  }
  return { failures, lockedUntil: 0 }
}

export function secondsLocked(state, now) {
  return Math.max(0, Math.ceil((state.lockedUntil - now) / 1000))
}

export function attemptsLeft(state) {
  return MAX_ATTEMPTS - state.failures
}

// Stored so that reloading the page does not clear the count. Storage can be unavailable
// (private windows, blocked site data), in which case the count lasts until the page reloads.
export function loadLockout() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (Number.isInteger(saved?.failures) && Number.isFinite(saved?.lockedUntil)) return saved
  } catch {
    // fall through to the default
  }
  return NO_FAILURES
}

export function saveLockout(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // nothing to do without storage
  }
}
