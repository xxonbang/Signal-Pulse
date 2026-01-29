import { EmptyState } from '@/components/common';

export function APIAnalysis() {
  return (
    <section id="api-analysis" className="mb-10">
      <div className="flex justify-between items-center mb-5 flex-wrap gap-3">
        <div className="flex-1">
          <h2 className="text-xl font-bold text-text-primary mb-1">한국투자증권 API 분석</h2>
          <p className="text-sm text-text-muted">실시간 API 기반 주식 데이터 분석</p>
        </div>
      </div>

      <EmptyState
        icon="🔧"
        title="준비 중입니다"
        description="한국투자증권 API 연동 기능은 현재 개발 중입니다. 향후 업데이트를 기대해 주세요."
      />

      <div className="mt-6 bg-bg-secondary border border-border rounded-2xl p-6">
        <h3 className="text-lg font-bold mb-4">예정된 기능</h3>
        <ul className="space-y-3 text-text-secondary">
          <li className="flex items-start gap-3">
            <span className="text-accent-primary">✓</span>
            <span>실시간 주가 데이터 조회</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-accent-primary">✓</span>
            <span>거래량 상위 종목 자동 추출</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-accent-primary">✓</span>
            <span>기술적 지표 기반 시그널 분석</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-accent-primary">✓</span>
            <span>Vision AI 분석과 교차 검증</span>
          </li>
        </ul>
      </div>
    </section>
  );
}
