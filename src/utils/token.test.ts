import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import {
  decodeJwt,
  getTokenSessionMeta,
  getStoredToken,
  setStoredToken,
  removeStoredToken,
  getStoredUser,
  setStoredUser,
  removeStoredUser,
  clearAuthStorage,
} from './token'
import type { User } from '@/types/api'

describe('token utils', () => {
  const mockUser: User = {
    id: 'user-uuid-123',
    email: 'admin@example.com',
    name: 'Admin Test',
    role: 'admin',
    createdAt: '2026-11-05T00:00:00.000Z',
    updatedAt: '2026-11-05T00:00:00.000Z',
  }

  // Sample JWT with sub, email, role, iat, exp (future)
  // header: {"alg":"HS256","typ":"JWT"} -> eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
  // payload: {"sub":"user-uuid-123","email":"admin@example.com","role":"admin","iat":1000000000,"exp":1000086400}
  // base64url of payload: eyJzdWIiOiJ1c2VyLXV1aWQtMTIzIiwiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTAwMDAwMDAwMCwiZXhwIjoxMDAwMDg2NDAwfQ
  const sampleValidJwt =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLXV1aWQtMTIzIiwiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTAwMDAwMDAwMCwiZXhwIjoxMDAwMDg2NDAwfQ.signature'

  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('lưu và lấy access token từ localStorage đúng chuẩn', () => {
    expect(getStoredToken()).toBeNull()
    setStoredToken('my-test-token')
    expect(getStoredToken()).toBe('my-test-token')
    removeStoredToken()
    expect(getStoredToken()).toBeNull()
  })

  it('lưu và lấy user info từ localStorage đúng chuẩn', () => {
    expect(getStoredUser()).toBeNull()
    setStoredUser(mockUser)
    expect(getStoredUser()).toEqual(mockUser)
    removeStoredUser()
    expect(getStoredUser()).toBeNull()
  })

  it('clearAuthStorage dọn dẹp sạch cả token và user', () => {
    setStoredToken('token-1')
    setStoredUser(mockUser)
    clearAuthStorage()
    expect(getStoredToken()).toBeNull()
    expect(getStoredUser()).toBeNull()
  })

  it('decodeJwt giải mã chính xác payload từ JWT token', () => {
    const payload = decodeJwt(sampleValidJwt)
    expect(payload).not.toBeNull()
    expect(payload?.sub).toBe('user-uuid-123')
    expect(payload?.email).toBe('admin@example.com')
    expect(payload?.role).toBe('admin')
    expect(payload?.iat).toBe(1000000000)
    expect(payload?.exp).toBe(1000086400)
  })

  it('decodeJwt trả về null với token rỗng hoặc không đúng định dạng', () => {
    expect(decodeJwt(null)).toBeNull()
    expect(decodeJwt('')).toBeNull()
    expect(decodeJwt('invalid-token-no-dots')).toBeNull()
    expect(decodeJwt('header.not_base64_json.sig')).toBeNull()
  })

  it('getTokenSessionMeta tính toán chính xác thời hạn và phần trăm còn lại khi token hợp lệ', () => {
    // Giả lập thời gian hiện tại là 12h sau iat (còn lại 12h trên tổng 24h = 50%)
    const nowMs = (1000000000 + 43200) * 1000
    vi.useFakeTimers()
    vi.setSystemTime(new Date(nowMs))

    const meta = getTokenSessionMeta(sampleValidJwt)
    expect(meta.isValid).toBe(true)
    expect(meta.isExpired).toBe(false)
    expect(meta.remainingSeconds).toBe(43200) // 12 hours
    expect(meta.percentRemaining).toBe(50)
    expect(meta.remainingFormatted).toContain('Còn lại ~12 giờ 0 phút')
    expect(meta.issuedAt?.getTime()).toBe(1000000000 * 1000)
    expect(meta.expiresAt?.getTime()).toBe(1000086400 * 1000)
  })

  it('getTokenSessionMeta trả về trạng thái hết hạn khi thời gian hiện tại vượt qua exp', () => {
    // Giả lập thời gian hiện tại là sau exp
    const nowMs = (1000086400 + 100) * 1000
    vi.useFakeTimers()
    vi.setSystemTime(new Date(nowMs))

    const meta = getTokenSessionMeta(sampleValidJwt)
    expect(meta.isValid).toBe(false)
    expect(meta.isExpired).toBe(true)
    expect(meta.remainingSeconds).toBe(0)
    expect(meta.percentRemaining).toBe(0)
    expect(meta.remainingFormatted).toBe('Đã hết hạn')
  })

  it('getTokenSessionMeta trả về trạng thái không hợp lệ với token null', () => {
    const meta = getTokenSessionMeta(null)
    expect(meta.isValid).toBe(false)
    expect(meta.isExpired).toBe(true)
    expect(meta.payload).toBeNull()
    expect(meta.remainingFormatted).toBe('Không hợp lệ hoặc không có token')
  })
})
