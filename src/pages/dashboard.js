import { renderSidebar } from '../components/sidebar.js';
import { renderHeader } from '../components/header.js';
import { apiGet, getCachedUser } from '../utils/api.js';
import { getStatusBadgeClass, formatTime } from '../utils/helpers.js';

export default async function renderDashboard(container) {
  const user = getCachedUser();
  const isAdmin = user?.role === 'admin';
  
  let stats = {};
  let activities = [];
  
  try {
    if (isAdmin) {
      const [empRes, leaveRes, attRes] = await Promise.all([
        apiGet('/api/employees'),
        apiGet('/api/leave/all'),
        apiGet('/api/attendance/daily?date=' + new Date().toISOString().split('T')[0])
      ]);
      const employeesData = empRes.employees || [];
      const leavesData = leaveRes.leaveRequests || [];
      const attData = attRes.records || [];
      stats = {
        totalEmployees: employeesData.length,
        presentToday: attData.filter(a => a.status === 'present').length,
        pendingLeaves: leavesData.filter(l => l.status === 'pending').length,
        departments: new Set(employeesData.map(e => e.department)).size
      };
      activities = leavesData.slice(0, 5).map(l => ({
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path><polyline points="9 11 12 14 22 4"></polyline></svg>',
        title: `${l.first_name} ${l.last_name} applied for ${l.leave_type} leave`,
        time: l.created_at
      }));
    } else {
      const [todayRes, leaveRes, attRes] = await Promise.all([
        apiGet('/api/attendance/today'),
        apiGet('/api/leave/my'),
        apiGet(`/api/attendance/monthly/${user.employeeId}?month=${new Date().getMonth()}&year=${new Date().getFullYear()}`)
      ]);
      
      const todayRecord = todayRes.record || null;
      const leavesData = leaveRes.leaveRequests || [];
      const thisMonthAtt = attRes.records || [];
      
      stats = {
        status: todayRecord?.status || 'Not Checked In',
        time: todayRecord?.check_in ? formatTime(todayRecord.check_in) : '--:--',
        leaveBalance: 12 - leavesData.filter(l => l.status === 'approved' && l.leave_type === 'paid').length,
        presentDays: thisMonthAtt.filter(a => a.status === 'present').length,
        pendingRequests: leavesData.filter(l => l.status === 'pending').length
      };
      
      activities = leavesData.slice(0, 5).map(l => ({
         icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect></svg>',
         title: `Leave request ${l.status}`,
         time: l.created_at
      }));
      if (todayRecord?.check_in) {
        activities.unshift({
          icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>',
          title: `Checked in at ${formatTime(todayRecord.check_in)}`,
          time: todayRecord.check_in
        });
      }
    }
  } catch(e) {
    console.error("Failed to load dashboard data", e);
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const name = user?.firstName || user?.email?.split('@')[0] || 'User';

  container.innerHTML = `
    <div class="app-layout">
      ${renderSidebar(user)}
      <main class="main-content">
        ${renderHeader('Dashboard', 'Enterprise workforce overview and key metrics')}
        
        <div class="page-container">
          <div class="dashboard-welcome">
            <h2>${greeting}, ${name}!</h2>
            <p>Here's what's happening today.</p>
          </div>

          ${isAdmin ? renderAdminDashboard(stats, activities) : renderEmployeeDashboard(stats, activities)}
        </div>
      </main>
    </div>
  `;
}

function renderAdminDashboard(stats, activities) {
  return `
    <div class="stats-grid">
      <div class="glass-card stat-card">
        <div class="stat-card__icon stat-card__icon--primary">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
        </div>
        <div class="stat-card__info mt-4">
          <div class="stat-card__label">Total Employees</div>
          <div class="stat-card__value">${stats.totalEmployees || 0}</div>
        </div>
      </div>
      <div class="glass-card stat-card">
        <div class="stat-card__icon stat-card__icon--success">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
        <div class="stat-card__info mt-4">
          <div class="stat-card__label">Present Today</div>
          <div class="stat-card__value">${stats.presentToday || 0}</div>
        </div>
      </div>
      <div class="glass-card stat-card">
        <div class="stat-card__icon stat-card__icon--warning">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
        </div>
        <div class="stat-card__info mt-4">
          <div class="stat-card__label">Pending Leaves</div>
          <div class="stat-card__value">${stats.pendingLeaves || 0}</div>
        </div>
      </div>
      <div class="glass-card stat-card">
        <div class="stat-card__icon stat-card__icon--info">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
        </div>
        <div class="stat-card__info mt-4">
          <div class="stat-card__label">Departments</div>
          <div class="stat-card__value">${stats.departments || 0}</div>
        </div>
      </div>
    </div>

    <div class="quick-actions">
      <a href="/employees" class="quick-action-btn" data-link>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>
        <span>Manage Employees</span>
      </a>
      <a href="/attendance" class="quick-action-btn" data-link>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
        <span>Attendance Overview</span>
      </a>
      <a href="/leave-approvals" class="quick-action-btn" data-link>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"></polyline></svg>
        <span>Leave Approvals</span>
      </a>
    </div>

    <div class="dashboard-grid">
      <div class="glass-card">
        <h3 class="font-bold mb-4">Recent Activity</h3>
        <div class="activity-feed">
          ${activities.length ? activities.map(a => `
            <div class="activity-item">
              <div class="activity-icon">${a.icon}</div>
              <div class="activity-details">
                <div class="activity-title">${a.title}</div>
                <div class="activity-time">${new Date(a.time).toLocaleString()}</div>
              </div>
            </div>
          `).join('') : '<div class="text-muted text-sm">No recent activity</div>'}
        </div>
      </div>
    </div>
  `;
}

function renderEmployeeDashboard(stats, activities) {
  return `
    <div class="stats-grid">
      <div class="glass-card stat-card">
        <div class="stat-card__icon ${stats.status === 'present' ? 'stat-card__icon--success' : 'stat-card__icon--primary'}">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
        </div>
        <div class="stat-card__info mt-4">
          <div class="stat-card__label">Today's Status</div>
          <div class="stat-card__value capitalize">${stats.status}</div>
          <div class="text-xs text-muted mt-1">${stats.time !== '--:--' ? `Since ${stats.time}` : ''}</div>
        </div>
      </div>
      <div class="glass-card stat-card">
        <div class="stat-card__icon stat-card__icon--info">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect></svg>
        </div>
        <div class="stat-card__info mt-4">
          <div class="stat-card__label">Leave Balance</div>
          <div class="stat-card__value">${stats.leaveBalance || 0}</div>
        </div>
      </div>
      <div class="glass-card stat-card">
        <div class="stat-card__icon stat-card__icon--success">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
        <div class="stat-card__info mt-4">
          <div class="stat-card__label">Present Days (Month)</div>
          <div class="stat-card__value">${stats.presentDays || 0}</div>
        </div>
      </div>
      <div class="glass-card stat-card">
        <div class="stat-card__icon stat-card__icon--warning">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
        </div>
        <div class="stat-card__info mt-4">
          <div class="stat-card__label">Pending Requests</div>
          <div class="stat-card__value">${stats.pendingRequests || 0}</div>
        </div>
      </div>
    </div>

    <div class="quick-actions">
      <a href="/attendance" class="quick-action-btn" data-link>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle></svg>
        <span>Check In / Out</span>
      </a>
      <a href="/leave" class="quick-action-btn" data-link>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect></svg>
        <span>Apply Leave</span>
      </a>
      <a href="/payroll" class="quick-action-btn" data-link>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
        <span>View Payslip</span>
      </a>
    </div>

    <div class="dashboard-grid">
      <div class="glass-card">
        <h3 class="font-bold mb-4">Recent Activity</h3>
        <div class="activity-feed">
           ${activities.length ? activities.map(a => `
            <div class="activity-item">
              <div class="activity-icon">${a.icon}</div>
              <div class="activity-details">
                <div class="activity-title">${a.title}</div>
                <div class="activity-time">${new Date(a.time).toLocaleString()}</div>
              </div>
            </div>
          `).join('') : '<div class="text-muted text-sm">No recent activity</div>'}
        </div>
      </div>
    </div>
  `;
}
