// ============================================
// Toast Notification Store
// ============================================

import { writable } from 'svelte/store';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

function createToastStore() {
  const { subscribe, update } = writable<Toast[]>([]);

  function addToast(
    type: Toast['type'],
    message: string,
    duration: number = 5000
  ): string {
    const id = Math.random().toString(36).substring(2, 11);
    
    update(toasts => [...toasts, { id, type, message, duration }]);
    
    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    
    return id;
  }

  function removeToast(id: string) {
    update(toasts => toasts.filter(t => t.id !== id));
  }

  function success(message: string, duration?: number) {
    return addToast('success', message, duration);
  }

  function error(message: string, duration?: number) {
    return addToast('error', message, duration ?? 8000); // Errors stay longer
  }

  function warning(message: string, duration?: number) {
    return addToast('warning', message, duration ?? 6000);
  }

  function info(message: string, duration?: number) {
    return addToast('info', message, duration);
  }

  function clear() {
    update(() => []);
  }

  return {
    subscribe,
    success,
    error,
    warning,
    info,
    remove: removeToast,
    clear
  };
}

export const toasts = createToastStore();
