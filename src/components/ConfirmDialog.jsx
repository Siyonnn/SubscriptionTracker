import { useEffect, useRef } from 'react'

export default function ConfirmDialog({
  title,
  message,
  confirmLabel,
  onConfirm,
  alternative,
  isDanger = false,
  onCancel,
}) {
  const dialogRef = useRef(null)
  const cancelRef = useRef(null)

  useEffect(() => {
    if (!dialogRef.current.open) dialogRef.current.showModal()
    // Start on the safe choice so Enter does not confirm by accident.
    cancelRef.current.focus()
  }, [])

  return (
    <dialog
      ref={dialogRef}
      className="modal confirm"
      aria-labelledby="confirm-title"
      aria-describedby="confirm-message"
      onClose={onCancel}
    >
      <div className="modal-body">
        <h2 id="confirm-title">{title}</h2>
        <p id="confirm-message" className="confirm-message">
          {message}
        </p>
        <div className="form-actions">
          <button type="button" className={isDanger ? 'danger' : undefined} onClick={onConfirm}>
            {confirmLabel}
          </button>
          {alternative && (
            <button type="button" className="secondary" onClick={alternative.onConfirm}>
              {alternative.label}
            </button>
          )}
          <button type="button" className="secondary" ref={cancelRef} onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </dialog>
  )
}
