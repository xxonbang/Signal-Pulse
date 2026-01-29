import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/uiStore';
import type { AnalysisTab } from '@/services/types';

const tabs: { key: AnalysisTab; label: string; icon: string }[] = [
  { key: 'vision', label: 'Vision AI 분석', icon: '🤖' },
  { key: 'api', label: '한투 API 분석', icon: '📊' },
  { key: 'combined', label: '분석종합', icon: '🔄' },
];

export function AnalysisTabs() {
  const { activeTab, setActiveTab } = useUIStore();

  return (
    <div className="flex gap-1 mb-6 bg-bg-secondary p-1 rounded-xl border border-border overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => setActiveTab(tab.key)}
          className={cn(
            'flex-1 min-w-fit py-3 px-4 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 whitespace-nowrap',
            activeTab === tab.key
              ? 'bg-accent-primary text-white'
              : 'text-text-muted hover:text-text-secondary hover:bg-bg-primary'
          )}
        >
          <span>{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </div>
  );
}
