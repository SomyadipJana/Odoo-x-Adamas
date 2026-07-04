(function(){const a=document.createElement("link").relList;if(a&&a.supports&&a.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))l(n);new MutationObserver(n=>{for(const d of n)if(d.type==="childList")for(const i of d.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&l(i)}).observe(document,{childList:!0,subtree:!0});function t(n){const d={};return n.integrity&&(d.integrity=n.integrity),n.referrerPolicy&&(d.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?d.credentials="include":n.crossOrigin==="anonymous"?d.credentials="omit":d.credentials="same-origin",d}function l(n){if(n.ep)return;n.ep=!0;const d=t(n);fetch(n.href,d)}})();const P={};let j=null;function $(e,a){P[e]=a}function S(e){window.history.pushState({},"",e),R()}async function R(){const e=window.location.pathname,a=document.getElementById("app");typeof j=="function"&&(j(),j=null);const t=P[e]||P["/404"]||P["/login"];if(t){const l=await t(a);typeof l=="function"&&(j=l)}}function le(){window.addEventListener("popstate",()=>{R()}),document.addEventListener("click",e=>{const a=e.target.closest("a[data-link]");if(a){e.preventDefault();const t=a.getAttribute("href");t&&t!==window.location.pathname&&S(t)}})}const O="hrms_token",V="hrms_user";function ee(){return localStorage.getItem(O)}function te(e){localStorage.setItem(O,e)}function re(){localStorage.removeItem(O),localStorage.removeItem(V)}function E(){try{const e=localStorage.getItem(V);return e?JSON.parse(e):null}catch{return null}}function J(e){localStorage.setItem(V,JSON.stringify(e))}function N(){return!!ee()}async function Y(e,a={}){const t=ee(),l={...a.headers||{}};a.body instanceof FormData||(l["Content-Type"]="application/json"),t&&(l.Authorization=`Bearer ${t}`);const n=await fetch(e,{...a,headers:l}),d=await n.json();if(!n.ok){const i=new Error(d.message||"Something went wrong");throw i.status=n.status,i.data=d,i}return d}function g(e){return Y(e,{method:"GET"})}function I(e,a){return Y(e,{method:"POST",body:a instanceof FormData?a:JSON.stringify(a)})}function U(e,a){return Y(e,{method:"PUT",body:a instanceof FormData?a:JSON.stringify(a)})}function x({type:e="info",title:a,message:t}){const l=document.getElementById("toast-container");if(!l)return;const n=document.createElement("div");n.className=`toast toast--${e}`;const d={success:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>',error:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>',warning:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',info:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>'};n.innerHTML=`
    <div class="toast__icon">
      ${d[e]||d.info}
    </div>
    <div class="toast__body">
      ${a?`<div class="toast__title">${a}</div>`:""}
      <div class="toast__message">${t}</div>
    </div>
    <div class="toast__close">&times;</div>
  `,n.querySelector(".toast__close").addEventListener("click",()=>{Z(n)}),l.appendChild(n),setTimeout(()=>{n.parentElement&&Z(n)},4e3)}function Z(e){e.classList.add("toast--exit"),e.addEventListener("animationend",()=>{e.parentElement&&e.parentElement.removeChild(e)})}async function ne(e){if(N()){S("/dashboard");return}e.innerHTML=`
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
  `;const a=e.querySelector("#login-form"),t=e.querySelector("#error-msg"),l=a.querySelector('button[type="submit"]');a.addEventListener("submit",async n=>{n.preventDefault(),t.classList.add("hidden"),l.innerHTML='<div class="spinner"></div>',l.disabled=!0;try{const d=document.getElementById("email").value,i=document.getElementById("password").value,s=await I("/api/auth/signin",{email:d,password:i});te(s.token),J(s.user),x({type:"success",title:"Welcome back!",message:"Signed in successfully."}),S("/dashboard")}catch(d){t.textContent=d.message||"Failed to sign in",t.classList.remove("hidden")}finally{l.innerHTML="Sign In",l.disabled=!1}})}function _(e,a={}){const t=new Date(e);return isNaN(t.getTime())?"—":t.toLocaleDateString("en-IN",{year:"numeric",month:"short",day:"numeric",...a})}function M(e){const a=new Date(e);return isNaN(a.getTime())?"—":a.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",hour12:!0})}function W(e){const a=new Date(e),t=a.getFullYear(),l=String(a.getMonth()+1).padStart(2,"0"),n=String(a.getDate()).padStart(2,"0");return`${t}-${l}-${n}`}function T(e){return["January","February","March","April","May","June","July","August","September","October","November","December"][e]}function f(e){return e==null||isNaN(e)?"₹0":new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",minimumFractionDigits:0,maximumFractionDigits:0}).format(e)}function de(e){return/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)}function Q(e){let a=0;return e.length>=8&&a++,/[A-Z]/.test(e)&&/[a-z]/.test(e)&&a++,/[0-9]/.test(e)&&a++,/[^A-Za-z0-9]/.test(e)&&a++,a}function G(e,a){return`${(e||"")[0]||""}${(a||"")[0]||""}`.toUpperCase()}function oe(e,a=300){let t;return(...l)=>{clearTimeout(t),t=setTimeout(()=>e(...l),a)}}function z(e,a){const t=new Date(e),l=new Date(a),n=Math.abs(l-t);return Math.ceil(n/(1e3*60*60*24))+1}function K(e){return{present:"badge--success",approved:"badge--success",absent:"badge--error",rejected:"badge--error","half-day":"badge--warning",pending:"badge--warning",leave:"badge--info",paid:"badge--success",sick:"badge--warning",unpaid:"badge--neutral"}[(e||"").toLowerCase()]||"badge--neutral"}async function ce(e){if(N()){S("/dashboard");return}e.innerHTML=`
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
  `;const a=e.querySelectorAll(".role-selector__btn"),t=e.querySelector("#role");a.forEach(c=>{c.addEventListener("click",()=>{a.forEach(r=>r.classList.remove("active")),c.classList.add("active"),t.value=c.dataset.role})});const l=e.querySelector("#password"),n=e.querySelector("#pw-meter");l.addEventListener("input",c=>{const r=c.target.value,o=Q(r);n.className="password-meter "+(r?`password-meter--${o}`:"")});const d=e.querySelector("#signup-form"),i=e.querySelector("#error-msg"),s=d.querySelector('button[type="submit"]');d.addEventListener("submit",async c=>{c.preventDefault(),i.classList.add("hidden");const r=document.getElementById("email").value,o=document.getElementById("password").value,v=document.getElementById("confirm_password").value,p=document.getElementById("employee_id").value,m=document.getElementById("role").value;if(!de(r)){i.textContent="Invalid email format",i.classList.remove("hidden");return}if(o!==v){i.textContent="Passwords do not match",i.classList.remove("hidden");return}if(Q(o)<2){i.textContent="Password is too weak",i.classList.remove("hidden");return}s.innerHTML='<div class="spinner"></div>',s.disabled=!0;try{const u=await I("/api/auth/signup",{email:r,password:o,employee_id:p,role:m});te(u.token),J(u.user),x({type:"success",title:"Account created!",message:"Welcome to HRMS."}),S("/dashboard")}catch(u){i.textContent=u.message||"Failed to sign up",i.classList.remove("hidden")}finally{s.innerHTML="Sign Up",s.disabled=!1}})}function B(e){const a=window.location.pathname,t=[{name:"Dashboard",path:"/dashboard",icon:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>'},{name:"Profile",path:"/profile",icon:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>'},{name:"Attendance",path:"/attendance",icon:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>'},{name:"Leave",path:"/leave",icon:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>'},{name:"Payroll",path:"/payroll",icon:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>'}];(e==null?void 0:e.role)==="admin"&&t.push({separator:!0},{name:"Employees",path:"/employees",icon:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>'},{name:"Leave Approvals",path:"/leave-approvals",icon:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>'});const l=t.map(i=>{if(i.separator)return'<div class="sidebar-separator"><span>Admin Tools</span></div>';const s=a===i.path||a.startsWith(i.path+"/");return`
      <a href="${i.path}" class="sidebar-nav-item ${s?"active":""}" data-link>
        <span class="sidebar-nav-icon">${i.icon}</span>
        <span class="sidebar-nav-label">${i.name}</span>
      </a>
    `}).join(""),n=G(e==null?void 0:e.firstName,e==null?void 0:e.lastName),d=`${(e==null?void 0:e.firstName)||""} ${(e==null?void 0:e.lastName)||""}`.trim()||"User";return`
    <style>
      .sidebar {
        position: fixed;
        left: 0;
        top: 0;
        bottom: 0;
        width: var(--sidebar-width);
        background: var(--color-bg-elevated);
        border-right: 1px solid var(--color-border);
        display: flex;
        flex-direction: column;
        z-index: var(--z-sidebar);
        transition: width var(--transition-base);
      }
      .sidebar-brand {
        height: var(--header-height);
        display: flex;
        align-items: center;
        padding: 0 var(--sp-6);
        gap: var(--sp-3);
        border-bottom: 1px solid var(--color-border);
      }
      .sidebar-brand-icon {
        width: 32px;
        height: 32px;
        border-radius: var(--radius-md);
        background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .sidebar-brand-text {
        font-weight: var(--fw-bold);
        font-size: var(--fs-lg);
        letter-spacing: -0.025em;
      }
      .sidebar-nav {
        flex: 1;
        padding: var(--sp-4) var(--sp-3);
        overflow-y: auto;
      }
      .sidebar-nav-item {
        display: flex;
        align-items: center;
        gap: var(--sp-3);
        padding: var(--sp-3);
        border-radius: var(--radius-lg);
        color: var(--color-text-secondary);
        margin-bottom: var(--sp-1);
        position: relative;
        overflow: hidden;
      }
      .sidebar-nav-item:hover {
        background: var(--color-surface-hover);
        color: var(--color-text);
      }
      .sidebar-nav-item.active {
        background: var(--color-primary-bg);
        color: var(--color-primary-light);
      }
      .sidebar-nav-item.active::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 3px;
        background: var(--color-primary);
        border-radius: 0 4px 4px 0;
      }
      .sidebar-nav-icon {
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .sidebar-separator {
        padding: var(--sp-4) var(--sp-4) var(--sp-2);
        font-size: var(--fs-xs);
        text-transform: uppercase;
        letter-spacing: 0.1em;
        font-weight: var(--fw-semibold);
        color: var(--color-text-muted);
      }
      .sidebar-footer {
        padding: var(--sp-4);
        border-top: 1px solid var(--color-border);
      }
      .sidebar-user {
        display: flex;
        align-items: center;
        gap: var(--sp-3);
        margin-bottom: var(--sp-4);
      }
      .sidebar-user-avatar {
        width: 40px;
        height: 40px;
        border-radius: var(--radius-full);
        background: linear-gradient(135deg, var(--color-accent), var(--color-primary));
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: var(--fw-bold);
        font-size: var(--fs-sm);
        flex-shrink: 0;
      }
      .sidebar-user-avatar img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: var(--radius-full);
      }
      .sidebar-user-info {
        flex: 1;
        min-width: 0;
      }
      .sidebar-user-name {
        font-weight: var(--fw-medium);
        font-size: var(--fs-sm);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .sidebar-user-role {
        font-size: var(--fs-xs);
        color: var(--color-text-muted);
        text-transform: capitalize;
      }
      @media (max-width: 768px) {
        .sidebar {
          transform: translateX(-100%);
        }
        .sidebar.open {
          transform: translateX(0);
        }
      }
    </style>
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-brand">
        <div class="sidebar-brand-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
        </div>
        <div class="sidebar-brand-text">HRMS</div>
      </div>
      <nav class="sidebar-nav">
        ${l}
      </nav>
      <div class="sidebar-footer">
        <div class="sidebar-user">
          <div class="sidebar-user-avatar">
            ${e!=null&&e.profilePicture?`<img src="${e.profilePicture.startsWith("http")?e.profilePicture:"/uploads/"+e.profilePicture}" alt="Avatar">`:n}
          </div>
          <div class="sidebar-user-info">
            <div class="sidebar-user-name">${d}</div>
            <div class="sidebar-user-role">${(e==null?void 0:e.role)||"Employee"}</div>
          </div>
        </div>
        <button id="logout-btn" class="btn btn--ghost btn--full btn--sm">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          Sign Out
        </button>
      </div>
    </aside>
  `}function A(e,a=""){return`
    <style>
      .app-header {
        position: fixed;
        top: 0;
        right: 0;
        left: var(--sidebar-width);
        height: var(--header-height);
        background: var(--glass-bg);
        backdrop-filter: blur(var(--glass-blur));
        -webkit-backdrop-filter: blur(var(--glass-blur));
        border-bottom: 1px solid var(--color-border);
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 var(--sp-8);
        z-index: var(--z-header);
        transition: left var(--transition-base);
      }
      .header-title-container {
        display: flex;
        flex-direction: column;
      }
      .header-title {
        font-weight: var(--fw-semibold);
        font-size: var(--fs-lg);
        margin: 0;
        line-height: 1.2;
      }
      .header-subtitle {
        font-size: var(--fs-xs);
        color: var(--color-text-muted);
      }
      .header-right {
        display: flex;
        align-items: center;
        gap: var(--sp-4);
      }
      .header-date {
        font-size: var(--fs-sm);
        color: var(--color-text-secondary);
        display: flex;
        align-items: center;
        gap: var(--sp-2);
      }
      .mobile-menu-btn {
        display: none;
        background: none;
        border: none;
        color: var(--color-text);
        cursor: pointer;
        padding: var(--sp-2);
      }
      @media (max-width: 768px) {
        .app-header {
          left: 0;
          padding: 0 var(--sp-4);
        }
        .mobile-menu-btn {
          display: block;
        }
        .header-date {
          display: none;
        }
      }
    </style>
    <header class="app-header">
      <div class="flex items-center gap-4">
        <button class="mobile-menu-btn" id="mobile-menu-btn">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </button>
        <div class="header-title-container">
          <h1 class="header-title">${e}</h1>
          ${a?`<div class="header-subtitle">${a}</div>`:""}
        </div>
      </div>
      <div class="header-right">
        <div class="header-date">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          ${_(new Date,{weekday:"short",month:"short",day:"numeric"})}
        </div>
      </div>
    </header>
  `}async function ve(e){var c;const a=E(),t=(a==null?void 0:a.role)==="admin";let l={},n=[];try{if(t){const[r,o,v]=await Promise.all([g("/api/employees"),g("/api/leave/all"),g("/api/attendance/daily?date="+new Date().toISOString().split("T")[0])]);l={totalEmployees:r.length,presentToday:v.filter(p=>p.status==="present").length,pendingLeaves:o.filter(p=>p.status==="pending").length,departments:new Set(r.map(p=>p.department)).size},n=o.slice(0,5).map(p=>({icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path><polyline points="9 11 12 14 22 4"></polyline></svg>',title:`${p.first_name} ${p.last_name} applied for ${p.leave_type} leave`,time:p.created_at}))}else{const[r,o,v]=await Promise.all([g("/api/attendance/today"),g("/api/leave/my"),g(`/api/attendance/monthly/${a.employeeId}?month=${new Date().getMonth()}&year=${new Date().getFullYear()}`)]),p=Array.isArray(v)?v:[];l={status:(r==null?void 0:r.status)||"Not Checked In",time:r!=null&&r.check_in?M(r.check_in):"--:--",leaveBalance:12-o.filter(m=>m.status==="approved"&&m.leave_type==="paid").length,presentDays:p.filter(m=>m.status==="present").length,pendingRequests:o.filter(m=>m.status==="pending").length},n=o.slice(0,5).map(m=>({icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect></svg>',title:`Leave request ${m.status}`,time:m.created_at})),r!=null&&r.check_in&&n.unshift({icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>',title:`Checked in at ${M(r.check_in)}`,time:r.check_in})}}catch(r){console.error("Failed to load dashboard data",r)}const d=new Date().getHours(),i=d<12?"Good morning":d<17?"Good afternoon":"Good evening",s=(a==null?void 0:a.firstName)||((c=a==null?void 0:a.email)==null?void 0:c.split("@")[0])||"User";e.innerHTML=`
    <div class="app-layout">
      ${B(a)}
      <main class="main-content">
        ${A("Dashboard","Overview of your HRMS")}
        
        <div class="page-container">
          <div class="dashboard-welcome">
            <h2>${i}, ${s}!</h2>
            <p>Here's what's happening today.</p>
          </div>

          ${t?pe(l,n):ue(l,n)}
        </div>
      </main>
    </div>
  `}function pe(e,a){return`
    <div class="stats-grid">
      <div class="glass-card stat-card">
        <div class="stat-card__icon stat-card__icon--primary">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
        </div>
        <div class="stat-card__info mt-4">
          <div class="stat-card__label">Total Employees</div>
          <div class="stat-card__value">${e.totalEmployees||0}</div>
        </div>
      </div>
      <div class="glass-card stat-card">
        <div class="stat-card__icon stat-card__icon--success">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
        <div class="stat-card__info mt-4">
          <div class="stat-card__label">Present Today</div>
          <div class="stat-card__value">${e.presentToday||0}</div>
        </div>
      </div>
      <div class="glass-card stat-card">
        <div class="stat-card__icon stat-card__icon--warning">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
        </div>
        <div class="stat-card__info mt-4">
          <div class="stat-card__label">Pending Leaves</div>
          <div class="stat-card__value">${e.pendingLeaves||0}</div>
        </div>
      </div>
      <div class="glass-card stat-card">
        <div class="stat-card__icon stat-card__icon--info">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
        </div>
        <div class="stat-card__info mt-4">
          <div class="stat-card__label">Departments</div>
          <div class="stat-card__value">${e.departments||0}</div>
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
          ${a.length?a.map(t=>`
            <div class="activity-item">
              <div class="activity-icon">${t.icon}</div>
              <div class="activity-details">
                <div class="activity-title">${t.title}</div>
                <div class="activity-time">${new Date(t.time).toLocaleString()}</div>
              </div>
            </div>
          `).join(""):'<div class="text-muted text-sm">No recent activity</div>'}
        </div>
      </div>
    </div>
  `}function ue(e,a){return`
    <div class="stats-grid">
      <div class="glass-card stat-card">
        <div class="stat-card__icon ${e.status==="present"?"stat-card__icon--success":"stat-card__icon--primary"}">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
        </div>
        <div class="stat-card__info mt-4">
          <div class="stat-card__label">Today's Status</div>
          <div class="stat-card__value capitalize">${e.status}</div>
          <div class="text-xs text-muted mt-1">${e.time!=="--:--"?`Since ${e.time}`:""}</div>
        </div>
      </div>
      <div class="glass-card stat-card">
        <div class="stat-card__icon stat-card__icon--info">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect></svg>
        </div>
        <div class="stat-card__info mt-4">
          <div class="stat-card__label">Leave Balance</div>
          <div class="stat-card__value">${e.leaveBalance||0}</div>
        </div>
      </div>
      <div class="glass-card stat-card">
        <div class="stat-card__icon stat-card__icon--success">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
        <div class="stat-card__info mt-4">
          <div class="stat-card__label">Present Days (Month)</div>
          <div class="stat-card__value">${e.presentDays||0}</div>
        </div>
      </div>
      <div class="glass-card stat-card">
        <div class="stat-card__icon stat-card__icon--warning">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
        </div>
        <div class="stat-card__info mt-4">
          <div class="stat-card__label">Pending Requests</div>
          <div class="stat-card__value">${e.pendingRequests||0}</div>
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
           ${a.length?a.map(t=>`
            <div class="activity-item">
              <div class="activity-icon">${t.icon}</div>
              <div class="activity-details">
                <div class="activity-title">${t.title}</div>
                <div class="activity-time">${new Date(t.time).toLocaleString()}</div>
              </div>
            </div>
          `).join(""):'<div class="text-muted text-sm">No recent activity</div>'}
        </div>
      </div>
    </div>
  `}async function me(e){const a=E();let t={},l=[];try{t=await g(`/api/employees/${a.employeeId}`);try{l=await g("/api/payroll/my")}catch{}}catch{x({type:"error",message:"Failed to load profile data"});return}const n=G(t.first_name,t.last_name),d=`${t.first_name} ${t.last_name}`,i=l.length?l[0]:null;e.innerHTML=`
    <div class="app-layout">
      ${B(a)}
      <main class="main-content">
        ${A("My Profile","Manage your account and view details")}
        
        <div class="page-container">
          <div class="profile-hero">
            <div class="profile-avatar-container">
              <div class="profile-avatar">
                ${t.profile_picture?`<img src="${t.profile_picture.startsWith("http")?t.profile_picture:"/uploads/"+t.profile_picture}" alt="Profile">`:n}
              </div>
              <label class="profile-avatar-overlay" for="avatar-upload">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                <input type="file" id="avatar-upload" class="hidden" accept="image/*">
              </label>
            </div>
            <div class="profile-info">
              <h2 class="profile-name">${d}</h2>
              <div class="profile-designation">${t.designation||"Employee"}</div>
              <div class="profile-badges">
                <span class="badge badge--primary">${t.employee_id}</span>
                <span class="badge badge--neutral">${t.department||"General"}</span>
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
                    <div class="info-value edit-hide">${t.first_name}</div>
                    <input type="text" name="first_name" class="form-input edit-show hidden" value="${t.first_name}" disabled>
                  </div>
                  <div class="info-group">
                    <div class="info-label">Last Name</div>
                    <div class="info-value edit-hide">${t.last_name}</div>
                    <input type="text" name="last_name" class="form-input edit-show hidden" value="${t.last_name}" disabled>
                  </div>
                  <div class="info-group">
                    <div class="info-label">Email</div>
                    <div class="info-value">${t.email}</div>
                  </div>
                  <div class="info-group">
                    <div class="info-label">Phone</div>
                    <div class="info-value edit-hide">${t.phone||"—"}</div>
                    <input type="tel" name="phone" class="form-input edit-show hidden" value="${t.phone||""}">
                  </div>
                  <div class="info-group" style="grid-column: 1 / -1;">
                    <div class="info-label">Address</div>
                    <div class="info-value edit-hide">${t.address||"—"}</div>
                    <textarea name="address" class="form-input edit-show hidden" rows="3">${t.address||""}</textarea>
                  </div>
                </div>
              </div>

              <!-- Job Details Tab -->
              <div id="tab-job" class="tab-content hidden">
                <div class="profile-grid">
                  <div class="info-group">
                    <div class="info-label">Employee ID</div>
                    <div class="info-value">${t.employee_id}</div>
                  </div>
                  <div class="info-group">
                    <div class="info-label">Date of Joining</div>
                    <div class="info-value">${t.join_date?_(t.join_date):"—"}</div>
                  </div>
                  <div class="info-group">
                    <div class="info-label">Department</div>
                    <div class="info-value">${t.department||"—"}</div>
                  </div>
                  <div class="info-group">
                    <div class="info-label">Designation</div>
                    <div class="info-value">${t.designation||"—"}</div>
                  </div>
                  <div class="info-group">
                    <div class="info-label">System Role</div>
                    <div class="info-value capitalize">${t.role}</div>
                  </div>
                </div>
              </div>

              <!-- Salary Tab -->
              <div id="tab-salary" class="tab-content hidden">
                ${i?`
                  <div class="profile-grid">
                    <div class="info-group">
                      <div class="info-label">Basic Salary</div>
                      <div class="info-value">${f(i.basic_salary)}</div>
                    </div>
                    <div class="info-group">
                      <div class="info-label">HRA</div>
                      <div class="info-value">${f(i.hra)}</div>
                    </div>
                    <div class="info-group">
                      <div class="info-label">DA</div>
                      <div class="info-value">${f(i.da)}</div>
                    </div>
                    <div class="info-group">
                      <div class="info-label text-error">Deductions</div>
                      <div class="info-value text-error">-${f(i.deductions)}</div>
                    </div>
                    <div class="info-group" style="grid-column: 1 / -1; border-top: 1px solid var(--color-border); padding-top: var(--sp-4);">
                      <div class="info-label">Net Salary</div>
                      <div class="info-value" style="font-size: var(--fs-2xl); font-weight: var(--fw-bold); color: var(--color-success)">
                        ${f(i.net_salary)}
                      </div>
                    </div>
                  </div>
                `:`
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
  `;const s=e.querySelectorAll(".tab"),c=e.querySelectorAll(".tab-content");s.forEach(w=>{w.addEventListener("click",()=>{s.forEach(h=>h.classList.remove("tab--active")),c.forEach(h=>h.classList.add("hidden")),w.classList.add("tab--active"),e.querySelector(`#tab-${w.dataset.tab}`).classList.remove("hidden")})});const r=e.querySelector("#edit-btn"),o=e.querySelector("#cancel-btn"),v=e.querySelector("#edit-actions"),p=e.querySelectorAll(".edit-hide"),m=e.querySelectorAll(".edit-show"),u=w=>{w?(p.forEach(h=>h.classList.add("hidden")),m.forEach(h=>h.classList.remove("hidden")),v.classList.remove("hidden"),r.classList.add("hidden"),s[0].click()):(p.forEach(h=>h.classList.remove("hidden")),m.forEach(h=>h.classList.add("hidden")),v.classList.add("hidden"),r.classList.remove("hidden"))};r.addEventListener("click",()=>u(!0)),o.addEventListener("click",()=>u(!1));const y=e.querySelector("#profile-form");y.addEventListener("submit",async w=>{w.preventDefault();const h=y.querySelector('button[type="submit"]');h.innerHTML='<div class="spinner"></div>',h.disabled=!0;try{const L=new FormData(y),b=Object.fromEntries(L.entries()),k=await U(`/api/employees/${t.id}`,b);x({type:"success",message:"Profile updated successfully"}),e.querySelectorAll(".edit-hide").forEach((D,H)=>{m[H].name&&(D.textContent=m[H].value||"—")}),u(!1)}catch(L){x({type:"error",message:L.message||"Failed to update"})}finally{h.innerHTML="Save Changes",h.disabled=!1}}),e.querySelector("#avatar-upload").addEventListener("change",async w=>{const h=w.target.files[0];if(!h)return;const L=new FormData;L.append("profile_picture",h);try{const b=await I(`/api/employees/${t.id}/picture`,L);x({type:"success",message:"Profile picture updated"});const k=E();k.profilePicture=b.profile_picture,J(k);const D=e.querySelector(".profile-avatar");D.innerHTML=`<img src="/uploads/${b.profile_picture}" alt="Profile">`}catch(b){x({type:"error",message:b.message||"Failed to upload picture"})}})}function X({containerId:e,month:a,year:t,data:l={},onDateClick:n,onMonthChange:d,selectionRange:i=null}){const s=document.getElementById(e);if(!s)return;const c=W(new Date),r=new Date(t,a+1,0).getDate(),o=new Date(t,a,1).getDay();let v=`
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
        <div class="calendar-title">${T(a)} ${t}</div>
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
  `;for(let u=0;u<o;u++)v+='<div class="calendar-cell empty"></div>';for(let u=1;u<=r;u++){const y=`${t}-${String(a+1).padStart(2,"0")}-${String(u).padStart(2,"0")}`,C=y===c,w=l[y];let h="calendar-cell";C&&(h+=" today"),i&&(y===i.start&&(h+=" selected selected-start"),y===i.end&&(h+=" selected selected-end"),i.start&&i.end&&y>i.start&&y<i.end&&(h+=" in-range"),i.start&&!i.end&&y===i.start&&(h+=" selected selected-start")),v+=`
      <div class="${h}" data-date="${y}">
        <div class="calendar-day-num">${u}</div>
        <div class="calendar-dots">
          ${w&&w.status?`<div class="status-dot ${w.status}" title="${w.label||w.status}"></div>`:""}
        </div>
      </div>
    `}const m=(7-(o+r)%7)%7;for(let u=0;u<m;u++)v+='<div class="calendar-cell empty"></div>';v+="</div></div>",s.innerHTML=v,d&&(s.querySelector("#prev-month").addEventListener("click",()=>{let u=a-1,y=t;u<0&&(u=11,y--),d(u,y)}),s.querySelector("#next-month").addEventListener("click",()=>{let u=a+1,y=t;u>11&&(u=0,y++),d(u,y)})),n&&s.querySelectorAll(".calendar-cell:not(.empty)").forEach(u=>{u.addEventListener("click",()=>{n(u.dataset.date)})})}function ae({title:e,content:a,onClose:t}){const l=document.createElement("div");l.className="modal-backdrop";const n=document.createElement("div");n.className="modal",n.innerHTML=`
    <div class="modal__header">
      <h3 class="modal__title">${e}</h3>
      <button class="modal__close" aria-label="Close modal">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
    </div>
    <div class="modal__body"></div>
  `;const d=n.querySelector(".modal__body");typeof a=="string"?d.innerHTML=a:a instanceof Node&&d.appendChild(a);const i=()=>{document.body.contains(l)&&document.body.removeChild(l),document.body.contains(n)&&document.body.removeChild(n),document.removeEventListener("keydown",s),typeof t=="function"&&t()},s=c=>{c.key==="Escape"&&i()};return n.querySelector(".modal__close").addEventListener("click",i),l.addEventListener("click",i),document.addEventListener("keydown",s),document.body.appendChild(l),document.body.appendChild(n),window.closeModal=i,d}function he(){typeof window.closeModal=="function"&&window.closeModal()}async function ye(e){const a=E(),t=(a==null?void 0:a.role)==="admin";e.innerHTML=`
    <div class="app-layout">
      ${B(a)}
      <main class="main-content">
        ${A("Attendance",t?"Monitor employee attendance":"Track your working hours")}
        <div class="page-container" id="attendance-content">
          <div class="loading-screen"><div class="spinner spinner--lg"></div></div>
        </div>
      </main>
    </div>
  `;const l=e.querySelector("#attendance-content");t?await be(l):await fe(l,a)}async function fe(e,a){let t,l;const n=new Date;let d=n.getMonth(),i=n.getFullYear();const s=async(r,o)=>{[t,l]=await Promise.all([g("/api/attendance/today"),g(`/api/attendance/monthly/${a.employeeId}?month=${r}&year=${o}`)])};await s(d,i);const c=()=>{let r=!1,o=null,v="Not checked in yet";t!=null&&t.check_in&&!(t!=null&&t.check_out)?(r=!0,o=t.check_in,v="Currently working"):t!=null&&t.check_out?(v="Shift completed",o=t.check_in):(t==null?void 0:t.status)==="leave"?v="On Leave":(t==null?void 0:t.status)==="absent"&&(v="Absent");const p={};Array.isArray(l)&&l.forEach(b=>{p[b.date]={status:b.status,label:b.status.replace("-"," ")}}),e.innerHTML=`
      <div class="glass-card check-in-card">
        <div class="check-in-status">${v}</div>
        <div class="check-in-time" id="live-clock">${M(new Date)}</div>
        
        ${t!=null&&t.check_out?`
          <div class="text-success flex items-center justify-center gap-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
            Completed today's shift
          </div>
        `:(t==null?void 0:t.status)==="leave"||(t==null?void 0:t.status)==="absent"?`
          <div class="text-secondary flex items-center justify-center gap-2">
             No check-in required today
          </div>
        `:`
          <button id="check-btn" class="btn-check ${r?"btn-check--out":"btn-check--in"}">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              ${r?'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line>':'<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line>'}
            </svg>
            ${r?"Check Out":"Check In"}
          </button>
          ${o?`<div class="mt-4 text-sm text-secondary">Checked in at ${M(o)}</div>`:""}
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
    `;const m=e.querySelector("#live-clock"),u=setInterval(()=>{if(!document.contains(m)){clearInterval(u);return}m.textContent=M(new Date)},1e3),y=e.querySelector("#check-btn");y&&y.addEventListener("click",async()=>{y.disabled=!0;try{await I(r?"/api/attendance/check-out":"/api/attendance/check-in",{}),x({type:"success",message:`Successfully checked ${r?"out":"in"}`}),await s(d,i),c()}catch(b){x({type:"error",message:b.message||"Action failed"}),y.disabled=!1}}),X({containerId:"calendar-container",month:d,year:i,data:p,onMonthChange:async(b,k)=>{d=b,i=k,await s(b,k),c()}});const C=e.querySelector("#weekly-bars"),w=["M","T","W","T","F"];let h="";const L=new Date().getDay();for(let b=1;b<=5;b++){const k=new Date;k.setDate(k.getDate()-(L-b));const D=W(k),H=p[D],F=H?H.status:k>new Date?"":"absent";h+=`
        <div class="day-bar-container">
          <div class="day-bar">
            <div class="day-bar-fill ${F}" style="height: ${F?F==="half-day"?"50%":"100%":"0%"}"></div>
          </div>
          <div class="day-label">${w[b-1]}</div>
        </div>
      `}C.innerHTML=h};c()}async function be(e){let a=W(new Date);const t=async d=>await g(`/api/attendance/daily?date=${d}`);let l=await t(a);const n=()=>{e.innerHTML=`
      <div class="glass-card">
        <div class="filter-bar">
          <div class="form-group mb-0" style="width: 200px;">
            <input type="date" id="date-filter" class="form-input" value="${a}">
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
              ${l.length===0?'<tr><td colspan="5" class="text-center text-muted">No attendance data found for this date.</td></tr>':""}
              ${l.map(i=>`
                <tr>
                  <td>
                    <div class="flex items-center gap-3">
                      <div class="font-medium">${i.first_name} ${i.last_name}</div>
                    </div>
                  </td>
                  <td>
                    <span class="badge ${K(i.status)}">${i.status||"Absent"}</span>
                  </td>
                  <td>${i.check_in?M(i.check_in):"—"}</td>
                  <td>${i.check_out?M(i.check_out):"—"}</td>
                  <td>
                    <button class="btn btn--ghost btn--sm view-cal-btn" data-id="${i.user_id}" data-name="${i.first_name}">
                      View Calendar
                    </button>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `,e.querySelector("#date-filter").addEventListener("change",async i=>{a=i.target.value,e.innerHTML='<div class="loading-screen"><div class="spinner"></div></div>',l=await t(a),n()}),e.querySelectorAll(".view-cal-btn").forEach(i=>{i.addEventListener("click",async s=>{const c=s.target.dataset.id,r=s.target.dataset.name,o=ae({title:`${r}'s Attendance`,content:'<div id="modal-cal-container"></div><div class="loading-screen" id="cal-loader"><div class="spinner"></div></div>'}),v=new Date,p=v.getMonth(),m=v.getFullYear();try{const u=await g(`/api/attendance/monthly/${c}?month=${p}&year=${m}`),y={};Array.isArray(u)&&u.forEach(C=>y[C.date]={status:C.status}),o.querySelector("#cal-loader").remove(),X({containerId:"modal-cal-container",month:p,year:m,data:y})}catch{o.innerHTML='<div class="text-error">Failed to load calendar</div>'}})})};n()}async function se(e){const a=E(),t=window.location.pathname==="/leave-approvals";e.innerHTML=`
    <div class="app-layout">
      ${B(a)}
      <main class="main-content">
        ${A(t?"Leave Approvals":"Leave Management",t?"Review and manage leave requests":"Apply for leave and view history")}
        <div class="page-container" id="leave-content">
          <div class="loading-screen"><div class="spinner spinner--lg"></div></div>
        </div>
      </main>
    </div>
  `;const l=e.querySelector("#leave-content");t?await we(l):await ge(l)}async function ge(e){let a=[];try{a=await g("/api/leave/my")}catch{x({type:"error",message:"Failed to load requests"})}const t=()=>{e.innerHTML=`
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
            ${a.length===0?`
              <div class="empty-state glass-card">
                <div class="text-muted">No leave requests found.</div>
              </div>
            `:a.map(r=>`
              <div class="leave-card leave-card--${r.status}">
                <div class="leave-card-header">
                  <div>
                    <div class="leave-card-type capitalize">${r.leave_type} Leave</div>
                    <div class="leave-card-dates">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                      ${_(r.start_date)} - ${_(r.end_date)}
                    </div>
                  </div>
                  <span class="badge ${K(r.status)}">${r.status}</span>
                </div>
                ${r.remarks?`<div class="leave-card-remarks">${r.remarks}</div>`:""}
                ${r.admin_comment?`
                  <div class="leave-admin-comment">
                    <strong class="text-xs text-muted uppercase">Admin Reply:</strong>
                    <div class="mt-1">${r.admin_comment}</div>
                  </div>
                `:""}
                <div class="text-xs text-muted mt-3 text-right">Applied on ${_(r.created_at)}</div>
              </div>
            `).join("")}
          </div>
        </div>
      </div>
    `;let l=new Date().getMonth(),n=new Date().getFullYear(),d=null,i=null;const s=()=>{const r=e.querySelector("#start_date"),o=e.querySelector("#end_date"),v=e.querySelector("#days-count");if(r.value=d||"",o.value=i||d||"",d){const m=z(d,i||d);v.textContent=`${m} day${m>1?"s":""} selected`,v.classList.remove("hidden")}else v.classList.add("hidden");X({containerId:"apply-calendar",month:l,year:n,selectionRange:{start:d,end:i},onMonthChange:(p,m)=>{l=p,n=m,s()},onDateClick:p=>{!d||d&&i?(d=p,i=null):p<d?(i=d,d=p):i=p,s()}})};s();const c=e.querySelector("#apply-form");c.addEventListener("submit",async r=>{r.preventDefault();const o=c.querySelector("button");o.disabled=!0,o.innerHTML='<div class="spinner"></div>';try{await I("/api/leave",{leave_type:document.getElementById("leave_type").value,start_date:document.getElementById("start_date").value,end_date:document.getElementById("end_date").value,remarks:document.getElementById("remarks").value}),x({type:"success",message:"Leave application submitted"}),a=await g("/api/leave/my"),t()}catch(v){x({type:"error",message:v.message||"Failed to apply"}),o.disabled=!1,o.innerHTML="Submit Application"}})};t()}async function we(e){let a=[];try{a=await g("/api/leave/all")}catch{}const t=()=>{const l=a.filter(s=>s.status==="pending"),n=a.filter(s=>s.status!=="pending");e.innerHTML=`
      <div class="tabs">
        <div class="tab tab--active" data-tab="pending">Pending Approvals <span class="badge badge--warning ml-2">${l.length}</span></div>
        <div class="tab" data-tab="history">History</div>
      </div>

      <div id="tab-pending" class="tab-content">
        ${l.length===0?`
          <div class="empty-state glass-card">
            <div class="empty-state__icon">👍</div>
            <div class="empty-state__title">All caught up!</div>
            <div class="empty-state__text">No pending leave requests to review.</div>
          </div>
        `:`
          <div class="grid grid-2">
            ${l.map(s=>`
              <div class="glass-card leave-card leave-card--pending">
                <div class="flex justify-between items-start mb-4">
                  <div>
                    <div class="font-bold text-lg">${s.first_name} ${s.last_name}</div>
                    <div class="text-sm text-secondary capitalize">${s.leave_type} Leave</div>
                  </div>
                  <div class="text-right text-sm">
                    <div>${_(s.start_date)} - ${_(s.end_date)}</div>
                    <div class="text-muted mt-1">${z(s.start_date,s.end_date)} days</div>
                  </div>
                </div>
                ${s.remarks?`<div class="bg-[var(--color-bg-input)] p-3 rounded-lg text-sm mb-4">"${s.remarks}"</div>`:""}
                <div class="flex gap-3 mt-4 pt-4 border-t border-[var(--color-border)]">
                  <button class="btn btn--success flex-1 action-btn" data-id="${s.id}" data-action="approve">Approve</button>
                  <button class="btn btn--danger flex-1 action-btn" data-id="${s.id}" data-action="reject">Reject</button>
                </div>
              </div>
            `).join("")}
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
              ${n.map(s=>`
                <tr>
                  <td class="font-medium">${s.first_name} ${s.last_name}</td>
                  <td class="capitalize">${s.leave_type}</td>
                  <td>${_(s.start_date)} to ${_(s.end_date)}</td>
                  <td>${z(s.start_date,s.end_date)}</td>
                  <td><span class="badge ${K(s.status)}">${s.status}</span></td>
                  <td class="text-sm text-muted">${_(s.created_at)}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;const d=e.querySelectorAll(".tab"),i=e.querySelectorAll(".tab-content");d.forEach(s=>{s.addEventListener("click",()=>{d.forEach(c=>c.classList.remove("tab--active")),i.forEach(c=>c.classList.add("hidden")),s.classList.add("tab--active"),e.querySelector(`#tab-${s.dataset.tab}`).classList.remove("hidden")})}),e.querySelectorAll(".action-btn").forEach(s=>{s.addEventListener("click",()=>{const c=s.dataset.id,r=s.dataset.action;ae({title:`${r==="approve"?"Approve":"Reject"} Leave`,content:`
            <div class="mb-4">
              <label class="form-label">Add a comment (optional)</label>
              <textarea id="admin-comment" class="form-input" rows="3" placeholder="Will be visible to employee"></textarea>
            </div>
            <div class="flex justify-end gap-3 mt-6">
              <button class="btn btn--ghost" onclick="closeModal()">Cancel</button>
              <button class="btn btn--${r==="approve"?"success":"danger"}" id="confirm-action">Confirm ${r}</button>
            </div>
          `,onClose:()=>{}}),setTimeout(()=>{const o=document.getElementById("confirm-action");o&&o.addEventListener("click",async()=>{o.disabled=!0,o.innerHTML='<div class="spinner"></div>';const v=document.getElementById("admin-comment").value;try{await U(`/api/leave/${c}/${r}`,{admin_comment:v}),x({type:"success",message:`Leave ${r}d successfully`}),he(),a=await g("/api/leave/all"),t()}catch(p){x({type:"error",message:p.message}),o.disabled=!1,o.textContent=`Confirm ${r}`}})},50)})})};t()}async function ie(e){const a=E(),t=(a==null?void 0:a.role)==="admin";e.innerHTML=`
    <div class="app-layout">
      ${B(a)}
      <main class="main-content">
        ${A("Payroll",t?"Manage employee salaries":"View your payslips and salary breakdown")}
        <div class="page-container" id="payroll-content">
          <div class="loading-screen"><div class="spinner spinner--lg"></div></div>
        </div>
      </main>
    </div>
  `;const l=e.querySelector("#payroll-content");t?await ke(l):await xe(l)}async function xe(e){let a=[];try{a=await g("/api/payroll/my")}catch{}const t=a.length?a[0]:null;if(!t){e.innerHTML=`
      <div class="empty-state glass-card">
        <div class="empty-state__icon">💰</div>
        <div class="empty-state__title">No payroll data</div>
        <div class="empty-state__text">Your salary details have not been updated yet.</div>
      </div>
    `;return}const l=t.basic_salary+t.hra+t.da+t.deductions,n=t.basic_salary/l*100,d=t.hra/l*100,i=t.da/l*100,s=t.deductions/l*100;e.innerHTML=`
    <div class="salary-card">
      <div class="salary-header">
        <div>
          <h3 class="font-bold text-xl mb-1">${T(t.month)} ${t.year}</h3>
          <div class="text-secondary text-sm">Salary Breakdown</div>
        </div>
        <div class="salary-net">
          <div class="salary-net-label">Net Salary</div>
          <div class="salary-net-value">${f(t.net_salary)}</div>
        </div>
      </div>

      <div class="salary-bar-container">
        <div class="salary-bar-segment salary-bar-segment--basic" style="width: 0%" data-width="${n}%" data-tooltip="Basic: ${f(t.basic_salary)}"></div>
        <div class="salary-bar-segment salary-bar-segment--hra" style="width: 0%" data-width="${d}%" data-tooltip="HRA: ${f(t.hra)}"></div>
        <div class="salary-bar-segment salary-bar-segment--da" style="width: 0%" data-width="${i}%" data-tooltip="DA: ${f(t.da)}"></div>
        <div class="salary-bar-segment salary-bar-segment--deduction" style="width: 0%" data-width="${s}%" data-tooltip="Deductions: ${f(t.deductions)}"></div>
      </div>

      <div class="salary-breakdown">
        <div class="breakdown-item">
          <div class="breakdown-label"><div class="breakdown-dot breakdown-dot--basic"></div> Basic</div>
          <div class="breakdown-value">${f(t.basic_salary)}</div>
        </div>
        <div class="breakdown-item">
          <div class="breakdown-label"><div class="breakdown-dot breakdown-dot--hra"></div> HRA</div>
          <div class="breakdown-value">${f(t.hra)}</div>
        </div>
        <div class="breakdown-item">
          <div class="breakdown-label"><div class="breakdown-dot breakdown-dot--da"></div> DA</div>
          <div class="breakdown-value">${f(t.da)}</div>
        </div>
        <div class="breakdown-item">
          <div class="breakdown-label"><div class="breakdown-dot breakdown-dot--deduction"></div> Deductions</div>
          <div class="breakdown-value text-error">-${f(t.deductions)}</div>
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
          ${a.map(c=>`
            <tr>
              <td class="font-medium">${T(c.month)} ${c.year}</td>
              <td>${f(c.basic_salary)}</td>
              <td>${f(c.hra)}</td>
              <td>${f(c.da)}</td>
              <td class="text-error">-${f(c.deductions)}</td>
              <td class="font-bold text-success">${f(c.net_salary)}</td>
              <td>
                <button class="btn btn--ghost btn--sm" onclick="alert('Payslip download coming soon!')">Download</button>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `,setTimeout(()=>{e.querySelectorAll(".salary-bar-segment").forEach(c=>{c.style.width=c.dataset.width})},100)}async function ke(e){let a=[],t=[];try{[a,t]=await Promise.all([g("/api/employees"),g("/api/payroll/all")])}catch{}const l=new Date,n=l.getMonth(),d=l.getFullYear();e.innerHTML=`
    <div class="grid grid-2 mb-8">
      <div class="glass-card">
        <h3 class="font-bold mb-4">Update Salary Structure</h3>
        <form id="payroll-form">
          <div class="grid grid-2">
            <div class="form-group" style="grid-column: 1 / -1;">
              <label class="form-label">Select Employee</label>
              <select class="form-select" id="emp_select" required>
                <option value="">-- Choose Employee --</option>
                ${a.map(o=>`<option value="${o.id}">${o.first_name} ${o.last_name} (${o.employee_id})</option>`).join("")}
              </select>
            </div>
            
            <div class="form-group">
              <label class="form-label">Month</label>
              <select class="form-select" id="month_select" required>
                ${Array.from({length:12},(o,v)=>`<option value="${v}" ${v===n?"selected":""}>${T(v)}</option>`).join("")}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Year</label>
              <input type="number" id="year_input" class="form-input" value="${d}" required>
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
              <div class="text-3xl font-bold mt-1">${f(t.reduce((o,v)=>o+v.net_salary,0))}</div>
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
              ${t.slice(0,10).map(o=>`
                <tr>
                  <td class="font-medium">${o.first_name} ${o.last_name}</td>
                  <td class="text-sm text-muted">${T(o.month)} ${o.year}</td>
                  <td class="text-success font-medium">${f(o.net_salary)}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;const i=e.querySelectorAll(".calc-input"),s=e.querySelector("#calc-net"),c=()=>{const o=parseFloat(e.querySelector("#basic_salary").value)||0,v=parseFloat(e.querySelector("#hra").value)||0,p=parseFloat(e.querySelector("#da").value)||0,m=parseFloat(e.querySelector("#deductions").value)||0;s.textContent=f(o+v+p-m)};i.forEach(o=>o.addEventListener("input",c));const r=e.querySelector("#payroll-form");r.addEventListener("submit",async o=>{o.preventDefault();const v=r.querySelector("button"),p=e.querySelector("#emp_select").value;if(!p){x({type:"warning",message:"Please select an employee"});return}v.disabled=!0,v.innerHTML='<div class="spinner"></div>';try{await U(`/api/payroll/${p}`,{month:parseInt(e.querySelector("#month_select").value),year:parseInt(e.querySelector("#year_input").value),basic_salary:parseFloat(e.querySelector("#basic_salary").value)||0,hra:parseFloat(e.querySelector("#hra").value)||0,da:parseFloat(e.querySelector("#da").value)||0,deductions:parseFloat(e.querySelector("#deductions").value)||0}),x({type:"success",message:"Payroll saved successfully"}),r.reset(),c(),ie(document.getElementById("app"))}catch(m){x({type:"error",message:m.message}),v.disabled=!1,v.innerHTML="Save Payroll"}})}async function _e(e){const a=E();e.innerHTML=`
    <div class="app-layout">
      ${B(a)}
      <main class="main-content">
        ${A("Employees","Directory of all personnel")}
        <div class="page-container">
          
          <div class="glass-card mb-6 flex justify-between items-center" style="padding: var(--sp-4);">
            <div class="form-group mb-0" style="width: 300px;">
              <input type="text" id="emp-search" class="form-input" placeholder="Search by name, email or ID...">
            </div>
            <button class="btn btn--primary">
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
  `;let t=[];const l=e.querySelector("#emp-table-body"),n=i=>{if(i.length===0){l.innerHTML='<tr><td colspan="6" class="text-center text-muted py-8">No employees found.</td></tr>';return}l.innerHTML=i.map(s=>`
      <tr class="hover:bg-[var(--color-surface-hover)] cursor-pointer" onclick="alert('View profile logic here')">
        <td>
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-[var(--color-primary-bg)] text-[var(--color-primary-light)] flex items-center justify-center font-bold text-sm flex-shrink-0 overflow-hidden border border-[var(--color-border)]">
              ${s.profile_picture?`<img src="${s.profile_picture.startsWith("http")?s.profile_picture:"/uploads/"+s.profile_picture}" class="w-full h-full object-cover">`:G(s.first_name,s.last_name)}
            </div>
            <div>
              <div class="font-medium">${s.first_name} ${s.last_name}</div>
              <div class="text-xs text-secondary mt-1">Joined: ${new Date(s.join_date).toLocaleDateString()}</div>
            </div>
          </div>
        </td>
        <td><span class="badge badge--neutral">${s.employee_id}</span></td>
        <td>
          <div class="font-medium text-sm">${s.designation||"—"}</div>
          <div class="text-xs text-muted mt-1">${s.department||"—"}</div>
        </td>
        <td>
          <div class="text-sm">${s.email}</div>
          <div class="text-xs text-muted mt-1">${s.phone||"—"}</div>
        </td>
        <td>
           <span class="badge ${s.role==="admin"?"badge--primary":"badge--neutral"} capitalize">${s.role}</span>
        </td>
        <td onclick="event.stopPropagation()">
           <button class="btn btn--ghost btn--icon" title="Edit">
             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
           </button>
        </td>
      </tr>
    `).join("")};try{t=await g("/api/employees"),n(t)}catch{l.innerHTML='<tr><td colspan="6" class="text-center text-error py-8">Failed to load employees</td></tr>',x({type:"error",message:"Failed to fetch employees"})}e.querySelector("#emp-search").addEventListener("input",oe(i=>{const s=i.target.value.toLowerCase(),c=t.filter(r=>(r.first_name+" "+r.last_name).toLowerCase().includes(s)||r.email.toLowerCase().includes(s)||r.employee_id.toLowerCase().includes(s)||(r.department||"").toLowerCase().includes(s));n(c)},300))}window.logout=()=>{re(),S("/login")};function q(e,a=!1){return async t=>{if(!N()){S("/login");return}if(a){const l=E();if((l==null?void 0:l.role)!=="admin"){S("/dashboard");return}}return e(t)}}$("/login",ne);$("/signup",ce);$("/dashboard",q(ve));$("/profile",q(me));$("/attendance",q(ye));$("/leave",q(se));$("/leave-approvals",q(se,!0));$("/payroll",q(ie));$("/employees",q(_e,!0));$("/404",e=>{e.innerHTML=`
    <div class="empty-state">
      <div class="empty-state__icon" style="font-size:4rem;margin-bottom:1rem">😕</div>
      <h2 class="empty-state__title" style="font-size:2rem;font-weight:bold;margin-bottom:1rem">Page not found</h2>
      <button class="btn btn--primary" onclick="window.history.back()">Go Back</button>
    </div>
  `});document.addEventListener("DOMContentLoaded",()=>{le(),document.body.addEventListener("click",a=>{a.target.closest("#logout-btn")&&window.logout()}),window.location.pathname==="/"?S(N()?"/dashboard":"/login"):R()});
