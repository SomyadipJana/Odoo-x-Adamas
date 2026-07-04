/**
 * Modal Dialog Component
 */

export function openModal({ title, content, onClose }) {
  // Create backdrop
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  
  // Create modal container
  const modal = document.createElement('div');
  modal.className = 'modal';
  
  modal.innerHTML = `
    <div class="modal__header">
      <h3 class="modal__title">${title}</h3>
      <button class="modal__close" aria-label="Close modal">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
    </div>
    <div class="modal__body"></div>
  `;

  const bodyEl = modal.querySelector('.modal__body');
  
  // Content can be HTML string or DOM node
  if (typeof content === 'string') {
    bodyEl.innerHTML = content;
  } else if (content instanceof Node) {
    bodyEl.appendChild(content);
  }

  // Close handlers
  const close = () => {
    if (document.body.contains(backdrop)) document.body.removeChild(backdrop);
    if (document.body.contains(modal)) document.body.removeChild(modal);
    document.removeEventListener('keydown', handleEsc);
    if (typeof onClose === 'function') onClose();
  };

  const handleEsc = (e) => {
    if (e.key === 'Escape') close();
  };

  modal.querySelector('.modal__close').addEventListener('click', close);
  backdrop.addEventListener('click', close);
  document.addEventListener('keydown', handleEsc);

  // Append to body
  document.body.appendChild(backdrop);
  document.body.appendChild(modal);

  // Expose close method
  window.closeModal = close;

  return bodyEl; // Return container so caller can attach listeners to dynamic content
}

export function closeModal() {
  if (typeof window.closeModal === 'function') {
    window.closeModal();
  }
}
