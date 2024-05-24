import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const focusRing = [
  // base
  "outline outline-blue-500 outline-offset-2 outline-0",
  // dark
  "dark:outline-blue-500",
  // focus-visible
  "focus-visible:outline-2",
]
