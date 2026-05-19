import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const { mockFrom, mockGetUser } = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
  mockFrom: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  })),
}))

import { GET } from '@/app/api/playlists/infinite/route'

function playlistQueryBuilder(
  resolve: { data: unknown[]; error: null; count: number },
) {
  const chain: Record<string, unknown> = {}
  chain.eq = vi.fn(() => chain)
  chain.overlaps = vi.fn(() => chain)
  chain.or = vi.fn(() => chain)
  chain.order = vi.fn(() => chain)
  chain.range = vi.fn(() => Promise.resolve(resolve))
  return chain
}

describe('GET /api/playlists/infinite', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u-me' } } })
  })

  it('returns enriched paginated JSON', async () => {
    const playlistRow = {
      id: 'p1',
      name: 'Mix',
      user_id: 'u1',
      context_story: 'x'.repeat(10),
      platform: 'spotify' as const,
      track_count: 0,
      duration_ms: 0,
      is_public: true,
      tags: [] as string[],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_profiles: {
        id: 'u1',
        username: 'bob',
        avatar_url: null as string | null,
      },
    }

    const chain = playlistQueryBuilder({
      data: [playlistRow],
      error: null,
      count: 1,
    })

    mockFrom.mockImplementation((table: string) => {
      if (table === 'playlists') {
        return {
          select: vi.fn(() => chain),
        }
      }
      return {
        select: vi.fn(() => ({
          in: vi.fn().mockResolvedValue({ data: [] }),
        })),
      }
    })

    const req = new NextRequest('http://localhost/api/playlists/infinite?page=0&limit=12')
    const res = await GET(req)
    expect(res.status).toBe(200)

    const body = await res.json()
    expect(body.count).toBe(1)
    expect(body.data).toHaveLength(1)
    expect(body.data[0].id).toBe('p1')
    expect(body.data[0].likes_count).toBe(0)
    expect(body.has_more).toBe(false)
  })

  it('returns 500 when playlists query errors', async () => {
    const chain = playlistQueryBuilder({
      data: [],
      error: null,
      count: 0,
    })
    chain.range = vi.fn(() =>
      Promise.resolve({
        data: null,
        error: { message: 'boom' },
        count: null,
      }),
    )

    mockFrom.mockImplementation((table: string) => {
      if (table === 'playlists') {
        return { select: vi.fn(() => chain) }
      }
      return {
        select: vi.fn(() => ({
          in: vi.fn().mockResolvedValue({ data: [] }),
        })),
      }
    })

    const req = new NextRequest('http://localhost/api/playlists/infinite')
    const res = await GET(req)
    expect(res.status).toBe(500)
  })
})
