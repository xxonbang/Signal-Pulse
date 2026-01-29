import { useQuery } from '@tanstack/react-query';
import { fetchHistoryIndex } from '@/services/api';

export function useHistoryIndex() {
  return useQuery({
    queryKey: ['history', 'index'],
    queryFn: fetchHistoryIndex,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
}
