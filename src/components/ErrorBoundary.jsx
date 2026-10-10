import { Component } from 'react'

// Without this, an error while drawing the page leaves it blank with no explanation.
// React only supports error boundaries as class components.
export default class ErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (!this.state.hasError) return this.props.children
    return (
      <main>
        <h1>Something went wrong</h1>
        <p className="boundary-message">
          The page hit an error and could not be shown. Your saved subscriptions are not affected.
        </p>
        <button type="button" onClick={() => window.location.reload()}>
          Reload the page
        </button>
      </main>
    )
  }
}
