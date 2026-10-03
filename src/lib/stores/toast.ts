import { derived, writable } from 'svelte/store';

export type ToastType = 'primary' | 'warning' | 'error';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
}

type ToastOptions = {
  message: string;
  type?: ToastType;
  duration?: number;
};

// Only one toast fits into the header, so the others wait in line until it's their turn.
const queue = writable<Toast[]>([]);

export const currentToast = derived(queue, (all) => all[0]);

/**
 * Queues a toast. Messages need to be short, since they replace the title in the header, even on mobile.
 */
export function addToast({ message, type = 'primary', duration = 3000 }: ToastOptions): void {
  const id = Math.random().toString(36).substring(2, 9);

  queue.update((all) => [...all, { id, message, type, duration }]);
}

/**
 * Removes a toast by its unique ID, which lets the next queued one take its place.
 */
export function removeToast(id: string): void {
  queue.update((all) => all.filter((toast) => toast.id !== id));
}
