// ══════════════════════════════════════════════════════════
// STATE
// ══════════════════════════════════════════════════════════
const state = {
  currentPage: 'home',
  lang: 'en',
  quizMode: 'practice',
  quizSubject: 'Science',
  quizCount: 10,
  isLoggedIn: false,
  user: { name: 'Arjun Singh', points: 1250, avatar: 'A' },

  // Active quiz state
  questions: [],
  currentQ: 0,
  answers: {},    // { qIndex: { selected, isCorrect } }
  startTime: null,
  timerInterval: null,
  timerSeconds: 0,
  quizStarted: false,
};

// ══════════════════════════════════════════════════════════
// QUESTION BANK (50 sample MCQs across subjects)
// ══════════════════════════════════════════════════════════

// ══════════════════════════════════════════════════════════
// LOCALSTORAGE INTEGRATION (Admin Panel Sync)
// ══════════════════════════════════════════════════════════
const ADMIN_PREFIX = 'qf_admin_';

function readAdmin(key) {
  try { return JSON.parse(localStorage.getItem(ADMIN_PREFIX + key) || 'null'); }
  catch(e) { return null; }
}

function getAdminQuestions() {
  const questions = readAdmin('questions');
  if (!questions || !Array.isArray(questions) || questions.length === 0) return null;

  // Filter active only and group by subject
  const grouped = {};
  questions.filter(q => q.status === 'active' || !q.status).forEach(q => {
    const subj = q.subject || 'General';
    if (!grouped[subj]) grouped[subj] = [];
    grouped[subj].push({
      en: q.en || '',
      hi: q.hi || '',
      options: q.options || { en: [], hi: [] },
      correct: typeof q.correct === 'number' ? q.correct : 0,
      exp: q.exp || '',
      exp_hi: q.exp_hi || '',
      marks: q.marks || 1,
      neg: q.neg || 0,
      difficulty: q.difficulty || 'medium'
    });
  });
  return Object.keys(grouped).length > 0 ? grouped : null;
}

function populateQuizDropdowns() {
  // --- Subjects dropdown ---
  const subjects = readAdmin('subjects');
  const subjSel = document.getElementById('sel-subject');
  if (subjSel) {
    const currentVal = subjSel.value;
    subjSel.innerHTML = '<option value="">Subject चुनो</option>';

    if (subjects && subjects.length > 0) {
      subjects.filter(s => s.status === 'active' || !s.status).forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.name;
        opt.textContent = (s.icon ? s.icon + ' ' : '') + s.name;
        subjSel.appendChild(opt);
      });
    } else {
      
    }
    // Restore previous selection if still valid
    if (currentVal) subjSel.value = currentVal;
  }

  // --- Classes dropdown ---
  const classes = readAdmin('classes');
  const clsSel = document.getElementById('sel-class');
  if (clsSel) {
    const currentVal = clsSel.value;
    clsSel.innerHTML = '<option value="">Class चुनो</option>';

    if (classes && classes.length > 0) {
      classes.filter(c => c.status === 'active' || !c.status).forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.name;
        opt.textContent = c.name;
        clsSel.appendChild(opt);
      });
    } else {
      // Fallback
      ['Class 9','Class 10','Class 11','Class 12','Graduation','UPSC/SSC'].forEach(name => {
        const opt = document.createElement('option');
        opt.value = name;
        opt.textContent = name;
        clsSel.appendChild(opt);
      });
    }
    if (currentVal) clsSel.value = currentVal;
  }

  // --- Update homepage subject count badge (if admin questions exist) ---
  const adminQ = getAdminQuestions();
  if (adminQ) {
    document.querySelectorAll('.subject-card .subject-count').forEach(el => {
      const card = el.closest('.subject-card');
      const nameEl = card?.querySelector('.subject-name');
      if (nameEl) {
        const count = (adminQ[nameEl.textContent] || []).length;
        if (count > 0) el.textContent = count + ' Questions';
      }
    });
  }
}

// ══════════════════════════════════════════════════════════
// PAGE NAVIGATION
// ══════════════════════════════════════════════════════════
function showPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + page)?.classList.add('active');
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(l => {
    if (l.textContent.toLowerCase().includes(page === 'home' ? 'होम' : page.includes('leader') ? 'leader' : page.includes('dash') ? 'dash' : page)) {
      l.classList.add('active');
    }
  });
  state.currentPage = page;
  window.scrollTo(0, 0);

  if (page === 'leaderboard') buildLeaderboard();
  if (page === 'dashboard') buildHeatmap();
}

function goHome() { showPage('home'); }

// ══════════════════════════════════════════════════════════
// MODAL
// ══════════════════════════════════════════════════════════
function openModal(type) {
  document.getElementById('modal-' + type).classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closeModal(type) {
  document.getElementById('modal-' + type).classList.remove('show');
  document.body.style.overflow = '';
}

function fakeLogin() {
  closeModal('login'); closeModal('register');
  state.isLoggedIn = true;
  document.getElementById('nav-guest').classList.add('hidden');
  document.getElementById('nav-user').classList.remove('hidden');
  showToast('+100 Welcome Points! 🎉', 100);
}

// Click outside to close modal
document.querySelectorAll('.modal-overlay').forEach(el => {
  el.addEventListener('click', e => {
    if (e.target === el) {
      const id = el.id.replace('modal-', '');
      closeModal(id);
    }
  });
});

// ══════════════════════════════════════════════════════════
// LANGUAGE
// ══════════════════════════════════════════════════════════
function setLang(lang) {
  state.lang = lang;
  document.querySelectorAll('.lang-btn').forEach(b => {
    b.classList.remove('active');
    if ((lang === 'en' && b.textContent.trim() === 'EN') || 
        (lang === 'hi' && b.textContent.trim() === 'HI')) {
      b.classList.add('active');
    }
  });

  // If quiz is active, update question display
  if (state.quizStarted) renderCurrentQuestion();
}

// ══════════════════════════════════════════════════════════
// QUIZ SETUP
// ══════════════════════════════════════════════════════════
function selectMode(el, mode) {
  document.querySelectorAll('.setup-option').forEach(o => o.classList.remove('active'));
  el.classList.add('active');
  state.quizMode = mode;
}

function startSubjectQuiz(subject) {
  showPage('quiz');
  document.getElementById('sel-subject').value = subject;
  state.quizSubject = subject;
}

function startQuickQuiz() {
  showPage('quiz');
  // Auto-select first options
  setTimeout(() => startQuiz(), 300);
}

async function startQuiz() {
  const subj = document.getElementById('sel-subject')?.value || 'Science';
  const count = parseInt(document.getElementById('sel-count')?.value || '10');
  state.quizSubject = subj || 'Science';
  state.quizCount = count;

  let pool = [];

  // 1. Try Firebase First
  if (typeof isFirebaseConfigured !== 'undefined' && isFirebaseConfigured() && window.fbGetQuestions) {
    try {
      const fbQs = await fbGetQuestions({ subject: state.quizSubject, status: 'active' });
      if (fbQs && fbQs.length > 0) pool = fbQs;
      else pool = await fbGetQuestions({ status: 'active' }); // fallback to all active
    } catch (e) {
      console.warn("Firestore fetch failed, falling back to local storage", e);
    }
  }

  // 2. Fallback to LocalStorage (Admin Sync)
  if (pool.length === 0) {
    const adminQ = getAdminQuestions();
    if (adminQ) {
      pool = adminQ[state.quizSubject] || [];
      if (pool.length === 0) pool = Object.values(adminQ).flat();
    }
  }

  

  // Shuffle and slice
  let shuffled = [...pool].sort(() => Math.random() - 0.5);
  state.questions = shuffled.slice(0, Math.min(count, shuffled.length));

  // Pad with more questions if not enough
  if (state.questions.length < count) {
    const adminQ = getAdminQuestions();
    const allExtra = adminQ
      ? Object.values(adminQ).flat()
      : [];
    const extra = [...allExtra]
      .filter(q => !state.questions.some(sq => sq.en === q.en))
      .sort(() => Math.random() - 0.5)
      .slice(0, count - state.questions.length);
    state.questions = [...state.questions, ...extra];
  }

  state.currentQ = 0;
  state.answers = {};
  state.startTime = Date.now();
  state.quizStarted = true;

  // Show active quiz
  document.getElementById('quiz-setup').style.display = 'none';
  document.getElementById('quiz-active').classList.add('show');

  buildQNavigator();
  renderCurrentQuestion();
  startTimer();

  showPage('quiz');
}

// ══════════════════════════════════════════════════════════
// QUIZ TIMER
// ══════════════════════════════════════════════════════════
function startTimer() {
  if (state.timerInterval) clearInterval(state.timerInterval);
  const durationMins = (state.quizMode === 'exam') ? state.questions.length * 1.5 : 30;
  state.timerSeconds = Math.floor(durationMins * 60);

  updateTimerDisplay();

  if (state.quizMode !== 'practice') {
    state.timerInterval = setInterval(() => {
      state.timerSeconds--;
      updateTimerDisplay();
      if (state.timerSeconds <= 0) {
        clearInterval(state.timerInterval);
        finishQuiz();
      }
    }, 1000);
  }
}

function updateTimerDisplay() {
  const el = document.getElementById('timer-display');
  const timerEl = document.getElementById('quiz-timer');
  if (!el) return;

  const m = Math.floor(state.timerSeconds / 60);
  const s = state.timerSeconds % 60;
  el.textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;

  timerEl.className = 'quiz-timer';
  if (state.timerSeconds < 60) timerEl.classList.add('danger');
  else if (state.timerSeconds < 180) timerEl.classList.add('warn');
}

// ══════════════════════════════════════════════════════════
// QUESTION RENDER
// ══════════════════════════════════════════════════════════
function renderCurrentQuestion() {
  const q = state.questions[state.currentQ];
  if (!q) return;

  const idx = state.currentQ;
  const total = state.questions.length;
  const isHindi = document.getElementById('chk-hindi')?.checked || state.lang === 'hi';

  // Progress
  document.getElementById('q-progress-text').textContent = `Question ${idx+1} of ${total}`;
  document.getElementById('q-subject-label').textContent = state.quizSubject;
  document.getElementById('quiz-progress-fill').style.width = ((idx+1)/total*100) + '%';
  document.getElementById('q-num-label').textContent = `Q ${idx+1}`;
  document.getElementById('q-marks').textContent = q.marks;
  document.getElementById('q-neg-marks').textContent = q.neg > 0 ? `(-${q.neg} Negative)` : '';

  // Difficulty badge
  const diffEl = document.getElementById('q-diff-badge');
  const diffMap = { easy: ['badge-green','Easy 🟢'], medium: ['badge-orange','Medium 🟡'], hard: ['badge-red','Hard 🔴'] };
  const [dc, dl] = diffMap[q.difficulty] || ['badge-orange','Medium'];
  diffEl.innerHTML = `<span class="badge ${dc}">${dl}</span>`;

  // Question text
  document.getElementById('question-text-en').textContent = q.en;
  const hiEl = document.getElementById('question-text-hi');
  if (isHindi && q.hi) {
    hiEl.textContent = q.hi;
    hiEl.style.display = 'block';
  } else {
    hiEl.style.display = 'none';
  }

  // Options
  const container = document.getElementById('options-container');
  container.innerHTML = '';
  const labels = ['A','B','C','D'];
  q.options.en.forEach((optText, i) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.id = `opt-${i}`;

    const ans = state.answers[idx];
    if (ans !== undefined) {
      btn.disabled = true;
      if (ans.selected === i) {
        btn.classList.add(ans.isCorrect ? 'correct' : 'wrong');
      }
      if (i === q.correct) btn.classList.add('correct');
    }

    const hiOpt = (isHindi && q.options.hi) ? `<span style="font-size:12px;color:var(--muted);display:block;margin-top:2px">${q.options.hi[i]}</span>` : '';

    btn.innerHTML = `
      <span class="option-label">${labels[i]}</span>
      <span style="flex:1">${optText}${hiOpt}</span>
      ${ans !== undefined && ans.selected === i ? `<span class="option-result-icon">${ans.isCorrect ? '✓' : '✗'}</span>` : ''}
      ${ans !== undefined && i === q.correct && ans.selected !== i ? '<span class="option-result-icon" style="color:var(--green)">✓</span>' : ''}
    `;
    btn.onclick = () => selectAnswer(i);
    container.appendChild(btn);
  });

  // Explanation
  const expBox = document.getElementById('explanation-box');
  if (state.answers[idx] !== undefined && state.quizMode === 'practice') {
    document.getElementById('explanation-text').innerHTML =
      (isHindi && q.exp_hi ? `<strong>हिंदी:</strong> ${q.exp_hi}<br><br>` : '') +
      `<strong>English:</strong> ${q.exp}`;
    expBox.classList.remove('hidden');
  } else {
    expBox.classList.add('hidden');
  }

  // Nav buttons
  document.getElementById('btn-prev').disabled = idx === 0;
  document.getElementById('btn-next').textContent = idx === total - 1 ? 'Finish Quiz ✓' : 'अगला →';

  // Bookmark
  const bookmarked = JSON.parse(localStorage.getItem('qf_bookmarks') || '[]');
  document.getElementById('btn-bookmark').textContent = bookmarked.includes(idx) ? '🔖 Saved ✓' : '🔖 Save';

  updateQNavigator();
}

function selectAnswer(optionIndex) {
  const idx = state.currentQ;
  if (state.answers[idx] !== undefined) return; // Already answered

  const q = state.questions[idx];
  const isCorrect = optionIndex === q.correct;

  state.answers[idx] = { selected: optionIndex, isCorrect };

  // Update live score
  const correctCount = Object.values(state.answers).filter(a => a.isCorrect).length;
  const wrongCount = Object.values(state.answers).filter(a => !a.isCorrect).length;
  document.getElementById('live-correct').textContent = correctCount;
  document.getElementById('live-wrong').textContent = wrongCount;

  renderCurrentQuestion();

  // Auto-advance in timed mode
  if (state.quizMode === 'timed' || state.quizMode === 'exam') {
    setTimeout(() => {
      if (state.currentQ < state.questions.length - 1) nextQuestion();
    }, 800);
  }
}

function skipQuestion() {
  if (state.answers[state.currentQ] === undefined) {
    state.answers[state.currentQ] = { selected: null, isCorrect: false, skipped: true };
  }
  nextQuestion();
}

function prevQuestion() {
  if (state.currentQ > 0) {
    state.currentQ--;
    renderCurrentQuestion();
  }
}

function nextQuestion() {
  if (state.currentQ < state.questions.length - 1) {
    state.currentQ++;
    renderCurrentQuestion();
  } else {
    confirmFinishQuiz();
  }
}

function bookmarkQuestion() {
  const idx = state.currentQ;
  const bookmarked = JSON.parse(localStorage.getItem('qf_bookmarks') || '[]');
  const i = bookmarked.indexOf(idx);
  if (i === -1) { bookmarked.push(idx); }
  else { bookmarked.splice(i, 1); }
  localStorage.setItem('qf_bookmarks', JSON.stringify(bookmarked));
  renderCurrentQuestion();
}

// ══════════════════════════════════════════════════════════
// Q NAVIGATOR
// ══════════════════════════════════════════════════════════
function buildQNavigator() {
  const grid = document.getElementById('q-nav-grid');
  grid.innerHTML = '';
  state.questions.forEach((_, i) => {
    const btn = document.createElement('button');
    btn.className = 'q-nav-btn';
    btn.textContent = i + 1;
    btn.id = `qnav-${i}`;
    btn.onclick = () => { state.currentQ = i; renderCurrentQuestion(); };
    grid.appendChild(btn);
  });
}

function updateQNavigator() {
  state.questions.forEach((_, i) => {
    const btn = document.getElementById(`qnav-${i}`);
    if (!btn) return;
    btn.className = 'q-nav-btn';
    if (i === state.currentQ) btn.classList.add('current');
    else if (state.answers[i]) {
      if (state.answers[i].skipped) btn.classList.add('skipped');
      else btn.classList.add('answered');
    }
  });
}

// ══════════════════════════════════════════════════════════
// FINISH QUIZ
// ══════════════════════════════════════════════════════════
function confirmFinishQuiz() {
  if (Object.keys(state.answers).length < state.questions.length) {
    const unanswered = state.questions.length - Object.keys(state.answers).length;
    if (!confirm(`अभी भी ${unanswered} question(s) बचे हैं। क्या आप Submit करना चाहते हैं?`)) return;
  }
  finishQuiz();
}

function finishQuiz() {
  if (state.timerInterval) clearInterval(state.timerInterval);

  const timeTaken = Math.floor((Date.now() - state.startTime) / 1000);
  const total = state.questions.length;
  const answered = Object.keys(state.answers).length;
  const correct = Object.values(state.answers).filter(a => a.isCorrect).length;
  const wrong = Object.values(state.answers).filter(a => !a.isCorrect && !a.skipped && a.selected !== null).length;
  const skipped = total - answered + Object.values(state.answers).filter(a => a.skipped).length;

  let totalMarksObtained = 0;
  let totalPossible = 0;
  state.questions.forEach((q, i) => {
    totalPossible += q.marks;
    const ans = state.answers[i];
    if (ans) {
      if (ans.isCorrect) totalMarksObtained += q.marks;
      else if (!ans.skipped && ans.selected !== null) totalMarksObtained -= (q.neg || 0);
    }
  });

  const pct = Math.max(0, Math.round((totalMarksObtained / totalPossible) * 100));
  const points = Math.max(0, Math.round(totalMarksObtained * 10));

  // Show interstitial ad before result
  showInterstitialAd(() => {
    showResult({ total, correct, wrong, skipped, pct, timeTaken, points });
  });
}

async function showResult(data) {
  const { total, correct, wrong, skipped, pct, timeTaken, points } = data;

  let emoji = '😤', title = 'अभी और मेहनत करो!';
  if (pct >= 90) { emoji = '🏆'; title = 'Outstanding! शानदार!'; }
  else if (pct >= 75) { emoji = '🎉'; title = 'बहुत अच्छा! Great Job!'; }
  else if (pct >= 60) { emoji = '👍'; title = 'अच्छा किया! Keep it up!'; }
  else if (pct >= 40) { emoji = '📚'; title = 'और practice करो!'; }

  document.getElementById('result-emoji').textContent = emoji;
  document.getElementById('result-title').textContent = title;
  document.getElementById('result-pct').textContent = pct + '%';
  document.getElementById('result-sub').textContent = `${state.quizSubject} · ${state.quizMode} mode · ${total} questions`;
  document.getElementById('result-rank-msg').textContent = pct >= 75 ? '🏆 Top 25% में! Well done!' : '💪 अगली बार और बेहतर करो!';

  document.getElementById('rs-total').textContent = total;
  document.getElementById('rs-correct').textContent = correct;
  document.getElementById('rs-wrong').textContent = wrong;
  const mins = Math.floor(timeTaken / 60), secs = timeTaken % 60;
  document.getElementById('rs-time').textContent = `${mins}m ${secs}s`;

  // Firebase integration
  if (typeof isFirebaseConfigured !== 'undefined' && isFirebaseConfigured() && window.currentUser) {
    try {
      await fbSaveQuizResult({
        subject: state.quizSubject,
        mode: state.quizMode || 'practice',
        total: total,
        correctCount: correct,
        wrongCount: wrong,
        skippedCount: skipped,
        points: points,
        timeTaken: timeTaken,
        accuracy: pct
      });
      console.log('Quiz saved to Firebase!');
      if (typeof loadAnalyticsDashboard === 'function') loadAnalyticsDashboard();
    } catch (e) {
      console.error('Error saving quiz result to Firebase', e);
    }
  }

  // Answer review
  const reviewList = document.getElementById('answer-review-list');
  reviewList.innerHTML = '';
  state.questions.forEach((q, i) => {
    const ans = state.answers[i];
    const isCorrect = ans?.isCorrect;
    const isSkipped = !ans || ans.skipped;

    let statusIcon, statusClass;
    if (isSkipped) { statusIcon = '—'; statusClass = 'status-skip'; }
    else if (isCorrect) { statusIcon = '✓'; statusClass = 'status-correct'; }
    else { statusIcon = '✗'; statusClass = 'status-wrong'; }

    const labels = ['A','B','C','D'];
    const item = document.createElement('div');
    item.className = 'answer-review-item';
    item.innerHTML = `
      <div class="answer-status-icon ${statusClass}">${statusIcon}</div>
      <div style="flex:1">
        <div class="answer-q-text">Q${i+1}: ${q.en}</div>
        <div class="answer-options-mini">
          ${q.options.en.map((opt, oi) => `
            <span class="answer-opt-mini ${oi === q.correct ? 'correct-opt' : (ans?.selected === oi && !isCorrect ? 'wrong-opt' : '')}">
              ${labels[oi]}. ${opt}
            </span>
          `).join('')}
        </div>
        ${(!isSkipped && q.exp) ? `<div style="font-size:12px;color:var(--muted);margin-top:6px;line-height:1.5">${q.exp}</div>` : ''}
      </div>
    `;
    reviewList.appendChild(item);
  });

  showPage('result');
  showToast(`+${points}`, points);

  // Reset quiz state for next time
  setTimeout(() => {
    document.getElementById('quiz-setup').style.display = 'block';
    document.getElementById('quiz-active').classList.remove('show');
    state.quizStarted = false;
  }, 500);
}

// ══════════════════════════════════════════════════════════
// LEADERBOARD
// ══════════════════════════════════════════════════════════
const LEADERBOARD_DATA = [
  { name: 'Priya Sharma', tag: 'Class 12 · Delhi', points: 8540, acc: 92, quizzes: 213, avatar: 'P', color: '#FF6B35' },
  { name: 'Rahul Verma', tag: 'JEE Aspirant · Mumbai', points: 7920, acc: 89, quizzes: 198, avatar: 'R', color: '#4F8EF7' },
  { name: 'Ananya Gupta', tag: 'NEET · Bangalore', points: 7340, acc: 94, quizzes: 176, avatar: 'A', color: '#A855F7' },
  { name: 'Arjun Singh', tag: 'UPSC · Raipur', points: 1250, acc: 78, quizzes: 34, avatar: 'A', color: '#00D97E', isYou: true },
  { name: 'Devika Patel', tag: 'Class 11 · Ahmedabad', points: 6890, acc: 88, quizzes: 165, avatar: 'D', color: '#FFB347' },
  { name: 'Karan Mehta', tag: 'SSC CGL · Jaipur', points: 6450, acc: 85, quizzes: 158, avatar: 'K', color: '#FF4757' },
  { name: 'Sneha Reddy', tag: 'Class 10 · Hyderabad', points: 5980, acc: 91, quizzes: 142, avatar: 'S', color: '#00B4D8' },
  { name: 'Vikram Nair', tag: 'JEE · Kerala', points: 5670, acc: 87, quizzes: 134, avatar: 'V', color: '#2DC653' },
];

function buildLeaderboard() {
  const sorted = [...LEADERBOARD_DATA].sort((a, b) => b.points - a.points);
  const top3 = sorted.slice(0, 3);
  const rest = sorted.slice(3);

  // Podium
  const podiumEl = document.getElementById('lb-podium');
  const podiumOrder = [top3[1], top3[0], top3[2]]; // 2nd, 1st, 3rd
  const ranks = [2, 1, 3];
  const rankClasses = ['rank-2', 'rank-1', 'rank-3'];

  podiumEl.innerHTML = podiumOrder.map((p, i) => `
    <div class="lb-podium ${ranks[i] === 1 ? 'lb-podium-1' : ''}">
      <div class="lb-rank-badge ${rankClasses[i]}">${ranks[i]}</div>
      <div class="lb-avatar" style="background:${p.color}">${p.avatar}</div>
      <div class="lb-name">${p.name}</div>
      <div class="lb-points">⚡ ${p.points.toLocaleString()}</div>
      <div class="lb-level">${p.acc}% accuracy</div>
    </div>
  `).join('');

  // Table
  const tableBody = document.getElementById('lb-table-body');
  [...sorted].forEach((entry, i) => {
    const row = document.createElement('div');
    row.className = `lb-row ${entry.isYou ? 'you' : ''}`;
    row.innerHTML = `
      <div class="lb-rank-num">#${i + 1}</div>
      <div class="lb-user">
        <div class="lb-user-ava" style="background:${entry.color}">${entry.avatar}</div>
        <div>
          <div class="lb-user-name">${entry.name} ${entry.isYou ? '<span class="badge badge-orange" style="font-size:10px;margin-left:4px">You</span>' : ''}</div>
          <div class="lb-user-tag">${entry.tag}</div>
        </div>
      </div>
      <div style="text-align:right;font-weight:700;color:var(--gold)">⚡ ${entry.points.toLocaleString()}</div>
      <div style="text-align:right">${entry.acc}%</div>
      <div style="text-align:right;color:var(--muted)">${entry.quizzes}</div>
    `;
    tableBody.appendChild(row);
  });
}

function switchLbTab(el, tab) {
  document.querySelectorAll('.tab-pill').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  // In a real app, fetch different data here
  document.getElementById('lb-table-body').innerHTML = '';
  buildLeaderboard();
}

// ══════════════════════════════════════════════════════════
// DASHBOARD HEATMAP
// ══════════════════════════════════════════════════════════
function buildHeatmap() {
  const heatmap = document.getElementById('heatmap');
  if (!heatmap || heatmap.children.length > 0) return;
  const levels = [0, 0, 0, 0, 1, 0, 2, 1, 0, 0, 3, 4];
  levels.forEach(l => {
    const cell = document.createElement('div');
    cell.className = `heatmap-cell ${l > 0 ? 'l' + l : ''}`;
    heatmap.appendChild(cell);
  });
  // Add more weeks
  for (let w = 0; w < 7*12 - 12; w++) {
    const cell = document.createElement('div');
    const rand = Math.random();
    const l = rand < 0.4 ? 0 : rand < 0.6 ? 1 : rand < 0.8 ? 2 : rand < 0.95 ? 3 : 4;
    cell.className = `heatmap-cell ${l > 0 ? 'l' + l : ''}`;
    heatmap.appendChild(cell);
  }
}

// ══════════════════════════════════════════════════════════
// ADS - MONETAG INTEGRATION
// ══════════════════════════════════════════════════════════

// --- Interstitial Ad ---
let interstitialCallback = null;
let skipCountdown = 5;
let skipInterval = null;

function showInterstitialAd(callback) {
  interstitialCallback = callback;
  skipCountdown = 5;

  const adEl = document.getElementById('ad-interstitial');
  const skipBtn = document.getElementById('btn-skip-ad');
  const countdownEl = document.getElementById('skip-countdown');

  skipBtn.disabled = true;
  countdownEl.textContent = `${skipCountdown} seconds में skip कर सकते हो...`;
  adEl.classList.add('show');

  skipInterval = setInterval(() => {
    skipCountdown--;
    if (skipCountdown <= 0) {
      clearInterval(skipInterval);
      skipBtn.disabled = false;
      countdownEl.textContent = 'अब skip कर सकते हो ✓';
    } else {
      countdownEl.textContent = `${skipCountdown} seconds में skip कर सकते हो...`;
    }
  }, 1000);

  /* ── REAL MONETAG INTEGRATION (replace the placeholder div) ──
  
  // Popunder (fires once per session on first user click)
  window._mNHandle = window._mNHandle || {};
  window._mNHandle.queue = window._mNHandle.queue || [];
  
  // Native Banner
  (function(d,z,s){
    s.src='https://cdn.monetag.com/publishers/YOUR_PUB_ID/tag.js';
    s.async=1; s.defer=1;
    (d.body||d.documentElement).appendChild(s);
  })(document, 208991, document.createElement('script'));
  
  ─────────────────────────────────────────────── */
}

function closeInterstitial() {
  document.getElementById('ad-interstitial').classList.remove('show');
  clearInterval(skipInterval);
  if (interstitialCallback) {
    interstitialCallback();
    interstitialCallback = null;
  }
}

// ── Points Toast ──
function showToast(points, pts) {
  const toast = document.getElementById('points-toast');
  document.getElementById('toast-pts').textContent = `+${pts} Points`;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 3000);
}

// ── Mobile Menu ──
function toggleMobileMenu() {
  const menu = document.getElementById('mobile-menu');
  menu.style.display = menu.style.display === 'flex' ? 'none' : 'flex';
}
function closeMobileMenu() {
  document.getElementById('mobile-menu').style.display = 'none';
}

// ══════════════════════════════════════════════════════════
// MONETAG SCRIPT INTEGRATION
// (Uncomment and replace YOUR_PUB_ID when deploying)
// ══════════════════════════════════════════════════════════

/*
// 1. Main Monetag SDK
(function(d, s) {
  var js = d.createElement(s);
  js.src = "https://cdn.monetag.com/monetag.js?id=YOUR_PUB_ID";
  js.async = true;
  d.head.appendChild(js);
})(document, 'script');

// 2. Push Notifications (subscriber opt-in)
// Add after SDK loads:
window.monetag = window.monetag || {};
monetag.push({ type: 'push', publisherId: 'YOUR_PUB_ID', delay: 5000 });

// 3. Sticky bottom banner (mobile)
monetag.push({ type: 'banner', size: '320x50', placement: 'sticky-bottom' });
*/

// ══════════════════════════════════════════════════════════
// FIREBASE AUTH HOOKS
// ══════════════════════════════════════════════════════════
window.onUserLoggedIn = function(user, profile) {
  state.isLoggedIn = true;
  state.user = profile || user;
  
  // Check if admin
  if (window.AUTH_ADMIN_EMAILS && window.AUTH_ADMIN_EMAILS.includes(state.user.email)) {
    const adminLink = document.getElementById('nav-admin-link');
    if (adminLink) adminLink.style.display = 'block';
  } else {
    const adminLink = document.getElementById('nav-admin-link');
    if (adminLink) adminLink.style.display = 'none';
  }

  // If the user logs in from the home page, redirect to the dashboard
  if (state.currentPage === 'home') {
    showPage('dashboard');
  }
};

window.onUserLoggedOut = function() {
  state.isLoggedIn = false;
  state.user = null;
  
  // Hide admin link
  const adminLink = document.getElementById('nav-admin-link');
  if (adminLink) adminLink.style.display = 'none';

  if (state.currentPage === 'dashboard') {
    showPage('home');
  }
};

// ══════════════════════════════════════════════════════════
// REAL-TIME SYNC — Firestore Live Listeners
// ══════════════════════════════════════════════════════════
const liveState = {
  questions: [],
  subjects: [],
  topics: [],
  unsubscribers: [],
  latestPage: 1,
  latestPerPage: 10,
  filterSubject: '',
  filterTopic: '',
};

// ── Animated counter ──
function animateCounter(el, target, duration = 600) {
  if (!el) return;
  const start = parseInt(el.textContent) || 0;
  if (start === target) return;

  const startTime = performance.now();
  const diff = target - start;

  function step(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // easeOut quad
    const eased = 1 - (1 - progress) * (1 - progress);
    el.textContent = Math.round(start + diff * eased);
    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      el.textContent = target;
      // Bump animation
      el.classList.remove('bump');
      void el.offsetWidth; // reflow
      el.classList.add('bump');
    }
  }
  requestAnimationFrame(step);
}

// ── Time ago (relative) ──
function liveTimeAgo(ts) {
  if (!ts) return '';
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  const d = Date.now() - date.getTime();
  if (d < 60000) return 'अभी';
  if (d < 3600000) return Math.floor(d / 60000) + ' min पहले';
  if (d < 86400000) return Math.floor(d / 3600000) + ' hr पहले';
  if (d < 604800000) return Math.floor(d / 86400000) + ' days पहले';
  return date.toLocaleDateString('hi-IN');
}

// ── Default subject config ──
const DEFAULT_SUBJECT_CONFIG = {
  'Science':     { icon: '🔬', color: '#00D97E', badge: 'NCERT',    badgeClass: 'badge-green' },
  'Mathematics': { icon: '➕', color: '#4B91F7', badge: 'Class 6–12', badgeClass: 'badge-blue' },
  'Physics':     { icon: '⚡', color: '#00B4D8', badge: 'JEE/NEET', badgeClass: 'badge-blue' },
  'Chemistry':   { icon: '🧪', color: '#FF4757', badge: 'JEE/NEET', badgeClass: 'badge-red' },
  'Biology':     { icon: '🌿', color: '#2DC653', badge: 'NEET',     badgeClass: 'badge-green' },
  'History':     { icon: '🏛️', color: '#FFB347', badge: 'UPSC/SSC', badgeClass: 'badge-gold' },
  'Geography':   { icon: '🌍', color: '#FF6B35', badge: 'UPSC',     badgeClass: 'badge-orange' },
  'English':     { icon: '📝', color: '#9B6DFF', badge: 'Grammar',  badgeClass: 'badge-purple' },
};

// ── Update hero stats ──
function updateHeroStats() {
  const activeQ = liveState.questions.filter(q => q.status === 'active' || !q.status);
  animateCounter(document.getElementById('hero-total-q'), activeQ.length);
  animateCounter(document.getElementById('hero-total-subjects'), liveState.subjects.length);
  // Students count: fetch from users collection or use a static fallback
  const studEl = document.getElementById('hero-total-students');
  if (studEl && studEl.textContent === '0') studEl.textContent = '2L+'; // keep marketing value
}

// ── Update live counter cards ──
function updateLiveCounters() {
  const activeQ = liveState.questions.filter(q => q.status === 'active' || !q.status);

  animateCounter(document.getElementById('lc-total-questions'), activeQ.length);
  animateCounter(document.getElementById('lc-total-subjects'), liveState.subjects.length);
  animateCounter(document.getElementById('lc-total-topics'), liveState.topics.length);

  // Today count
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const todayCount = activeQ.filter(q => {
    const d = q.createdAt?.toDate ? q.createdAt.toDate() : new Date(q.createdAt || 0);
    return d >= todayStart;
  }).length;
  animateCounter(document.getElementById('lc-today-added'), todayCount);
}

// ── Render subject breakdown bars ──
function renderSubjectBreakdown() {
  const container = document.getElementById('live-subject-bars');
  if (!container) return;

  const activeQ = liveState.questions.filter(q => q.status === 'active' || !q.status);
  const subjCounts = {};
  activeQ.forEach(q => { subjCounts[q.subject] = (subjCounts[q.subject] || 0) + 1; });

  const maxCount = Math.max(...Object.values(subjCounts), 1);

  if (liveState.subjects.length === 0) {
    container.innerHTML = '<p style="color:var(--muted);font-size:13px;text-align:center;padding:20px">No subjects yet — Admin Panel से add करो</p>';
    return;
  }

  container.innerHTML = liveState.subjects
    .filter(s => s.status === 'active' || !s.status)
    .map(s => {
      const cfg = DEFAULT_SUBJECT_CONFIG[s.name] || {};
      const icon = s.icon || cfg.icon || '📚';
      const color = s.color || cfg.color || '#FF6B35';
      const cnt = subjCounts[s.name] || 0;
      const pct = maxCount > 0 ? Math.round((cnt / maxCount) * 100) : 0;

      return `<div class="lsb-row">
        <div class="lsb-icon" style="background:${color}18;color:${color}">${icon}</div>
        <div class="lsb-info">
          <div class="lsb-top">
            <span class="lsb-name">${s.name}</span>
            <span class="lsb-count" style="color:${color}">${cnt}</span>
          </div>
          <div class="lsb-bar">
            <div class="lsb-bar-fill" style="width:${pct}%;background:${color}"></div>
          </div>
        </div>
      </div>`;
    }).join('');
}

// ── Render dynamic subject cards ──
function renderLiveSubjects() {
  const grid = document.getElementById('live-subjects-grid');
  if (!grid) return;

  const activeQ = liveState.questions.filter(q => q.status === 'active' || !q.status);
  const subjCounts = {};
  activeQ.forEach(q => { subjCounts[q.subject] = (subjCounts[q.subject] || 0) + 1; });

  const activeSubjects = liveState.subjects.filter(s => s.status === 'active' || !s.status);

  if (activeSubjects.length === 0) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--muted)">
      <div style="font-size:48px;margin-bottom:12px">📚</div>
      <p style="font-size:14px">No subjects yet — Admin panel से subjects add करो</p>
    </div>`;
    return;
  }

  grid.innerHTML = activeSubjects.map(s => {
    const cfg = DEFAULT_SUBJECT_CONFIG[s.name] || {};
    const icon = s.icon || cfg.icon || '📚';
    const color = s.color || cfg.color || '#FF6B35';
    const badge = cfg.badge || (s.exams && s.exams.length ? s.exams[0] : '');
    const badgeClass = cfg.badgeClass || 'badge-orange';
    const cnt = subjCounts[s.name] || 0;

    return `<div class="subject-card card-hover" onclick="startSubjectQuiz('${s.name}')" style="--sc:${color};--scb:${color}18">
      <div class="subject-icon" style="background:${color}18;color:${color}">${icon}</div>
      <div class="subject-name">${s.name}</div>
      <div class="subject-count">${cnt > 0 ? cnt.toLocaleString() + ' Questions' : 'Coming Soon'}</div>
      ${badge ? `<span class="badge ${badgeClass} subject-badge">${badge}</span>` : ''}
    </div>`;
  }).join('');
}

// ── Get filtered questions for latest list ──
function getFilteredLatest() {
  let qs = liveState.questions
    .filter(q => q.status === 'active' || !q.status)
    .sort((a, b) => {
      const da = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : (a.createdAt || 0);
      const db = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : (b.createdAt || 0);
      return db - da;
    });

  if (liveState.filterSubject) qs = qs.filter(q => q.subject === liveState.filterSubject);
  if (liveState.filterTopic) qs = qs.filter(q => q.topic === liveState.filterTopic);

  return qs;
}

// ── Render latest questions ──
function renderLatestQuestions() {
  const container = document.getElementById('latest-questions-list');
  const pagination = document.getElementById('latest-questions-pagination');
  if (!container) return;

  const filteredQs = getFilteredLatest();
  const visible = filteredQs.slice(0, liveState.latestPage * liveState.latestPerPage);

  if (filteredQs.length === 0) {
    container.innerHTML = `<div class="lq-empty">
      <div class="lq-empty-icon">📭</div>
      <div class="lq-empty-text">${liveState.filterSubject || liveState.filterTopic ? 'इस filter में कोई question नहीं मिला' : 'अभी तक कोई question add नहीं हुआ — Admin Panel से add करो'}</div>
    </div>`;
    if (pagination) pagination.style.display = 'none';
    return;
  }

  container.innerHTML = visible.map(q => {
    const cfg = DEFAULT_SUBJECT_CONFIG[q.subject] || {};
    const color = cfg.color || '#FF6B35';
    const diffMap = { easy: ['badge-green', 'Easy'], medium: ['badge-orange', 'Medium'], hard: ['badge-red', 'Hard'] };
    const [dc, dl] = diffMap[q.difficulty] || ['badge-orange', 'Medium'];

    return `<div class="lq-item">
      <div class="lq-accent" style="background:${color}"></div>
      <div class="lq-content">
        <div class="lq-question" title="${(q.en || '').replace(/"/g, '&quot;')}">${q.en || 'Untitled Question'}</div>
        <div class="lq-meta">
          <span class="lq-tag" style="background:${color}18;color:${color}">${cfg.icon || '📚'} ${q.subject || 'General'}</span>
          ${q.topic ? `<span class="lq-tag" style="background:var(--surf3);color:var(--muted)">${q.topic}</span>` : ''}
          <span class="badge ${dc}" style="font-size:10px">${dl}</span>
          <span class="lq-time">${liveTimeAgo(q.createdAt)}</span>
        </div>
      </div>
    </div>`;
  }).join('');

  // Pagination
  if (pagination) {
    if (visible.length < filteredQs.length) {
      pagination.style.display = 'flex';
      document.getElementById('btn-load-more').textContent = `Load More (${filteredQs.length - visible.length} और) →`;
    } else {
      pagination.style.display = 'none';
    }
  }
}

function loadMoreQuestions() {
  liveState.latestPage++;
  renderLatestQuestions();
}

// ── Populate filter dropdowns ──
function populateFilterDropdowns() {
  const subjSelect = document.getElementById('filter-subject');
  const topicSelect = document.getElementById('filter-topic');
  if (!subjSelect || !topicSelect) return;

  const curSubj = subjSelect.value;
  const curTopic = topicSelect.value;

  subjSelect.innerHTML = '<option value="">All Subjects</option>' +
    liveState.subjects
      .filter(s => s.status === 'active' || !s.status)
      .map(s => {
        const cfg = DEFAULT_SUBJECT_CONFIG[s.name] || {};
        return `<option value="${s.name}">${s.icon || cfg.icon || '📚'} ${s.name}</option>`;
      }).join('');

  // Filter topics by selected subject
  let topics = liveState.topics;
  if (liveState.filterSubject) topics = topics.filter(t => t.subject === liveState.filterSubject);
  topicSelect.innerHTML = '<option value="">All Topics</option>' +
    topics.map(t => `<option value="${t.name}">${t.name}</option>`).join('');

  // Restore selection
  if (curSubj) subjSelect.value = curSubj;
  if (curTopic) topicSelect.value = curTopic;
}

function applyLatestFilter() {
  liveState.filterSubject = document.getElementById('filter-subject')?.value || '';
  liveState.filterTopic = document.getElementById('filter-topic')?.value || '';
  liveState.latestPage = 1;

  // Update topic dropdown based on subject selection
  const topicSelect = document.getElementById('filter-topic');
  if (topicSelect) {
    let topics = liveState.topics;
    if (liveState.filterSubject) topics = topics.filter(t => t.subject === liveState.filterSubject);
    const curTopic = topicSelect.value;
    topicSelect.innerHTML = '<option value="">All Topics</option>' +
      topics.map(t => `<option value="${t.name}">${t.name}</option>`).join('');
    if (curTopic && topics.some(t => t.name === curTopic)) topicSelect.value = curTopic;
    else liveState.filterTopic = '';
  }

  renderLatestQuestions();
}

// ── Master update (called on every snapshot) ──
function onLiveDataUpdate() {
  updateHeroStats();
  updateLiveCounters();
  renderSubjectBreakdown();
  renderLiveSubjects();
  renderLatestQuestions();
  populateFilterDropdowns();
  populateQuizDropdowns(); // keep quiz setup in sync too
}

// ── Initialize Firestore real-time listeners ──
function initRealtimeSync() {
  if (typeof isFirebaseConfigured === 'undefined' || !isFirebaseConfigured()) {
    console.log('⚡ Firebase not configured — using localStorage fallback');
    // Fallback: load from localStorage
    liveState.questions = readAdmin('questions') || [];
    liveState.subjects = readAdmin('subjects') || [];
    liveState.topics = readAdmin('topics') || [];
    onLiveDataUpdate();
    return;
  }

  console.log('🔴 Starting real-time Firestore listeners...');

  // Listen to questions
  if (typeof fbListenQuestions === 'function') {
    const unsub1 = fbListenQuestions(questions => {
      console.log(`📦 Questions snapshot: ${questions.length} items`);
      liveState.questions = questions;
      onLiveDataUpdate();
    });
    liveState.unsubscribers.push(unsub1);
  }

  // Listen to subjects
  if (typeof fbListenSubjects === 'function') {
    const unsub2 = fbListenSubjects(subjects => {
      console.log(`📚 Subjects snapshot: ${subjects.length} items`);
      liveState.subjects = subjects;
      onLiveDataUpdate();
    });
    liveState.unsubscribers.push(unsub2);
  }

  // Listen to topics
  if (typeof fbListenTopics === 'function') {
    const unsub3 = fbListenTopics(topics => {
      console.log(`🏷️ Topics snapshot: ${topics.length} items`);
      liveState.topics = topics;
      onLiveDataUpdate();
    });
    liveState.unsubscribers.push(unsub3);
  }
}

// Clean up listeners on page unload
window.addEventListener('beforeunload', () => {
  liveState.unsubscribers.forEach(fn => { if (typeof fn === 'function') fn(); });
});

// ══════════════════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  // Populate dropdowns from admin localStorage
  populateQuizDropdowns();

  // ── Start real-time Firestore listeners ──
  initRealtimeSync();

  // ── Cross-tab sync with admin panel ──
  window.addEventListener('storage', e => {
    if (e.key && e.key.startsWith(ADMIN_PREFIX)) {
      setTimeout(() => populateQuizDropdowns(), 100);
    }
  });

  // Polling fallback (some browsers don't fire storage event reliably)
  let _adminHash = '';
  setInterval(() => {
    const hash = (localStorage.getItem(ADMIN_PREFIX + 'questions') || '') + '|' +
                 (localStorage.getItem(ADMIN_PREFIX + 'subjects') || '') + '|' +
                 (localStorage.getItem(ADMIN_PREFIX + 'classes') || '');
    if (hash !== _adminHash) {
      _adminHash = hash;
      populateQuizDropdowns();
    }
  }, 1500);

  // Close mobile menu on resize
  window.addEventListener('resize', () => {
    if (window.innerWidth > 600) closeMobileMenu();
  });

  // Keyboard navigation during quiz
  document.addEventListener('keydown', e => {
    if (state.quizStarted && state.currentPage === 'quiz') {
      if (e.key === 'ArrowRight') nextQuestion();
      if (e.key === 'ArrowLeft') prevQuestion();
      if (['1','2','3','4'].includes(e.key)) {
        const idx = parseInt(e.key) - 1;
        if (state.answers[state.currentQ] === undefined) selectAnswer(idx);
      }
    }
  });

  console.log('🎯 QuizForge loaded! Admin sync active. Keyboard: ←→ nav, 1-4 answers');
});