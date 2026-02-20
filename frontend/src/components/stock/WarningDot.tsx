import type { StockCriteria } from '@/services/types';

export function WarningDot({ criteria, className }: {
  criteria: StockCriteria | null | undefined;
  className?: string;
}) {
  let color: string;
  if (criteria?.short_selling_alert?.met) color = 'bg-red-500';
  else if (criteria?.overheating_alert?.met) color = 'bg-orange-500';
  else if (criteria?.reverse_ma_alert?.met) color = 'bg-violet-500';
  else return null;

  return (
    <span className={`absolute flex h-3 w-3 ${className || '-top-1 -right-1'}`}>
      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${color} opacity-75`} />
      <span className={`relative inline-flex rounded-full h-3 w-3 ${color}`} />
    </span>
  );
}
