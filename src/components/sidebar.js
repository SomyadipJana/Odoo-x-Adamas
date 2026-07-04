/**
 * Sidebar Navigation Component
 */
import { getInitials } from '../utils/helpers.js';

export function renderSidebar(user) {
  const path = window.location.pathname;
  
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>' },
    { name: 'Profile', path: '/profile', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>' },
    { name: 'Attendance', path: '/attendance', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>' },
    { name: 'Leave', path: '/leave', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>' },
    { name: 'Payroll', path: '/payroll', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>' }
  ];

  if (user?.role === 'admin') {
    navItems.push(
      { separator: true },
      { name: 'Employees', path: '/employees', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>' },
      { name: 'Leave Approvals', path: '/leave-approvals', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>' }
    );
  }

  const navHtml = navItems.map(item => {
    if (item.separator) {
      return `<div class="sidebar-separator"><span>Admin Tools</span></div>`;
    }
    const isActive = path === item.path || path.startsWith(item.path + '/');
    return `
      <a href="${item.path}" class="sidebar-nav-item ${isActive ? 'active' : ''}" data-link>
        <span class="sidebar-nav-icon">${item.icon}</span>
        <span class="sidebar-nav-label">${item.name}</span>
      </a>
    `;
  }).join('');

  const initials = getInitials(user?.firstName, user?.lastName);
  const fullName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'User';

  return `
    <style>
      .sidebar {
        position: fixed;
        left: 0;
        top: 0;
        bottom: 0;
        width: var(--sidebar-width);
        background: var(--color-bg-elevated);
        border-right: 1px solid var(--color-border);
        display: flex;
        flex-direction: column;
        z-index: var(--z-sidebar);
        transition: width var(--transition-base);
      }
      .sidebar-brand {
        height: var(--header-height);
        display: flex;
        align-items: center;
        padding: 0 var(--sp-6);
        gap: var(--sp-3);
        border-bottom: 1px solid var(--color-border);
      }
      .sidebar-brand-icon {
        width: 32px;
        height: 32px;
        border-radius: var(--radius-md);
        background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .sidebar-brand-text {
        font-weight: var(--fw-bold);
        font-size: var(--fs-lg);
        letter-spacing: -0.025em;
      }
      .sidebar-nav {
        flex: 1;
        padding: var(--sp-4) var(--sp-3);
        overflow-y: auto;
      }
      .sidebar-nav-item {
        display: flex;
        align-items: center;
        gap: var(--sp-3);
        padding: var(--sp-3);
        border-radius: var(--radius-lg);
        color: var(--color-text-secondary);
        margin-bottom: var(--sp-1);
        position: relative;
        overflow: hidden;
      }
      .sidebar-nav-item:hover {
        background: var(--color-surface-hover);
        color: var(--color-text);
      }
      .sidebar-nav-item.active {
        background: var(--color-primary-bg);
        color: var(--color-primary-light);
      }
      .sidebar-nav-item.active::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 3px;
        background: var(--color-primary);
        border-radius: 0 4px 4px 0;
      }
      .sidebar-nav-icon {
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .sidebar-separator {
        padding: var(--sp-4) var(--sp-4) var(--sp-2);
        font-size: var(--fs-xs);
        text-transform: uppercase;
        letter-spacing: 0.1em;
        font-weight: var(--fw-semibold);
        color: var(--color-text-muted);
      }
      .sidebar-footer {
        padding: var(--sp-4);
        border-top: 1px solid var(--color-border);
      }
      .sidebar-user {
        display: flex;
        align-items: center;
        gap: var(--sp-3);
        margin-bottom: var(--sp-4);
      }
      .sidebar-user-avatar {
        width: 40px;
        height: 40px;
        border-radius: var(--radius-full);
        background: linear-gradient(135deg, var(--color-accent), var(--color-primary));
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: var(--fw-bold);
        font-size: var(--fs-sm);
        flex-shrink: 0;
      }
      .sidebar-user-avatar img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: var(--radius-full);
      }
      .sidebar-user-info {
        flex: 1;
        min-width: 0;
      }
      .sidebar-user-name {
        font-weight: var(--fw-medium);
        font-size: var(--fs-sm);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .sidebar-user-role {
        font-size: var(--fs-xs);
        color: var(--color-text-muted);
        text-transform: capitalize;
      }
      @media (max-width: 768px) {
        .sidebar {
          transform: translateX(-100%);
        }
        .sidebar.open {
          transform: translateX(0);
        }
      }
    </style>
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-brand">
        <img src="/logo.png" alt="HRMS Logo" style="width: 76px; height: 76px; object-fit: contain; flex-shrink: 0; margin-left: 28px; margin-right: -4px;">
        <div class="sidebar-brand-text">HRMS</div>
      </div>
      <nav class="sidebar-nav">
        ${navHtml}
      </nav>
      <div class="sidebar-footer">
        <div class="sidebar-user">
          <div class="sidebar-user-avatar">
            ${user?.profilePicture ? `<img src="${user.profilePicture.startsWith('http') ? user.profilePicture : '/uploads/' + user.profilePicture}" alt="Avatar">` : initials}
          </div>
          <div class="sidebar-user-info">
            <div class="sidebar-user-name">${fullName}</div>
            <div class="sidebar-user-role">${user?.role || 'Employee'}</div>
          </div>
        </div>
        <button id="logout-btn" class="btn btn--ghost btn--full btn--sm">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          Sign Out
        </button>
      </div>
    </aside>
  `;
}
