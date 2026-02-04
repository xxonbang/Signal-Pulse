import { StockTable } from './StockTable';
import { StockCard } from './StockCard';
import { useUIStore } from '@/store/uiStore';
import type { StockResult } from '@/services/types';

interface StockListProps {
  stocks: StockResult[];
}

export function StockList({ stocks }: StockListProps) {
  const { isCompactView } = useUIStore();

  return (
    <>
      {/* Desktop Table */}
      <StockTable stocks={stocks} isCompact={isCompactView} />

      {/* Mobile Cards */}
      <div className="md:hidden">
        {stocks.map((stock) => (
          <StockCard key={stock.code} stock={stock} isCompact={isCompactView} />
        ))}
      </div>
    </>
  );
}
