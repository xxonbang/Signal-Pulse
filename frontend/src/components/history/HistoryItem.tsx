import { cn } from '@/lib/utils';
import type { HistoryItem as HistoryItemType } from '@/services/types';

interface HistoryItemProps {
  item: HistoryItemType;
  isToday: boolean;
  isActive: boolean;
  onClick: () => void;
}

export function HistoryItem({ item, isToday, isActive, onClick }: HistoryItemProps) {
  const buyCount = (item.signals['적극매수'] || 0) + (item.signals['매수'] || 0);
  const sellCount = (item.signals['적극매도'] || 0) + (item.signals['매도'] || 0);
  const neutralCount = item.signals['중립'] || 0;

  return (
    <div
      onClick={onClick}
      className={cn(
        'p-3.5 rounded-xl cursor-pointer transition-all mb-2 border',
        isActive
          ? 'bg-bg-accent border-accent-primary'
          : 'border-transparent hover:bg-bg-primary'
      )}
    >
      <div className="font-bold text-sm text-text-primary mb-1.5 flex items-center gap-2">
        {item.date}
        {isToday && (
          <span className="bg-accent-primary text-white px-2 py-0.5 rounded-full text-[0.65rem] font-semibold">
            TODAY
          </span>
        )}
      </div>
      <div className="flex gap-1.5 flex-wrap">
        {buyCount > 0 && (
          <span className="text-[0.65rem] px-2 py-0.5 rounded-lg font-semibold bg-emerald-100 text-signal-buy">
            매수 {buyCount}
          </span>
        )}
        {neutralCount > 0 && (
          <span className="text-[0.65rem] px-2 py-0.5 rounded-lg font-semibold bg-amber-100 text-signal-neutral">
            중립 {neutralCount}
          </span>
        )}
        {sellCount > 0 && (
          <span className="text-[0.65rem] px-2 py-0.5 rounded-lg font-semibold bg-red-100 text-signal-sell">
            매도 {sellCount}
          </span>
        )}
      </div>
    </div>
  );
}
