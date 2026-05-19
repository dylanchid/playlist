import { describe, expect, it } from 'vitest'
import { getPlaylistPlayUrl } from './open-playlist'

describe('getPlaylistPlayUrl', () => {
  it('prefers external_url when set', () => {
    expect(
      getPlaylistPlayUrl({
        id: 'p1',
        platform: 'spotify',
        external_url: 'https://open.spotify.com/playlist/abc',
      }),
    ).toBe('https://open.spotify.com/playlist/abc')
  })

  it('builds Spotify URL from external_id', () => {
    expect(
      getPlaylistPlayUrl({
        id: 'p1',
        platform: 'spotify',
        external_id: 'abc123',
      }),
    ).toBe('https://open.spotify.com/playlist/abc123')
  })

  it('returns null when no external link exists', () => {
    expect(
      getPlaylistPlayUrl({
        id: 'p1',
        platform: 'custom',
      }),
    ).toBeNull()
  })
})
