import type { AnalysisData, HistoryIndex } from './types';

const BASE_URL = import.meta.env.DEV ? '' : '.';

export async function fetchLatestData(): Promise<AnalysisData> {
  const response = await fetch(`${BASE_URL}/results/latest.json`);
  if (!response.ok) {
    throw new Error('Failed to fetch latest data');
  }
  return response.json();
}

export async function fetchHistoryData(filename: string): Promise<AnalysisData> {
  const response = await fetch(`${BASE_URL}/results/history/${filename}`);
  if (!response.ok) {
    throw new Error('Failed to fetch history data');
  }
  return response.json();
}

export async function fetchHistoryIndex(): Promise<HistoryIndex> {
  const response = await fetch(`${BASE_URL}/results/history_index.json`);
  if (!response.ok) {
    throw new Error('Failed to fetch history index');
  }
  return response.json();
}
