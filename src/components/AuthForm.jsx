import { useEffect, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from 'firebase/auth'
import { auth } from '../firebase.js'
import {
  LOCK_SECONDS,
  NO_FAILURES,
  afterFailure,
  attemptsLeft,
  loadLockout,
  saveLockout,
  secondsLocked,
} from '../lib/loginLockout.js'

const ERROR_MESSAGES = {
  'auth/invalid-email': 'Enter a valid email address.',
  'auth/email-already-in-use': 'An account with this email already exists.',
  'auth/weak-password': 'Password must be at least 6 characters.',
  'auth/too-many-requests': 'Too many attempts. Try again later.',
  'auth/network-request-failed': 'Network error. Check your connection.',
}

// Firebase reports a wrong password and an unknown email the same way, so both count as a wrong try.
const WRONG_LOGIN_CODES = ['auth/invalid-credential', 'auth/wrong-password', 'auth/user-not-found']

// Sample rows that show how the dashboard marks each status. Not real data.
function Preview() {
  return (
    <aside className="auth-preview" aria-hidden="true">
      <p className="preview-caption">Example of what you'll see after logging in</p>
      <p className="total-month">
        <span className="total-amount">₱847.00</span> a month
      </p>
      <ul className="preview-list">
        <li>
          <span>Netflix</span>
          <mark className="due-soon">Due in 3 days</mark>
          <span>₱549.00</span>
        </li>
        <li>
          <span>Spotify</span>
          <span className="due-paid">Paid</span>
          <span>₱149.00</span>
        </li>
        <li>
          <span>iCloud+</span>
          <span className="due-overdue">Overdue</span>
          <span>₱149.00</span>
        </li>
      </ul>
    </aside>
  )
}

export default function AuthForm() {
  const [isRegistering, setIsRegistering] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [lockout, setLockout] = useState(loadLockout)
  const [now, setNow] = useState(() => Date.now())

  const secondsLeft = isRegistering ? 0 : secondsLocked(lockout, now)
  const isLocked = secondsLeft > 0
  // Worked out from the lock itself, so it also shows after a reload and clears when the lock ends.
  const shownError = isLocked
    ? `Too many wrong attempts. Log in is paused for ${LOCK_SECONDS} seconds.`
    : error

  // Tick only while locked, so the countdown on the button stays current.
  useEffect(() => {
    if (!isLocked) return
    const timer = setInterval(() => setNow(Date.now()), 500)
    return () => clearInterval(timer)
  }, [isLocked])

  function updateLockout(next) {
    saveLockout(next)
    setLockout(next)
    setNow(Date.now())
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (isLocked) return
    setError('')
    setInfo('')
    setIsSubmitting(true)
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password)
      } else {
        await signInWithEmailAndPassword(auth, email, password)
        saveLockout(NO_FAILURES)
      }
    } catch (err) {
      if (!isRegistering && WRONG_LOGIN_CODES.includes(err.code)) {
        const next = afterFailure(lockout, Date.now())
        updateLockout(next)
        // When this try starts the lock, the lock message below replaces this one.
        const left = attemptsLeft(next)
        setError(`Incorrect email or password. ${left} ${left === 1 ? 'try' : 'tries'} left.`)
      } else {
        setError(ERROR_MESSAGES[err.code] ?? 'Something went wrong. Try again.')
      }
      setIsSubmitting(false)
    }
  }

  async function handleResetPassword() {
    setError('')
    setInfo('')
    if (!email.trim()) {
      setError('Enter your email above, then choose "Forgot password?" again.')
      return
    }
    try {
      await sendPasswordResetEmail(auth, email.trim())
      // The same message either way, so this can't be used to check which emails have accounts.
      setInfo('If an account exists for that email, a reset link is on its way.')
    } catch (err) {
      setError(ERROR_MESSAGES[err.code] ?? 'Could not send the reset email. Try again.')
    }
  }

  function toggleMode() {
    setIsRegistering(!isRegistering)
    setError('')
    setInfo('')
  }

  return (
    <main className="auth">
      <section className="auth-panel">
        <p className="auth-brand">Subscription Tracker</p>
        <h1>{isRegistering ? 'Create your account' : 'Log in'}</h1>
        <p className="muted">Keep track of what you pay for and when it's due.</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={isRegistering ? 'new-password' : 'current-password'}
              minLength={6}
              required
            />
            {isRegistering && <span className="field-hint">At least 6 characters.</span>}
          </label>

          {shownError && <p className="error" role="alert">{shownError}</p>}
          {info && <p role="status">{info}</p>}

          <button type="submit" disabled={isSubmitting || isLocked}>
            {isLocked
              ? `Try again in ${secondsLeft}s`
              : isRegistering
                ? 'Create account'
                : 'Log in'}
          </button>
        </form>

        <div className="auth-links">
          <p className="muted">
            {isRegistering ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button type="button" className="link" onClick={toggleMode}>
              {isRegistering ? 'Log in' : 'Create one'}
            </button>
          </p>
          {!isRegistering && (
            <button type="button" className="link" onClick={handleResetPassword}>
              Forgot password?
            </button>
          )}
        </div>
      </section>

      <Preview />
    </main>
  )
}
