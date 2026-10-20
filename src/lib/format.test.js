import { describe, expect, it } from 'vitest'
import { formatDate } from './format.js'

describe('formatDate', () => {
  it('shows stored dates as MM/DD/YYYY', () => {
    expect(formatDate('2026-10-20')).toBe('10/20/2026')
    expect(formatDate('2027-02-05')).toBe('02/05/2027')
  })
})
