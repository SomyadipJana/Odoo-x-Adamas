import { apiPost, setToken, setCachedUser, isAuthenticated } from '../utils/api.js';
import { navigate } from '../utils/router.js';
import { showToast } from '../components/toast.js';

export default async function renderLogin(container) {
  if (isAuthenticated()) {
    navigate('/dashboard');
    return;
  }

  container.innerHTML = `
    <div class="auth-split">
      <div class="auth-split__left">
        <div class="auth-brand">
          <div class="auth-brand__logo">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
            HRMS
          </div>
          <div class="auth-brand__tagline">Every workday, perfectly aligned.</div>
        </div>
      </div>
      <div class="auth-split__right">
        <div class="auth-card glass-card">
          <div class="auth-header">
            <h1 class="auth-title">Welcome back</h1>
            <p class="auth-subtitle">Sign in to your account</p>
          </div>
          <form id="login-form">
            <div class="form-group">
              <label class="form-label" for="email">Email</label>
              <input type="email" id="email" class="form-input" required placeholder="name@company.com">
            </div>
            <div class="form-group">
              <label class="form-label" for="password">Password</label>
              <input type="password" id="password" class="form-input" required placeholder="••••••••">
            </div>
            <div id="error-msg" class="form-error hidden mb-4"></div>
            <button type="submit" class="btn btn--primary btn--full btn--lg mb-4">Sign In</button>
            <div class="text-center text-sm text-secondary">
              Don't have an account? <a href="/signup" data-link>Sign up</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;

  const form = container.querySelector('#login-form');
  const errorMsg = container.querySelector('#error-msg');
  const submitBtn = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMsg.classList.add('hidden');
    submitBtn.innerHTML = '<div class="spinner"></div>';
    submitBtn.disabled = true;

    try {
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      const data = await apiPost('/api/auth/signin', { email, password });
      
      setToken(data.token);
      setCachedUser(data.user);
      
      showToast({ type: 'success', title: 'Welcome back!', message: 'Signed in successfully.' });
      navigate('/dashboard');
    } catch (error) {
      errorMsg.textContent = error.message || 'Failed to sign in';
      errorMsg.classList.remove('hidden');
    } finally {
      submitBtn.innerHTML = 'Sign In';
      submitBtn.disabled = false;
    }
  });
}
