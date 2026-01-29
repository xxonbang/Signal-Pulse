import { Badge } from '@/components/common';

export function Hero() {
  return (
    <section className="text-center py-8 md:py-12">
      <h1 className="text-2xl md:text-4xl font-bold mb-3 text-text-primary">
        AI Vision{' '}
        <span className="bg-gradient-to-br from-accent-primary to-accent-secondary bg-clip-text text-transparent">
          Stock Signal
        </span>{' '}
        Analyzer
      </h1>
      <p className="text-base text-text-secondary max-w-xl mx-auto mb-5">
        Gemini 2.5 Flash Vision API를 활용하여 국내 주식 거래량 상위 120개 종목을 자동으로 분석합니다.
      </p>
      <div className="flex justify-center gap-2 flex-wrap">
        <Badge>🤖 Gemini 2.5 Flash</Badge>
        <Badge>📸 Playwright</Badge>
        <Badge>🇰🇷 KOSPI 50 + KOSDAQ 70</Badge>
        <Badge>⚡ 배치 분석</Badge>
      </div>
    </section>
  );
}
