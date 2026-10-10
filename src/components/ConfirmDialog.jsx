import Dialog from './Dialog.jsx'

export default function ConfirmDialog({
  title,
  message,
  confirmLabel,
  onConfirm,
  alternative,
  isDanger = false,
  onCancel,
}) {
  return (
    <Dialog
      className="confirm"
      aria-labelledby="confirm-title"
      aria-describedby="confirm-message"
      onClose={onCancel}
    >
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
        {/* Focus starts on the safe choice so Enter does not confirm by accident. */}
        <button type="button" className="secondary" data-initial-focus onClick={onCancel}>
          Cancel
        </button>
      </div>
    </Dialog>
  )
}
