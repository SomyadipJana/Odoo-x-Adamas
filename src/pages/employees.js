import { renderSidebar } from '../components/sidebar.js';
import { renderHeader } from '../components/header.js';
import { apiGet, apiPost, getCachedUser } from '../utils/api.js';
import { getInitials, debounce } from '../utils/helpers.js';
import { navigate } from '../utils/router.js';
import { showToast } from '../components/toast.js';
import { openModal, closeModal } from '../components/modal.js';

export default async function renderEmployees(container) {
  const user = getCachedUser();
  
  container.innerHTML = `
    <div class="app-layout">
      ${renderSidebar(user)}
      <main class="main-content">
        ${renderHeader('Employees', 'Directory of all personnel')}
        <div class="page-container">
          
          <div class="glass-card mb-6 flex justify-between items-center" style="padding: var(--sp-4);">
            <div class="form-group mb-0" style="width: 300px;">
              <input type="text" id="emp-search" class="form-input" placeholder="Search by name, email or ID...">
            </div>
            <button id="add-emp-btn" class="btn btn--primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Add Employee
            </button>
          </div>

          <div class="glass-card p-0" style="overflow-x: auto;">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>ID</th>
                  <th>Department & Role</th>
                  <th>Contact</th>
                  <th>Role</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody id="emp-table-body">
                <tr><td colspan="6" class="text-center py-8"><div class="spinner mx-auto"></div></td></tr>
              </tbody>
            </table>
          </div>

        </div>
      </main>
    </div>
  `;

  let allEmployees = [];
  const tbody = container.querySelector('#emp-table-body');

  const renderRows = (data) => {
    if (data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-8">No employees found.</td></tr>';
      return;
    }

    tbody.innerHTML = data.map(emp => `
      <tr class="hover:bg-[var(--color-surface-hover)] cursor-pointer" onclick="alert('View profile logic here')">
        <td>
          <div class="flex items-center gap-3">
            <div class="flex items-center justify-center bg-[var(--color-primary-bg)] font-bold data-table__avatar text-[var(--color-primary-light)] overflow-hidden border border-[var(--color-border)]" style="flex-shrink:0;">
              ${emp.profile_picture 
                ? `<img src="${emp.profile_picture.startsWith('http') ? emp.profile_picture : '/uploads/' + emp.profile_picture}" class="data-table__avatar" style="border:none;">`
                : getInitials(emp.first_name, emp.last_name)}
            </div>
            <div>
              <div class="font-medium">${emp.first_name} ${emp.last_name}</div>
              <div class="text-xs text-secondary mt-1">Joined: ${new Date(emp.join_date).toLocaleDateString()}</div>
            </div>
          </div>
        </td>
        <td><span class="badge badge--neutral">${emp.employee_id}</span></td>
        <td>
          <div class="font-medium text-sm">${emp.designation || '—'}</div>
          <div class="text-xs text-muted mt-1">${emp.department || '—'}</div>
        </td>
        <td>
          <div class="text-sm">${emp.email}</div>
          <div class="text-xs text-muted mt-1">${emp.phone || '—'}</div>
        </td>
        <td>
           <span class="badge ${emp.role === 'admin' ? 'badge--primary' : 'badge--neutral'} capitalize">${emp.role}</span>
        </td>
        <td onclick="event.stopPropagation()">
           <button class="btn btn--ghost btn--icon edit-emp-btn" data-id="${emp.id}" title="Edit">
             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
           </button>
        </td>
      </tr>
    `).join('');

    // Attach Edit Event Listeners
    container.querySelectorAll('.edit-emp-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const empId = parseInt(btn.dataset.id);
        const emp = allEmployees.find(e => e.id === empId);
        if (emp) openEditModal(emp);
      });
    });
  };

  try {
    const res = await apiGet('/api/employees');
    allEmployees = res.employees || [];
    renderRows(allEmployees);
  } catch(e) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center text-error py-8">Failed to load employees</td></tr>`;
    showToast({type:'error', message:'Failed to fetch employees'});
  }

  // Search logic
  const searchInput = container.querySelector('#emp-search');
  searchInput.addEventListener('input', debounce((e) => {
    const term = e.target.value.toLowerCase();
    const filtered = allEmployees.filter(emp => 
      (emp.first_name + ' ' + emp.last_name).toLowerCase().includes(term) ||
      emp.email.toLowerCase().includes(term) ||
      emp.employee_id.toLowerCase().includes(term) ||
      (emp.department || '').toLowerCase().includes(term)
    );
    renderRows(filtered);
  }, 300));

  // Add Employee Logic
  const addBtn = container.querySelector('#add-emp-btn');
  addBtn.addEventListener('click', () => {
    openModal({
      title: 'Add New Employee',
      content: `
        <form id="add-emp-form">
          <div class="grid grid-2">
            <div class="form-group">
              <label class="form-label">First Name</label>
              <input type="text" id="add-first-name" class="form-input" required>
            </div>
            <div class="form-group">
              <label class="form-label">Last Name</label>
              <input type="text" id="add-last-name" class="form-input" required>
            </div>
            <div class="form-group">
              <label class="form-label">Employee ID</label>
              <input type="text" id="add-emp-id" class="form-input" required placeholder="EMP00X">
            </div>
            <div class="form-group">
              <label class="form-label">Email</label>
              <input type="email" id="add-email" class="form-input" required>
            </div>
            <div class="form-group">
              <label class="form-label">Password</label>
              <input type="password" id="add-password" class="form-input" required>
            </div>
            <div class="form-group">
              <label class="form-label">System Role</label>
              <select id="add-role" class="form-select">
                <option value="employee">Employee</option>
                <option value="admin">Admin / HR</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Department</label>
              <input type="text" id="add-department" class="form-input">
            </div>
            <div class="form-group">
              <label class="form-label">Designation</label>
              <input type="text" id="add-designation" class="form-input">
            </div>
            <div class="form-group" style="grid-column: 1 / -1;">
              <label class="form-label">Join Date</label>
              <input type="date" id="add-join-date" class="form-input">
            </div>
          </div>
          <div id="add-error" class="form-error hidden mb-4"></div>
          <div class="flex justify-end gap-3 mt-4">
            <button type="button" class="btn btn--ghost" onclick="document.querySelector('.modal-backdrop')?.click()">Cancel</button>
            <button type="submit" class="btn btn--primary">Create Employee</button>
          </div>
        </form>
      `
    });

    setTimeout(() => {
      const form = document.getElementById('add-emp-form');
      const errEl = document.getElementById('add-error');
      if (form) {
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          const btn = form.querySelector('button[type="submit"]');
          btn.disabled = true;
          btn.innerHTML = '<div class="spinner"></div>';
          errEl.classList.add('hidden');

          try {
            await apiPost('/api/auth/signup', {
              first_name: document.getElementById('add-first-name').value,
              last_name: document.getElementById('add-last-name').value,
              employee_id: document.getElementById('add-emp-id').value,
              email: document.getElementById('add-email').value,
              password: document.getElementById('add-password').value,
              role: document.getElementById('add-role').value,
              department: document.getElementById('add-department').value,
              designation: document.getElementById('add-designation').value,
              join_date: document.getElementById('add-join-date').value
            });
            
            showToast({ type: 'success', message: 'Employee added successfully!' });
            closeModal();
            
            // Reload list
            const res = await apiGet('/api/employees');
            allEmployees = res.employees || [];
            renderRows(allEmployees);
          } catch (error) {
            errEl.textContent = error.message || 'Failed to create employee';
            errEl.classList.remove('hidden');
            btn.disabled = false;
            btn.innerHTML = 'Create Employee';
          }
        });
      }
    }, 50);
  });

  // Edit Employee Modal Logic
  function openEditModal(emp) {
    openModal({
      title: 'Edit Employee',
      content: `
        <form id="edit-emp-form">
          <div class="grid grid-2">
            <div class="form-group">
              <label class="form-label">First Name</label>
              <input type="text" id="edit-first-name" class="form-input" required value="${emp.first_name || ''}">
            </div>
            <div class="form-group">
              <label class="form-label">Last Name</label>
              <input type="text" id="edit-last-name" class="form-input" required value="${emp.last_name || ''}">
            </div>
            <div class="form-group">
              <label class="form-label">Phone</label>
              <input type="tel" id="edit-phone" class="form-input" value="${emp.phone || ''}">
            </div>
            <div class="form-group">
              <label class="form-label">Department</label>
              <input type="text" id="edit-department" class="form-input" value="${emp.department || ''}">
            </div>
            <div class="form-group">
              <label class="form-label">Designation</label>
              <input type="text" id="edit-designation" class="form-input" value="${emp.designation || ''}">
            </div>
            <div class="form-group">
              <label class="form-label">Join Date</label>
              <input type="date" id="edit-join-date" class="form-input" value="${emp.join_date || ''}">
            </div>
            <div class="form-group" style="grid-column: 1 / -1;">
              <label class="form-label">Address</label>
              <textarea id="edit-address" class="form-input" rows="2">${emp.address || ''}</textarea>
            </div>
          </div>
          <div id="edit-error" class="form-error hidden mb-4"></div>
          <div class="flex justify-end gap-3 mt-4">
            <button type="button" class="btn btn--ghost" onclick="document.querySelector('.modal-backdrop')?.click()">Cancel</button>
            <button type="submit" class="btn btn--primary">Save Changes</button>
          </div>
        </form>
      `
    });

    setTimeout(() => {
      const form = document.getElementById('edit-emp-form');
      const errEl = document.getElementById('edit-error');
      
      if (form) {
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          const btn = form.querySelector('button[type="submit"]');
          btn.disabled = true;
          btn.innerHTML = '<div class="spinner"></div>';
          errEl.classList.add('hidden');

          try {
            // To be safe, I'll use fetch directly with token.
            const token = localStorage.getItem('hrms_token');
            const response = await fetch('/api/employees/' + emp.id, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
              },
              body: JSON.stringify({
                first_name: document.getElementById('edit-first-name').value,
                last_name: document.getElementById('edit-last-name').value,
                phone: document.getElementById('edit-phone').value,
                department: document.getElementById('edit-department').value,
                designation: document.getElementById('edit-designation').value,
                join_date: document.getElementById('edit-join-date').value,
                address: document.getElementById('edit-address').value
              })
            });
            const data = await response.json();
            
            if (!response.ok) throw new Error(data.error || 'Failed to update');
            
            showToast({ type: 'success', message: 'Employee updated successfully!' });
            closeModal();
            
            // Reload list
            const res = await apiGet('/api/employees');
            allEmployees = res.employees || [];
            renderRows(allEmployees);
          } catch (error) {
            errEl.textContent = error.message || 'Failed to update employee';
            errEl.classList.remove('hidden');
            btn.disabled = false;
            btn.innerHTML = 'Save Changes';
          }
        });
      }
    }, 50);
  }
}
