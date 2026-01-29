import { useQuery } from '@tanstack/react-query';
import { fetchHistoryData } from '@/services/api';

export function useHistoryData(filename: string | null) {
  return useQuery({
    queryKey: ['history', filename],
    queryFn: () => fetchHistoryData(filename!),
    enabled: !!filename,
    staleTime: 1000 * 60 * 30, // 30 minutes (historical data doesn't change)
    retry: 2,
  });
}
