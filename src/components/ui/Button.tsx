import * as React from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(
                    'inline-flex items-center justify-center rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]',
                    {
                        'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20': variant === 'primary',
                        'bg-zinc-800 text-zinc-100 hover:bg-zinc-700': variant === 'secondary',
                        'bg-transparent hover:bg-zinc-800/50 text-zinc-300 hover:text-white': variant === 'ghost',
                        'bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20': variant === 'danger',
                        'border border-zinc-700 bg-transparent hover:bg-zinc-800 text-zinc-300': variant === 'outline',

                        'h-9 px-4 text-sm': size === 'sm',
                        'h-11 px-6 text-base': size === 'md',
                        'h-14 px-8 text-lg': size === 'lg',
                        'h-10 w-10 p-0': size === 'icon',
                    },
                    className
                )}
                disabled={isLoading || props.disabled}
                {...props}
            >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {children}
            </button>
        );
    }
);
Button.displayName = 'Button';

export { Button };
