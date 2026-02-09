import type { NewsAnalysis } from '@/services/types';

interface NewsAnalysisSectionProps {
  newsAnalysis?: NewsAnalysis;
}

const sentimentConfig: Record<string, { bg: string; text: string; label: string }> = {
  '긍정': { bg: 'bg-emerald-100', text: 'text-emerald-700', label: '긍정' },
  '중립': { bg: 'bg-gray-100', text: 'text-gray-600', label: '중립' },
  '부정': { bg: 'bg-red-100', text: 'text-red-700', label: '부정' },
};

export function NewsAnalysisSection({ newsAnalysis }: NewsAnalysisSectionProps) {
  if (!newsAnalysis) return null;

  const sentiment = sentimentConfig[newsAnalysis.sentiment] || sentimentConfig['중립'];

  return (
    <div className="mt-2 md:mt-3 pt-2 md:pt-3 border-t border-border-light">
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-[0.65rem] md:text-xs font-semibold text-text-muted">재료분석</span>
        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[0.6rem] md:text-[0.65rem] font-semibold ${sentiment.bg} ${sentiment.text}`}>
          {sentiment.label}
        </span>
      </div>
      {newsAnalysis.catalyst && (
        <p className="text-[0.7rem] md:text-xs text-text-secondary leading-relaxed mb-1.5">
          {newsAnalysis.catalyst}
        </p>
      )}
      {newsAnalysis.key_news && newsAnalysis.key_news.length > 0 && (
        <ul className="space-y-0.5">
          {newsAnalysis.key_news.slice(0, 5).map((news, idx) => (
            <li key={idx} className="text-[0.65rem] md:text-xs text-text-muted leading-relaxed flex items-start gap-1">
              <span className="text-text-muted/50 mt-0.5 flex-shrink-0">·</span>
              <span>{news}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
