import { z } from 'zod'

/**
 * Schema xác thực cho Form Đăng nhập
 */
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Vui lòng nhập địa chỉ email.')
    .email('Định dạng email không hợp lệ (ví dụ: user@example.com).'),
  password: z
    .string()
    .min(1, 'Vui lòng nhập mật khẩu.')
    .min(6, 'Mật khẩu phải có tối thiểu 6 ký tự.'),
})

export type LoginFormData = z.infer<typeof loginSchema>

/**
 * Schema xác thực cho Form Đăng ký tài khoản mới
 */
export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Vui lòng nhập họ và tên.')
      .min(2, 'Họ và tên phải có tối thiểu 2 ký tự.')
      .max(100, 'Họ và tên không được vượt quá 100 ký tự.'),
    email: z
      .string()
      .trim()
      .min(1, 'Vui lòng nhập địa chỉ email.')
      .email('Định dạng email không hợp lệ (ví dụ: user@example.com).'),
    password: z
      .string()
      .min(1, 'Vui lòng nhập mật khẩu.')
      .min(6, 'Mật khẩu phải có tối thiểu 6 ký tự.'),
    confirmPassword: z
      .string()
      .min(1, 'Vui lòng nhập lại mật khẩu xác nhận.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp với mật khẩu đã nhập.',
    path: ['confirmPassword'],
  })

export type RegisterFormData = z.infer<typeof registerSchema>
