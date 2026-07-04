import { renderSidebar } from '../components/sidebar.js';
import { renderHeader } from '../components/header.js';
import { apiGet, apiPut, apiPost, getCachedUser, setCachedUser } from '../utils/api.js';
import { getInitials, formatDate, formatCurrency } from '../utils/helpers.js';
import { showToast } from '../components/toast.js';

export default async function renderProfile(container) {
  const user = getCachedUser();
  let empData = {};
  let payrollData = [];
  
  try {
    const empRes = await apiGet(`/api/employees/${user.employeeId}`);
    empData = empRes.employee || {};
    try {
      const payRes = await apiGet('/api/payroll/my');
      payrollData = payRes.payrolls || [];
    } catch(e) {} // Ignore if payroll fails
  } catch (error) {
    showToast({ type: 'error', message: 'Failed to load profile data' });
    return;
  }

  const initials = getInitials(empData.first_name, empData.last_name);
  const fullName = `${empData.first_name} ${empData.last_name}`;
  const latestPayroll = payrollData.length ? payrollData[0] : null;

  container.innerHTML = `
    <div class="app-layout">
      ${renderSidebar(user)}
      <main class="main-content">
        ${renderHeader('My Profile', 'Manage your account and view details')}
        
        <div class="page-container">
          <div class="profile-hero">
          <div style="display:flex; flex-direction:column; align-items:center; gap:var(--sp-2);">
            <div class="profile-avatar-container">
              <div class="profile-avatar">
                ${empData.profile_picture ? `<img src="${empData.profile_picture.startsWith('http') ? empData.profile_picture : '/uploads/' + empData.profile_picture}" alt="Profile" style="width:100%; height:100%; object-fit:cover; border-radius:var(--radius-full);">` : getInitials(empData.first_name, empData.last_name)}
              </div>
              <div class="profile-avatar-overlay" onclick="document.getElementById('upload-avatar').click()" title="Upload Picture">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
              </div>
              <input type="file" id="upload-avatar" hidden accept="image/*">
            </div>
            ${empData.profile_picture ? `<button id="remove-avatar-btn" class="btn btn--sm btn--ghost" style="padding:2px 6px; font-size:11px;">Remove</button>` : ''}
          </div>
          
          <div class="profile-info">
              <h2 class="profile-name">${fullName}</h2>
              <div class="profile-designation">${empData.designation || 'Employee'}</div>
              <div class="profile-badges">
                <span class="badge badge--primary">${empData.employee_id}</span>
                <span class="badge badge--neutral">${empData.department || 'General'}</span>
              </div>
            </div>
            <button id="edit-btn" class="btn btn--ghost">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              Edit Profile
            </button>
          </div>

          <div class="tabs">
            <div class="tab tab--active" data-tab="personal">Personal Info</div>
            <div class="tab" data-tab="job">Job Details</div>
            <div class="tab" data-tab="salary">Salary</div>
          </div>

          <div class="glass-card">
            <form id="profile-form">
              <!-- Personal Tab -->
              <div id="tab-personal" class="tab-content">
                <div class="profile-grid">
                  <div class="info-group">
                    <div class="info-label">First Name</div>
                    <div class="info-value edit-hide">${empData.first_name}</div>
                    <input type="text" name="first_name" class="form-input edit-show hidden" value="${empData.first_name}" disabled>
                  </div>
                  <div class="info-group">
                    <div class="info-label">Last Name</div>
                    <div class="info-value edit-hide">${empData.last_name}</div>
                    <input type="text" name="last_name" class="form-input edit-show hidden" value="${empData.last_name}" disabled>
                  </div>
                  <div class="info-group">
                    <div class="info-label">Email</div>
                    <div class="info-value">${empData.email}</div>
                  </div>
                  <div class="info-group">
                    <div class="info-label">Phone</div>
                    <div class="info-value edit-hide">${empData.phone || '—'}</div>
                    <input type="tel" name="phone" class="form-input edit-show hidden" value="${empData.phone || ''}">
                  </div>
                  <div class="info-group" style="grid-column: 1 / -1;">
                    <div class="info-label">Address</div>
                    <div class="info-value edit-hide">${empData.address || '—'}</div>
                    <textarea name="address" class="form-input edit-show hidden" rows="3">${empData.address || ''}</textarea>
                  </div>
                </div>
              </div>

              <!-- Job Details Tab -->
              <div id="tab-job" class="tab-content hidden">
                <div class="profile-grid">
                  <div class="info-group">
                    <div class="info-label">Employee ID</div>
                    <div class="info-value">${empData.employee_id}</div>
                  </div>
                  <div class="info-group">
                    <div class="info-label">Date of Joining</div>
                    <div class="info-value">${empData.join_date ? formatDate(empData.join_date) : '—'}</div>
                  </div>
                  <div class="info-group">
                    <div class="info-label">Department</div>
                    <div class="info-value">${empData.department || '—'}</div>
                  </div>
                  <div class="info-group">
                    <div class="info-label">Designation</div>
                    <div class="info-value">${empData.designation || '—'}</div>
                  </div>
                  <div class="info-group">
                    <div class="info-label">System Role</div>
                    <div class="info-value capitalize">${empData.role}</div>
                  </div>
                </div>
              </div>

              <!-- Salary Tab -->
              <div id="tab-salary" class="tab-content hidden">
                ${latestPayroll ? `
                  <div class="profile-grid">
                    <div class="info-group">
                      <div class="info-label">Basic Salary</div>
                      <div class="info-value">${formatCurrency(latestPayroll.basic_salary)}</div>
                    </div>
                    <div class="info-group">
                      <div class="info-label">HRA</div>
                      <div class="info-value">${formatCurrency(latestPayroll.hra)}</div>
                    </div>
                    <div class="info-group">
                      <div class="info-label">DA</div>
                      <div class="info-value">${formatCurrency(latestPayroll.da)}</div>
                    </div>
                    <div class="info-group">
                      <div class="info-label text-error">Deductions</div>
                      <div class="info-value text-error">-${formatCurrency(latestPayroll.deductions)}</div>
                    </div>
                    <div class="info-group" style="grid-column: 1 / -1; border-top: 1px solid var(--color-border); padding-top: var(--sp-4);">
                      <div class="info-label">Net Salary</div>
                      <div class="info-value" style="font-size: var(--fs-2xl); font-weight: var(--fw-bold); color: var(--color-success)">
                        ${formatCurrency(latestPayroll.net_salary)}
                      </div>
                    </div>
                  </div>
                ` : `
                  <div class="empty-state">
                    <div class="text-muted">No payroll data available.</div>
                  </div>
                `}
              </div>

              <div id="edit-actions" class="flex justify-end gap-3 mt-6 hidden pt-6" style="border-top: 1px solid var(--color-border)">
                <button type="button" id="cancel-btn" class="btn btn--ghost">Cancel</button>
                <button type="submit" class="btn btn--primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  `;

  // Tabs logic
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

  // Edit logic
  const editBtn = container.querySelector('#edit-btn');
  const cancelBtn = container.querySelector('#cancel-btn');
  const editActions = container.querySelector('#edit-actions');
  const editHides = container.querySelectorAll('.edit-hide');
  const editShows = container.querySelectorAll('.edit-show');

  const toggleEdit = (show) => {
    if (show) {
      editHides.forEach(el => el.classList.add('hidden'));
      editShows.forEach(el => el.classList.remove('hidden'));
      editActions.classList.remove('hidden');
      editBtn.classList.add('hidden');
      // Switch to personal tab
      tabs[0].click();
    } else {
      editHides.forEach(el => el.classList.remove('hidden'));
      editShows.forEach(el => el.classList.add('hidden'));
      editActions.classList.add('hidden');
      editBtn.classList.remove('hidden');
    }
  };

  editBtn.addEventListener('click', () => toggleEdit(true));
  cancelBtn.addEventListener('click', () => toggleEdit(false));

  // Save changes
  const form = container.querySelector('#profile-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.innerHTML = '<div class="spinner"></div>';
    submitBtn.disabled = true;

    try {
      const fd = new FormData(form);
      const updates = Object.fromEntries(fd.entries());
      
      const updatedUser = await apiPut(`/api/employees/${empData.id}`, updates);
      showToast({ type: 'success', message: 'Profile updated successfully' });
      
      // Update UI (simplified, ideally re-render)
      container.querySelectorAll('.edit-hide').forEach((el, i) => {
        if(editShows[i].name) el.textContent = editShows[i].value || '—';
      });
      toggleEdit(false);
    } catch (error) {
      showToast({ type: 'error', message: error.message || 'Failed to update' });
    } finally {
      submitBtn.innerHTML = 'Save Changes';
      submitBtn.disabled = false;
    }
  });

  // Avatar upload
  const fileInput = container.querySelector('#upload-avatar');
  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fd = new FormData();
    fd.append('profile_picture', file);

    try {
      const res = await apiPost(`/api/employees/${empData.id}/picture`, fd);
      showToast({ type: 'success', message: 'Profile picture updated' });
      
      // Update user cache for sidebar
      const cached = getCachedUser();
      cached.profilePicture = res.filename;
      setCachedUser(cached);
      
      // Update img src
      const avatarContainer = container.querySelector('.profile-avatar');
      avatarContainer.innerHTML = `<img src="/uploads/${res.filename}" alt="Profile" style="width:100%; height:100%; object-fit:cover; border-radius:var(--radius-full);">`;
      
      // Update sidebar
      const sidebarAvatar = document.querySelector('.sidebar-user-avatar');
      if (sidebarAvatar) {
         sidebarAvatar.innerHTML = `<img src="/uploads/${res.filename}" alt="Avatar">`;
      }
    } catch (error) {
      showToast({ type: 'error', message: error.message || 'Failed to upload picture' });
    }
  });

  const removeAvatarBtn = container.querySelector('#remove-avatar-btn');
  if (removeAvatarBtn) {
    removeAvatarBtn.addEventListener('click', async () => {
      try {
        await apiPut(`/api/employees/${empData.id}`, { profile_picture: "" });
        
        // Update user cache
        const cached = getCachedUser();
        cached.profilePicture = "";
        setCachedUser(cached);
        
        // Refresh profile page
        renderProfile(container);
        showToast({ type: 'success', message: 'Profile picture removed.' });
        
        // Update sidebar
        const sidebarAvatar = document.querySelector('.sidebar-user-avatar');
        if (sidebarAvatar) {
           sidebarAvatar.innerHTML = getInitials(empData.first_name, empData.last_name);
        }
      } catch (err) {
        showToast({ type: 'error', message: 'Failed to remove picture.' });
      }
    });
  }
}
