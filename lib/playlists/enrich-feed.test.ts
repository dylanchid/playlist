import { describe, expect, it } from 'vitest'
import { enrichPlaylistsWithEngagement } from './enrich-feed'

describe('enrichPlaylistsWithEngagement', () => {
  const playlists = [
    {
      id: 'p1',
      name: 'A',
      user_profiles: { id: 'u1', username: 'alice', avatar_url: null as string | null },
    },
    { id: 'p2', name: 'B', user_profiles: null },
  ]

  it('counts reactions and plays and picks current user reaction', () => {
    const reactions = [
      { playlist_id: 'p1', reaction_type: 'fire', user_id: 'me' },
      { playlist_id: 'p1', reaction_type: 'perfect', user_id: 'other' },
      { playlist_id: 'p2', reaction_type: 'energy', user_id: 'me' },
    ]
    const plays = [
      { playlist_id: 'p1' },
      { playlist_id: 'p1' },
      { playlist_id: 'p2' },
    ]

    const out = enrichPlaylistsWithEngagement(playlists, reactions, plays, 'me')

    expect(out[0].likes_count).toBe(2)
    expect(out[0].plays_count).toBe(2)
    expect(out[0].reactions.fire).toBe(1)
    expect(out[0].reactions.perfect).toBe(1)
    expect(out[0].user_reaction).toBe('fire')

    expect(out[1].likes_count).toBe(1)
    expect(out[1].user_reaction).toBe('energy')
  })

  it('handles empty sides', () => {
    const out = enrichPlaylistsWithEngagement(playlists, [], [], undefined)
    expect(out[0].likes_count).toBe(0)
    expect(out[0].plays_count).toBe(0)
    expect(out[0].user_reaction).toBeNull()
  })
})
