import { StockTable } from './StockTable';
import { StockCard } from './StockCard';
import type { StockResult } from '@/services/types';

interface StockListProps {
  stocks: StockResult[];
}

export function StockList({ stocks }: StockListProps) {
  return (
    <>
      {/* Desktop Table */}
      <StockTable stocks={stocks} />

      {/* Mobile Cards */}
      <div className="md:hidden">
        {stocks.map((stock) => (
          <StockCard key={stock.code} stock={stock} />
        ))}
      </div>
    </>
  );
}
