import { useQuery } from '@tanstack/react-query';
import { fetchLatestData } from '@/services/api';

export function useVisionData() {
  return useQuery({
    queryKey: ['vision', 'latest'],
    queryFn: fetchLatestData,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
}
