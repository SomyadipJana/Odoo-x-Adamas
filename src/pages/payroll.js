import { renderSidebar } from '../components/sidebar.js';
import { renderHeader } from '../components/header.js';
import { apiGet, apiPut, getCachedUser } from '../utils/api.js';
import { formatCurrency, getMonthName } from '../utils/helpers.js';
import { showToast } from '../components/toast.js';

export default async function renderPayroll(container) {
  const user = getCachedUser();
  const isAdmin = user?.role === 'admin';

  container.innerHTML = `
    <div class="app-layout">
      ${renderSidebar(user)}
      <main class="main-content">
        ${renderHeader('Payroll', isAdmin ? 'Manage employee salaries' : 'View your payslips and salary breakdown')}
        <div class="page-container" id="payroll-content">
          <div class="loading-screen"><div class="spinner spinner--lg"></div></div>
        </div>
      </main>
    </div>
  `;

  const content = container.querySelector('#payroll-content');
  if (isAdmin) {
    await renderAdminView(content);
  } else {
    await renderEmployeeView(content);
  }
}

async function renderEmployeeView(container) {
  let payrolls = [];
  try {
    const res = await apiGet('/api/payroll/my');
    payrolls = res.payrolls || [];
  } catch(e) {}

  const current = payrolls.length ? payrolls[0] : null;

  if (!current) {
    container.innerHTML = `
      <div class="empty-state glass-card">
        <div class="empty-state__icon">💰</div>
        <div class="empty-state__title">No payroll data</div>
        <div class="empty-state__text">Your salary details have not been updated yet.</div>
      </div>
    `;
    return;
  }

  // Calculate percentages for the bar
  const gross = current.basic_salary + current.hra + current.da + current.deductions; // Include deductions in total width for visual scale
  const basicPct = (current.basic_salary / gross) * 100;
  const hraPct = (current.hra / gross) * 100;
  const daPct = (current.da / gross) * 100;
  const dedPct = (current.deductions / gross) * 100;

  container.innerHTML = `
    <div class="salary-card">
      <div class="salary-header">
        <div>
          <h3 class="font-bold text-xl mb-1">${getMonthName(current.month)} ${current.year}</h3>
          <div class="text-secondary text-sm">Salary Breakdown</div>
        </div>
        <div class="salary-net">
          <div class="salary-net-label">Net Salary</div>
          <div class="salary-net-value">${formatCurrency(current.net_salary)}</div>
        </div>
      </div>

      <div class="salary-bar-container">
        <div class="salary-bar-segment salary-bar-segment--basic" style="width: 0%" data-width="${basicPct}%" data-tooltip="Basic: ${formatCurrency(current.basic_salary)}"></div>
        <div class="salary-bar-segment salary-bar-segment--hra" style="width: 0%" data-width="${hraPct}%" data-tooltip="HRA: ${formatCurrency(current.hra)}"></div>
        <div class="salary-bar-segment salary-bar-segment--da" style="width: 0%" data-width="${daPct}%" data-tooltip="DA: ${formatCurrency(current.da)}"></div>
        <div class="salary-bar-segment salary-bar-segment--deduction" style="width: 0%" data-width="${dedPct}%" data-tooltip="Deductions: ${formatCurrency(current.deductions)}"></div>
      </div>

      <div class="salary-breakdown">
        <div class="breakdown-item">
          <div class="breakdown-label"><div class="breakdown-dot breakdown-dot--basic"></div> Basic</div>
          <div class="breakdown-value">${formatCurrency(current.basic_salary)}</div>
        </div>
        <div class="breakdown-item">
          <div class="breakdown-label"><div class="breakdown-dot breakdown-dot--hra"></div> HRA</div>
          <div class="breakdown-value">${formatCurrency(current.hra)}</div>
        </div>
        <div class="breakdown-item">
          <div class="breakdown-label"><div class="breakdown-dot breakdown-dot--da"></div> DA</div>
          <div class="breakdown-value">${formatCurrency(current.da)}</div>
        </div>
        <div class="breakdown-item">
          <div class="breakdown-label"><div class="breakdown-dot breakdown-dot--deduction"></div> Deductions</div>
          <div class="breakdown-value text-error">-${formatCurrency(current.deductions)}</div>
        </div>
      </div>
    </div>

    <h3 class="font-bold mb-4">Payroll History</h3>
    <div class="glass-card p-0" style="overflow-x: auto;">
      <table class="data-table">
        <thead>
          <tr>
            <th>Month</th>
            <th>Basic</th>
            <th>HRA</th>
            <th>DA</th>
            <th>Deductions</th>
            <th>Net Salary</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          ${payrolls.map(p => `
            <tr>
              <td class="font-medium">${getMonthName(p.month)} ${p.year}</td>
              <td>${formatCurrency(p.basic_salary)}</td>
              <td>${formatCurrency(p.hra)}</td>
              <td>${formatCurrency(p.da)}</td>
              <td class="text-error">-${formatCurrency(p.deductions)}</td>
              <td class="font-bold text-success">${formatCurrency(p.net_salary)}</td>
              <td>
                <button class="btn btn--ghost btn--sm" onclick="alert('Payslip download coming soon!')">Download</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  // Animate the bar
  setTimeout(() => {
    container.querySelectorAll('.salary-bar-segment').forEach(el => {
      el.style.width = el.dataset.width;
    });
  }, 100);
}

async function renderAdminView(container) {
  let employees = [];
  let payrolls = [];
  try {
    const [empRes, payRes] = await Promise.all([
      apiGet('/api/employees'),
      apiGet('/api/payroll/all')
    ]);
    employees = empRes.employees || [];
    payrolls = payRes.payrolls || [];
  } catch(e) {}

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  container.innerHTML = `
    <div class="grid grid-2 mb-8">
      <div class="glass-card">
        <h3 class="font-bold mb-4">Update Salary Structure</h3>
        <form id="payroll-form">
          <div class="grid grid-2">
            <div class="form-group" style="grid-column: 1 / -1;">
              <label class="form-label">Select Employee</label>
              <select class="form-select" id="emp_select" required>
                <option value="">-- Choose Employee --</option>
                ${employees.map(e => `<option value="${e.id}">${e.first_name} ${e.last_name} (${e.employee_id})</option>`).join('')}
              </select>
            </div>
            
            <div class="form-group">
              <label class="form-label">Month</label>
              <select class="form-select" id="month_select" required>
                ${Array.from({length:12}, (_, i) => `<option value="${i}" ${i === currentMonth ? 'selected' : ''}>${getMonthName(i)}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Year</label>
              <input type="number" id="year_input" class="form-input" value="${currentYear}" required>
            </div>

            <div class="form-group">
              <label class="form-label">Basic Salary (₹)</label>
              <input type="number" id="basic_salary" class="form-input calc-input" required value="0">
            </div>
            <div class="form-group">
              <label class="form-label">HRA (₹)</label>
              <input type="number" id="hra" class="form-input calc-input" required value="0">
            </div>
            <div class="form-group">
              <label class="form-label">DA (₹)</label>
              <input type="number" id="da" class="form-input calc-input" required value="0">
            </div>
            <div class="form-group">
              <label class="form-label">Deductions (₹)</label>
              <input type="number" id="deductions" class="form-input calc-input" required value="0">
            </div>
          </div>
          
          <div class="bg-[var(--color-bg-elevated)] p-4 rounded-lg mt-2 mb-6 flex justify-between items-center border border-[var(--color-border)]">
            <span class="font-medium text-secondary">Calculated Net Salary:</span>
            <span class="text-2xl font-bold text-success" id="calc-net">₹0</span>
          </div>

          <button type="submit" class="btn btn--primary btn--full">Save Payroll</button>
        </form>
      </div>
      
      <div>
        <div class="glass-card mb-4">
          <div class="flex justify-between items-center">
            <div>
              <div class="text-sm text-secondary uppercase tracking-wide">Total Payroll</div>
              <div class="text-3xl font-bold mt-1">${formatCurrency(payrolls.reduce((sum, p) => sum + p.net_salary, 0))}</div>
            </div>
            <div class="w-12 h-12 rounded-full bg-[var(--color-primary-bg)] text-[var(--color-primary-light)] flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            </div>
          </div>
        </div>
        
        <h3 class="font-bold mb-4 mt-6">Recent Records</h3>
        <div class="glass-card p-0" style="overflow-x: auto; max-height: 400px;">
          <table class="data-table">
            <thead style="position: sticky; top: 0; background: var(--color-bg-elevated); z-index: 1;">
              <tr>
                <th>Employee</th>
                <th>Period</th>
                <th>Net Salary</th>
              </tr>
            </thead>
            <tbody>
              ${payrolls.slice(0, 10).map(p => `
                <tr>
                  <td class="font-medium">${p.first_name} ${p.last_name}</td>
                  <td class="text-sm text-muted">${getMonthName(p.month)} ${p.year}</td>
                  <td class="text-success font-medium">${formatCurrency(p.net_salary)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  // Calculator logic
  const inputs = container.querySelectorAll('.calc-input');
  const netEl = container.querySelector('#calc-net');
  
  const calculate = () => {
    const basic = parseFloat(container.querySelector('#basic_salary').value) || 0;
    const hra = parseFloat(container.querySelector('#hra').value) || 0;
    const da = parseFloat(container.querySelector('#da').value) || 0;
    const ded = parseFloat(container.querySelector('#deductions').value) || 0;
    netEl.textContent = formatCurrency(basic + hra + da - ded);
  };
  
  inputs.forEach(inp => inp.addEventListener('input', calculate));

  // Form submit
  const form = container.querySelector('#payroll-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button');
    const empId = container.querySelector('#emp_select').value;
    
    if (!empId) {
      showToast({type: 'warning', message: 'Please select an employee'});
      return;
    }

    btn.disabled = true;
    btn.innerHTML = '<div class="spinner"></div>';

    try {
      await apiPut(`/api/payroll/${empId}`, {
        month: parseInt(container.querySelector('#month_select').value),
        year: parseInt(container.querySelector('#year_input').value),
        basic_salary: parseFloat(container.querySelector('#basic_salary').value) || 0,
        hra: parseFloat(container.querySelector('#hra').value) || 0,
        da: parseFloat(container.querySelector('#da').value) || 0,
        deductions: parseFloat(container.querySelector('#deductions').value) || 0
      });
      showToast({type: 'success', message: 'Payroll saved successfully'});
      // Reset form and reload
      form.reset();
      calculate();
      renderPayroll(document.getElementById('app')); // Full re-render
    } catch(err) {
      showToast({type: 'error', message: err.message});
      btn.disabled = false;
      btn.innerHTML = 'Save Payroll';
    }
  });
}
