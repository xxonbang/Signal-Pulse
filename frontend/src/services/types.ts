export type SignalType = '적극매수' | '매수' | '중립' | '매도' | '적극매도';

export type MarketType = 'all' | 'kospi' | 'kosdaq';

export type AnalysisTab = 'vision' | 'api' | 'combined';

export interface StockResult {
  code: string;
  name: string;
  signal: SignalType;
  reason: string;
  capture_time?: string;
  analysis_time?: string;
}

export interface AnalysisData {
  date: string;
  total_stocks: number;
  results: StockResult[];
}

export interface HistoryItem {
  date: string;
  filename: string;
  total_stocks: number;
  signals: Record<SignalType, number>;
}

export interface HistoryIndex {
  last_updated: string;
  total_records: number;
  retention_days: number;
  history: HistoryItem[];
}

export interface SignalCounts {
  적극매수: number;
  매수: number;
  중립: number;
  매도: number;
  적극매도: number;
}
