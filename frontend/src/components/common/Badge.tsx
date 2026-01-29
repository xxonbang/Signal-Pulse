import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
}

export function Badge({ children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'bg-bg-secondary border border-border px-3 py-1.5 rounded-full text-xs text-text-secondary font-medium',
        className
      )}
    >
      {children}
    </span>
  );
}
