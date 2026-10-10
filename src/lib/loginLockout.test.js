import { describe, expect, it } from 'vitest'
import { NO_FAILURES, afterFailure, attemptsLeft, secondsLocked } from './loginLockout.js'

const NOW = 1_000_000

describe('login lockout', () => {
  it('starts with 3 tries and no lock', () => {
    expect(attemptsLeft(NO_FAILURES)).toBe(3)
    expect(secondsLocked(NO_FAILURES, NOW)).toBe(0)
  })

  it('counts down the tries without locking for the first two wrong attempts', () => {
    const once = afterFailure(NO_FAILURES, NOW)
    const twice = afterFailure(once, NOW)
    expect(attemptsLeft(once)).toBe(2)
    expect(attemptsLeft(twice)).toBe(1)
    expect(secondsLocked(twice, NOW)).toBe(0)
  })

  it('locks for 30 seconds on the third wrong attempt', () => {
    const locked = [1, 2, 3].reduce((state) => afterFailure(state, NOW), NO_FAILURES)
    expect(secondsLocked(locked, NOW)).toBe(30)
    expect(secondsLocked(locked, NOW + 29_500)).toBe(1)
    expect(secondsLocked(locked, NOW + 30_000)).toBe(0)
  })

  it('gives 3 fresh tries once the lock ends', () => {
    const locked = [1, 2, 3].reduce((state) => afterFailure(state, NOW), NO_FAILURES)
    expect(attemptsLeft(locked)).toBe(3)
    const next = afterFailure(locked, NOW + 31_000)
    expect(attemptsLeft(next)).toBe(2)
    expect(secondsLocked(next, NOW + 31_000)).toBe(0)
  })
})
