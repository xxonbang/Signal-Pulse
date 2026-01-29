import { Logo } from './Logo';

interface NavigationProps {
  activeSection?: string;
}

export function Navigation({ activeSection = 'results' }: NavigationProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-border z-50 px-4 md:px-6 pt-[env(safe-area-inset-top)]">
      <div className="max-w-[1200px] mx-auto flex justify-between items-center h-14 md:h-16">
        <Logo />
        <div className="hidden md:flex gap-1">
          <a
            href="#results"
            className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
              activeSection === 'results'
                ? 'text-accent-primary bg-bg-accent'
                : 'text-text-secondary hover:text-accent-primary hover:bg-bg-accent'
            }`}
          >
            분석 결과
          </a>
          <a
            href="#features"
            className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
              activeSection === 'features'
                ? 'text-accent-primary bg-bg-accent'
                : 'text-text-secondary hover:text-accent-primary hover:bg-bg-accent'
            }`}
          >
            기능
          </a>
        </div>
      </div>
    </nav>
  );
}
