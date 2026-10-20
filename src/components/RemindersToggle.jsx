import { useEffect, useState } from 'react'
import {
  canUseReminders,
  refreshReminders,
  remindersAreOn,
  turnOffReminders,
  turnOnReminders,
} from '../lib/pushReminders.js'

// Hidden in browsers that can't receive push, so it never offers something that won't work.
export default function RemindersToggle({ uid, onMessage }) {
  const [isSupported, setIsSupported] = useState(false)
  const [isOn, setIsOn] = useState(false)
  const [isBusy, setIsBusy] = useState(false)

  useEffect(() => {
    let isCurrent = true
    canUseReminders().then((supported) => {
      if (!isCurrent || !supported) return
      setIsSupported(true)
      setIsOn(remindersAreOn())
      refreshReminders(uid)
        .then(() => isCurrent && setIsOn(remindersAreOn()))
        .catch(() => {})
    })
    return () => {
      isCurrent = false
    }
  }, [uid])

  if (!isSupported) return null

  async function handleClick() {
    setIsBusy(true)
    try {
      if (isOn) {
        await turnOffReminders(uid)
        setIsOn(false)
        onMessage('Reminders are off for this browser.')
      } else if (await turnOnReminders(uid)) {
        setIsOn(true)
        onMessage(
          'Reminders are on for this browser. You will get one 3 days before each payment and on the day it is due.',
        )
      } else {
        onMessage(
          "Notifications are blocked for this site. Allow them in your browser's site settings, then try again.",
        )
      }
    } catch (error) {
      // Logged so the real cause shows in the browser console (F12 > Console).
      console.error('Could not change reminders:', error)
      // Says which part failed without opening the console. Firebase errors have a text code
      // such as "permission-denied"; browser errors only have a number, so show their message.
      const detail =
        typeof error.code === 'string' ? error.code : `${error.name}: ${error.message}`
      onMessage(`Could not change reminders (${detail}). Check your connection and try again.`)
    }
    setIsBusy(false)
  }

  return (
    <button type="button" className="secondary small" onClick={handleClick} disabled={isBusy}>
      {isOn ? 'Turn off reminders' : 'Turn on reminders'}
    </button>
  )
}
