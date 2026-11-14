/**
 * Whether text looks like an email address — an address, a single @, a dot in the domain. Only to say "enter a valid
 * email" under a field before sending; the backend decides what an address is.
 */
export const isEmail = (value: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
