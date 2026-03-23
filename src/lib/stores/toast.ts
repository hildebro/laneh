import { writable } from 'svelte/store';

export type ToastType = 'primary' | 'warning' | 'error';

export interface Toast {
  id: string;
  title: string;
  message: string;
  type: ToastType;
}

export const toasts = writable<Toast[]>([]);

type ToastOptions = {
  title: string;
  message: string;
  type?: ToastType;
  duration?: number;
};

export function addToast(
  {
    title,
    message,
    type = 'primary',
    duration = 3000
  }: ToastOptions
): void {
  const id = Math.random().toString(36).substring(2, 9);

  // New toasts are added at the start to appear on top
  toasts.update((all) => [{ id, title, message, type }, ...all]);

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