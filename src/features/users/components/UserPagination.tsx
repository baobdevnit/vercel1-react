import React from 'react'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { Button } from '@/components/ui'

interface UserPaginationProps {
  page: number
  totalPages: number
  pageSize: number
  totalItems: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

export const UserPagination: React.FC<UserPaginationProps> = ({
  page,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
}) => {
  if (totalItems === 0) return null

  const startItem = Math.min((page - 1) * pageSize + 1, totalItems)
  const endItem = Math.min(page * pageSize, totalItems)

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      if (page > 3) pages.push('...')

      const start = Math.max(2, page - 1)
      const end = Math.min(totalPages - 1, page + 1)
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      if (page < totalPages - 2) pages.push('...')
      pages.push(totalPages)
    }
    return pages
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-6 py-4 border-t border-zinc-100 dark:border-zinc-800/40 bg-zinc-50/40 dark:bg-zinc-950/40 text-xs text-zinc-600 dark:text-zinc-400 font-sans">
      {/* Thông tin số lượng & Chọn Page Size */}
      <div className="flex items-center gap-3">
        <span>
          Hiển thị <strong className="font-semibold text-zinc-900 dark:text-zinc-200 font-mono">{startItem}</strong> -{' '}
          <strong className="font-semibold text-zinc-900 dark:text-zinc-200 font-mono">{endItem}</strong> trên{' '}
          <strong className="font-semibold text-zinc-900 dark:text-zinc-200 font-mono">{totalItems}</strong> người dùng
        </span>

        <div className="flex items-center gap-1.5 border-l border-zinc-200/60 dark:border-zinc-800/50 pl-3">
          <label htmlFor="page-size-select" className="text-zinc-600 dark:text-zinc-400 text-[11px]">
            Mỗi trang:
          </label>
          <select
            id="page-size-select"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="px-2 py-1 rounded-md border border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-200 text-xs focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {/* Điều hướng các trang */}
      <div className="flex items-center gap-1 self-center sm:self-auto">
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => onPageChange(1)}
          disabled={page <= 1}
          aria-label="Trang đầu"
          title="Trang đầu"
        >
          <ChevronsLeft className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Trang trước"
          title="Trang trước"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        {getPageNumbers().map((p, idx) =>
          typeof p === 'number' ? (
            <button
              key={idx}
              type="button"
              onClick={() => onPageChange(p)}
              className={`h-8 min-w-[32px] px-2 rounded-sm font-medium text-xs transition-colors ${
                p === page
                  ? 'bg-zinc-900 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 font-semibold shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              {p}
            </button>
          ) : (
            <span key={idx} className="px-1 text-zinc-400 dark:text-zinc-600">
              ...
            </span>
          ),
        )}

        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Trang sau"
          title="Trang sau"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => onPageChange(totalPages)}
          disabled={page >= totalPages}
          aria-label="Trang cuối"
          title="Trang cuối"
        >
          <ChevronsRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
