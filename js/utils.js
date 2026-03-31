// ══════════════════════════════════════════════════════════
// SHARED UTILITIES — QuizForge
// ══════════════════════════════════════════════════════════

// ── XSS Sanitization ──
// Prevents script injection when inserting user content into innerHTML
function sanitize(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = String(str);
  return div.innerHTML;
}

// ── Firebase Ready Check ──
// Single helper to avoid repeating typeof checks everywhere
function fbReady() {
  return typeof isFirebaseConfigured !== 'undefined' && isFirebaseConfigured();
}

// ── Time Ago (shared) ──
// Converts timestamp to relative Hindi time string
function timeAgo(ts) {
  if (!ts) return '';
  const date = (ts && ts.toDate) ? ts.toDate() : new Date(typeof ts === 'number' ? ts : ts);
  const d = Date.now() - date.getTime();
  if (d < 60000)    return 'अभी';
  if (d < 3600000)  return Math.floor(d / 60000)  + ' min पहले';
  if (d < 86400000) return Math.floor(d / 3600000) + ' hr पहले';
  if (d < 604800000) return Math.floor(d / 86400000) + ' days पहले';
  return date.toLocaleDateString('hi-IN');
}

// ── UUID Generator ──
// Collision-safe ID generator using crypto API with fallback
function genUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// ── Debounce ──
// Prevents function from being called too frequently
function debounce(fn, delay = 100) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// ── Global Error Handler ──
window.addEventListener('error', (event) => {
  console.error('🚨 Global error:', event.error?.message || event.message);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('🚨 Unhandled promise rejection:', event.reason);
  event.preventDefault(); // prevent default console error duplication
});

console.log('🔧 Utils module loaded');
