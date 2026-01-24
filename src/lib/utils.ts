import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD', // Modify to VND if user prefers, but default to USD for now based on generic request
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}
