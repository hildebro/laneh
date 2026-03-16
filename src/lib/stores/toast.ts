import { writable } from 'svelte/store';

export type ToastType = 'info' | 'error' | 'accent';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

export const toasts = writable<Toast[]>([]);

export function addToast(
  message: string,
  type: ToastType = 'info',
  duration: number = 3000
): void {
  const id = Math.random().toString(36).substring(2, 9);

  // New toasts are added at the start to appear on top
  toasts.update((all) => [{ id, message, type }, ...all]);

  if (duration > 0) {
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }
}

/**
 * Removes a toast by its unique ID.
 */
export function removeToast(id: string): void {
  toasts.update((all) => all.filter((toast) => toast.id !== id));
}