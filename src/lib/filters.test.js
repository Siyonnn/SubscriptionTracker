import { describe, expect, it } from 'vitest'
import { NO_FILTERS, filterSubscriptions } from './filters.js'

const TODAY = '2026-06-10'

const netflix = {
  subscriptionName: 'Netflix',
  category: 'Streaming',
  billingCycle: 'monthly',
  firstDueDate: '2026-06-01',
  lastPaidDate: '2026-06-01',
}
const spotify = {
  subscriptionName: 'Spotify',
  category: 'Music',
  billingCycle: 'monthly',
  firstDueDate: '2026-06-12',
  lastPaidDate: null,
}
const claude = {
  subscriptionName: 'Claude',
  category: 'Software',
  billingCycle: 'monthly',
  firstDueDate: '2026-05-20',
  lastPaidDate: null,
}
const all = [netflix, spotify, claude]

function names(filters) {
  return filterSubscriptions(all, { ...NO_FILTERS, ...filters }, TODAY).map(
    (s) => s.subscriptionName,
  )
}

describe('filterSubscriptions', () => {
  it('returns everything when no filter is set', () => {
    expect(names({})).toEqual(['Netflix', 'Spotify', 'Claude'])
  })

  it('searches by name, ignoring case and surrounding spaces', () => {
    expect(names({ search: '  spot ' })).toEqual(['Spotify'])
  })

  it('filters by category', () => {
    expect(names({ category: 'Software' })).toEqual(['Claude'])
  })

  it('filters by payment status', () => {
    expect(names({ status: 'paid' })).toEqual(['Netflix'])
    expect(names({ status: 'dueSoon' })).toEqual(['Spotify'])
    expect(names({ status: 'overdue' })).toEqual(['Claude'])
  })

  it('filters by renewal date, including the chosen day', () => {
    expect(names({ renewsBy: '2026-06-12' })).toEqual(['Spotify', 'Claude'])
    expect(names({ renewsBy: '2026-06-11' })).toEqual(['Claude'])
  })

  it('combines filters', () => {
    expect(names({ search: 'e', status: 'overdue' })).toEqual(['Claude'])
    expect(names({ category: 'Music', status: 'paid' })).toEqual([])
  })
})
