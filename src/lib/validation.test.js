import { describe, expect, it } from 'vitest'
import { MAX_PRICE, earliestFirstDueDate, validateSubscription } from './validation.js'

const MIN_DATE = '2026-07-09'
const valid = {
  subscriptionName: 'Netflix',
  image: '',
  price: '549',
  firstDueDate: '2026-10-12',
}

function errorsFor(changes) {
  return validateSubscription({ ...valid, ...changes }, MIN_DATE)
}

describe('earliestFirstDueDate', () => {
  it('is three months before today, clamped to the end of the month', () => {
    expect(earliestFirstDueDate('2026-10-09')).toBe('2026-07-09')
    expect(earliestFirstDueDate('2026-05-31')).toBe('2026-02-28')
  })
})

describe('validateSubscription', () => {
  it('accepts valid values', () => {
    expect(errorsFor({})).toEqual({})
    expect(errorsFor({ image: 'https://example.com/logo.png' })).toEqual({})
  })

  it('rejects a blank or spaces-only name', () => {
    expect(errorsFor({ subscriptionName: '   ' })).toHaveProperty('subscriptionName')
  })

  it('rejects an image that is not a web link', () => {
    expect(errorsFor({ image: 'logo.png' })).toHaveProperty('image')
    expect(errorsFor({ image: 'javascript:alert(1)' })).toHaveProperty('image')
  })

  it('rejects an empty, zero, or negative price', () => {
    expect(errorsFor({ price: '' })).toHaveProperty('price')
    expect(errorsFor({ price: '0' })).toHaveProperty('price')
    expect(errorsFor({ price: '-5' })).toHaveProperty('price')
  })

  it('allows up to 2 decimal places and rejects more', () => {
    expect(errorsFor({ price: '0.01' })).toEqual({})
    expect(errorsFor({ price: '549.5' })).toEqual({})
    expect(errorsFor({ price: '0.001' })).toHaveProperty('price')
    expect(errorsFor({ price: '9.999' })).toHaveProperty('price')
    expect(errorsFor({ price: '1e3' })).toHaveProperty('price')
  })

  it('reports errors in the order the fields appear in the form', () => {
    const errors = errorsFor({ subscriptionName: '', price: '', firstDueDate: '' })
    expect(Object.keys(errors)).toEqual(['subscriptionName', 'price', 'firstDueDate'])
  })

  it('allows the maximum price and rejects anything above it', () => {
    expect(errorsFor({ price: String(MAX_PRICE) })).toEqual({})
    expect(errorsFor({ price: '99999999999.99' })).toHaveProperty('price')
  })

  it('allows the earliest date and rejects anything before it', () => {
    expect(errorsFor({ firstDueDate: MIN_DATE })).toEqual({})
    expect(errorsFor({ firstDueDate: '2020-01-01' })).toHaveProperty('firstDueDate')
    expect(errorsFor({ firstDueDate: '' })).toHaveProperty('firstDueDate')
  })
})
