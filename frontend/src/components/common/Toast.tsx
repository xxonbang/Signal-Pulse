import { useUIStore } from '@/store/uiStore';

export function Toast() {
  const { toast } = useUIStore();

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 300,
        pointerEvents: toast.isVisible ? 'auto' : 'none',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '10px 16px',
          backgroundColor: 'rgba(30, 41, 59, 0.95)',
          color: 'white',
          fontSize: '14px',
          fontWeight: 500,
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
          opacity: toast.isVisible ? 1 : 0,
          transition: 'opacity 0.3s ease-out',
        }}
      >
        {/* 체크 아이콘 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '20px',
            height: '20px',
            backgroundColor: '#10b981',
            borderRadius: '50%',
            flexShrink: 0,
          }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>

        {/* 메시지 */}
        <span style={{ whiteSpace: 'nowrap' }}>{toast.message}</span>
      </div>
    </div>
  );
}
