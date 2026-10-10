import { describe, expect, it } from 'vitest'
import {
  addCycles,
  expenseTotals,
  getPaymentStatus,
  nextPaymentDate,
  previousPaidDate,
} from './billing.js'

describe('addCycles', () => {
  it('keeps month-end anchors and clamps to the last day of the month', () => {
    expect(addCycles('2026-01-31', 'monthly', 1)).toBe('2026-02-28')
    expect(addCycles('2026-01-31', 'monthly', 2)).toBe('2026-03-31')
  })

  it('clamps a yearly Feb 29 anchor to Feb 28 in non-leap years', () => {
    expect(addCycles('2028-02-29', 'yearly', 1)).toBe('2029-02-28')
  })

  it('adds weeks in 7-day steps', () => {
    expect(addCycles('2026-03-01', 'weekly', 2)).toBe('2026-03-15')
  })
})

describe('nextPaymentDate', () => {
  it('equals the first due date before any payment', () => {
    expect(
      nextPaymentDate({ firstDueDate: '2026-05-10', billingCycle: 'monthly', lastPaidDate: null }),
    ).toBe('2026-05-10')
  })

  it('moves forward one cycle after each payment', () => {
    expect(
      nextPaymentDate({ firstDueDate: '2026-01-31', billingCycle: 'monthly', lastPaidDate: '2026-01-31' }),
    ).toBe('2026-02-28')
    expect(
      nextPaymentDate({ firstDueDate: '2026-01-31', billingCycle: 'monthly', lastPaidDate: '2026-02-28' }),
    ).toBe('2026-03-31')
  })
})

describe('previousPaidDate', () => {
  it('is null when undoing the only payment', () => {
    expect(
      previousPaidDate({ firstDueDate: '2026-01-31', billingCycle: 'monthly', lastPaidDate: '2026-01-31' }),
    ).toBeNull()
  })

  it('steps back one cycle from the anchor, keeping month-end dates', () => {
    expect(
      previousPaidDate({ firstDueDate: '2026-01-31', billingCycle: 'monthly', lastPaidDate: '2026-03-31' }),
    ).toBe('2026-02-28')
  })

  it('reverses a payment exactly', () => {
    const before = { firstDueDate: '2026-03-01', billingCycle: 'weekly', lastPaidDate: '2026-03-08' }
    const after = { ...before, lastPaidDate: nextPaymentDate(before) }
    expect(previousPaidDate(after)).toBe(before.lastPaidDate)
  })
})

describe('getPaymentStatus', () => {
  const base = { firstDueDate: '2026-06-01', billingCycle: 'monthly', lastPaidDate: null }

  it('is upcoming when the due date is more than 7 days away', () => {
    expect(getPaymentStatus(base, '2026-05-20').status).toBe('upcoming')
  })

  it('is due soon within 7 days, and on the due date', () => {
    expect(getPaymentStatus(base, '2026-05-25').status).toBe('dueSoon')
    expect(getPaymentStatus(base, '2026-06-01').status).toBe('dueSoon')
  })

  it('is overdue after the due date and counts the missed periods', () => {
    const result = getPaymentStatus(base, '2026-06-02')
    expect(result.status).toBe('overdue')
    expect(result.overduePeriods).toBe(1)
  })

  it('counts several missed periods when three cycles are behind', () => {
    const sub = { firstDueDate: '2026-01-05', billingCycle: 'monthly', lastPaidDate: null }
    const result = getPaymentStatus(sub, '2026-04-10')
    expect(result.status).toBe('overdue')
    expect(result.overduePeriods).toBe(4)
  })

  it('does not count a period that is due today as overdue', () => {
    const sub = { firstDueDate: '2026-09-10', billingCycle: 'monthly', lastPaidDate: null }
    expect(getPaymentStatus(sub, '2026-10-10').overduePeriods).toBe(1)
    expect(getPaymentStatus(sub, '2026-10-11').overduePeriods).toBe(2)
  })

  it('is paid after paying the current period, until the next due date', () => {
    const sub = { firstDueDate: '2026-06-01', billingCycle: 'monthly', lastPaidDate: '2026-06-01' }
    expect(getPaymentStatus(sub, '2026-06-15').status).toBe('paid')
    expect(getPaymentStatus(sub, '2026-07-01').status).toBe('dueSoon')
  })

  it('becomes overdue when a paid card passes its next due date unpaid', () => {
    const sub = { firstDueDate: '2026-06-01', billingCycle: 'monthly', lastPaidDate: '2026-06-01' }
    const result = getPaymentStatus(sub, '2026-07-03')
    expect(result.status).toBe('overdue')
    expect(result.overduePeriods).toBe(1)
  })
})

describe('expenseTotals', () => {
  it('converts each cycle to monthly and yearly, grouped by currency', () => {
    const totals = expenseTotals([
      { price: 12, currency: 'USD', billingCycle: 'monthly' },
      { price: 120, currency: 'USD', billingCycle: 'yearly' },
      { price: 100, currency: 'PHP', billingCycle: 'monthly' },
    ])
    expect(totals.USD.monthly).toBeCloseTo(22)
    expect(totals.USD.yearly).toBeCloseTo(264)
    expect(totals.PHP.monthly).toBeCloseTo(100)
    expect(totals.PHP.yearly).toBeCloseTo(1200)
  })

  it('uses 52 weeks per year when converting weekly prices', () => {
    const totals = expenseTotals([{ price: 10, currency: 'USD', billingCycle: 'weekly' }])
    expect(totals.USD.yearly).toBeCloseTo(520)
  })
})
