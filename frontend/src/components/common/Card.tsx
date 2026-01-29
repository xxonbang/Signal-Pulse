import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        'bg-bg-secondary border border-border rounded-2xl shadow-sm',
        className
      )}
    >
      {children}
    </div>
  );
}
