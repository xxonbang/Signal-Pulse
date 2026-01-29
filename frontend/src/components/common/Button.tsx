import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all',
        {
          'bg-accent-primary text-white hover:bg-accent-primary-light': variant === 'primary',
          'bg-bg-secondary border border-border text-text-secondary hover:bg-bg-accent hover:border-accent-primary hover:text-accent-primary': variant === 'secondary',
          'text-text-secondary hover:text-accent-primary hover:bg-bg-accent': variant === 'ghost',
        },
        {
          'px-3 py-1.5 text-xs': size === 'sm',
          'px-4 py-2.5 text-sm': size === 'md',
          'px-5 py-3 text-base': size === 'lg',
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
