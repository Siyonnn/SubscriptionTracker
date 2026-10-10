import { useEffect, useRef } from 'react'

export default function Modal({ title, onClose, children }) {
  const dialogRef = useRef(null)

  useEffect(() => {
    if (!dialogRef.current.open) dialogRef.current.showModal()
    // showModal focuses the Close button; start in the first field when there is one.
    dialogRef.current.querySelector('input, select')?.focus()
  }, [])

  // The dialog has no padding of its own, so a click that lands on it is a click on the backdrop.
  function handleClick(event) {
    if (event.target === dialogRef.current) onClose()
  }

  return (
    <dialog ref={dialogRef} className="modal" onClose={onClose} onClick={handleClick}>
      <div className="modal-body">
        <header className="modal-header">
          <h2>{title}</h2>
          <button type="button" className="text" onClick={onClose}>
            Close
          </button>
        </header>
        {children}
      </div>
    </dialog>
  )
}
