/**
 * Header Component
 */
import { formatDate } from '../utils/helpers.js';

export function renderHeader(title, subtitle = '') {
  return `
    <style>
      .app-header {
        position: fixed;
        top: 0;
        right: 0;
        left: var(--sidebar-width);
        height: var(--header-height);
        background: var(--glass-bg);
        backdrop-filter: blur(var(--glass-blur));
        -webkit-backdrop-filter: blur(var(--glass-blur));
        border-bottom: 1px solid var(--color-border);
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 var(--sp-8);
        z-index: var(--z-header);
        transition: left var(--transition-base);
      }
      .header-title-container {
        display: flex;
        flex-direction: column;
      }
      .header-title {
        font-weight: var(--fw-semibold);
        font-size: var(--fs-lg);
        margin: 0;
        line-height: 1.2;
      }
      .header-subtitle {
        font-size: var(--fs-xs);
        color: var(--color-text-muted);
      }
      .header-right {
        display: flex;
        align-items: center;
        gap: var(--sp-4);
      }
      .header-date {
        font-size: var(--fs-sm);
        color: var(--color-text-secondary);
        display: flex;
        align-items: center;
        gap: var(--sp-2);
      }
      .mobile-menu-btn {
        display: none;
        background: none;
        border: none;
        color: var(--color-text);
        cursor: pointer;
        padding: var(--sp-2);
      }
      @media (max-width: 768px) {
        .app-header {
          left: 0;
          padding: 0 var(--sp-4);
        }
        .mobile-menu-btn {
          display: block;
        }
        .header-date {
          display: none;
        }
      }
    </style>
    <header class="app-header">
      <div class="flex items-center gap-4">
        <button class="mobile-menu-btn" id="mobile-menu-btn">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </button>
        <div class="header-title-container">
          <h1 class="header-title">${title}</h1>
          ${subtitle ? `<div class="header-subtitle">${subtitle}</div>` : ''}
        </div>
      </div>
      <div class="header-right">
        <div class="header-date">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          ${formatDate(new Date(), { weekday: 'short', month: 'short', day: 'numeric' })}
        </div>
      </div>
    </header>
  `;
}
