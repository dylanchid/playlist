import { describe, expect, it, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const { mockFetchPlaylists, mockCreatePlaylist, mockGetUser } = vi.hoisted(() => ({
  mockFetchPlaylists: vi.fn(),
  mockCreatePlaylist: vi.fn(),
  mockGetUser: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: mockGetUser },
  })),
}))

vi.mock('@/lib/supabase/playlists', () => ({
  fetchPlaylists: mockFetchPlaylists,
  createPlaylist: mockCreatePlaylist,
}))

import { GET, POST } from '@/app/api/playlists/route'

describe('GET /api/playlists', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })
  })

  it('returns public playlists as JSON', async () => {
    mockFetchPlaylists.mockResolvedValue([
      { id: 'p1', name: 'Mix', is_public: true },
    ])

    const req = new NextRequest('http://localhost/api/playlists?tags=chill')
    const res = await GET(req)

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.count).toBe(1)
    expect(body.data[0].id).toBe('p1')
    expect(mockFetchPlaylists).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ tags: ['chill'], is_public: true }),
    )
  })

  it('returns 500 when fetch fails', async () => {
    mockFetchPlaylists.mockRejectedValue(new Error('db down'))

    const req = new NextRequest('http://localhost/api/playlists')
    const res = await GET(req)

    expect(res.status).toBe(500)
  })
})

describe('POST /api/playlists', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('requires authentication', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })

    const req = new NextRequest('http://localhost/api/playlists', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test' }),
    })
    const res = await POST(req)

    expect(res.status).toBe(401)
  })

  it('creates playlist for authenticated user', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'u1' } },
      error: null,
    })
    mockCreatePlaylist.mockResolvedValue({ id: 'p-new', name: 'Test' })

    const req = new NextRequest('http://localhost/api/playlists', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test',
        context_story: 'My context story here',
        platform: 'spotify',
        tags: ['chill'],
      }),
    })
    const res = await POST(req)

    expect(res.status).toBe(201)
    expect(mockCreatePlaylist).toHaveBeenCalledWith(
      expect.anything(),
      'u1',
      expect.objectContaining({ name: 'Test' }),
    )
  })
})
