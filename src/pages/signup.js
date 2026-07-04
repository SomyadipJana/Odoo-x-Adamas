import { apiPost, setToken, setCachedUser, isAuthenticated } from '../utils/api.js';
import { navigate } from '../utils/router.js';
import { passwordStrength, isValidEmail } from '../utils/helpers.js';
import { showToast } from '../components/toast.js';

export default async function renderSignup(container) {
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
            <h1 class="auth-title">Create account</h1>
            <p class="auth-subtitle">Join the HRMS platform</p>
          </div>
          
          <div class="role-selector">
            <button type="button" class="role-selector__btn active" data-role="employee">Employee</button>
            <button type="button" class="role-selector__btn" data-role="admin">HR / Admin</button>
          </div>

          <form id="signup-form">
            <input type="hidden" id="role" value="employee">
            
            <div class="form-group">
              <label class="form-label" for="employee_id">Employee ID</label>
              <input type="text" id="employee_id" class="form-input" required placeholder="EMP001">
            </div>
            
            <div class="form-group">
              <label class="form-label" for="email">Email</label>
              <input type="email" id="email" class="form-input" required placeholder="name@company.com">
            </div>
            
            <div class="form-group">
              <label class="form-label" for="password">Password</label>
              <input type="password" id="password" class="form-input" required placeholder="••••••••">
              <div class="password-meter" id="pw-meter">
                <div class="password-meter__bar"></div>
                <div class="password-meter__bar"></div>
                <div class="password-meter__bar"></div>
                <div class="password-meter__bar"></div>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="confirm_password">Confirm Password</label>
              <input type="password" id="confirm_password" class="form-input" required placeholder="••••••••">
            </div>
            
            <div id="error-msg" class="form-error hidden mb-4"></div>
            
            <button type="submit" class="btn btn--primary btn--full btn--lg mb-4">Sign Up</button>
            <div class="text-center text-sm text-secondary">
              Already have an account? <a href="/login" data-link>Sign in</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;

  // Role toggle
  const roleBtns = container.querySelectorAll('.role-selector__btn');
  const roleInput = container.querySelector('#role');
  
  roleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      roleBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      roleInput.value = btn.dataset.role;
    });
  });

  // Password strength
  const pwInput = container.querySelector('#password');
  const pwMeter = container.querySelector('#pw-meter');
  
  pwInput.addEventListener('input', (e) => {
    const val = e.target.value;
    const score = passwordStrength(val);
    pwMeter.className = 'password-meter ' + (val ? `password-meter--${score}` : '');
  });

  // Form submit
  const form = container.querySelector('#signup-form');
  const errorMsg = container.querySelector('#error-msg');
  const submitBtn = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMsg.classList.add('hidden');
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirm = document.getElementById('confirm_password').value;
    const employee_id = document.getElementById('employee_id').value;
    const role = document.getElementById('role').value;

    if (!isValidEmail(email)) {
      errorMsg.textContent = 'Invalid email format';
      errorMsg.classList.remove('hidden');
      return;
    }

    if (password !== confirm) {
      errorMsg.textContent = 'Passwords do not match';
      errorMsg.classList.remove('hidden');
      return;
    }

    if (passwordStrength(password) < 2) {
      errorMsg.textContent = 'Password is too weak';
      errorMsg.classList.remove('hidden');
      return;
    }

    submitBtn.innerHTML = '<div class="spinner"></div>';
    submitBtn.disabled = true;

    try {
      const data = await apiPost('/api/auth/signup', { email, password, employee_id, role });
      
      setToken(data.token);
      setCachedUser(data.user);
      
      showToast({ type: 'success', title: 'Account created!', message: 'Welcome to HRMS.' });
      navigate('/dashboard');
    } catch (error) {
      errorMsg.textContent = error.message || 'Failed to sign up';
      errorMsg.classList.remove('hidden');
    } finally {
      submitBtn.innerHTML = 'Sign Up';
      submitBtn.disabled = false;
    }
  });
}
