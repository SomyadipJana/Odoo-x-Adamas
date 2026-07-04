// ============================================================
// Client-Side SPA Router
// ============================================================

const routes = {};
let currentCleanup = null;

/**
 * Register a route with a render function.
 * @param {string} path - The URL path (e.g., '/dashboard')
 * @param {Function} handler - Async function(container) that renders the page
 */
export function addRoute(path, handler) {
  routes[path] = handler;
}

/**
 * Navigate to a path, updating the URL and rendering the page.
 * @param {string} path - Target path
 */
export function navigate(path) {
  window.history.pushState({}, '', path);
  renderRoute();
}

/**
 * Render the current route based on window.location.pathname
 */
export async function renderRoute() {
  const path = window.location.pathname;
  const app = document.getElementById('app');

  // Run cleanup from previous page if any
  if (typeof currentCleanup === 'function') {
    currentCleanup();
    currentCleanup = null;
  }

  // Find matching route
  const handler = routes[path] || routes['/404'] || routes['/login'];

  if (handler) {
    const cleanup = await handler(app);
    if (typeof cleanup === 'function') {
      currentCleanup = cleanup;
    }
  }
}

/**
 * Initialize the router — listen for popstate and intercept link clicks.
 */
export function initRouter() {
  // Handle back/forward buttons
  window.addEventListener('popstate', () => {
    renderRoute();
  });

  // Intercept all anchor clicks for SPA navigation
  document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a[data-link]');
    if (anchor) {
      e.preventDefault();
      const href = anchor.getAttribute('href');
      if (href && href !== window.location.pathname) {
        navigate(href);
      }
    }
  });
}
