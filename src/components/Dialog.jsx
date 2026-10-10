import { useEffect, useRef } from 'react'

// The shared base for every popup: opens as a modal, picks where focus starts,
// and closes on Esc or a click outside. Extra props (such as aria labels) go on the dialog.
export default function Dialog({ className = '', onClose, children, ...rest }) {
  const dialogRef = useRef(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog.open) dialog.showModal()
    // showModal focuses the first button. Prefer the element a popup marks, then the first field.
    const start = dialog.querySelector('[data-initial-focus]') ?? dialog.querySelector('input, select')
    start?.focus()
  }, [])

  // The dialog has no padding of its own, so a click that lands on it is a click on the backdrop.
  function handleClick(event) {
    if (event.target === dialogRef.current) onClose()
  }

  return (
    <dialog
      ref={dialogRef}
      className={`modal ${className}`}
      onClose={onClose}
      onClick={handleClick}
      {...rest}
    >
      <div className="modal-body">{children}</div>
    </dialog>
  )
}
