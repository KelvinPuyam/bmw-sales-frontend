import { describe, it, expect, vi, beforeEach } from 'vitest'
import { loginUser, signupUser } from '../services/authService'

vi.mock('../api/axios', () => ({
  default: {
    post: vi.fn(),
  },
}))

import api from '../api/axios'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('loginUser', () => {
  it('posts to /auth/login and returns the access token', async () => {
    api.post.mockResolvedValue({ data: { access_token: 'jwt-abc-123' } })
    const token = await loginUser({ username: 'alice', password: 'secret' })
    expect(api.post).toHaveBeenCalledWith('/auth/login', { username: 'alice', password: 'secret' })
    expect(token).toBe('jwt-abc-123')
  })

  it('propagates errors from the API', async () => {
    api.post.mockRejectedValue({ response: { status: 401 } })
    await expect(loginUser({ username: 'bad', password: 'wrong' })).rejects.toMatchObject({
      response: { status: 401 },
    })
  })
})

describe('signupUser', () => {
  it('posts to /auth/signup', async () => {
    api.post.mockResolvedValue({ data: {} })
    await signupUser({ username: 'bob', password: 'pass123' })
    expect(api.post).toHaveBeenCalledWith('/auth/signup', { username: 'bob', password: 'pass123' })
  })

  it('does not return a value on success', async () => {
    api.post.mockResolvedValue({ data: {} })
    const result = await signupUser({ username: 'bob', password: 'pass' })
    expect(result).toBeUndefined()
  })
})
