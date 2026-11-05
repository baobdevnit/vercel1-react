import { useState } from 'react'
import {
  Users,
  Search,
  RefreshCw,
  Download,
  X,
  FileSpreadsheet,
  FileCode,
  RotateCcw,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Badge,
} from '@/components/ui'
import { useUsers } from '@/features/users/hooks/useUsers'
import { UserStatsCards } from '@/features/users/components/UserStatsCards'
import { UserTable } from '@/features/users/components/UserTable'
import { UserPagination } from '@/features/users/components/UserPagination'
import { UserDetailsModal } from '@/features/users/components/UserDetailsModal'

export function UsersListPage() {
  const [showExportMenu, setShowExportMenu] = useState(false)

  const {
    users,
    paginatedUsers,
    stats,
    isLoading,
    isFetching,
    error,
    refetch,
    searchQuery,
    setSearchQuery,
    roleFilter,
    setRoleFilter,
    sortBy,
    sortOrder,
    toggleSort,
    resetFilters,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    selectedUser,
    setSelectedUser,
    exportToCsv,
    exportToJson,
  } = useUsers()

  const hasActiveFilters = searchQuery !== '' || roleFilter !== 'all'

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Quản Trị Người Dùng
            </h2>
            <Badge variant="admin">Admin Area</Badge>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Danh sách toàn bộ tài khoản đăng ký trên hệ thống, được đồng bộ trực tiếp từ cơ sở dữ liệu Supabase.
          </p>
        </div>

        {/* Top Actions: Refresh & Export */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Export Dropdown */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowExportMenu(!showExportMenu)}
              disabled={isLoading || users.length === 0}
              iconPrefix={<Download className="w-4 h-4 text-zinc-400" />}
            >
              Xuất Danh Sách
            </Button>

            {showExportMenu && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setShowExportMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-52 bg-white/95 dark:bg-zinc-950/95 rounded-xl shadow-lg border border-zinc-200/60 dark:border-zinc-800/50 py-1.5 z-30 text-xs backdrop-blur-md">
                  <button
                    type="button"
                    onClick={() => {
                      exportToCsv()
                      setShowExportMenu(false)
                    }}
                    className="w-full text-left px-3.5 py-2 flex items-center gap-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-zinc-100 transition-colors rounded-sm"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Xuất file Excel/CSV (.csv)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      exportToJson()
                      setShowExportMenu(false)
                    }}
                    className="w-full text-left px-3.5 py-2 flex items-center gap-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-zinc-100 transition-colors rounded-sm"
                  >
                    <FileCode className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                    <span>Xuất định dạng JSON (.json)</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            isLoading={isFetching}
            iconPrefix={<RefreshCw className="w-4 h-4 text-zinc-400" />}
          >
            Làm Mới
          </Button>
        </div>
      </div>

      {/* 4 Thẻ Thống Kê Tổng Quan */}
      <UserStatsCards stats={stats} isLoading={isLoading} />

      {/* Bảng Dữ Liệu & Bộ Lọc */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-4 border-b border-zinc-100 dark:border-zinc-800/40">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Tiêu đề & Đếm */}
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
              <CardTitle className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                Danh Sách Người Dùng ({stats.filteredCount})
              </CardTitle>
            </div>

            {/* Thanh Tìm Kiếm & Lọc Role */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Role filter pills */}
              <div className="inline-flex items-center p-1 rounded-lg bg-zinc-100/60 dark:bg-zinc-950/60 border border-zinc-200/50 dark:border-zinc-800/40 text-xs">
                <button
                  type="button"
                  onClick={() => setRoleFilter('all')}
                  className={`px-3 py-1 rounded-sm font-medium transition-colors ${
                    roleFilter === 'all'
                      ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  Tất cả ({stats.totalUsers})
                </button>
                <button
                  type="button"
                  onClick={() => setRoleFilter('admin')}
                  className={`px-3 py-1 rounded-sm font-medium transition-colors ${
                    roleFilter === 'admin'
                      ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  Admin ({stats.adminCount})
                </button>
                <button
                  type="button"
                  onClick={() => setRoleFilter('user')}
                  className={`px-3 py-1 rounded-sm font-medium transition-colors ${
                    roleFilter === 'user'
                      ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  User ({stats.userCount})
                </button>
              </div>

              {/* Ô tìm kiếm */}
              <div className="relative w-full sm:w-64">
                <Input
                  id="search-users-input"
                  placeholder="Tìm theo tên, email, UUID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  iconPrefix={<Search className="w-4 h-4 text-zinc-400" />}
                  className="text-xs pr-8"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-zinc-400 hover:text-zinc-200 rounded-sm"
                    title="Xóa tìm kiếm"
                    aria-label="Xóa tìm kiếm"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Nút reset bộ lọc nếu đang có filter */}
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="text-xs text-zinc-400 hover:text-zinc-200"
                  iconPrefix={<RotateCcw className="w-3.5 h-3.5" />}
                  title="Đặt lại bộ lọc"
                >
                  Xóa lọc
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Bảng Dữ Liệu */}
          <UserTable
            users={paginatedUsers}
            isLoading={isLoading}
            error={error}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onToggleSort={toggleSort}
            onSelectUser={(u) => setSelectedUser(u)}
            onResetFilters={resetFilters}
            onRetry={() => refetch()}
            searchQuery={searchQuery}
          />

          {/* Phân Trang */}
          {!isLoading && !error && (
            <UserPagination
              page={page}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={stats.filteredCount}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          )}
        </CardContent>
      </Card>

      {/* Modal Chi Tiết Người Dùng */}
      <UserDetailsModal
        user={selectedUser}
        isOpen={selectedUser !== null}
        onClose={() => setSelectedUser(null)}
      />
    </div>
  )
}
