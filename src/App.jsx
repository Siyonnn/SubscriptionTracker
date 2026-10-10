import { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, isFirebaseConfigured } from './firebase.js'
import AuthForm from './components/AuthForm.jsx'
import Dashboard from './components/Dashboard.jsx'

export default function App() {
  // undefined = still checking, null = logged out
  const [user, setUser] = useState(undefined)

  useEffect(() => {
    if (!isFirebaseConfigured) return
    return onAuthStateChanged(auth, setUser)
  }, [])

  if (!isFirebaseConfigured) {
    return (
      <main>
        <h1>Setup needed</h1>
        <p>
          Copy <code>.env.example</code> to <code>.env</code> and fill in your Firebase web app
          config, then restart <code>npm run dev</code>.
        </p>
      </main>
    )
  }

  if (user === undefined) {
    return (
      <main>
        <p className="muted">Loading…</p>
      </main>
    )
  }

  return user ? <Dashboard user={user} /> : <AuthForm />
}
