import { cn } from '@/lib/utils';
import type { SignalType } from '@/services/types';

interface SignalBadgeProps {
  signal: SignalType;
  size?: 'sm' | 'md';
  className?: string;
}

export function SignalBadge({ signal, size = 'md', className }: SignalBadgeProps) {
  const colorClasses: Record<SignalType, string> = {
    '적극매수': 'bg-emerald-100 text-signal-strong-buy',
    '매수': 'bg-emerald-100 text-signal-buy',
    '중립': 'bg-amber-100 text-signal-neutral',
    '매도': 'bg-orange-100 text-signal-sell',
    '적극매도': 'bg-red-100 text-signal-strong-sell',
  };

  const sizeClasses = {
    sm: 'px-1.5 py-0.5 rounded-lg text-[0.6rem] font-medium',
    md: 'px-2 md:px-3 py-0.5 md:py-1 rounded-2xl text-[0.65rem] md:text-xs font-semibold',
  };

  return (
    <span
      className={cn(
        'inline-block whitespace-nowrap',
        sizeClasses[size],
        colorClasses[signal],
        className
      )}
    >
      {signal}
    </span>
  );
}
