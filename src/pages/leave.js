import { renderSidebar } from '../components/sidebar.js';
import { renderHeader } from '../components/header.js';
import { renderCalendar } from '../components/calendar.js';
import { openModal, closeModal } from '../components/modal.js';
import { apiGet, apiPost, apiPut, getCachedUser } from '../utils/api.js';
import { formatDate, getStatusBadgeClass, toISODate, daysBetween } from '../utils/helpers.js';
import { showToast } from '../components/toast.js';

export default async function renderLeave(container) {
  const user = getCachedUser();
  const isAdminView = window.location.pathname === '/leave-approvals';
  
  container.innerHTML = `
    <div class="app-layout">
      ${renderSidebar(user)}
      <main class="main-content">
        ${renderHeader(isAdminView ? 'Leave Approvals' : 'Leave Management', isAdminView ? 'Review and manage leave requests' : 'Apply for leave and view history')}
        <div class="page-container" id="leave-content">
          <div class="loading-screen"><div class="spinner spinner--lg"></div></div>
        </div>
      </main>
    </div>
  `;

  const content = container.querySelector('#leave-content');
  if (isAdminView) {
    await renderAdminView(content);
  } else {
    await renderEmployeeView(content);
  }
}

async function renderEmployeeView(container) {
  let requests = [];
  try {
    const res = await apiGet('/api/leave/my');
    requests = res.leaveRequests || [];
  } catch(e) {
    showToast({type: 'error', message: 'Failed to load requests'});
  }

  const renderContent = () => {
    container.innerHTML = `
      <div class="leave-grid">
        <div>
          <div class="glass-card">
            <h3 class="font-bold mb-4">Apply for Leave</h3>
            <form id="apply-form">
              <div class="form-group">
                <label class="form-label">Leave Type</label>
                <select class="form-select" id="leave_type" required>
                  <option value="paid">Paid Leave</option>
                  <option value="sick">Sick Leave</option>
                  <option value="unpaid">Unpaid Leave</option>
                </select>
              </div>
              
              <div class="form-group">
                <label class="form-label">Select Dates</label>
                <div class="calendar-wrapper" id="apply-calendar"></div>
                <div class="date-inputs">
                  <div class="flex-1">
                    <label class="form-label text-xs">Start Date</label>
                    <input type="text" id="start_date" class="form-input" readonly placeholder="Select in calendar" required>
                  </div>
                  <div class="flex-1">
                    <label class="form-label text-xs">End Date</label>
                    <input type="text" id="end_date" class="form-input" readonly placeholder="Select in calendar" required>
                  </div>
                </div>
                <div id="days-count" class="text-sm text-primary mb-2 hidden"></div>
              </div>

              <div class="form-group">
                <label class="form-label">Remarks</label>
                <textarea id="remarks" class="form-input" rows="3" placeholder="Reason for leave..."></textarea>
              </div>

              <button type="submit" class="btn btn--primary btn--full">Submit Application</button>
            </form>
          </div>
        </div>

        <div>
          <h3 class="font-bold mb-4">My Leave History</h3>
          <div class="leave-list">
            ${requests.length === 0 ? `
              <div class="empty-state glass-card">
                <div class="text-muted">No leave requests found.</div>
              </div>
            ` : requests.map(r => `
              <div class="leave-card leave-card--${r.status}">
                <div class="leave-card-header">
                  <div>
                    <div class="leave-card-type capitalize">${r.leave_type} Leave</div>
                    <div class="leave-card-dates">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                      ${formatDate(r.start_date)} - ${formatDate(r.end_date)}
                    </div>
                  </div>
                  <span class="badge ${getStatusBadgeClass(r.status)}">${r.status}</span>
                </div>
                ${r.remarks ? `<div class="leave-card-remarks">${r.remarks}</div>` : ''}
                ${r.admin_comment ? `
                  <div class="leave-admin-comment">
                    <strong class="text-xs text-muted uppercase">Admin Reply:</strong>
                    <div class="mt-1">${r.admin_comment}</div>
                  </div>
                ` : ''}
                <div class="text-xs text-muted mt-3 text-right">Applied on ${formatDate(r.created_at)}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    // Calendar selection logic
    let calMonth = new Date().getMonth();
    let calYear = new Date().getFullYear();
    let selStart = null;
    let selEnd = null;

    const updateCal = () => {
      const startInp = container.querySelector('#start_date');
      const endInp = container.querySelector('#end_date');
      const countEl = container.querySelector('#days-count');
      
      startInp.value = selStart || '';
      endInp.value = selEnd || selStart || ''; // If end not selected, assume 1 day
      
      if (selStart) {
        const end = selEnd || selStart;
        const days = daysBetween(selStart, end);
        countEl.textContent = `${days} day${days > 1 ? 's' : ''} selected`;
        countEl.classList.remove('hidden');
      } else {
        countEl.classList.add('hidden');
      }

      renderCalendar({
        containerId: 'apply-calendar',
        month: calMonth,
        year: calYear,
        selectionRange: { start: selStart, end: selEnd },
        onMonthChange: (m, y) => { calMonth = m; calYear = y; updateCal(); },
        onDateClick: (dateStr) => {
          if (!selStart || (selStart && selEnd)) {
            // New selection
            selStart = dateStr;
            selEnd = null;
          } else {
            // Second click
            if (dateStr < selStart) {
              selEnd = selStart;
              selStart = dateStr;
            } else {
              selEnd = dateStr;
            }
          }
          updateCal();
        }
      });
    };

    updateCal(); // Initial render

    // Form submit
    const form = container.querySelector('#apply-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('button');
      btn.disabled = true;
      btn.innerHTML = '<div class="spinner"></div>';

      try {
        await apiPost('/api/leave', {
          leave_type: document.getElementById('leave_type').value,
          start_date: document.getElementById('start_date').value,
          end_date: document.getElementById('end_date').value,
          remarks: document.getElementById('remarks').value
        });
        showToast({type: 'success', message: 'Leave application submitted'});
        // Reload
        const res = await apiGet('/api/leave/my');
        requests = res.leaveRequests || [];
        renderContent();
      } catch (err) {
        showToast({type: 'error', message: err.message || 'Failed to apply'});
        btn.disabled = false;
        btn.innerHTML = 'Submit Application';
      }
    });
  };

  renderContent();
}

async function renderAdminView(container) {
  let requests = [];
  try {
    const res = await apiGet('/api/leave/all');
    requests = res.leaveRequests || [];
  } catch(e) {}

  const renderContent = () => {
    const pending = requests.filter(r => r.status === 'pending');
    const history = requests.filter(r => r.status !== 'pending');

    container.innerHTML = `
      <div class="tabs">
        <div class="tab tab--active" data-tab="pending">Pending Approvals <span class="badge badge--warning ml-2">${pending.length}</span></div>
        <div class="tab" data-tab="history">History</div>
      </div>

      <div id="tab-pending" class="tab-content">
        ${pending.length === 0 ? `
          <div class="empty-state glass-card">
            <div class="empty-state__icon">👍</div>
            <div class="empty-state__title">All caught up!</div>
            <div class="empty-state__text">No pending leave requests to review.</div>
          </div>
        ` : `
          <div class="grid grid-2">
            ${pending.map(r => `
              <div class="glass-card leave-card leave-card--pending">
                <div class="flex justify-between items-start mb-4">
                  <div>
                    <div class="font-bold text-lg">${r.first_name} ${r.last_name}</div>
                    <div class="text-sm text-secondary capitalize">${r.leave_type} Leave</div>
                  </div>
                  <div class="text-right text-sm">
                    <div>${formatDate(r.start_date)} - ${formatDate(r.end_date)}</div>
                    <div class="text-muted mt-1">${daysBetween(r.start_date, r.end_date)} days</div>
                  </div>
                </div>
                ${r.remarks ? `<div class="bg-[var(--color-bg-input)] p-3 rounded-lg text-sm mb-4">"${r.remarks}"</div>` : ''}
                <div class="flex gap-3 mt-4 pt-4 border-t border-[var(--color-border)]">
                  <button class="btn btn--success flex-1 action-btn" data-id="${r.id}" data-action="approve">Approve</button>
                  <button class="btn btn--danger flex-1 action-btn" data-id="${r.id}" data-action="reject">Reject</button>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>

      <div id="tab-history" class="tab-content hidden">
        <div class="glass-card p-0" style="overflow-x: auto;">
          <table class="data-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Type</th>
                <th>Dates</th>
                <th>Days</th>
                <th>Status</th>
                <th>Applied On</th>
              </tr>
            </thead>
            <tbody>
              ${history.map(r => `
                <tr>
                  <td class="font-medium">${r.first_name} ${r.last_name}</td>
                  <td class="capitalize">${r.leave_type}</td>
                  <td>${formatDate(r.start_date)} to ${formatDate(r.end_date)}</td>
                  <td>${daysBetween(r.start_date, r.end_date)}</td>
                  <td><span class="badge ${getStatusBadgeClass(r.status)}">${r.status}</span></td>
                  <td class="text-sm text-muted">${formatDate(r.created_at)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    // Tabs
    const tabs = container.querySelectorAll('.tab');
    const contents = container.querySelectorAll('.tab-content');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('tab--active'));
        contents.forEach(c => c.classList.add('hidden'));
        tab.classList.add('tab--active');
        container.querySelector(`#tab-${tab.dataset.tab}`).classList.remove('hidden');
      });
    });

    // Actions
    container.querySelectorAll('.action-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const action = btn.dataset.action;
        
        openModal({
          title: `${action === 'approve' ? 'Approve' : 'Reject'} Leave`,
          content: `
            <div class="mb-4">
              <label class="form-label">Add a comment (optional)</label>
              <textarea id="admin-comment" class="form-input" rows="3" placeholder="Will be visible to employee"></textarea>
            </div>
            <div class="flex justify-end gap-3 mt-6">
              <button class="btn btn--ghost" onclick="closeModal()">Cancel</button>
              <button class="btn btn--${action === 'approve' ? 'success' : 'danger'}" id="confirm-action">Confirm ${action}</button>
            </div>
          `,
          onClose: () => {}
        });

        // Add event listener to dynamically added button
        setTimeout(() => {
           const confirmBtn = document.getElementById('confirm-action');
           if(confirmBtn) {
              confirmBtn.addEventListener('click', async () => {
                confirmBtn.disabled = true;
                confirmBtn.innerHTML = '<div class="spinner"></div>';
                const comment = document.getElementById('admin-comment').value;
                try {
                  await apiPut(`/api/leave/${id}/${action}`, { admin_comment: comment });
                  showToast({type: 'success', message: `Leave ${action}d successfully`});
                  closeModal();
                  // Reload
                  const res = await apiGet('/api/leave/all');
                  requests = res.leaveRequests || [];
                  renderContent();
                } catch(err) {
                  showToast({type: 'error', message: err.message});
                  confirmBtn.disabled = false;
                  confirmBtn.textContent = `Confirm ${action}`;
                }
              });
           }
        }, 50);
      });
    });
  };

  renderContent();
}
