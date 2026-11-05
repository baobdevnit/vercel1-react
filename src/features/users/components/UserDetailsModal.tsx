import React, { useEffect, useState } from 'react'
import {
  X,
  Mail,
  Calendar,
  Clock,
  Key,
  Copy,
  Check,
  Code,
  ShieldCheck,
  UserCheck,
} from 'lucide-react'
import { Badge, Button, Avatar, AvatarFallback } from '@/components/ui'
import type { User } from '@/types/api'

interface UserDetailsModalProps {
  user: User | null
  isOpen: boolean
  onClose: () => void
}

export const UserDetailsModal: React.FC<UserDetailsModalProps> = ({ user, isOpen, onClose }) => {
  const [copiedId, setCopiedId] = useState(false)
  const [copiedEmail, setCopiedEmail] = useState(false)
  const [copiedJson, setCopiedJson] = useState(false)
  const [showJson, setShowJson] = useState(false)

  // Đóng modal khi bấm ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen || !user) return null

  const handleCopy = async (text: string, type: 'id' | 'email' | 'json') => {
    try {
      await navigator.clipboard.writeText(text)
      if (type === 'id') {
        setCopiedId(true)
        setTimeout(() => setCopiedId(false), 2000)
      } else if (type === 'email') {
        setCopiedEmail(true)
        setTimeout(() => setCopiedEmail(false), 2000)
      } else if (type === 'json') {
        setCopiedJson(true)
        setTimeout(() => setCopiedJson(false), 2000)
      }
    } catch (err) {
      console.error('Không thể sao chép:', err)
    }
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—'
    const date = new Date(dateStr)
    return date.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const isAdmin = user.role === 'admin'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs transition-opacity duration-200 font-sans"
      role="dialog"
      aria-modal="true"
      aria-labelledby="user-details-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white/95 dark:bg-zinc-950/95 rounded-2xl shadow-xl border border-zinc-200/60 dark:border-zinc-800/50 overflow-hidden transform transition-all max-h-[90vh] flex flex-col backdrop-blur-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="relative px-6 pt-6 pb-4 bg-zinc-50/50 dark:bg-zinc-900/30 border-b border-zinc-100 dark:border-zinc-800/40">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-zinc-900 rounded-lg hover:bg-zinc-200/70 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800/70 transition-colors"
            aria-label="Đóng modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <Avatar className="w-14 h-14 shrink-0 rounded-xl shadow-xs ring-1 ring-zinc-200/80 dark:ring-zinc-700/60">
              <AvatarFallback
                className={`w-full h-full text-xl font-bold rounded-xl ${
                  isAdmin
                    ? 'bg-purple-100/80 text-purple-900 border border-purple-200/50 dark:bg-purple-950/60 dark:text-purple-200 dark:border-purple-800/40'
                    : 'bg-zinc-100/80 text-zinc-800 border border-zinc-200/50 dark:bg-zinc-800/60 dark:text-zinc-200 dark:border-zinc-700/40'
                }`}
              >
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 pr-6">
              <div className="flex items-center gap-2 flex-wrap">
                <h3
                  id="user-details-title"
                  className="text-lg font-bold text-zinc-900 dark:text-zinc-100 truncate"
                >
                  {user.name}
                </h3>
                <Badge variant={isAdmin ? 'admin' : 'user'} dot size="sm">
                  {user.role}
                </Badge>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 font-mono mt-0.5 truncate">
                {user.email}
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* ID */}
            <div className="p-3 rounded-xl bg-zinc-50/60 dark:bg-zinc-900/30 border border-zinc-200/40 dark:border-zinc-800/30">
              <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400 mb-1">
                <span className="flex items-center gap-1.5 font-medium">
                  <Key className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                  Mã Định Danh (UUID)
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(user.id, 'id')}
                  className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
                  title="Sao chép ID"
                >
                  {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <p className="font-mono text-xs font-semibold text-zinc-900 dark:text-zinc-200 break-all select-all">
                {user.id}
              </p>
            </div>

            {/* Email */}
            <div className="p-3 rounded-xl bg-zinc-50/60 dark:bg-zinc-900/30 border border-zinc-200/40 dark:border-zinc-800/30">
              <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400 mb-1">
                <span className="flex items-center gap-1.5 font-medium">
                  <Mail className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                  Địa Chỉ Email
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(user.email, 'email')}
                  className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
                  title="Sao chép Email"
                >
                  {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <p className="text-xs font-mono font-semibold text-zinc-900 dark:text-zinc-200 truncate select-all">
                {user.email}
              </p>
            </div>

            {/* Created At */}
            <div className="p-3 rounded-xl bg-zinc-50/60 dark:bg-zinc-900/30 border border-zinc-200/40 dark:border-zinc-800/30">
              <div className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400 mb-1 font-medium">
                <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Ngày Đăng Ký
              </div>
              <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-300">
                {formatDate(user.createdAt)}
              </p>
            </div>

            {/* Updated At */}
            <div className="p-3 rounded-xl bg-zinc-50/60 dark:bg-zinc-900/30 border border-zinc-200/40 dark:border-zinc-800/30">
              <div className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400 mb-1 font-medium">
                <Clock className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                Cập Nhật Gần Nhất
              </div>
              <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-300">
                {formatDate(user.updatedAt)}
              </p>
            </div>
          </div>

          {/* Role & Permissions Note */}
          <div className="p-3.5 rounded-xl bg-zinc-50/60 dark:bg-zinc-900/30 border border-zinc-200/40 dark:border-zinc-800/30 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-900 dark:text-zinc-100">
              {isAdmin ? (
                <>
                  <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span>Quyền Hạn: Quản Trị Viên Hệ Thống (Administrator)</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                  <span>Quyền Hạn: Người Dùng Tiêu Chuẩn (Standard Member)</span>
                </>
              )}
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {isAdmin
                ? 'Tài khoản có toàn quyền truy cập quản trị hệ thống, bao gồm xem danh sách toàn bộ người dùng từ Supabase, giám sát tình trạng máy chủ và cấu hình hệ thống.'
                : 'Tài khoản thành viên tiêu chuẩn, có quyền truy cập tổng quan cá nhân, xem và cập nhật hồ sơ cá nhân và theo dõi trạng thái sức khỏe dịch vụ công khai.'}
            </p>
          </div>

          {/* Raw JSON toggle */}
          <div>
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowJson(!showJson)}
                className="flex items-center gap-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
              >
                <Code className="w-3.5 h-3.5" />
                {showJson ? 'Ẩn đối tượng JSON thô' : 'Xem chi tiết đối tượng JSON thô'}
              </button>

              {showJson && (
                <button
                  type="button"
                  onClick={() => handleCopy(JSON.stringify(user, null, 2), 'json')}
                  className="flex items-center gap-1 text-[11px] text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 font-medium hover:underline"
                >
                  {copiedJson ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      Đã chép!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      Sao chép JSON
                    </>
                  )}
                </button>
              )}
            </div>

            {showJson && (
              <pre className="mt-2 p-3 rounded-lg bg-zinc-50/70 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-200 text-[11px] font-mono overflow-x-auto max-h-40 border border-zinc-200/40 dark:border-zinc-800/30">
                {JSON.stringify(user, null, 2)}
              </pre>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-zinc-50/50 dark:bg-zinc-900/30 border-t border-zinc-100 dark:border-zinc-800/40 flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </div>
    </div>
  )
}
