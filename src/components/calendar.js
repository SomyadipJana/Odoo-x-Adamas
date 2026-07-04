/**
 * Interactive Calendar Component
 */
import { getMonthName, toISODate } from '../utils/helpers.js';

export function renderCalendar({ 
  containerId, 
  month, 
  year, 
  data = {}, 
  onDateClick, 
  onMonthChange,
  selectionRange = null // { start: 'YYYY-MM-DD', end: 'YYYY-MM-DD' }
}) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const todayStr = toISODate(new Date());
  
  // Calculate days in month and starting day
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay(); // 0 (Sun) to 6 (Sat)
  
  let html = `
    <style>
      .calendar {
        background: var(--color-bg-elevated);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-xl);
        overflow: hidden;
      }
      .calendar-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--sp-4) var(--sp-6);
        border-bottom: 1px solid var(--color-border);
        background: rgba(0,0,0,0.2);
      }
      .calendar-title {
        font-weight: var(--fw-bold);
        font-size: var(--fs-lg);
      }
      .calendar-nav-btn {
        padding: var(--sp-2);
        border-radius: var(--radius-md);
        color: var(--color-text-secondary);
        transition: all var(--transition-fast);
      }
      .calendar-nav-btn:hover {
        background: var(--color-surface-hover);
        color: var(--color-text);
      }
      .calendar-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
      }
      .calendar-day-header {
        text-align: center;
        padding: var(--sp-3) 0;
        font-size: var(--fs-xs);
        font-weight: var(--fw-semibold);
        color: var(--color-text-muted);
        text-transform: uppercase;
        border-bottom: 1px solid var(--color-border);
      }
      .calendar-cell {
        aspect-ratio: 1;
        border-bottom: 1px solid var(--color-border);
        border-right: 1px solid var(--color-border);
        padding: var(--sp-2);
        display: flex;
        flex-direction: column;
        cursor: pointer;
        transition: background var(--transition-fast);
        position: relative;
      }
      .calendar-cell:nth-child(7n) {
        border-right: none;
      }
      .calendar-cell.empty {
        background: rgba(0,0,0,0.1);
        cursor: default;
      }
      .calendar-cell:not(.empty):hover {
        background: var(--color-surface-hover);
      }
      .calendar-day-num {
        font-size: var(--fs-sm);
        font-weight: var(--fw-medium);
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--radius-full);
        margin-bottom: auto;
      }
      .calendar-cell.today .calendar-day-num {
        background: var(--color-primary);
        color: white;
        box-shadow: 0 0 10px rgba(99, 102, 241, 0.4);
      }
      .calendar-dots {
        display: flex;
        gap: 4px;
        justify-content: center;
        margin-top: 4px;
      }
      .status-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
      }
      .status-dot.present { background: var(--color-success); box-shadow: 0 0 5px var(--color-success); }
      .status-dot.absent { background: var(--color-error); box-shadow: 0 0 5px var(--color-error); }
      .status-dot.half-day { background: var(--color-warning); box-shadow: 0 0 5px var(--color-warning); }
      .status-dot.leave { background: var(--color-info); box-shadow: 0 0 5px var(--color-info); }
      
      /* Selection styles for leave apply */
      .calendar-cell.selected {
        background: var(--color-primary-bg) !important;
      }
      .calendar-cell.selected-start .calendar-day-num,
      .calendar-cell.selected-end .calendar-day-num {
        background: var(--color-primary);
        color: white;
      }
      .calendar-cell.in-range {
        background: rgba(99, 102, 241, 0.1);
      }
    </style>
    <div class="calendar">
      <div class="calendar-header">
        <button class="calendar-nav-btn" id="prev-month">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </button>
        <div class="calendar-title">${getMonthName(month)} ${year}</div>
        <button class="calendar-nav-btn" id="next-month">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>
      </div>
      <div class="calendar-grid">
        <div class="calendar-day-header">Sun</div>
        <div class="calendar-day-header">Mon</div>
        <div class="calendar-day-header">Tue</div>
        <div class="calendar-day-header">Wed</div>
        <div class="calendar-day-header">Thu</div>
        <div class="calendar-day-header">Fri</div>
        <div class="calendar-day-header">Sat</div>
  `;

  // Empty cells for days before the 1st
  for (let i = 0; i < firstDay; i++) {
    html += `<div class="calendar-cell empty"></div>`;
  }

  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const isToday = dateStr === todayStr;
    const dayData = data[dateStr];
    
    let cellClasses = 'calendar-cell';
    if (isToday) cellClasses += ' today';
    
    // Selection logic
    if (selectionRange) {
      if (dateStr === selectionRange.start) cellClasses += ' selected selected-start';
      if (dateStr === selectionRange.end) cellClasses += ' selected selected-end';
      if (selectionRange.start && selectionRange.end && 
          dateStr > selectionRange.start && dateStr < selectionRange.end) {
        cellClasses += ' in-range';
      }
      if (selectionRange.start && !selectionRange.end && dateStr === selectionRange.start) {
         cellClasses += ' selected selected-start';
      }
    }

    html += `
      <div class="${cellClasses}" data-date="${dateStr}">
        <div class="calendar-day-num">${day}</div>
        <div class="calendar-dots">
          ${dayData && dayData.status ? `<div class="status-dot ${dayData.status}" title="${dayData.label || dayData.status}"></div>` : ''}
        </div>
      </div>
    `;
  }

  // Complete the grid
  const totalCells = firstDay + daysInMonth;
  const remainingCells = (7 - (totalCells % 7)) % 7;
  for (let i = 0; i < remainingCells; i++) {
    html += `<div class="calendar-cell empty"></div>`;
  }

  html += `</div></div>`;
  container.innerHTML = html;

  // Event Listeners
  if (onMonthChange) {
    container.querySelector('#prev-month').addEventListener('click', () => {
      let m = month - 1;
      let y = year;
      if (m < 0) { m = 11; y--; }
      onMonthChange(m, y);
    });

    container.querySelector('#next-month').addEventListener('click', () => {
      let m = month + 1;
      let y = year;
      if (m > 11) { m = 0; y++; }
      onMonthChange(m, y);
    });
  }

  if (onDateClick) {
    container.querySelectorAll('.calendar-cell:not(.empty)').forEach(cell => {
      cell.addEventListener('click', () => {
        onDateClick(cell.dataset.date);
      });
    });
  }
}
