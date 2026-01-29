import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Navigation } from '@/components/common';
import { Hero, AnalysisTabs, Footer } from '@/components/layout';
import { HistoryPanel } from '@/components/history';
import { VisionAnalysis, APIAnalysis, CombinedAnalysis } from '@/pages';
import { useUIStore } from '@/store/uiStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 2,
    },
  },
});

function FeaturesSection() {
  return (
    <section id="features" className="mb-10">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-text-primary">주요 기능</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-bg-secondary border border-border rounded-xl p-5 transition-all hover:border-accent-primary hover:shadow-md hover:-translate-y-0.5">
          <div className="w-11 h-11 rounded-lg bg-blue-100 flex items-center justify-center text-xl mb-3">
            📊
          </div>
          <h3 className="text-base font-bold mb-1.5">실시간 데이터 수집</h3>
          <p className="text-sm text-text-secondary leading-relaxed">
            네이버 증권 API에서 거래량 상위 120개 종목을 실시간으로 수집합니다.
          </p>
        </div>
        <div className="bg-bg-secondary border border-border rounded-xl p-5 transition-all hover:border-accent-primary hover:shadow-md hover:-translate-y-0.5">
          <div className="w-11 h-11 rounded-lg bg-cyan-100 flex items-center justify-center text-xl mb-3">
            📸
          </div>
          <h3 className="text-base font-bold mb-1.5">고해상도 스크린샷</h3>
          <p className="text-sm text-text-secondary leading-relaxed">
            Playwright로 각 종목의 상세 페이지를 고해상도로 캡처합니다.
          </p>
        </div>
        <div className="bg-bg-secondary border border-border rounded-xl p-5 transition-all hover:border-accent-primary hover:shadow-md hover:-translate-y-0.5">
          <div className="w-11 h-11 rounded-lg bg-teal-100 flex items-center justify-center text-xl mb-3">
            🤖
          </div>
          <h3 className="text-base font-bold mb-1.5">AI 배치 분석</h3>
          <p className="text-sm text-text-secondary leading-relaxed">
            120개 이미지를 한 번에 분석하여 API 효율을 극대화합니다.
          </p>
        </div>
        <div className="bg-bg-secondary border border-border rounded-xl p-5 transition-all hover:border-accent-primary hover:shadow-md hover:-translate-y-0.5">
          <div className="w-11 h-11 rounded-lg bg-amber-100 flex items-center justify-center text-xl mb-3">
            📈
          </div>
          <h3 className="text-base font-bold mb-1.5">5단계 시그널</h3>
          <p className="text-sm text-text-secondary leading-relaxed">
            적극매수부터 적극매도까지 5단계 시그널과 분석 근거를 제공합니다.
          </p>
        </div>
      </div>
    </section>
  );
}

function WorkflowSection() {
  return (
    <section className="bg-bg-secondary border border-border rounded-2xl p-6 mb-10">
      <h2 className="text-xl font-bold text-center mb-5">분석 워크플로우</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center relative">
          <div className="w-10 h-10 bg-gradient-to-br from-accent-primary to-accent-secondary rounded-full flex items-center justify-center mx-auto mb-2.5 text-white font-bold">
            1
          </div>
          <h4 className="text-sm font-bold mb-1">종목 수집</h4>
          <p className="text-xs text-text-muted">API로 상위 120개 종목</p>
          <span className="hidden md:block absolute top-5 right-0 translate-x-1/2 text-border">→</span>
        </div>
        <div className="text-center relative">
          <div className="w-10 h-10 bg-gradient-to-br from-accent-primary to-accent-secondary rounded-full flex items-center justify-center mx-auto mb-2.5 text-white font-bold">
            2
          </div>
          <h4 className="text-sm font-bold mb-1">스크린샷</h4>
          <p className="text-xs text-text-muted">풀스크린 캡처</p>
          <span className="hidden md:block absolute top-5 right-0 translate-x-1/2 text-border">→</span>
        </div>
        <div className="text-center relative">
          <div className="w-10 h-10 bg-gradient-to-br from-accent-primary to-accent-secondary rounded-full flex items-center justify-center mx-auto mb-2.5 text-white font-bold">
            3
          </div>
          <h4 className="text-sm font-bold mb-1">AI 분석</h4>
          <p className="text-xs text-text-muted">배치 이미지 분석</p>
          <span className="hidden md:block absolute top-5 right-0 translate-x-1/2 text-border">→</span>
        </div>
        <div className="text-center">
          <div className="w-10 h-10 bg-gradient-to-br from-accent-primary to-accent-secondary rounded-full flex items-center justify-center mx-auto mb-2.5 text-white font-bold">
            4
          </div>
          <h4 className="text-sm font-bold mb-1">리포트</h4>
          <p className="text-xs text-text-muted">결과 저장 (30일)</p>
        </div>
      </div>
    </section>
  );
}

function MainContent() {
  const { activeTab } = useUIStore();

  return (
    <>
      <AnalysisTabs />
      {activeTab === 'vision' && <VisionAnalysis />}
      {activeTab === 'api' && <APIAnalysis />}
      {activeTab === 'combined' && <CombinedAnalysis />}
    </>
  );
}

function AppContent() {
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <Navigation />
      <HistoryPanel />

      <main className="max-w-[1200px] mx-auto px-4 md:px-6 pt-20 md:pt-24 pb-10">
        <Hero />
        <MainContent />
        <FeaturesSection />
        <WorkflowSection />
      </main>

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
