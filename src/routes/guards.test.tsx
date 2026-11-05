import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth.store'
import { ProtectedRoute } from './ProtectedRoute'
import { AdminRoute } from './AdminRoute'
import { PublicOnlyRoute } from './PublicOnlyRoute'
import type { User } from '@/types/api'

// Helper mock user
const normalUser: User = {
  id: 'user-001',
  name: 'Normal User',
  email: 'user@example.com',
  role: 'user',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

const adminUser: User = {
  id: 'admin-001',
  name: 'Admin User',
  email: 'admin@example.com',
  role: 'admin',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

describe('Route Guards Suite', () => {
  beforeEach(() => {
    useAuthStore.getState().clearAuth()
  })

  describe('ProtectedRoute', () => {
    it('Chuyển hướng về /login khi người dùng chưa xác thực', () => {
      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <Routes>
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <div data-testid="dashboard-content">Dashboard Protected</div>
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<div data-testid="login-page">Trang Login</div>} />
          </Routes>
        </MemoryRouter>,
      )

      expect(screen.getByTestId('login-page')).toBeDefined()
      expect(screen.queryByTestId('dashboard-content')).toBeNull()
    })

    it('Cho phép truy cập khi người dùng đã đăng nhập', () => {
      useAuthStore.getState().setAuth(normalUser, 'mock-jwt-token')

      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <Routes>
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <div data-testid="dashboard-content">Dashboard Protected</div>
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<div data-testid="login-page">Trang Login</div>} />
          </Routes>
        </MemoryRouter>,
      )

      expect(screen.getByTestId('dashboard-content')).toBeDefined()
      expect(screen.queryByTestId('login-page')).toBeNull()
    })
  })

  describe('AdminRoute', () => {
    it('Chuyển hướng về /login khi chưa đăng nhập', () => {
      render(
        <MemoryRouter initialEntries={['/admin/users']}>
          <Routes>
            <Route
              path="/admin/users"
              element={
                <AdminRoute>
                  <div data-testid="admin-content">Admin Area</div>
                </AdminRoute>
              }
            />
            <Route path="/login" element={<div data-testid="login-page">Trang Login</div>} />
            <Route
              path="/unauthorized"
              element={<div data-testid="unauthorized-page">Trang 403</div>}
            />
          </Routes>
        </MemoryRouter>,
      )

      expect(screen.getByTestId('login-page')).toBeDefined()
      expect(screen.queryByTestId('admin-content')).toBeNull()
    })

    it('Chặn người dùng thường (role: user) và chuyển hướng về /unauthorized (403)', () => {
      useAuthStore.getState().setAuth(normalUser, 'mock-jwt-token')

      render(
        <MemoryRouter initialEntries={['/admin/users']}>
          <Routes>
            <Route
              path="/admin/users"
              element={
                <AdminRoute>
                  <div data-testid="admin-content">Admin Area</div>
                </AdminRoute>
              }
            />
            <Route
              path="/unauthorized"
              element={<div data-testid="unauthorized-page">Trang 403 Forbidden</div>}
            />
          </Routes>
        </MemoryRouter>,
      )

      expect(screen.getByTestId('unauthorized-page')).toBeDefined()
      expect(screen.queryByTestId('admin-content')).toBeNull()
    })

    it('Cho phép người dùng có vai trò admin truy cập', () => {
      useAuthStore.getState().setAuth(adminUser, 'mock-jwt-token')

      render(
        <MemoryRouter initialEntries={['/admin/users']}>
          <Routes>
            <Route
              path="/admin/users"
              element={
                <AdminRoute>
                  <div data-testid="admin-content">Admin Area Content</div>
                </AdminRoute>
              }
            />
            <Route
              path="/unauthorized"
              element={<div data-testid="unauthorized-page">Trang 403 Forbidden</div>}
            />
          </Routes>
        </MemoryRouter>,
      )

      expect(screen.getByTestId('admin-content')).toBeDefined()
      expect(screen.queryByTestId('unauthorized-page')).toBeNull()
    })
  })

  describe('PublicOnlyRoute', () => {
    it('Cho phép người dùng chưa đăng nhập truy cập trang login', () => {
      render(
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route
              path="/login"
              element={
                <PublicOnlyRoute>
                  <div data-testid="public-login">Login Form</div>
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/dashboard"
              element={<div data-testid="dashboard-page">Dashboard</div>}
            />
          </Routes>
        </MemoryRouter>,
      )

      expect(screen.getByTestId('public-login')).toBeDefined()
      expect(screen.queryByTestId('dashboard-page')).toBeNull()
    })

    it('Chuyển hướng vào /dashboard khi người dùng đã đăng nhập truy cập /login', () => {
      useAuthStore.getState().setAuth(normalUser, 'mock-jwt-token')

      render(
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route
              path="/login"
              element={
                <PublicOnlyRoute>
                  <div data-testid="public-login">Login Form</div>
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/dashboard"
              element={<div data-testid="dashboard-page">Dashboard Page</div>}
            />
          </Routes>
        </MemoryRouter>,
      )

      expect(screen.getByTestId('dashboard-page')).toBeDefined()
      expect(screen.queryByTestId('public-login')).toBeNull()
    })
  })
})
