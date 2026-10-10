import Dialog from './Dialog.jsx'

export default function Modal({ title, onClose, children }) {
  return (
    <Dialog onClose={onClose}>
      <header className="modal-header">
        <h2>{title}</h2>
        <button type="button" className="text" onClick={onClose}>
          Close
        </button>
      </header>
      {children}
    </Dialog>
  )
}
