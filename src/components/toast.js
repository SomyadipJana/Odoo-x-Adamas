/**
 * Toast Notification Component
 * Displays self-dismissing notifications in the #toast-container
 */

export function showToast({ type = 'info', title, message }) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  
  // Icon mapping
  const icons = {
    success: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>',
    error: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>',
    warning: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
    info: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>'
  };

  toast.innerHTML = `
    <div class="toast__icon">
      ${icons[type] || icons.info}
    </div>
    <div class="toast__body">
      ${title ? `<div class="toast__title">${title}</div>` : ''}
      <div class="toast__message">${message}</div>
    </div>
    <div class="toast__close">&times;</div>
  `;

  // Close button functionality
  const closeBtn = toast.querySelector('.toast__close');
  closeBtn.addEventListener('click', () => {
    removeToast(toast);
  });

  // Add to container
  container.appendChild(toast);

  // Auto remove after 4 seconds
  setTimeout(() => {
    if (toast.parentElement) {
      removeToast(toast);
    }
  }, 4000);
}

function removeToast(toast) {
  toast.classList.add('toast--exit');
  toast.addEventListener('animationend', () => {
    if (toast.parentElement) {
      toast.parentElement.removeChild(toast);
    }
  });
}
