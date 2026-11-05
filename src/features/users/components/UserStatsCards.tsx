import React from 'react'
import { Users, ShieldCheck, UserCheck, Filter } from 'lucide-react'
import { Card, CardContent, Badge, Skeleton } from '@/components/ui'
import type { UserStats } from '@/features/users/hooks/useUsers'

interface UserStatsCardsProps {
  stats: UserStats
  isLoading?: boolean
}

export const UserStatsCards: React.FC<UserStatsCardsProps> = ({ stats, isLoading = false }) => {
  const cards = [
    {
      title: 'Tổng Thành Viên',
      value: stats.totalUsers,
      subtitle: 'Tài khoản đăng ký hệ thống',
      icon: Users,
      iconBg: 'bg-zinc-100/80 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-200 border border-zinc-200/50 dark:border-zinc-700/40',
      badge: <Badge variant="default" size="sm">Toàn bộ</Badge>,
    },
    {
      title: 'Quản Trị Viên',
      value: stats.adminCount,
      subtitle: 'Tài khoản có quyền Admin',
      icon: ShieldCheck,
      iconBg: 'bg-purple-100/80 dark:bg-purple-950/40 text-purple-800 dark:text-purple-200 border border-purple-200/50 dark:border-purple-800/40',
      badge: <Badge variant="admin" size="sm" dot>Admin</Badge>,
    },
    {
      title: 'Người Dùng Tiêu Chuẩn',
      value: stats.userCount,
      subtitle: 'Tài khoản thành viên thường',
      icon: UserCheck,
      iconBg: 'bg-emerald-100/80 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/40',
      badge: <Badge variant="user" size="sm" dot>User</Badge>,
    },
    {
      title: 'Hiển Thị Hiện Tại',
      value: stats.filteredCount,
      subtitle: stats.totalUsers > 0
        ? `Chiếm ${Math.round((stats.filteredCount / stats.totalUsers) * 100)}% tổng danh sách`
        : '0%',
      icon: Filter,
      iconBg: 'bg-zinc-100/80 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 border border-zinc-200/50 dark:border-zinc-700/40',
      badge: (
        <Badge variant={stats.filteredCount === stats.totalUsers ? 'pass' : 'warn'} size="sm">
          {stats.filteredCount === stats.totalUsers ? 'Toàn bộ' : 'Đang lọc'}
        </Badge>
      ),
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-sans">
      {cards.map((card, idx) => (
        <Card key={idx} className="relative overflow-hidden hover:border-zinc-300/80 dark:hover:border-zinc-700/60 hover:shadow-sm transition-all duration-200">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                {card.title}
              </span>
              {card.badge}
            </div>

            <div className="mt-3 flex items-baseline justify-between">
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                  {card.value}
                </div>
              )}

              <div className={`p-2 rounded-lg ${card.iconBg} shrink-0`}>
                <card.icon className="w-4 h-4" />
              </div>
            </div>

            <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400 truncate">
              {card.subtitle}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
