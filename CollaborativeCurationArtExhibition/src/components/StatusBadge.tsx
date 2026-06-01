import { cn } from '@/lib/utils';

type ExhibitionStatus = 'planning' | 'preparing' | 'installing' | 'open' | 'closed' | 'dismantling';
type ConfirmStatus = 'pending' | 'confirmed' | 'withdrawn';
type TransportStatus = 'shipped' | 'in_transit' | 'arrived' | 'unpacked' | 'hung' | 'dismantled' | 'returned';
type GuestCategory = 'vvip' | 'vip' | 'media' | 'general';
type CheckinStatus = 'not_checked_in' | 'checked_in';
type InviteStatus = 'pending' | 'sent' | 'accepted' | 'declined';
type MediaType = 'poster' | 'press_release' | 'other';

type StatusType =
  | ExhibitionStatus
  | ConfirmStatus
  | TransportStatus
  | GuestCategory
  | CheckinStatus
  | InviteStatus
  | MediaType;

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  planning: { label: '筹备中', className: 'bg-blue-500/20 text-blue-400' },
  preparing: { label: '准备中', className: 'bg-cyan-500/20 text-cyan-400' },
  installing: { label: '布展中', className: 'bg-purple-500/20 text-purple-400' },
  open: { label: '开放中', className: 'bg-green-500/20 text-green-400' },
  closed: { label: '已闭幕', className: 'bg-gray-500/20 text-gray-400' },
  dismantling: { label: '撤展中', className: 'bg-orange-500/20 text-orange-400' },
  pending: { label: '待确认', className: 'bg-yellow-500/20 text-yellow-400' },
  confirmed: { label: '已确认', className: 'bg-green-500/20 text-green-400' },
  withdrawn: { label: '已撤展', className: 'bg-red-500/20 text-red-400' },
  shipped: { label: '起运', className: 'bg-blue-500/20 text-blue-400' },
  in_transit: { label: '在途', className: 'bg-amber-500/20 text-amber-400' },
  arrived: { label: '抵达', className: 'bg-emerald-500/20 text-emerald-400' },
  unpacked: { label: '拆箱', className: 'bg-purple-500/20 text-purple-400' },
  hung: { label: '上墙', className: 'bg-gold/20 text-gold' },
  dismantled: { label: '拆展', className: 'bg-orange-500/20 text-orange-400' },
  returned: { label: '回运', className: 'bg-gray-500/20 text-gray-400' },
  vvip: { label: 'VVIP', className: 'bg-gold/20 text-gold' },
  vip: { label: 'VIP', className: 'bg-amber-500/20 text-amber-400' },
  media: { label: '媒体', className: 'bg-cyan-500/20 text-cyan-400' },
  general: { label: '普通', className: 'bg-gray-500/20 text-gray-400' },
  not_checked_in: { label: '未签到', className: 'bg-gray-500/20 text-gray-400' },
  checked_in: { label: '已签到', className: 'bg-green-500/20 text-green-400' },
  sent: { label: '已发送', className: 'bg-blue-500/20 text-blue-400' },
  accepted: { label: '已接受', className: 'bg-green-500/20 text-green-400' },
  declined: { label: '已拒绝', className: 'bg-red-500/20 text-red-400' },
  poster: { label: '海报', className: 'bg-gold/20 text-gold' },
  press_release: { label: '通稿', className: 'bg-cyan-500/20 text-cyan-400' },
  other: { label: '其他', className: 'bg-gray-500/20 text-gray-400' },
};

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, className: 'bg-gray-500/20 text-gray-400' };

  return (
    <span className={cn('status-badge', config.className, className)}>
      {config.label}
    </span>
  );
}
