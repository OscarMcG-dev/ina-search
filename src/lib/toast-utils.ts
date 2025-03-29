"use client";

/**
 * Simple toast notification utility
 */

type ToastType = 'success' | 'error' | 'info';

interface ToastOptions {
  title?: string;
  message: string;
  type?: ToastType;
  duration?: number;
}

// Simple toast notification
export function showToast({ title, message, type = 'info', duration = 4000 }: ToastOptions) {
  // Don't run this during SSR
  if (typeof window === 'undefined') return;
  
  // Create toast container if it doesn't exist
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.style.position = 'fixed';
    toastContainer.style.top = '20px';
    toastContainer.style.right = '20px';
    toastContainer.style.zIndex = '9999';
    document.body.appendChild(toastContainer);
    
    // Add some basic styles
    const style = document.createElement('style');
    style.textContent = `
      .toast {
        padding: 12px 16px;
        border-radius: 8px;
        margin-bottom: 10px;
        min-width: 300px;
        max-width: 450px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        display: flex;
        flex-direction: column;
        animation: slideIn 0.3s ease;
        transition: all 0.3s ease;
      }
      .toast-success {
        background-color: #10b981;
        color: white;
      }
      .toast-error {
        background-color: #ef4444;
        color: white;
      }
      .toast-info {
        background-color: #3b82f6;
        color: white;
      }
      .toast-title {
        font-weight: bold;
        margin-bottom: 4px;
      }
      .toast-message {
        font-size: 14px;
      }
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
  
  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  // Add title if provided
  if (title) {
    const titleEl = document.createElement('div');
    titleEl.className = 'toast-title';
    titleEl.textContent = title;
    toast.appendChild(titleEl);
  }
  
  // Add message
  const messageEl = document.createElement('div');
  messageEl.className = 'toast-message';
  messageEl.textContent = message;
  toast.appendChild(messageEl);
  
  // Add to container
  toastContainer.appendChild(toast);
  
  // Remove after duration
  setTimeout(() => {
    toast.style.animation = 'fadeOut 0.5s ease forwards';
    setTimeout(() => {
      if (toastContainer.contains(toast)) {
        toastContainer.removeChild(toast);
      }
    }, 500);
  }, duration);
  
  return toast;
} 