import { Injectable } from '@angular/core';
import { DASHBOARD_CONSTANTS } from '../constants/dashboard.constants';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  showToast(message: string, type: 'success' | 'error' = 'success'): void { // Display temporary notification message
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 px-4 py-2 rounded-lg text-white font-medium z-50 ${
      type === 'success' ? 'bg-green-500' : 'bg-red-500'
    }`; // Style based on message type
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => { // Auto-remove after 3 seconds
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, DASHBOARD_CONSTANTS.TOAST_DURATION);
  }
}
