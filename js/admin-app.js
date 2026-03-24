// ══════════════════════════════════════════
// DATABASE (localStorage-based)
// ══════════════════════════════════════════
const DB = {
  get(key) {
    try { return JSON.parse(localStorage.getItem('qf_admin_' + key) || 'null'); }
    catch { return null; }
  },
  set(key, val) {
    localStorage.setItem('qf_admin_' + key, JSON.stringify(val));
  },
  push(key, item) {
    const arr = this.get(key) || [];
    arr.push(item);
    this.set(key, arr);
    return arr;
  },
  update(key, id, updates) {
    const arr = this.get(key) || [];
    const i = arr.findIndex(x => x.id === id);
    if (i !== -1) { arr[i] = { ...arr[i], ...updates, updatedAt: Date.now() }; }
    this.set(key, arr);
    return arr;
  },
  delete(key, id) {
    const arr = (this.get(key) || []).filter(x => x.id !== id);
    this.set(key, arr);
    return arr;
  }
};

// ── ID generator ──
const genId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

// ── Auth ──
const ADMIN_CREDS_KEY = 'qf_admin_creds';
function getCreds() {
  return DB.get('creds') || { username: 'admin', password: 'admin123' };
}

// ══════════════════════════════════════════
// INITIAL DATA SEED
// ══════════════════════════════════════════
function seedInitialData() {
  if (!DB.get('seeded')) {
    const subjects = [
      { id: genId(), name: 'Science', nameHi: 'विज्ञान', icon: '🔬', color: '#00D97E', status: 'active', exams: ['NCERT','NEET'], createdAt: Date.now() },
      { id: genId(), name: 'Mathematics', nameHi: 'गणित', icon: '➕', color: '#4B91F7', status: 'active', exams: ['JEE','NCERT'], createdAt: Date.now() },
      { id: genId(), name: 'Physics', nameHi: 'भौतिकी', icon: '⚡', color: '#00D4FF', status: 'active', exams: ['JEE','NEET'], createdAt: Date.now() },
      { id: genId(), name: 'Chemistry', nameHi: 'रसायन', icon: '🧪', color: '#FF4757', status: 'active', exams: ['JEE','NEET'], createdAt: Date.now() },
      { id: genId(), name: 'Biology', nameHi: 'जीवविज्ञान', icon: '🌿', color: '#2DC653', status: 'active', exams: ['NEET'], createdAt: Date.now() },
      { id: genId(), name: 'History', nameHi: 'इतिहास', icon: '🏛️', color: '#F5B843', status: 'active', exams: ['UPSC','SSC'], createdAt: Date.now() },
      { id: genId(), name: 'Geography', nameHi: 'भूगोल', icon: '🌍', color: '#FF6B35', status: 'active', exams: ['UPSC'], createdAt: Date.now() },
      { id: genId(), name: 'English', nameHi: 'अंग्रेज़ी', icon: '📝', color: '#9B6DFF', status: 'active', exams: ['CBSE'], createdAt: Date.now() },
    ];

    const classes = [
      { id: genId(), name: 'Class 6', level: 'School (6-8)', order: 1, status: 'active' },
      { id: genId(), name: 'Class 7', level: 'School (6-8)', order: 2, status: 'active' },
      { id: genId(), name: 'Class 8', level: 'School (6-8)', order: 3, status: 'active' },
      { id: genId(), name: 'Class 9', level: 'Secondary (9-10)', order: 4, status: 'active' },
      { id: genId(), name: 'Class 10', level: 'Secondary (9-10)', order: 5, status: 'active' },
      { id: genId(), name: 'Class 11', level: 'Senior Secondary (11-12)', order: 6, status: 'active' },
      { id: genId(), name: 'Class 12', level: 'Senior Secondary (11-12)', order: 7, status: 'active' },
      { id: genId(), name: 'Graduation', level: 'Graduation', order: 8, status: 'active' },
      { id: genId(), name: 'UPSC/SSC', level: 'Competitive Exams', order: 9, status: 'active' },
    ];

    const sampleUsers = [
      { id: genId(), name: 'Arjun Singh', email: 'arjun@example.com', class: 'UPSC/SSC', points: 1250, quizzes: 34, accuracy: 78, status: 'active', color: '#FF6B35', joinedAt: Date.now() - 864e5 * 14 },
      { id: genId(), name: 'Priya Sharma', email: 'priya@example.com', class: 'Class 12', points: 8540, quizzes: 213, accuracy: 92, status: 'active', color: '#9B6DFF', joinedAt: Date.now() - 864e5 * 30 },
      { id: genId(), name: 'Rahul Verma', email: 'rahul@example.com', class: 'Class 12', points: 7920, quizzes: 198, accuracy: 89, status: 'active', color: '#4B91F7', joinedAt: Date.now() - 864e5 * 25 },
    ];

    DB.set('subjects', subjects);
    DB.set('classes', classes);
    DB.set('topics', []);
    DB.set('questions', []);
    DB.set('users', sampleUsers);
    DB.set('activity', []);
    DB.set('settings', { siteName: 'QuizForge', tagline: "India का #1 Free MCQ Platform", monetagId: '', skipTimer: 5, adFrequency: 1 });
    DB.set('quizStats', { total: 47, accuracy: 76, avgTime: 18, popular: 'Science' });
    DB.set('seeded', true);
    logActivity('🚀 System initialized', 'Admin Panel setup हो गया');
  }
}

function logActivity(text, sub = '') {
  const logs = DB.get('activity') || [];
  logs.unshift({ text, sub, time: Date.now() });
  DB.set('activity', logs.slice(0, 30));
}

// ══════════════════════════════════════════
// AUTH
// ══════════════════════════════════════════
function doLogin() {
  const u = document.getElementById('login-user').value.trim();
  const p = document.getElementById('login-pass').value;
  const creds = getCreds();
  if (u === creds.username && p === creds.password) {
    document.getElementById('login-page').style.display = 'none';
    document.getElementById('app').style.display = 'flex';
    initApp();
  } else {
    showNotif('❌', 'Login Failed', 'Username या password गलत है');
    document.getElementById('login-pass').value = '';
  }
}

const passInput = document.getElementById('login-pass');
if (passInput) {
  passInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') doLogin();
  });
}

function doLogout() {
  document.getElementById('app').style.display = 'none';
  document.getElementById('login-page').style.display = 'flex';
}

function changeCredentials() {
  const creds = getCreds();
  const cur = document.getElementById('cur-pass').value;
  const np = document.getElementById('new-pass').value;
  const cp = document.getElementById('confirm-pass').value;
  const nu = document.getElementById('new-username').value.trim();
  if (cur !== creds.password) { showNotif('❌','Wrong Password','Current password गलत है'); return; }
  if (np && np !== cp) { showNotif('❌','Mismatch','Passwords match नहीं हो रहे'); return; }
  if (np && np.length < 6) { showNotif('❌','Too Short','Password कम से कम 6 characters'); return; }
  DB.set('creds', { username: nu || creds.username, password: np || creds.password });
  showNotif('✅', 'Updated!', 'Credentials update हो गए');
}

// ══════════════════════════════════════════
// NAVIGATION
// ══════════════════════════════════════════
const PAGE_TITLES = {
  overview: 'Dashboard', analytics: 'Analytics', questions: 'Questions Editor',
  subjects: 'Subjects & Classes', topics: 'Topics', bulk: 'Bulk Import',
  users: 'Users Management', reports: 'Reports', ads: 'Ad Management',
  settings: 'Settings', backup: 'Backup & Export'
};

function showSection(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + name)?.classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.querySelector(`.nav-item[data-page="${name}"]`)?.classList.add('active');
  document.getElementById('page-title').textContent = PAGE_TITLES[name] || name;

  if (name === 'overview')   renderOverview();
  if (name === 'questions')  renderQuestions();
  if (name === 'subjects')   renderSubjects();
  if (name === 'topics')     renderTopics();
  if (name === 'users')      renderUsers();
  if (name === 'analytics')  renderAnalytics();
  if (name === 'backup')     renderBackup();
}

// ══════════════════════════════════════════
// TABS
// ══════════════════════════════════════════
function switchTab(btn, targetId) {
  const parent = btn.closest('.tab-bar, .tab-bar + *')?.previousSibling?.parentElement || btn.parentElement;
  const container = btn.closest('.modal, .page, .main');

  btn.closest('.tab-bar').querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  const tabGroup = btn.closest('.tab-bar');
  let el = tabGroup.nextElementSibling;
  while (el && el.classList.contains('tab-content')) {
    el.classList.remove('active');
    el = el.nextElementSibling;
  }
  document.getElementById(targetId)?.classList.add('active');
}

// ══════════════════════════════════════════
// OVERVIEW
// ══════════════════════════════════════════
function renderOverview() {
  const questions = DB.get('questions') || [];
  const users = DB.get('users') || [];
  const subjects = DB.get('subjects') || [];
  const stats = DB.get('quizStats') || {};

  document.getElementById('ov-total-q').textContent = questions.length;
  document.getElementById('ov-users').textContent = users.length;
  document.getElementById('ov-quizzes').textContent = stats.total || 0;
  document.getElementById('ov-subjects').textContent = subjects.filter(s => s.status === 'active').length;

  const today = questions.filter(q => Date.now() - q.createdAt < 86400000).length;
  document.getElementById('ov-q-today').textContent = `+${today} आज`;

  document.getElementById('badge-q').textContent = questions.length;
  document.getElementById('badge-u').textContent = users.length;

  // Subject breakdown
  const sbEl = document.getElementById('subject-breakdown');
  const subjCounts = {};
  questions.forEach(q => { subjCounts[q.subject] = (subjCounts[q.subject] || 0) + 1; });
  const maxCount = Math.max(...Object.values(subjCounts), 1);

  sbEl.innerHTML = subjects.slice(0, 6).map(s => {
    const cnt = subjCounts[s.name] || 0;
    const pct = Math.round((cnt / maxCount) * 100);
    return `<div class="subj-row">
      <span class="subj-name" style="font-size:12px">${s.icon} ${s.name}</span>
      <div class="subj-bar"><div class="progress-bar"><div class="progress-fill" style="width:${pct}%;background:${s.color}"></div></div></div>
      <span style="font-size:11px;color:var(--muted);width:28px;text-align:right">${cnt}</span>
    </div>`;
  }).join('') || '<p style="color:var(--muted);font-size:13px">Questions add करो पहले</p>';

  // Activity
  const logs = DB.get('activity') || [];
  const actEl = document.getElementById('activity-log');
  actEl.innerHTML = logs.slice(0, 8).map(l => `
    <div class="activity-item">
      <div class="activity-dot"></div>
      <div>
        <div class="activity-text">${l.text}</div>
        ${l.sub ? `<div class="activity-time">${l.sub} · ${timeAgo(l.time)}</div>` : `<div class="activity-time">${timeAgo(l.time)}</div>`}
      </div>
    </div>`).join('') || '<p style="color:var(--muted);font-size:13px">No activity yet</p>';
}

function timeAgo(ts) {
  const d = Date.now() - ts;
  if (d < 60000) return 'अभी';
  if (d < 3600000) return Math.floor(d/60000) + ' min पहले';
  if (d < 86400000) return Math.floor(d/3600000) + ' hr पहले';
  return Math.floor(d/86400000) + ' days पहले';
}

// ══════════════════════════════════════════
// QUESTIONS
// ══════════════════════════════════════════
let qPage = 1;
const Q_PER_PAGE = 15;
let filteredQs = [];
let currentFilterSubj = 'all';

function renderQuestions() {
  const questions = DB.get('questions') || [];
  const subjects = DB.get('subjects') || [];

  // Build filter chips
  const filterRow = document.getElementById('q-filter-row');
  const existing = filterRow.querySelectorAll('.filter-chip');
  existing.forEach(c => { if (c.dataset.val !== 'all') c.remove(); });
  subjects.forEach(s => {
    const chip = document.createElement('button');
    chip.className = 'filter-chip';
    chip.dataset.val = s.name;
    chip.textContent = `${s.icon} ${s.name}`;
    chip.onclick = function() { filterBy(this, s.name); };
    filterRow.appendChild(chip);
  });

  // Populate class filter
  const classes = DB.get('classes') || [];
  const fltClass = document.getElementById('flt-class');
  fltClass.innerHTML = '<option value="">All Classes</option>' + classes.map(c => `<option value="${c.name}">${c.name}</option>`).join('');

  filterQuestions();
}

function filterQuestions() {
  const search = (document.getElementById('q-search')?.value || '').toLowerCase();
  const diff = document.getElementById('flt-difficulty')?.value || '';
  const cls = document.getElementById('flt-class')?.value || '';
  const questions = DB.get('questions') || [];

  filteredQs = questions.filter(q => {
    const matchSubj = currentFilterSubj === 'all' || q.subject === currentFilterSubj;
    const matchDiff = !diff || q.difficulty === diff;
    const matchCls  = !cls || q.class === cls;
    const matchSrch = !search || (q.en||'').toLowerCase().includes(search) || (q.subject||'').toLowerCase().includes(search);
    return matchSubj && matchDiff && matchCls && matchSrch;
  });

  document.getElementById('q-count-display').textContent = `${filteredQs.length} questions`;
  qPage = 1;
  renderQTable();
}

function filterBy(chip, val) {
  document.querySelectorAll('#q-filter-row .filter-chip').forEach(c => c.classList.remove('active'));
  chip.classList.add('active');
  currentFilterSubj = val;
  filterQuestions();
}

function renderQTable() {
  const start = (qPage - 1) * Q_PER_PAGE;
  const pageItems = filteredQs.slice(start, start + Q_PER_PAGE);
  const subjects = DB.get('subjects') || [];

  document.getElementById('cur-page').textContent = qPage;

  const tbody = document.getElementById('questions-tbody');

  if (!pageItems.length) {
    tbody.innerHTML = `<tr><td colspan="9"><div class="empty-state"><div class="empty-state-icon">❓</div><h3>No Questions Found</h3><p>Filter change करो या नया question add करो</p></div></td></tr>`;
    return;
  }

  tbody.innerHTML = pageItems.map((q, i) => {
    const subj = subjects.find(s => s.name === q.subject);
    const subjColor = subj?.color || '#888';
    const diffMap = { easy: ['badge-green','Easy'], medium: ['badge-orange','Medium'], hard: ['badge-red','Hard'] };
    const [dc, dl] = diffMap[q.difficulty] || ['badge-orange','Medium'];
    const statusMap = { active: ['badge-green','Active'], draft: ['badge-gold','Draft'], review: ['badge-blue','Review'] };
    const [sc, sl] = statusMap[q.status || 'active'] || ['badge-green','Active'];

    return `<tr>
      <td><input type="checkbox" class="checkbox q-chk" data-id="${q.id}"></td>
      <td style="color:var(--muted);font-family:var(--font-mono);font-size:11px">${start + i + 1}</td>
      <td style="max-width:280px">
        <div style="font-size:13px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:280px" title="${q.en}">${q.en}</div>
        ${q.hi ? `<div style="font-size:11px;color:var(--muted);margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${q.hi}</div>` : ''}
      </td>
      <td><span class="subj-pill" style="background:${subjColor}22;color:${subjColor}">${subj?.icon || '📚'} ${q.subject || '—'}</span></td>
      <td style="font-size:12px;color:var(--muted)">${q.class || '—'}</td>
      <td><span class="badge ${dc}">${dl}</span></td>
      <td style="font-family:var(--font-mono);font-size:12px">${q.marks || 1}</td>
      <td><span class="badge ${sc}">${sl}</span></td>
      <td>
        <div class="td-actions">
          <button class="btn-icon" title="Edit" onclick="editQuestion('${q.id}')">✏️</button>
          <button class="btn-icon" title="Delete" onclick="deleteQuestion('${q.id}')">🗑</button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

function changePage(dir) {
  const maxPage = Math.ceil(filteredQs.length / Q_PER_PAGE);
  qPage = Math.max(1, Math.min(maxPage, qPage + dir));
  renderQTable();
}

function toggleAllQ(chk) {
  document.querySelectorAll('.q-chk').forEach(c => c.checked = chk.checked);
}

// ══════════════════════════════════════════
// QUESTION MODAL
// ══════════════════════════════════════════
const OPTION_LABELS = ['A','B','C','D'];

function openQuestionModal(editId = null) {
  const modal = document.getElementById('modal-question');
  const subjects = DB.get('subjects') || [];
  const classes = DB.get('classes') || [];

  // Populate selects
  document.getElementById('q-subject').innerHTML = '<option value="">Subject चुनो</option>' + subjects.map(s => `<option value="${s.name}">${s.icon} ${s.name}</option>`).join('');
  document.getElementById('q-class').innerHTML = '<option value="">Class चुनो</option>' + classes.map(c => `<option value="${c.name}">${c.name}</option>`).join('');

  // Build option inputs
  buildOptionInputs('options-en-editor', 'opt-en');
  buildOptionInputs('options-hi-editor', 'opt-hi', true);

  // Reset form
  if (!editId) {
    document.getElementById('q-modal-title').textContent = '+ Question Add करो';
    document.getElementById('q-en').value = '';
    document.getElementById('q-hi').value = '';
    document.getElementById('q-exp-en').value = '';
    document.getElementById('q-exp-hi').value = '';
    document.getElementById('q-marks').value = 1;
    document.getElementById('q-neg').value = 0.25;
    document.getElementById('q-tags').value = '';
    document.getElementById('q-editing-id').value = '';
    document.getElementById('q-status').value = 'active';
    document.getElementById('q-difficulty').value = 'medium';
    setCorrectOption(0);
  } else {
    const q = (DB.get('questions') || []).find(x => x.id === editId);
    if (!q) return;
    document.getElementById('q-modal-title').textContent = '✏️ Question Edit करो';
    document.getElementById('q-en').value = q.en || '';
    document.getElementById('q-hi').value = q.hi || '';
    document.getElementById('q-exp-en').value = q.exp || '';
    document.getElementById('q-exp-hi').value = q.expHi || '';
    document.getElementById('q-marks').value = q.marks || 1;
    document.getElementById('q-neg').value = q.neg !== undefined ? q.neg : 0.25;
    document.getElementById('q-tags').value = (q.tags || []).join(', ');
    document.getElementById('q-editing-id').value = editId;
    document.getElementById('q-status').value = q.status || 'active';
    document.getElementById('q-difficulty').value = q.difficulty || 'medium';
    document.getElementById('q-subject').value = q.subject || '';
    document.getElementById('q-class').value = q.class || '';
    updateTopicFilter(q.topic);

    // Set option values
    (q.options?.en || ['','','','']).forEach((opt, i) => {
      const inp = document.getElementById(`opt-en-${i}`);
      if (inp) inp.value = opt;
    });
    (q.options?.hi || ['','','','']).forEach((opt, i) => {
      const inp = document.getElementById(`opt-hi-${i}`);
      if (inp) inp.value = opt;
    });
    setCorrectOption(q.correct || 0);
  }

  modal.classList.add('show');
  setupPreviewSync();
}

function buildOptionInputs(containerId, prefix, isHindi = false) {
  const container = document.getElementById(containerId);
  container.innerHTML = OPTION_LABELS.map((lbl, i) => `
    <div class="option-row" id="${prefix}-row-${i}">
      <span class="option-letter" id="${prefix}-letter-${i}">${lbl}</span>
      <input class="option-inp" id="${prefix}-${i}" placeholder="${isHindi ? `Option ${lbl} Hindi में...` : `Option ${lbl}...`}" oninput="updatePreview()">
      ${!isHindi ? `<input type="radio" class="correct-radio" name="correct-opt" value="${i}" ${i===0?'checked':''} onchange="setCorrectOption(${i})" title="Correct answer">` : ''}
    </div>
  `).join('');
}

function setCorrectOption(idx) {
  OPTION_LABELS.forEach((_, i) => {
    const row = document.getElementById(`opt-en-row-${i}`);
    const letter = document.getElementById(`opt-en-letter-${i}`);
    const radio = document.querySelector(`input[name="correct-opt"][value="${i}"]`);
    if (row) row.classList.toggle('is-correct', i === idx);
    if (letter) letter.classList.toggle('correct', i === idx);
    if (radio) radio.checked = i === idx;
  });
  updatePreview();
}

function updateTopicFilter(selectedTopic = '') {
  const subj = document.getElementById('q-subject')?.value;
  const topics = (DB.get('topics') || []).filter(t => !subj || t.subject === subj);
  const topicSel = document.getElementById('q-topic');
  if (topicSel) {
    topicSel.innerHTML = '<option value="">Topic चुनो</option>' + topics.map(t => `<option value="${t.name}" ${t.name===selectedTopic?'selected':''}>${t.name}</option>`).join('');
  }
}

function setupPreviewSync() {
  ['q-en','opt-en-0','opt-en-1','opt-en-2','opt-en-3'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', updatePreview);
  });
  document.querySelectorAll('input[name="correct-opt"]').forEach(r => r.addEventListener('change', updatePreview));
}

function updatePreview() {
  const qText = document.getElementById('q-en')?.value || '';
  const opts = OPTION_LABELS.map((_, i) => document.getElementById(`opt-en-${i}`)?.value || `Option ${OPTION_LABELS[i]}`);
  const correctRadio = document.querySelector('input[name="correct-opt"]:checked');
  const correctIdx = correctRadio ? parseInt(correctRadio.value) : 0;

  const prevEl = document.getElementById('q-modal-preview');
  if (!prevEl) return;
  prevEl.innerHTML = `
    <div class="preview-label">👁 Live Preview</div>
    <div class="preview-q">${qText || '<span style="color:var(--muted)">Question yahan dikhega...</span>'}</div>
    <div class="preview-opts">
      ${opts.map((opt, i) => `<div class="preview-opt ${i===correctIdx?'correct':''}">
        <span style="width:22px;height:22px;border-radius:5px;display:inline-flex;align-items:center;justify-content:center;background:var(--panel2);font-size:11px;font-weight:700;margin-right:8px;flex-shrink:0">${OPTION_LABELS[i]}</span>
        ${opt}
        ${i===correctIdx?'<span style="margin-left:auto;color:var(--green);font-size:13px">✓</span>':''}
      </div>`).join('')}
    </div>
  `;
}

async function saveQuestion(status = 'active') {
  const en = document.getElementById('q-en').value.trim();
  const subject = document.getElementById('q-subject').value;
  const difficulty = document.getElementById('q-difficulty').value;

  if (!en) { showNotif('⚠️','Missing','Question text required!'); return; }
  if (!subject) { showNotif('⚠️','Missing','Subject select करो'); return; }

  const correctRadio = document.querySelector('input[name="correct-opt"]:checked');
  const correctIdx = correctRadio ? parseInt(correctRadio.value) : 0;

  const optsEn = OPTION_LABELS.map((_, i) => document.getElementById(`opt-en-${i}`)?.value?.trim() || '');
  const optsHi = OPTION_LABELS.map((_, i) => document.getElementById(`opt-hi-${i}`)?.value?.trim() || '');

  if (optsEn.some(o => !o)) { showNotif('⚠️','Missing','सभी 4 options fill करो'); return; }

  const editId = document.getElementById('q-editing-id').value;
  const qData = {
    en, hi: document.getElementById('q-hi').value.trim(),
    options: { en: optsEn, hi: optsHi.some(o=>o) ? optsHi : optsEn },
    correct: correctIdx,
    subject, class: document.getElementById('q-class').value,
    topic: document.getElementById('q-topic').value,
    difficulty, marks: parseFloat(document.getElementById('q-marks').value) || 1,
    neg: parseFloat(document.getElementById('q-neg').value) || 0,
    exp: document.getElementById('q-exp-en').value.trim(),
    expHi: document.getElementById('q-exp-hi').value.trim(),
    tags: document.getElementById('q-tags').value.split(',').map(t=>t.trim()).filter(Boolean),
    status
  };

  try {
    if (editId) {
      if (typeof isFirebaseConfigured !== 'undefined' && isFirebaseConfigured()) {
        await fbUpdateQuestion(editId, qData);
      }
      DB.update('questions', editId, qData);
      logActivity('✏️ Question edited', `"${en.slice(0,40)}..."`);
      showNotif('✅','Updated!','Question update हो गया');
    } else {
      qData.createdAt = Date.now();
      let newId = genId();
      if (typeof isFirebaseConfigured !== 'undefined' && isFirebaseConfigured()) {
        newId = await fbAddQuestion(qData);
      }
      qData.id = newId;
      DB.push('questions', qData);
      logActivity('➕ Question added', `Subject: ${subject} · ${difficulty}`);
      showNotif('✅','Added!','Question successfully add हो गया');
    }

    closeModal('question');
    renderQuestions();
    updateBadges();
  } catch (e) {
    console.error("Error saving question:", e);
    showNotif('❌','Error','Database save failed');
  }
}

function editQuestion(id) {
  openQuestionModal(id);
}

function deleteQuestion(id) {
  showConfirm('🗑️', 'Question Delete करो?', 'यह question permanently delete हो जाएगा।', async () => {
    try {
      if (typeof isFirebaseConfigured !== 'undefined' && isFirebaseConfigured()) {
        await fbDeleteQuestion(id);
      }
      DB.delete('questions', id);
      logActivity('🗑 Question deleted');
      renderQuestions();
      updateBadges();
      showNotif('✅','Deleted!','Question delete हो गया');
    } catch (e) {
      console.error("Error deleting question:", e);
      showNotif('❌','Error','Delete failed');
    }
  });
}

// ══════════════════════════════════════════
// SUBJECTS
// ══════════════════════════════════════════
function renderSubjects() {
  const subjects = DB.get('subjects') || [];
  const questions = DB.get('questions') || [];

  // Subjects grid
  const grid = document.getElementById('subjects-grid');
  grid.innerHTML = subjects.map(s => {
    const cnt = questions.filter(q => q.subject === s.name).length;
    const exams = (s.exams || []).map(e => `<span class="tag">${e}</span>`).join('');
    return `<div class="subject-card-admin">
      <div class="sc-header">
        <span class="sc-icon">${s.icon}</span>
        <div style="display:flex;gap:6px">
          <button class="btn-icon btn-sm" title="Edit" onclick="editSubject('${s.id}')">✏️</button>
          <button class="btn-icon btn-sm" title="Delete" onclick="deleteSubject('${s.id}')">🗑</button>
        </div>
      </div>
      <div class="sc-title">${s.name}</div>
      ${s.nameHi ? `<div style="font-size:12px;color:var(--muted)">${s.nameHi}</div>` : ''}
      <div class="sc-meta">${cnt} questions</div>
      <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:12px">${exams}</div>
      <div class="sc-footer">
        <div class="progress-bar" style="flex:1"><div class="progress-fill" style="background:${s.color}"></div></div>
        <span class="badge ${s.status==='active'?'badge-green':'badge-red'}" style="margin-left:10px">${s.status}</span>
      </div>
    </div>`;
  }).join('') || '<div class="empty-state"><div class="empty-state-icon">📚</div><h3>No Subjects</h3><p>Subject add करो</p></div>';

  // Classes table
  const classes = DB.get('classes') || [];
  const tbody = document.getElementById('classes-tbody');
  const subjectNames = subjects.map(s => s.name).join(', ') || '—';
  tbody.innerHTML = classes.sort((a,b)=>a.order-b.order).map(c => `
    <tr>
      <td style="font-weight:600">${c.name}</td>
      <td><span class="tag">${c.level}</span></td>
      <td style="font-size:12px;color:var(--muted)">${subjectNames}</td>
      <td style="font-family:var(--font-mono);font-size:12px">${questions.filter(q=>q.class===c.name).length}</td>
      <td><span class="badge ${c.status==='active'?'badge-green':'badge-red'}">${c.status}</span></td>
      <td>
        <div class="td-actions">
          <button class="btn-icon" title="Edit" onclick="editClass('${c.id}')">✏️</button>
          <button class="btn-icon" title="Delete" onclick="deleteClass('${c.id}')">🗑</button>
        </div>
      </td>
    </tr>`).join('') || '<tr><td colspan="6" style="text-align:center;color:var(--muted);padding:20px">No classes</td></tr>';

  // Populate dropdowns in topic modal
  const topicSubjSel = document.getElementById('topic-subject');
  const topicClsSel = document.getElementById('topic-class');
  topicSubjSel.innerHTML = '<option value="">Subject चुनो</option>' + subjects.map(s=>`<option value="${s.name}">${s.icon} ${s.name}</option>`).join('');
  topicClsSel.innerHTML = '<option value="">Class चुनो</option>' + classes.map(c=>`<option value="${c.name}">${c.name}</option>`).join('');

  // Flt topic subject
  const fltTopicSubj = document.getElementById('flt-topic-subject');
  fltTopicSubj.innerHTML = '<option value="">All Subjects</option>' + subjects.map(s=>`<option value="${s.name}">${s.icon} ${s.name}</option>`).join('');
}

function openSubjectModal(editId = null) {
  document.getElementById('subj-editing-id').value = editId || '';
  document.getElementById('subj-modal-title').textContent = editId ? '✏️ Subject Edit करो' : '+ Subject Add करो';
  if (editId) {
    const s = (DB.get('subjects')||[]).find(x=>x.id===editId);
    if (!s) return;
    document.getElementById('subj-name-en').value = s.name;
    document.getElementById('subj-name-hi').value = s.nameHi || '';
    document.getElementById('subj-icon').value = s.icon || '';
    document.getElementById('subj-color').value = s.color || '#FF6B35';
    document.getElementById('subj-status').value = s.status || 'active';
    document.querySelectorAll('#exam-chips input').forEach(inp => {
      inp.checked = (s.exams || []).includes(inp.value);
    });
  } else {
    document.getElementById('subj-name-en').value = '';
    document.getElementById('subj-name-hi').value = '';
    document.getElementById('subj-icon').value = '📚';
    document.getElementById('subj-color').value = '#FF6B35';
    document.getElementById('subj-status').value = 'active';
  }
  document.getElementById('modal-subject').classList.add('show');
}

function editSubject(id) { openSubjectModal(id); }

async function saveSubject() {
  const name = document.getElementById('subj-name-en').value.trim();
  if (!name) { showNotif('⚠️','Missing','Subject name required'); return; }

  const exams = Array.from(document.querySelectorAll('#exam-chips input:checked')).map(i=>i.value);
  const editId = document.getElementById('subj-editing-id').value;
  const data = {
    name, nameHi: document.getElementById('subj-name-hi').value.trim(),
    icon: document.getElementById('subj-icon').value || '📚',
    color: document.getElementById('subj-color').value,
    status: document.getElementById('subj-status').value,
    exams
  };

  try {
    if (editId) { 
      if (typeof isFirebaseConfigured !== 'undefined' && isFirebaseConfigured()) await fbUpdateSubject(editId, data);
      DB.update('subjects', editId, data); 
      showNotif('✅','Updated!','Subject update हो गया'); 
    }
    else { 
      data.createdAt = Date.now();
      let newId = genId();
      if (typeof isFirebaseConfigured !== 'undefined' && isFirebaseConfigured()) newId = (await fbAddSubject(data)).id;
      DB.push('subjects', { id: newId, ...data }); 
      logActivity('📚 Subject added', name); 
      showNotif('✅','Added!','Subject add हो गया'); 
    }

    closeModal('subject');
    renderSubjects();
  } catch (e) {
    console.error("Error saving subject:", e);
    showNotif('❌','Error','Database save failed');
  }
}

function deleteSubject(id) {
  showConfirm('🗑️','Subject Delete?','Subject delete होगा। इससे जुड़े questions का subject unassigned हो जाएगा।', async () => {
    try {
      if (typeof isFirebaseConfigured !== 'undefined' && isFirebaseConfigured()) await fbDeleteSubject(id);
      DB.delete('subjects', id);
      renderSubjects();
      showNotif('✅','Deleted!','Subject delete हो गया');
    } catch(e) {
      console.error(e);
      showNotif('❌','Error', 'Delete failed');
    }
  });
}

function openClassModal(editId = null) {
  if (editId) {
    const c = (DB.get('classes')||[]).find(x=>x.id===editId);
    document.getElementById('class-name').value = c?.name || '';
    document.getElementById('class-level').value = c?.level || '';
    document.getElementById('class-order').value = c?.order || 1;
  } else {
    document.getElementById('class-name').value = '';
    document.getElementById('class-order').value = (DB.get('classes')||[]).length + 1;
  }
  document.getElementById('modal-class').classList.add('show');
}

function editClass(id) { openClassModal(id); }

async function saveClass() {
  const name = document.getElementById('class-name').value.trim();
  if (!name) { showNotif('⚠️','Missing','Class name required'); return; }
  
  const cData = { name, level: document.getElementById('class-level').value, order: parseInt(document.getElementById('class-order').value)||1, status: 'active', createdAt: Date.now() };
  try {
    let newId = genId();
    if (typeof isFirebaseConfigured !== 'undefined' && isFirebaseConfigured()) newId = (await fbAddClass(cData)).id;
    DB.push('classes', { id: newId, ...cData });
    closeModal('class');
    renderSubjects();
    showNotif('✅','Added!','Class add हो गई');
  } catch(e) {
    console.error(e);
    showNotif('❌','Error','Save failed');
  }
}

function deleteClass(id) {
  showConfirm('🗑️','Class Delete?','Class delete होगी।', () => {
    DB.delete('classes', id);
    renderSubjects();
    showNotif('✅','Deleted!','Class delete हो गई');
  });
}

// ══════════════════════════════════════════
// TOPICS
// ══════════════════════════════════════════
function renderTopics() {
  const topics = DB.get('topics') || [];
  const fltSubj = document.getElementById('flt-topic-subject')?.value || '';
  const filtered = fltSubj ? topics.filter(t => t.subject === fltSubj) : topics;
  const questions = DB.get('questions') || [];

  const tbody = document.getElementById('topics-tbody');
  tbody.innerHTML = filtered.map(t => {
    const qCnt = questions.filter(q => q.topic === t.name && q.subject === t.subject).length;
    return `<tr>
      <td style="font-weight:600">${t.name}</td>
      <td>${t.subject}</td>
      <td style="color:var(--muted)">${t.class || '—'}</td>
      <td style="font-family:var(--font-mono)">${qCnt}</td>
      <td><span class="badge badge-green">Active</span></td>
      <td><div class="td-actions">
        <button class="btn-icon" onclick="deleteTopic('${t.id}')">🗑</button>
      </div></td>
    </tr>`;
  }).join('') || `<tr><td colspan="6"><div class="empty-state"><div class="empty-state-icon">🏷️</div><h3>No Topics</h3><p>Topic add करो</p></div></td></tr>`;
}

function openTopicModal() {
  document.getElementById('topic-name').value = '';
  document.getElementById('modal-topic').classList.add('show');
}

async function saveTopic() {
  const name = document.getElementById('topic-name').value.trim();
  const subject = document.getElementById('topic-subject').value;
  if (!name || !subject) { showNotif('⚠️','Missing','Name और Subject required'); return; }
  
  const tData = { name, subject, class: document.getElementById('topic-class').value, createdAt: Date.now() };
  try {
    let newId = genId();
    if (typeof isFirebaseConfigured !== 'undefined' && isFirebaseConfigured()) newId = (await fbAddTopic(tData)).id;
    DB.push('topics', { id: newId, ...tData });
    closeModal('topic');
    renderTopics();
    showNotif('✅','Added!','Topic add हो गया');
  } catch(e) {
    console.error(e);
    showNotif('❌','Error','Save failed');
  }
}

function deleteTopic(id) {
  showConfirm('🗑️','Delete Topic?','',async () => { 
    try {
      if (typeof isFirebaseConfigured !== 'undefined' && isFirebaseConfigured()) await fbDeleteTopic(id);
      DB.delete('topics',id); renderTopics(); showNotif('✅','Deleted!',''); 
    } catch(e) {
      console.error(e);
      showNotif('❌','Error','Delete failed');
    }
  });
}

function filterTopics(val) {
  renderTopics();
}

// ══════════════════════════════════════════
// BULK IMPORT
// ══════════════════════════════════════════
function importBulkJSON() {
  const raw = document.getElementById('bulk-json').value.trim();
  if (!raw) { showNotif('⚠️','Empty','JSON paste करो'); return; }

  let data;
  try { data = JSON.parse(raw); }
  catch(e) { showNotif('❌','Invalid JSON','JSON format सही नहीं है: ' + e.message); return; }

  if (!Array.isArray(data)) { showNotif('❌','Format Error','Array of questions चाहिए'); return; }

  const imported = [];
  data.forEach(q => {
    if (!q.en || !q.correct === undefined) return;
    imported.push({
      id: genId(), createdAt: Date.now(),
      en: q.en, hi: q.hi || '',
      options: {
        en: Array.isArray(q.options) ? q.options : [q.optA||'',q.optB||'',q.optC||'',q.optD||''],
        hi: q.optionsHi || []
      },
      correct: parseInt(q.correct) || 0,
      subject: q.subject || 'Science',
      class: q.class || '',
      topic: q.topic || '',
      difficulty: q.difficulty || 'medium',
      marks: parseFloat(q.marks) || 1,
      neg: parseFloat(q.neg) || 0,
      exp: q.exp || q.explanation || '',
      expHi: q.expHi || '',
      tags: q.tags || [],
      status: 'active'
    });
  });

  const existing = DB.get('questions') || [];
  DB.set('questions', [...existing, ...imported]);
  logActivity(`📥 Bulk import: ${imported.length} questions`, `JSON से import`);
  showNotif('✅','Imported!',`${imported.length} questions add हो गए`);
  document.getElementById('bulk-json').value = '';
  renderQuestions();
  updateBadges();

  // Preview
  showImportPreview(imported);
}

function showImportPreview(items) {
  const card = document.getElementById('import-preview-card');
  const prev = document.getElementById('import-preview');
  card.style.display = 'block';
  prev.innerHTML = `<p style="color:var(--green);font-weight:600;margin-bottom:10px">✅ ${items.length} questions imported!</p>` +
    items.slice(0,5).map((q,i) => `<div style="padding:8px 0;border-bottom:1px solid var(--border);font-size:12.5px">${i+1}. ${q.en.slice(0,60)}...</div>`).join('') +
    (items.length > 5 ? `<div style="font-size:12px;color:var(--muted);margin-top:8px">...and ${items.length-5} more</div>` : '');
}

function handleFileUpload(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    if (file.name.endsWith('.json')) {
      document.getElementById('bulk-json').value = e.target.result;
      showNotif('📁','File Loaded!','JSON tab में paste हो गया, Import करो');
    }
  };
  reader.readAsText(file);
}

function loadSampleData(type) {
  const samples = {
    science: [
      { en: "Which organelle is known as the 'powerhouse of the cell'?", hi: "किस अंगक को 'कोशिका का शक्ति-गृह' कहा जाता है?", options: {en:["Nucleus","Ribosome","Mitochondria","Golgi Body"]}, correct: 2, subject: "Science", class: "Class 10", difficulty: "easy", marks: 1, neg: 0.25, exp: "Mitochondria produce ATP energy through cellular respiration.", status:'active' },
      { en: "The process by which plants make food using sunlight is?", options: {en:["Respiration","Photosynthesis","Transpiration","Digestion"]}, correct: 1, subject: "Science", class: "Class 9", difficulty: "easy", marks: 1, neg: 0, exp: "Photosynthesis uses sunlight to convert CO₂ and water to glucose.", status:'active' },
      { en: "Which blood group is the 'Universal Donor'?", options: {en:["A","B","AB","O"]}, correct: 3, subject: "Science", class: "Class 10", difficulty: "medium", marks: 2, neg: 0.5, exp: "Blood group O has no A or B antigens, so it can donate to all.", status:'active' },
      { en: "The chemical formula of common salt (table salt) is?", options: {en:["KCl","NaCl","CaCl₂","MgCl₂"]}, correct: 1, subject: "Science", class: "Class 9", difficulty: "easy", marks: 1, neg: 0, exp: "Common salt is Sodium Chloride (NaCl).", status:'active' },
      { en: "Speed of light in vacuum is approximately?", options: {en:["3×10⁸ m/s","3×10⁶ m/s","3×10¹⁰ m/s","3×10⁴ m/s"]}, correct: 0, subject: "Science", class: "Class 10", difficulty: "medium", marks: 2, neg: 0.5, exp: "Speed of light = 3×10⁸ m/s ≈ 300,000 km/s.", status:'active' },
      { en: "Deficiency of Vitamin C causes?", options: {en:["Rickets","Scurvy","Beri-Beri","Night Blindness"]}, correct: 1, subject: "Science", class: "Class 9", difficulty: "medium", marks: 1, neg: 0.25, exp: "Scurvy is caused by deficiency of Vitamin C (ascorbic acid).", status:'active' },
      { en: "The unit of heredity is?", options: {en:["Chromosome","Gene","DNA","Allele"]}, correct: 1, subject: "Science", class: "Class 10", difficulty: "medium", marks: 1, neg: 0.25, exp: "Gene is the basic unit of heredity — a specific DNA sequence.", status:'active' },
      { en: "Newton's first law is also called?", options: {en:["Law of Gravitation","Law of Inertia","Law of Momentum","Law of Energy"]}, correct: 1, subject: "Science", class: "Class 9", difficulty: "easy", marks: 1, neg: 0.25, exp: "Newton's first law = Law of Inertia: object continues in rest/motion unless acted upon.", status:'active' },
      { en: "Which planet is known as the 'Red Planet'?", options: {en:["Venus","Jupiter","Mars","Saturn"]}, correct: 2, subject: "Science", class: "Class 8", difficulty: "easy", marks: 1, neg: 0, exp: "Mars appears red due to iron oxide (rust) on its surface.", status:'active' },
      { en: "Which gas is released during photosynthesis?", options: {en:["Carbon Dioxide","Nitrogen","Oxygen","Hydrogen"]}, correct: 2, subject: "Science", class: "Class 8", difficulty: "easy", marks: 1, neg: 0, exp: "Plants release O₂ during photosynthesis when splitting water molecules.", status:'active' },
    ],
    math: [
      { en: "What is √144?", options: {en:["11","12","13","14"]}, correct: 1, subject: "Mathematics", class: "Class 8", difficulty: "easy", marks: 1, neg: 0, exp: "√144 = 12 because 12×12 = 144.", status:'active' },
      { en: "Sum of angles in a triangle?", options: {en:["90°","180°","270°","360°"]}, correct: 1, subject: "Mathematics", class: "Class 9", difficulty: "easy", marks: 1, neg: 0, exp: "Sum of interior angles of any triangle = 180°.", status:'active' },
      { en: "Area of a circle with radius r?", options: {en:["2πr","πr²","2πr²","πr"]}, correct: 1, subject: "Mathematics", class: "Class 10", difficulty: "easy", marks: 1, neg: 0, exp: "Area = πr². Circumference = 2πr.", status:'active' },
      { en: "LCM of 12 and 18?", options: {en:["24","36","48","54"]}, correct: 1, subject: "Mathematics", class: "Class 9", difficulty: "easy", marks: 1, neg: 0.25, exp: "LCM(12,18) = 2²×3² = 36.", status:'active' },
      { en: "If x² = 25, then x = ?", options: {en:["±4","±5","±6","±7"]}, correct: 1, subject: "Mathematics", class: "Class 9", difficulty: "easy", marks: 1, neg: 0.25, exp: "x = ±√25 = ±5.", status:'active' },
      { en: "HCF of 48 and 36?", options: {en:["6","8","12","18"]}, correct: 2, subject: "Mathematics", class: "Class 9", difficulty: "medium", marks: 1, neg: 0.25, exp: "HCF(48,36) = 2²×3 = 12.", status:'active' },
      { en: "What is 20% of 500?", options: {en:["80","100","120","150"]}, correct: 1, subject: "Mathematics", class: "Class 8", difficulty: "easy", marks: 1, neg: 0, exp: "20% of 500 = 0.20×500 = 100.", status:'active' },
      { en: "a² + b² = ? (Pythagoras)", options: {en:["a+b","c","c²","2c"]}, correct: 2, subject: "Mathematics", class: "Class 10", difficulty: "easy", marks: 1, neg: 0.25, exp: "Pythagoras: a²+b²=c² where c is hypotenuse.", status:'active' },
      { en: "Which is a prime number?", options: {en:["15","21","29","35"]}, correct: 2, subject: "Mathematics", class: "Class 9", difficulty: "medium", marks: 2, neg: 0.5, exp: "29 is prime — only factors are 1 and 29.", status:'active' },
      { en: "Value of π?", options: {en:["3.14","3.41","3.01","3.24"]}, correct: 0, subject: "Mathematics", class: "Class 8", difficulty: "easy", marks: 1, neg: 0, exp: "π ≈ 3.14159... ratio of circumference to diameter.", status:'active' },
    ],
    history: [
      { en: "Who is the 'Father of the Nation' in India?", options: {en:["Nehru","Patel","Gandhi","Bose"]}, correct: 2, subject: "History", class: "UPSC/SSC", difficulty: "easy", marks: 1, neg: 0, exp: "Mahatma Gandhi is called Father of Nation for leading non-violent independence movement.", status:'active' },
      { en: "India got independence on?", options: {en:["15 July 1947","26 Jan 1950","15 Aug 1947","2 Oct 1947"]}, correct: 2, subject: "History", class: "UPSC/SSC", difficulty: "easy", marks: 1, neg: 0, exp: "India gained independence on 15 August 1947.", status:'active' },
      { en: "First Prime Minister of India?", options: {en:["Patel","Ambedkar","Gandhi","Nehru"]}, correct: 3, subject: "History", class: "UPSC/SSC", difficulty: "easy", marks: 1, neg: 0.25, exp: "Jawaharlal Nehru was India's first PM (15 Aug 1947 – 27 May 1964).", status:'active' },
      { en: "In which year did the Sepoy Mutiny occur?", options: {en:["1847","1857","1867","1877"]}, correct: 1, subject: "History", class: "Class 10", difficulty: "easy", marks: 1, neg: 0, exp: "The Sepoy Mutiny (First War of Independence) occurred in 1857.", status:'active' },
      { en: "The Indian Constitution was adopted on?", options: {en:["15 Aug 1947","26 Jan 1950","26 Nov 1949","2 Oct 1949"]}, correct: 2, subject: "History", class: "UPSC/SSC", difficulty: "medium", marks: 2, neg: 0.5, exp: "The Constitution was adopted on 26 November 1949 and came into effect on 26 Jan 1950.", status:'active' },
    ],
  };

  let toAdd = [];
  if (type === 'all') { toAdd = [...samples.science, ...samples.math, ...samples.history]; }
  else { toAdd = samples[type] || []; }

  const withIds = toAdd.map(q => ({ id: genId(), createdAt: Date.now(), hi: '', ...q, options: { en: q.options.en, hi: [] } }));
  const existing = DB.get('questions') || [];
  DB.set('questions', [...existing, ...withIds]);
  logActivity(`📥 Sample data loaded: ${type}`, `${withIds.length} questions`);
  showNotif('✅','Loaded!',`${withIds.length} sample questions add हो गए`);
  renderQuestions();
  updateBadges();
  showImportPreview(withIds);
}

// ══════════════════════════════════════════
// USERS
// ══════════════════════════════════════════
function renderUsers() {
  const users = DB.get('users') || [];
  const tbody = document.getElementById('users-tbody');

  tbody.innerHTML = users.map(u => {
    const initial = u.name?.charAt(0).toUpperCase() || 'U';
    const joinDate = new Date(u.joinedAt).toLocaleDateString('en-IN', {day:'2-digit',month:'short',year:'numeric'});
    return `<tr>
      <td>
        <div style="display:flex;align-items:center;gap:10px">
          <div class="user-row-avatar" style="background:${u.color||'#888'}">${initial}</div>
          <div><div style="font-weight:600">${u.name}</div></div>
        </div>
      </td>
      <td style="color:var(--muted)">${u.email}</td>
      <td><span class="tag">${u.class||'—'}</span></td>
      <td style="font-family:var(--font-mono);color:var(--gold)">⚡ ${u.points||0}</td>
      <td style="font-family:var(--font-mono)">${u.quizzes||0}</td>
      <td style="font-size:12px;color:var(--muted)">${joinDate}</td>
      <td><span class="badge ${u.status==='active'?'badge-green':'badge-red'}">${u.status||'active'}</span></td>
      <td>
        <div class="td-actions">
          <button class="btn btn-sm btn-secondary" onclick="toggleUserStatus('${u.id}','${u.status}')">
            ${u.status==='active'?'🚫 Ban':'✅ Unban'}
          </button>
          <button class="btn-icon" onclick="deleteUser('${u.id}')">🗑</button>
        </div>
      </td>
    </tr>`;
  }).join('') || `<tr><td colspan="8"><div class="empty-state"><div class="empty-state-icon">👤</div><h3>No Users</h3></div></td></tr>`;

  document.getElementById('badge-u').textContent = users.length;
}

function filterUsers(val) {
  // Could filter by name/email — simplified
  renderUsers();
}

function toggleUserStatus(id, currentStatus) {
  const newStatus = currentStatus === 'active' ? 'banned' : 'active';
  DB.update('users', id, { status: newStatus });
  renderUsers();
  showNotif('✅','Updated!',`User ${newStatus === 'banned' ? 'banned' : 'unbanned'} हो गया`);
}

function deleteUser(id) {
  showConfirm('⚠️','User Delete करें?','',()=>{ DB.delete('users',id); renderUsers(); showNotif('✅','Deleted!',''); });
}

function openAddUserModal() {
  // Simplified — in real app would have a modal
  const name = prompt('User name:');
  const email = prompt('Email:');
  if (!name || !email) return;
  DB.push('users', { id: genId(), name, email, class:'', points:0, quizzes:0, accuracy:0, status:'active', color:'#4B91F7', joinedAt: Date.now() });
  renderUsers();
  showNotif('✅','Added!','User add हो गया');
}

// ══════════════════════════════════════════
// ANALYTICS
// ══════════════════════════════════════════
function renderAnalytics() {
  const stats = DB.get('quizStats') || { total:47, accuracy:76, avgTime:18, popular:'Science' };
  document.getElementById('an-quizzes').textContent = stats.total;
  document.getElementById('an-accuracy').textContent = stats.accuracy + '%';
  document.getElementById('an-avg-time').textContent = stats.avgTime + 'm';
  document.getElementById('an-popular').textContent = stats.popular;

  // Quiz chart
  const chartEl = document.getElementById('quiz-chart');
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const vals = [8,15,12,22,18,30,25];
  const max = Math.max(...vals);
  chartEl.innerHTML = days.map((d,i) => `
    <div class="chart-bar-wrap">
      <div class="chart-bar" style="height:${Math.max(5,(vals[i]/max)*100)}%" title="${vals[i]} quizzes"></div>
      <div class="chart-bar-lbl">${d}</div>
    </div>`).join('');

  // Popularity chart
  const subjects = DB.get('subjects') || [];
  const questions = DB.get('questions') || [];
  const popEl = document.getElementById('popularity-chart');
  const counts = {};
  questions.forEach(q => counts[q.subject] = (counts[q.subject]||0)+1);
  const total = Object.values(counts).reduce((a,b)=>a+b,1);
  popEl.innerHTML = subjects.slice(0,6).map(s => {
    const cnt = counts[s.name]||0;
    const pct = Math.round((cnt/total)*100);
    return `<div class="subj-row">
      <span style="font-size:12px;width:100px;flex-shrink:0">${s.icon} ${s.name}</span>
      <div style="flex:1"><div class="progress-bar"><div class="progress-fill" style="width:${pct}%;background:${s.color}"></div></div></div>
      <span style="font-size:11px;color:var(--muted);width:36px;text-align:right">${cnt}</span>
    </div>`;
  }).join('');

  // Difficult questions
  const tbody = document.getElementById('difficult-q-tbody');
  const sample = questions.slice(0,5);
  tbody.innerHTML = sample.map(q => `
    <tr>
      <td style="max-width:300px;font-size:13px">${(q.en||'').slice(0,60)}...</td>
      <td>${q.subject}</td>
      <td style="color:var(--red);font-weight:700">${Math.floor(Math.random()*40+30)}%</td>
      <td style="font-family:var(--font-mono)">${Math.floor(Math.random()*100+50)}</td>
    </tr>`).join('') || '<tr><td colspan="4" style="text-align:center;color:var(--muted)">Questions add करो पहले</td></tr>';
}

// ══════════════════════════════════════════
// BACKUP
// ══════════════════════════════════════════
function renderBackup() {
  const questions = DB.get('questions') || [];
  const subjects = DB.get('subjects') || [];
  const users = DB.get('users') || [];
  const topics = DB.get('topics') || [];
  const classes = DB.get('classes') || [];

  const el = document.getElementById('db-stats-inner');
  el.innerHTML = [
    { icon:'❓', label:'Questions', val: questions.length, color:'var(--orange)' },
    { icon:'📚', label:'Subjects', val: subjects.length, color:'var(--blue)' },
    { icon:'🏫', label:'Classes', val: classes.length, color:'var(--purple)' },
    { icon:'🏷️', label:'Topics', val: topics.length, color:'var(--cyan)' },
    { icon:'👥', label:'Users', val: users.length, color:'var(--green)' },
  ].map(s => `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:12px;background:var(--bg3);border-radius:var(--r-sm)">
      <div style="display:flex;align-items:center;gap:10px">
        <span style="font-size:18px">${s.icon}</span>
        <span style="font-size:13px;font-weight:600">${s.label}</span>
      </div>
      <span style="font-family:var(--font-head);font-size:20px;font-weight:700;color:${s.color}">${s.val}</span>
    </div>`).join('');
}

function exportData(type) {
  let data = {};
  if (type === 'questions') data = DB.get('questions') || [];
  else if (type === 'subjects') data = DB.get('subjects') || [];
  else if (type === 'users') data = DB.get('users') || [];
  else data = {
    questions: DB.get('questions'),
    subjects: DB.get('subjects'),
    classes: DB.get('classes'),
    topics: DB.get('topics'),
    users: DB.get('users'),
    settings: DB.get('settings'),
    exportedAt: new Date().toISOString()
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `quizforge_${type}_${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showNotif('✅','Exported!',`${type} data download हो गया`);
}

function restoreBackup(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      showConfirm('⚠️','Restore करें?','Existing data replace हो जाएगा।', () => {
        if (data.questions) DB.set('questions', data.questions);
        if (data.subjects)  DB.set('subjects', data.subjects);
        if (data.classes)   DB.set('classes', data.classes);
        if (data.topics)    DB.set('topics', data.topics);
        if (data.users)     DB.set('users', data.users);
        showNotif('✅','Restored!','Backup restore हो गया');
        renderOverview();
      });
    } catch(err) { showNotif('❌','Invalid','JSON file corrupt है'); }
  };
  reader.readAsText(file);
}

// ══════════════════════════════════════════
// AD & SETTINGS
// ══════════════════════════════════════════
function saveAdSettings() {
  const settings = DB.get('settings') || {};
  settings.monetagId = document.getElementById('monetag-id').value;
  settings.skipTimer = parseInt(document.getElementById('ad-skip-timer').value) || 5;
  settings.adFrequency = parseInt(document.getElementById('ad-frequency').value) || 1;
  DB.set('settings', settings);
  showNotif('✅','Saved!','Ad settings save हो गए');
}

function saveSiteSettings() {
  const settings = DB.get('settings') || {};
  settings.siteName = document.getElementById('set-site-name')?.value || 'QuizForge';
  settings.tagline  = document.getElementById('set-tagline')?.value || '';
  DB.set('settings', settings);
  showNotif('✅','Saved!','Settings save हो गई');
}

// ══════════════════════════════════════════
// MODALS
// ══════════════════════════════════════════
function closeModal(id) {
  document.getElementById('modal-' + id)?.classList.remove('show');
}

document.querySelectorAll('.modal-overlay').forEach(el => {
  el.addEventListener('click', e => {
    if (e.target === el) {
      const id = el.id.replace('modal-', '');
      closeModal(id);
    }
  });
});

// ══════════════════════════════════════════
// CONFIRM DIALOG
// ══════════════════════════════════════════
let _confirmCallback = null;
function showConfirm(icon, title, sub, cb) {
  document.getElementById('confirm-icon').textContent = icon;
  document.getElementById('confirm-title').textContent = title;
  document.getElementById('confirm-sub').textContent = sub;
  _confirmCallback = cb;
  document.getElementById('modal-confirm').classList.add('show');
  document.getElementById('confirm-ok-btn').onclick = () => {
    closeModal('confirm');
    if (_confirmCallback) _confirmCallback();
  };
}

// ══════════════════════════════════════════
// NOTIFICATIONS
// ══════════════════════════════════════════
let _notifTimeout;
function showNotif(icon, text, sub = '') {
  const el = document.getElementById('notification');
  document.getElementById('notif-icon').textContent = icon;
  document.getElementById('notif-text').textContent = text;
  document.getElementById('notif-sub').textContent = sub;

  // Reset bar
  el.innerHTML = el.innerHTML;
  el.style.display = 'flex';
  el.classList.remove('hide');

  // Reanimate bar
  const bar = document.createElement('div');
  bar.className = 'notif-bar';
  el.appendChild(bar);

  clearTimeout(_notifTimeout);
  _notifTimeout = setTimeout(() => {
    el.classList.add('hide');
    setTimeout(() => el.style.display = 'none', 300);
  }, 3000);
}

// ══════════════════════════════════════════
// MISC
// ══════════════════════════════════════════
function updateBadges() {
  const questions = DB.get('questions') || [];
  const users = DB.get('users') || [];
  document.getElementById('badge-q').textContent = questions.length;
  document.getElementById('badge-u').textContent = users.length;
}

// Drag & drop for CSV zone
const csvZone = document.getElementById('csv-upload-zone');
if (csvZone) {
  csvZone.addEventListener('dragover', e => { e.preventDefault(); csvZone.classList.add('dragover'); });
  csvZone.addEventListener('dragleave', () => csvZone.classList.remove('dragover'));
  csvZone.addEventListener('drop', e => {
    e.preventDefault();
    csvZone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file) {
      document.getElementById('csv-file').files = e.dataTransfer.files;
      handleFileUpload({ files: e.dataTransfer.files });
    }
  });
}

// Keyboard shortcuts
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.show').forEach(m => m.classList.remove('show'));
  }
});

// ══════════════════════════════════════════
// INIT
// ══════════════════════════════════════════
function initApp() {
  seedInitialData();
  showSection('overview');
  updateBadges();

  const settings = DB.get('settings') || {};
  if (document.getElementById('monetag-id')) document.getElementById('monetag-id').value = settings.monetagId || '';
  if (document.getElementById('ad-skip-timer')) document.getElementById('ad-skip-timer').value = settings.skipTimer || 5;
}

// Auto-init if already logged in (dev convenience)
// Comment out below line for production:
// initApp(); document.getElementById('login-page').style.display='none'; document.getElementById('app').style.display='flex';
