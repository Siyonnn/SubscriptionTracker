import { useRef } from 'react'
import { NO_FILTERS } from '../lib/filters.js'
import { CATEGORIES } from '../lib/categories.js'

const STATUSES = [
  { value: 'overdue', label: 'Overdue' },
  { value: 'dueSoon', label: 'Due soon' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'paid', label: 'Paid' },
]

export default function Filters({ filters, onChange }) {
  const searchRef = useRef(null)
  const isFiltering = Object.values(filters).some(Boolean)

  function set(field, value) {
    onChange({ ...filters, [field]: value })
  }

  // The button disables itself once cleared, which would drop keyboard focus to the page.
  function clear() {
    onChange(NO_FILTERS)
    searchRef.current.focus()
  }

  return (
    <section className="filters">
      <label>
        Search
        <input
          type="search"
          ref={searchRef}
          value={filters.search}
          onChange={(e) => set('search', e.target.value)}
          placeholder="Search by name"
        />
      </label>

      <label>
        Category
        <select value={filters.category} onChange={(e) => set('category', e.target.value)}>
          <option value="">All</option>
          {CATEGORIES.map((name) => (
            <option key={name}>{name}</option>
          ))}
        </select>
      </label>

      <label>
        Status
        <select value={filters.status} onChange={(e) => set('status', e.target.value)}>
          <option value="">All</option>
          {STATUSES.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </label>

      <label>
        Renews on or before
        <input
          type="date"
          value={filters.renewsBy}
          onChange={(e) => set('renewsBy', e.target.value)}
        />
      </label>

      {/* Always rendered so the other filters don't shift when one is set. */}
      <button
        type="button"
        className="secondary"
        onClick={clear}
        disabled={!isFiltering}
      >
        Clear filters
      </button>
    </section>
  )
}
