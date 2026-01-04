// ============================================
// Toast Notification Store
// Enhanced with progress tracking for batch operations
// ============================================

import { writable, get } from 'svelte/store';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'progress';
  message: string;
  duration?: number;
  // Progress tracking
  progress?: {
    current: number;
    total: number;
    label?: string;
  };
}

function createToastStore() {
  const { subscribe, update } = writable<Toast[]>([]);

  function addToast(
    type: Toast['type'],
    message: string,
    duration: number = 5000,
    progress?: Toast['progress']
  ): string {
    const id = Math.random().toString(36).substring(2, 11);
    
    update(toasts => [...toasts, { id, type, message, duration, progress }]);
    
    // Auto-remove after duration (not for progress toasts unless specified)
    if (duration > 0 && type !== 'progress') {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    
    return id;
  }

  function removeToast(id: string) {
    update(toasts => toasts.filter(t => t.id !== id));
  }

  function updateToast(id: string, updates: Partial<Toast>) {
    update(toasts => toasts.map(t => 
      t.id === id ? { ...t, ...updates } : t
    ));
  }

  function updateProgress(id: string, current: number, total: number, label?: string) {
    update(toasts => toasts.map(t => 
      t.id === id ? { 
        ...t, 
        progress: { current, total, label },
        message: label || `Processing ${current} of ${total}...`
      } : t
    ));
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

  /**
   * Show a progress toast for batch operations
   * Returns the toast ID for updating progress
   */
  function progress(message: string, current: number = 0, total: number = 0): string {
    return addToast('progress', message, 0, { current, total });
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
    progress,
    updateProgress,
    updateToast,
    remove: removeToast,
    clear
  };
}

export const toasts = createToastStore();
