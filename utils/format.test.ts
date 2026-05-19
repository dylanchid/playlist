import { describe, it, expect } from 'vitest'

import { formatDuration } from './format'

describe('formatDuration utility', () => {
  it('formats milliseconds to minutes and seconds correctly', () => {
    // 3 minutes and 30 seconds
    const ms = (3 * 60 * 1000) + (30 * 1000)
    expect(formatDuration(ms)).toBe('3m 30s')
  })

  it('handles single digit seconds correctly', () => {
    // 4 minutes and 5 seconds
    const ms = (4 * 60 * 1000) + (5 * 1000)
    expect(formatDuration(ms)).toBe('4m 5s')
  })

  it('handles zero milliseconds', () => {
    expect(formatDuration(0)).toBe('0s')
  })
  
  it('formats durations over an hour correctly', () => {
    // 1 hour, 2 minutes, 15 seconds
    const ms = (1 * 60 * 60 * 1000) + (2 * 60 * 1000) + (15 * 1000)
    expect(formatDuration(ms)).toBe('1h 2m') 
  })
})
