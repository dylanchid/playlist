import { describe, expect, it } from 'vitest'
import { isPublicPath } from './public-paths'

describe('isPublicPath', () => {
  it('allows home', () => {
    expect(isPublicPath('/')).toBe(true)
  })

  it('allows auth and discover', () => {
    expect(isPublicPath('/auth/login')).toBe(true)
    expect(isPublicPath('/discover')).toBe(true)
    expect(isPublicPath('/members')).toBe(true)
  })

  it('allows playlist detail but not create', () => {
    expect(isPublicPath('/playlists/abc-123')).toBe(true)
    expect(isPublicPath('/playlists/create')).toBe(false)
  })

  it('allows public profile but not edit', () => {
    expect(isPublicPath('/profile/jane')).toBe(true)
    expect(isPublicPath('/profile/edit')).toBe(false)
  })

  it('requires auth for app areas', () => {
    expect(isPublicPath('/friends')).toBe(false)
    expect(isPublicPath('/onboarding/welcome')).toBe(false)
  })
})
