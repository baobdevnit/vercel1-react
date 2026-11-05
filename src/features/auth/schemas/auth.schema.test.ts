import { describe, it, expect } from 'vitest'
import { loginSchema, registerSchema } from './auth.schema'

describe('Auth Validation Schemas', () => {
  describe('loginSchema', () => {
    it('chấp nhận thông tin đăng nhập hợp lệ', () => {
      const result = loginSchema.safeParse({
        email: 'admin@example.com',
        password: 'Admin@123456',
      })
      expect(result.success).toBe(true)
    })

    it('báo lỗi khi để trống email', () => {
      const result = loginSchema.safeParse({
        email: '',
        password: 'Admin@123456',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Vui lòng nhập địa chỉ email.')
      }
    })

    it('báo lỗi khi email sai định dạng', () => {
      const result = loginSchema.safeParse({
        email: 'invalid-email-format',
        password: 'Admin@123456',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('không hợp lệ')
      }
    })

    it('báo lỗi khi mật khẩu ít hơn 6 ký tự', () => {
      const result = loginSchema.safeParse({
        email: 'admin@example.com',
        password: '123',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('tối thiểu 6 ký tự')
      }
    })
  })

  describe('registerSchema', () => {
    it('chấp nhận thông tin đăng ký hợp lệ', () => {
      const result = registerSchema.safeParse({
        name: 'Nguyễn Văn A',
        email: 'newuser@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      })
      expect(result.success).toBe(true)
    })

    it('báo lỗi khi tên quá ngắn (dưới 2 ký tự)', () => {
      const result = registerSchema.safeParse({
        name: 'A',
        email: 'newuser@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('tối thiểu 2 ký tự')
      }
    })

    it('báo lỗi khi mật khẩu xác nhận không khớp', () => {
      const result = registerSchema.safeParse({
        name: 'Nguyễn Văn A',
        email: 'newuser@example.com',
        password: 'Password123!',
        confirmPassword: 'Password999!',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const confirmError = result.error.issues.find((i) => i.path.includes('confirmPassword'))
        expect(confirmError?.message).toBe('Mật khẩu xác nhận không khớp với mật khẩu đã nhập.')
      }
    })

    it('báo lỗi khi mật khẩu dưới 6 ký tự', () => {
      const result = registerSchema.safeParse({
        name: 'Nguyễn Văn A',
        email: 'newuser@example.com',
        password: '12345',
        confirmPassword: '12345',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const passwordError = result.error.issues.find((i) => i.path.includes('password'))
        expect(passwordError?.message).toContain('tối thiểu 6 ký tự')
      }
    })
  })
})
