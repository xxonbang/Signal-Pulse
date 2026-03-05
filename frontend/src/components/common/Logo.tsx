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
            <linearGradient id="logoFill" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1e3a8a"/>
              <stop offset="100%" stopColor="#2563eb"/>
            </linearGradient>
          </defs>
          {/* Layer 1 (back) */}
          <rect x="4" y="14" width="24" height="24" rx="6" fill="#bfdbfe" opacity="0.5"/>
          {/* Layer 2 (middle) */}
          <rect x="8" y="10" width="24" height="24" rx="6" fill="#60a5fa" opacity="0.45"/>
          {/* Layer 3 (front) */}
          <rect x="12" y="6" width="24" height="24" rx="6" fill="url(#logoFill)"/>
          {/* Pulse line */}
          <path d="M17 18 L21 18 L23 12 L25 24 L27 18 L31 18"
            stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.9"/>
        </svg>
      </div>
      <div className="flex flex-col leading-tight">
        <span className="text-lg font-extrabold tracking-tight bg-gradient-to-br from-[#1e3a8a] via-accent-primary to-accent-secondary bg-clip-text text-transparent">
          SignalPulse
        </span>
        <span className="text-[0.6rem] font-medium text-text-muted uppercase tracking-wider">
          AI Stock Signal Analyzer
        </span>
      </div>
    </a>
  );
}
