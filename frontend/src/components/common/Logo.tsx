export function Logo() {
  return (
    <a
      href="#"
      onClick={(e) => { e.preventDefault(); window.location.reload(); }}
      className="flex items-center gap-2.5 no-underline cursor-pointer"
    >
      <div className="w-9 h-9 relative flex items-center justify-center">
        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e3a5f"/>
              <stop offset="50%" stopColor="#2563eb"/>
              <stop offset="100%" stopColor="#0891b2"/>
            </linearGradient>
          </defs>
          <rect x="2" y="2" width="36" height="36" rx="10" stroke="url(#logoGradient)" strokeWidth="2.5" fill="none"/>
          <path d="M10 26L16 20L22 24L30 14" stroke="url(#logoGradient)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="30" cy="14" r="3" fill="url(#logoGradient)"/>
        </svg>
      </div>
      <div className="flex flex-col leading-tight">
        <span className="text-lg font-extrabold tracking-tight bg-gradient-to-br from-[#1e3a5f] via-accent-primary to-accent-secondary bg-clip-text text-transparent">
          SignalPulse
        </span>
        <span className="text-[0.6rem] font-medium text-text-muted uppercase tracking-wider">
          AI Stock Signal Analyzer
        </span>
      </div>
    </a>
  );
}
