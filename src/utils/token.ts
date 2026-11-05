import type { User, UserRole } from '@/types/api'

export const ACCESS_TOKEN_KEY = 'access_token'
export const USER_INFO_KEY = 'user_info'

export interface JwtPayload {
  sub: string
  email: string
  name?: string
  role: UserRole
  iat: number
  exp: number
  [key: string]: unknown
}

export interface TokenSessionMeta {
  isValid: boolean
  isExpired: boolean
  payload: JwtPayload | null
  issuedAt: Date | null
  expiresAt: Date | null
  remainingSeconds: number
  remainingFormatted: string
  percentRemaining: number
}

/**
 * Lấy Access Token từ localStorage
 */
export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY)
  } catch (error) {
    console.error('Không thể truy xuất token từ localStorage:', error)
    return null
  }
}

/**
 * Lưu Access Token vào localStorage
 */
export function setStoredToken(token: string): void {
  try {
    localStorage.setItem(ACCESS_TOKEN_KEY, token)
  } catch (error) {
    console.error('Không thể lưu token vào localStorage:', error)
  }
}

/**
 * Xóa Access Token khỏi localStorage
 */
export function removeStoredToken(): void {
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
  } catch (error) {
    console.error('Không thể xóa token khỏi localStorage:', error)
  }
}

/**
 * Lấy thông tin User đã lưu trong localStorage
 */
export function getStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_INFO_KEY)
    if (!raw) return null
    return JSON.parse(raw) as User
  } catch (error) {
    console.error('Không thể parse dữ liệu user_info từ localStorage:', error)
    return null
  }
}

/**
 * Lưu thông tin User vào localStorage
 */
export function setStoredUser(user: User): void {
  try {
    localStorage.setItem(USER_INFO_KEY, JSON.stringify(user))
  } catch (error) {
    console.error('Không thể lưu user_info vào localStorage:', error)
  }
}

/**
 * Xóa thông tin User khỏi localStorage
 */
export function removeStoredUser(): void {
  try {
    localStorage.removeItem(USER_INFO_KEY)
  } catch (error) {
    console.error('Không thể xóa user_info khỏi localStorage:', error)
  }
}

/**
 * Xóa toàn bộ phiên xác thực (token + user)
 */
export function clearAuthStorage(): void {
  removeStoredToken()
  removeStoredUser()
}

/**
 * Giải mã Base64URL an toàn chuẩn UTF-8
 */
function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  while (base64.length % 4) {
    base64 += '='
  }

  try {
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    return new TextDecoder('utf-8').decode(bytes)
  } catch {
    return ''
  }
}

/**
 * Giải mã JWT Payload mà không cần thư viện ngoài
 */
export function decodeJwt<T = JwtPayload>(token: string | null): T | null {
  if (!token || typeof token !== 'string') return null

  try {
    const parts = token.split('.')
    if (parts.length < 2) return null

    const jsonString = base64UrlDecode(parts[1])
    if (!jsonString) return null

    return JSON.parse(jsonString) as T
  } catch {
    return null
  }
}

/**
 * Phân tích chi tiết phiên làm việc của JWT token (thời hạn 24h, thời gian còn lại, thời điểm hết hạn)
 */
export function getTokenSessionMeta(token: string | null): TokenSessionMeta {
  const payload = decodeJwt<JwtPayload>(token)

  if (!payload || !payload.exp) {
    return {
      isValid: false,
      isExpired: true,
      payload: null,
      issuedAt: null,
      expiresAt: null,
      remainingSeconds: 0,
      remainingFormatted: 'Không hợp lệ hoặc không có token',
      percentRemaining: 0,
    }
  }

  const nowSec = Math.floor(Date.now() / 1000)
  const expSec = payload.exp
  const iatSec = payload.iat || expSec - 86400 // Mặc định thời hạn 24h nếu iat thiếu
  const totalDuration = Math.max(1, expSec - iatSec)
  const remainingSeconds = Math.max(0, expSec - nowSec)
  const isExpired = remainingSeconds <= 0

  // Tính phần trăm thời gian còn lại (0 - 100%)
  const percentRemaining = isExpired
    ? 0
    : Math.min(100, Math.max(0, Math.round((remainingSeconds / totalDuration) * 100)))

  // Định dạng thời gian còn lại thân thiện với người dùng
  let remainingFormatted = 'Đã hết hạn'
  if (!isExpired) {
    const hours = Math.floor(remainingSeconds / 3600)
    const minutes = Math.floor((remainingSeconds % 3600) / 60)
    const seconds = remainingSeconds % 60

    if (hours > 0) {
      remainingFormatted = `Còn lại ~${hours} giờ ${minutes} phút`
    } else if (minutes > 0) {
      remainingFormatted = `Còn lại ~${minutes} phút ${seconds} giây`
    } else {
      remainingFormatted = `Còn lại ~${seconds} giây`
    }
  }

  return {
    isValid: !isExpired,
    isExpired,
    payload,
    issuedAt: payload.iat ? new Date(payload.iat * 1000) : null,
    expiresAt: new Date(expSec * 1000),
    remainingSeconds,
    remainingFormatted,
    percentRemaining,
  }
}
