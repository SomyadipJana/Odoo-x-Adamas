import { initRouter, addRoute, renderRoute, navigate } from './utils/router.js';
import { isAuthenticated, getCachedUser, setCachedUser, clearAuth, apiGet } from './utils/api.js';

import renderLogin from './pages/login.js';
import renderSignup from './pages/signup.js';
import renderDashboard from './pages/dashboard.js';
import renderProfile from './pages/profile.js';
import renderAttendance from './pages/attendance.js';
import renderLeave from './pages/leave.js';
import renderPayroll from './pages/payroll.js';
import renderEmployees from './pages/employees.js';

// Expose logout to window for global access (e.g. from sidebar html)
window.logout = () => {
  clearAuth();
  navigate('/login');
};

// Auth Guard
function guard(handler, requireAdmin = false) {
  return async (container) => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    
    if (requireAdmin) {
      const user = getCachedUser();
      if (user?.role !== 'admin') {
        navigate('/dashboard');
        return;
      }
    }
    
    return handler(container);
  };
}

// Routes
addRoute('/login', renderLogin);
addRoute('/signup', renderSignup);
addRoute('/dashboard', guard(renderDashboard));
addRoute('/profile', guard(renderProfile));
addRoute('/attendance', guard(renderAttendance));
addRoute('/leave', guard(renderLeave));
addRoute('/leave-approvals', guard(renderLeave, true));
addRoute('/payroll', guard(renderPayroll));
addRoute('/employees', guard(renderEmployees, true));

addRoute('/404', (container) => {
  container.innerHTML = `
    <div class="empty-state">
      <div class="empty-state__icon" style="font-size:4rem;margin-bottom:1rem">😕</div>
      <h2 class="empty-state__title" style="font-size:2rem;font-weight:bold;margin-bottom:1rem">Page not found</h2>
      <button class="btn btn--primary" onclick="window.history.back()">Go Back</button>
    </div>
  `;
});

document.addEventListener('DOMContentLoaded', () => {
  initRouter();
  
  // Sync cached user with server if logged in
  if (isAuthenticated()) {
    apiGet('/api/auth/me').then(res => {
      if (res.user) {
        // The backend /api/auth/me returns slightly different keys, let's normalize to match what getCachedUser expects
        setCachedUser({
          id: res.user.id,
          employeeId: res.user.employeeId,
          email: res.user.email,
          role: res.user.role,
          firstName: res.user.firstName,
          lastName: res.user.lastName,
          department: res.user.department,
          designation: res.user.designation,
          profilePicture: res.user.profilePicture,
        });
        
        // Update sidebar avatar if it's currently rendered and different
        const sidebarAvatar = document.querySelector('.sidebar-user-avatar');
        if (sidebarAvatar && res.user.profilePicture) {
          sidebarAvatar.innerHTML = `<img src="${res.user.profilePicture.startsWith('http') ? res.user.profilePicture : '/uploads/' + res.user.profilePicture}" alt="Avatar">`;
        }
      }
    }).catch(() => {});
  }
  
  // Attach global logout listener since it might be re-rendered
  document.body.addEventListener('click', (e) => {
    const logoutBtn = e.target.closest('#logout-btn');
    if (logoutBtn) {
      window.logout();
    }
  });

  const path = window.location.pathname;
  if (path === '/') {
    navigate(isAuthenticated() ? '/dashboard' : '/login');
  } else {
    renderRoute();
  }
});
