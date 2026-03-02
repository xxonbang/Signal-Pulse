import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/uiStore';
import type { AnalysisTab } from '@/services/types';

const tabs: { key: AnalysisTab; label: string; shortLabel: string; icon: string }[] = [
  { key: 'vision', label: 'Vision AI 분석', shortLabel: 'Vision', icon: '🤖' },
  { key: 'api', label: '한투 API 분석', shortLabel: 'API', icon: '📊' },
  { key: 'combined', label: '분석종합', shortLabel: '종합', icon: '🔄' },
];

export function AnalysisTabs() {
  const { activeTab, setActiveTab } = useUIStore();

  return (
    <div className="mb-6">
      {/* 탭 버튼들 - 전체 너비 */}
      <div className="flex gap-1 bg-bg-secondary p-1 rounded-xl border border-border" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={activeTab === tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'flex-1 py-2.5 md:py-3 px-3 md:px-4 rounded-lg text-xs md:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 md:gap-2',
              activeTab === tab.key
                ? 'bg-accent-primary text-white'
                : 'text-text-muted hover:text-text-secondary hover:bg-bg-primary'
            )}
          >
            <span className="text-sm md:text-base">{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.shortLabel}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
