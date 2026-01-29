import { EmptyState } from '@/components/common';

export function CombinedAnalysis() {
  return (
    <section id="combined-analysis" className="mb-10">
      <div className="flex justify-between items-center mb-5 flex-wrap gap-3">
        <div className="flex-1">
          <h2 className="text-xl font-bold text-text-primary mb-1">분석 종합</h2>
          <p className="text-sm text-text-muted">Vision AI와 API 분석 결과 비교 및 검증</p>
        </div>
      </div>

      <EmptyState
        icon="🔄"
        title="준비 중입니다"
        description="한국투자증권 API 연동이 완료되면 두 분석 소스를 비교하는 종합 뷰를 제공합니다."
      />

      <div className="mt-6 bg-bg-secondary border border-border rounded-2xl p-6">
        <h3 className="text-lg font-bold mb-4">종합 분석 기능</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-bg-primary rounded-xl">
            <div className="text-2xl mb-2">🎯</div>
            <h4 className="font-semibold mb-1">시그널 일치 검증</h4>
            <p className="text-sm text-text-muted">
              Vision AI와 API 분석 시그널이 일치하는 종목을 하이라이트합니다.
            </p>
          </div>
          <div className="p-4 bg-bg-primary rounded-xl">
            <div className="text-2xl mb-2">⚠️</div>
            <h4 className="font-semibold mb-1">불일치 경고</h4>
            <p className="text-sm text-text-muted">
              두 분석 결과가 상반될 경우 주의가 필요한 종목으로 표시합니다.
            </p>
          </div>
          <div className="p-4 bg-bg-primary rounded-xl">
            <div className="text-2xl mb-2">📈</div>
            <h4 className="font-semibold mb-1">신뢰도 점수</h4>
            <p className="text-sm text-text-muted">
              복수 소스 일치율에 따른 신뢰도 점수를 제공합니다.
            </p>
          </div>
          <div className="p-4 bg-bg-primary rounded-xl">
            <div className="text-2xl mb-2">📊</div>
            <h4 className="font-semibold mb-1">통합 대시보드</h4>
            <p className="text-sm text-text-muted">
              모든 분석 결과를 한눈에 확인할 수 있는 대시보드를 제공합니다.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
