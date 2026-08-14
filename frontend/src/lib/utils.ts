import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * cn — merge Tailwind classes safely.
 * Resolves conflicts (e.g. `p-2 p-4` → `p-4`) and handles conditional classes.
 *
 * Usage:
 *   cn('px-4 py-2', isActive && 'bg-primary text-primary-foreground')
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
