import { renderSidebar } from '../components/sidebar.js';
import { renderHeader } from '../components/header.js';
import { renderCalendar } from '../components/calendar.js';
import { openModal } from '../components/modal.js';
import { apiGet, apiPost, getCachedUser } from '../utils/api.js';
import { formatTime, toISODate, getStatusBadgeClass } from '../utils/helpers.js';
import { showToast } from '../components/toast.js';

export default async function renderAttendance(container) {
  const user = getCachedUser();
  const isAdmin = user?.role === 'admin';

  container.innerHTML = `
    <div class="app-layout">
      ${renderSidebar(user)}
      <main class="main-content">
        ${renderHeader('Attendance', isAdmin ? 'Monitor employee attendance' : 'Track your working hours')}
        <div class="page-container" id="attendance-content">
          <div class="loading-screen"><div class="spinner spinner--lg"></div></div>
        </div>
      </main>
    </div>
  `;

  const content = container.querySelector('#attendance-content');
  if (isAdmin) {
    await renderAdminView(content);
  } else {
    await renderEmployeeView(content, user);
  }
}

async function renderEmployeeView(container, user) {
  let todayData, monthlyData;
  const now = new Date();
  let currentMonth = now.getMonth();
  let currentYear = now.getFullYear();

  const loadData = async (m, y) => {
    const [tRes, mRes] = await Promise.all([
      apiGet('/api/attendance/today'),
      apiGet(`/api/attendance/monthly/${user.employeeId}?month=${m}&year=${y}`)
    ]);
    todayData = tRes.record || null;
    monthlyData = mRes.records || [];
  };

  await loadData(currentMonth, currentYear);

  const renderContent = () => {
    // Current status calculation
    let isCheckedIn = false;
    let checkInTime = null;
    let statusText = 'Not checked in yet';
    
    if (todayData?.check_in && !todayData?.check_out) {
      isCheckedIn = true;
      checkInTime = todayData.check_in;
      statusText = 'Currently working';
    } else if (todayData?.check_out) {
      statusText = 'Shift completed';
      checkInTime = todayData.check_in;
    } else if (todayData?.status === 'leave') {
      statusText = 'On Leave';
    } else if (todayData?.status === 'absent') {
      statusText = 'Absent';
    }

    // Format calendar data
    const calData = {};
    if (Array.isArray(monthlyData)) {
      monthlyData.forEach(r => {
        calData[r.date] = { status: r.status, label: r.status.replace('-', ' ') };
      });
    }

    container.innerHTML = `
      <div class="glass-card check-in-card">
        <div class="check-in-status">${statusText}</div>
        <div class="check-in-time" id="live-clock">${formatTime(new Date())}</div>
        
        ${todayData?.check_out ? `
          <div class="text-success flex items-center justify-center gap-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
            Completed today's shift
          </div>
        ` : todayData?.status === 'leave' || todayData?.status === 'absent' ? `
          <div class="text-secondary flex items-center justify-center gap-2">
             No check-in required today
          </div>
        ` : `
          <button id="check-btn" class="btn-check ${isCheckedIn ? 'btn-check--out' : 'btn-check--in'}">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              ${isCheckedIn ? '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line>' : '<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line>'}
            </svg>
            ${isCheckedIn ? 'Check Out' : 'Check In'}
          </button>
          ${checkInTime ? `<div class="mt-4 text-sm text-secondary">Checked in at ${formatTime(checkInTime)}</div>` : ''}
        `}
      </div>

      <div class="attendance-grid">
        <div class="glass-card">
          <div id="calendar-container"></div>
          <div class="status-legend">
            <div class="legend-item"><div class="status-dot present"></div> Present</div>
            <div class="legend-item"><div class="status-dot absent"></div> Absent</div>
            <div class="legend-item"><div class="status-dot half-day"></div> Half Day</div>
            <div class="legend-item"><div class="status-dot leave"></div> Leave</div>
          </div>
        </div>
        
        <div class="glass-card">
          <h3 class="font-bold mb-4">This Week</h3>
          <div class="weekly-summary" id="weekly-bars">
            <!-- Populated via JS -->
          </div>
        </div>
      </div>
    `;

    // Live Clock
    const clockEl = container.querySelector('#live-clock');
    const clockTimer = setInterval(() => {
      if(!document.contains(clockEl)) {
        clearInterval(clockTimer);
        return;
      }
      clockEl.textContent = formatTime(new Date());
    }, 1000);

    // Check In/Out Action
    const checkBtn = container.querySelector('#check-btn');
    if (checkBtn) {
      checkBtn.addEventListener('click', async () => {
        checkBtn.disabled = true;
        try {
          const endpoint = isCheckedIn ? '/api/attendance/check-out' : '/api/attendance/check-in';
          await apiPost(endpoint, {});
          showToast({ type: 'success', message: `Successfully checked ${isCheckedIn ? 'out' : 'in'}` });
          await loadData(currentMonth, currentYear);
          renderContent();
        } catch (error) {
          showToast({ type: 'error', message: error.message || 'Action failed' });
          checkBtn.disabled = false;
        }
      });
    }

    // Render Calendar
    renderCalendar({
      containerId: 'calendar-container',
      month: currentMonth,
      year: currentYear,
      data: calData,
      onMonthChange: async (m, y) => {
        currentMonth = m;
        currentYear = y;
        await loadData(m, y);
        renderContent();
      }
    });

    // Render Weekly Bars
    const weeklyBarsContainer = container.querySelector('#weekly-bars');
    const days = ['M', 'T', 'W', 'T', 'F'];
    
    // Simple logic: get last 5 days from monthly data (assuming current month view includes them)
    // For demo, just plotting random visually
    let barsHtml = '';
    const todayNum = new Date().getDay(); // 0(Sun) - 6(Sat)
    
    for(let i=1; i<=5; i++) {
      // Find data for this weekday in current week
      const d = new Date();
      d.setDate(d.getDate() - (todayNum - i));
      const dStr = toISODate(d);
      const dData = calData[dStr];
      const status = dData ? dData.status : (d > new Date() ? '' : 'absent');
      
      barsHtml += `
        <div class="day-bar-container">
          <div class="day-bar">
            <div class="day-bar-fill ${status}" style="height: ${status ? (status === 'half-day' ? '50%' : '100%') : '0%'}"></div>
          </div>
          <div class="day-label">${days[i-1]}</div>
        </div>
      `;
    }
    weeklyBarsContainer.innerHTML = barsHtml;
  };

  renderContent();
}

async function renderAdminView(container) {
  let currentDate = toISODate(new Date());
  
  const loadData = async (dateStr) => {
    const res = await apiGet(`/api/attendance/daily?date=${dateStr}`);
    return res.records || [];
  };

  let data = await loadData(currentDate);

  const renderContent = () => {
    container.innerHTML = `
      <div class="glass-card">
        <div class="filter-bar">
          <div class="form-group mb-0" style="width: 200px;">
            <input type="date" id="date-filter" class="form-input" value="${currentDate}">
          </div>
        </div>
        
        <div style="overflow-x: auto;">
          <table class="data-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Status</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${data.length === 0 ? '<tr><td colspan="5" class="text-center text-muted">No attendance data found for this date.</td></tr>' : ''}
              ${data.map(row => `
                <tr>
                  <td>
                    <div class="flex items-center gap-3">
                      <div class="font-medium">${row.first_name} ${row.last_name}</div>
                    </div>
                  </td>
                  <td>
                    <span class="badge ${getStatusBadgeClass(row.status)}">${row.status || 'Absent'}</span>
                  </td>
                  <td>${row.check_in ? formatTime(row.check_in) : '—'}</td>
                  <td>${row.check_out ? formatTime(row.check_out) : '—'}</td>
                  <td>
                    <button class="btn btn--ghost btn--sm view-cal-btn" data-id="${row.user_id}" data-name="${row.first_name}">
                      View Calendar
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    // Date filter
    const dateInput = container.querySelector('#date-filter');
    dateInput.addEventListener('change', async (e) => {
      currentDate = e.target.value;
      container.innerHTML = '<div class="loading-screen"><div class="spinner"></div></div>';
      data = await loadData(currentDate);
      renderContent();
    });

    // View Calendar Modals
    container.querySelectorAll('.view-cal-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const empId = e.target.dataset.id;
        const empName = e.target.dataset.name;
        
        const content = openModal({
          title: `${empName}'s Attendance`,
          content: `<div id="modal-cal-container"></div><div class="loading-screen" id="cal-loader"><div class="spinner"></div></div>`
        });
        
        const now = new Date();
        const month = now.getMonth();
        const year = now.getFullYear();
        
        try {
          const mRes = await apiGet(`/api/attendance/monthly/${empId}?month=${month}&year=${year}`);
          const mData = mRes.records || [];
          const calData = {};
          if(Array.isArray(mData)) {
             mData.forEach(r => calData[r.date] = { status: r.status });
          }
          content.querySelector('#cal-loader').remove();
          renderCalendar({
            containerId: 'modal-cal-container',
            month,
            year,
            data: calData
          });
        } catch(err) {
          content.innerHTML = `<div class="text-error">Failed to load calendar</div>`;
        }
      });
    });
  };

  renderContent();
}
