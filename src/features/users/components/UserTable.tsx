import React, { useState } from 'react'
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  Copy,
  Check,
  SearchX,
  Calendar,
  AlertCircle,
} from 'lucide-react'
import { Badge, Button, Skeleton, Avatar, AvatarFallback } from '@/components/ui'
import type { User } from '@/types/api'
import type { SortField, SortOrder } from '@/features/users/hooks/useUsers'

interface UserTableProps {
  users: User[]
  isLoading: boolean
  error: unknown
  sortBy: SortField
  sortOrder: SortOrder
  onToggleSort: (field: SortField) => void
  onSelectUser: (user: User) => void
  onResetFilters: () => void
  onRetry: () => void
  searchQuery?: string
}

export const UserTable: React.FC<UserTableProps> = ({
  users,
  isLoading,
  error,
  sortBy,
  sortOrder,
  onToggleSort,
  onSelectUser,
  onResetFilters,
  onRetry,
  searchQuery,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleCopyId = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(id)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 1800)
    } catch (err) {
      console.error('Không thể sao chép ID:', err)
    }
  }

  const renderSortIcon = (field: SortField) => {
    if (sortBy !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300" />
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-zinc-100" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-zinc-100" />
    )
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  // 1. Trạng thái lỗi (Error State)
  if (error && !isLoading) {
    return (
      <div className="p-8 text-center space-y-3 font-sans">
        <div className="inline-flex p-3 rounded-md bg-red-950/60 border border-red-800 text-red-400">
          <AlertCircle className="w-7 h-7" />
        </div>
        <div>
          <h3 className="text-base font-bold text-zinc-100">
            Không thể tải danh sách người dùng
          </h3>
          <p className="text-xs text-red-300 mt-1 max-w-md mx-auto leading-relaxed">
            Máy chủ từ chối hoặc gặp sự cố khi kết nối. Hãy chắc chắn rằng tài khoản của bạn có quyền Quản trị viên (Admin).
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onRetry}>
          Thử Lại Ngay
        </Button>
      </div>
    )
  }

  // 2. Trạng thái Skeleton Loading
  if (isLoading) {
    return (
      <div className="p-6 space-y-4 font-sans">
        {[1, 2, 3, 4, 5].map((idx) => (
          <div key={idx} className="flex items-center justify-between gap-4 py-2 border-b border-zinc-800">
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-md" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
            <Skeleton className="h-6 w-16 rounded-md" />
            <Skeleton className="h-4 w-24 hidden md:block" />
            <Skeleton className="h-4 w-28 hidden lg:block" />
            <Skeleton className="h-8 w-20 rounded-md" />
          </div>
        ))}
      </div>
    )
  }

  // 3. Trạng thái không có kết quả (Empty State)
  if (users.length === 0) {
    return (
      <div className="p-12 text-center space-y-4 font-sans">
        <div className="inline-flex p-4 rounded-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400">
          <SearchX className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            Không tìm thấy người dùng nào
          </h3>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-sm mx-auto">
            {searchQuery
              ? `Không có kết quả nào phù hợp với từ khóa "${searchQuery}". Hãy thử tìm kiếm bằng tên, email hoặc UUID khác.`
              : 'Hiện không có người dùng nào trong danh mục lọc đã chọn.'}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onResetFilters}>
          Xóa Bộ Lọc
        </Button>
      </div>
    )
  }

  return (
    <div className="font-sans">
      {/* Desktop / Tablet Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50/60 dark:bg-zinc-900/40 border-b border-zinc-100 dark:border-zinc-800/40 text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-medium">
            <tr>
              <th scope="col" className="px-6 py-3.5">
                <button
                  type="button"
                  onClick={() => onToggleSort('name')}
                  className="flex items-center gap-1.5 hover:text-zinc-900 dark:hover:text-zinc-200 group transition-colors"
                >
                  <span>Thành Viên</span>
                  {renderSortIcon('name')}
                </button>
              </th>

              <th scope="col" className="px-6 py-3.5">
                <button
                  type="button"
                  onClick={() => onToggleSort('role')}
                  className="flex items-center gap-1.5 hover:text-zinc-900 dark:hover:text-zinc-200 group transition-colors"
                >
                  <span>Vai Trò</span>
                  {renderSortIcon('role')}
                </button>
              </th>

              <th scope="col" className="px-6 py-3.5">
                <button
                  type="button"
                  onClick={() => onToggleSort('createdAt')}
                  className="flex items-center gap-1.5 hover:text-zinc-900 dark:hover:text-zinc-200 group transition-colors"
                >
                  <span>Ngày Đăng Ký</span>
                  {renderSortIcon('createdAt')}
                </button>
              </th>

              <th scope="col" className="px-6 py-3.5">
                Mã ID (UUID)
              </th>

              <th scope="col" className="px-6 py-3.5 text-right">
                Hành Động
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/30 text-zinc-700 dark:text-zinc-300">
            {users.map((u) => {
              const isAdmin = u.role === 'admin'

              return (
                <tr
                  key={u.id}
                  onClick={() => onSelectUser(u)}
                  className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer group"
                >
                  {/* Thành viên (Avatar + Tên + Email) */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-9 h-9 shrink-0 rounded-md ring-1 ring-zinc-300 dark:ring-zinc-700">
                        <AvatarFallback
                          className={`w-full h-full text-xs font-semibold rounded-md shadow-xs ${
                            isAdmin
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200 border border-purple-200 dark:border-purple-800/60'
                              : 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700'
                          }`}
                        >
                          {u.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="font-medium text-zinc-900 dark:text-zinc-100 group-hover:text-black dark:group-hover:text-white transition-colors truncate">
                          {u.name}
                        </div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-400 font-mono truncate">
                          {u.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Vai trò */}
                  <td className="px-6 py-4">
                    <Badge variant={isAdmin ? 'admin' : 'user'} dot>
                      {u.role}
                    </Badge>
                  </td>

                  {/* Ngày đăng ký */}
                  <td className="px-6 py-4 text-xs text-zinc-400 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{formatDate(u.createdAt)}</span>
                    </div>
                  </td>

                  {/* UUID */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[11px] text-zinc-400 truncate max-w-[110px]">
                        {u.id}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleCopyId(u.id, e)}
                        className="text-zinc-500 hover:text-zinc-200 p-1 rounded-sm transition-colors"
                        title="Sao chép ID"
                        aria-label="Sao chép ID"
                      >
                        {copiedId === u.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </td>

                  {/* Hành động */}
                  <td className="px-6 py-4 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        onSelectUser(u)
                      }}
                      className="text-xs text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      iconPrefix={<Eye className="w-3.5 h-3.5" />}
                    >
                      Chi tiết
                    </Button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View (Dành cho màn hình nhỏ) */}
      <div className="block md:hidden divide-y divide-zinc-100 dark:divide-zinc-800/30">
        {users.map((u) => {
          const isAdmin = u.role === 'admin'

          return (
            <div
              key={u.id}
              onClick={() => onSelectUser(u)}
              className="p-4 space-y-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 cursor-pointer transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar className="w-9 h-9 shrink-0 rounded-md ring-1 ring-zinc-300 dark:ring-zinc-700">
                    <AvatarFallback
                      className={`w-full h-full text-xs font-semibold shrink-0 rounded-md ${
                        isAdmin
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200'
                          : 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200'
                      }`}
                    >
                      {u.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="font-medium text-sm text-zinc-900 dark:text-zinc-100 truncate">
                      {u.name}
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 font-mono truncate">
                      {u.email}
                    </div>
                  </div>
                </div>

                <Badge variant={isAdmin ? 'admin' : 'user'} dot size="sm">
                  {u.role}
                </Badge>
              </div>

              <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 pt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                  {formatDate(u.createdAt)}
                </span>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onSelectUser(u)
                  }}
                  className="h-7 px-2 text-xs text-zinc-300"
                  iconPrefix={<Eye className="w-3 h-3" />}
                >
                  Xem
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
