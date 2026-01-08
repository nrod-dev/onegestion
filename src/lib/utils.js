import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
    return twMerge(clsx(inputs))
}

/**
 * Parses a date string (YYYY-MM-DD) as a local date, avoiding timezone offsets.
 * @param {string} dateString - The date string to parse (e.g., "2023-11-25").
 * @returns {Date} A Date object representing the local date at midnight.
 */
export const parseDateLocal = (dateString) => {
    if (!dateString) return new Date();
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
};
