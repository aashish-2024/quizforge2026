// ══════════════════════════════════════════════════════════
// FIREBASE ANALYTICS & CHARTS MODULE
// ══════════════════════════════════════════════════════════

// Render analytics dashboard with real data
async function renderAnalyticsDashboard() {
  if (!currentUser) return;

  const analytics = await fbGetAnalytics(currentUser.uid);
  if (!analytics) {
    showEmptyAnalytics();
    return;
  }

  // Update stat cards
  setText('dash-stat-points', (currentProfile?.points || 0).toLocaleString());
  setText('dash-stat-quizzes', analytics.totalQuizzes);
  setText('dash-stat-correct', analytics.totalCorrect);
  setText('dash-stat-accuracy', analytics.avgAccuracy + '%');
  setText('dash-stat-streak', (currentProfile?.streak || 0) + '🔥');

  // Render charts
  renderWeeklyChart(analytics.dailyStats);
  renderAccuracyChart(analytics.subjectStats);
  renderQuizHistory(analytics.recentResults);
  renderImprovementTips(analytics);
}

function showEmptyAnalytics() {
  const container = document.getElementById('analytics-content');
  if (container) {
    container.innerHTML = `
      <div class="empty-analytics">
        <div style="font-size:48px;margin-bottom:16px">📊</div>
        <h3>Abhi koi data nahi hai!</h3>
        <p>Pehle ek quiz do, phir yahan analytics dikhenge</p>
        <button class="btn-primary-full" onclick="showPage('quiz')" style="max-width:240px;margin-top:16px">🚀 Quiz शुरू करो</button>
      </div>
    `;
  }
}

// ── Weekly Quiz Chart (Bar) ──
function renderWeeklyChart(dailyStats) {
  const canvas = document.getElementById('chart-weekly');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const days = getLast7Days();
  const data = days.map(d => dailyStats[d] || 0);

  if (window._weeklyChart) window._weeklyChart.destroy();
  window._weeklyChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: days.map(d => formatShortDate(d)),
      datasets: [{
        label: 'Quizzes',
        data: data,
        backgroundColor: 'rgba(255, 107, 53, 0.7)',
        borderColor: '#FF6B35',
        borderWidth: 1,
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1, color: '#888' },
          grid: { color: 'rgba(255,255,255,0.05)' }
        },
        x: {
          ticks: { color: '#888' },
          grid: { display: false }
        }
      }
    }
  });
}

// ── Subject Accuracy Chart (Doughnut) ──
function renderAccuracyChart(subjectStats) {
  const canvas = document.getElementById('chart-accuracy');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const subjects = Object.keys(subjectStats);
  const accuracies = subjects.map(s => {
    const st = subjectStats[s];
    return st.total > 0 ? Math.round(st.correct / st.total * 100) : 0;
  });

  const colors = ['#FF6B35', '#00D97E', '#3B82F6', '#A855F7', '#F59E0B', '#EF4444', '#06B6D4', '#EC4899'];

  if (window._accuracyChart) window._accuracyChart.destroy();
  window._accuracyChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: subjects,
      datasets: [{
        data: accuracies,
        backgroundColor: colors.slice(0, subjects.length),
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#ccc', padding: 12, font: { size: 11 } }
        }
      }
    }
  });

  // Subject detail list
  const list = document.getElementById('subject-stats-list');
  if (list) {
    list.innerHTML = subjects.map((s, i) => `
      <div class="subj-stat-row">
        <span class="subj-dot" style="background:${colors[i]}"></span>
        <span class="subj-name">${s}</span>
        <span class="subj-accuracy">${accuracies[i]}%</span>
        <span class="subj-count">${subjectStats[s].quizzes} quizzes</span>
      </div>
    `).join('');
  }
}

// ── Quiz History Table ──
function renderQuizHistory(results) {
  const tbody = document.getElementById('quiz-history-tbody');
  if (!tbody) return;

  if (!results.length) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#888;padding:20px">Koi quiz history nahi hai</td></tr>';
    return;
  }

  tbody.innerHTML = results.map((r, i) => {
    const date = r.createdAt?.toDate ? r.createdAt.toDate().toLocaleDateString('hi-IN') : '—';
    const accuracy = r.total > 0 ? Math.round(r.correctCount / r.total * 100) : 0;
    const acColor = accuracy >= 80 ? '#00D97E' : accuracy >= 50 ? '#F59E0B' : '#EF4444';
    return `
      <tr>
        <td>${i + 1}</td>
        <td>${r.subject || '—'}</td>
        <td>${r.mode || 'practice'}</td>
        <td>${r.correctCount}/${r.total}</td>
        <td style="color:${acColor};font-weight:600">${accuracy}%</td>
        <td>${date}</td>
      </tr>
    `;
  }).join('');
}

// ── Improvement Tips ──
function renderImprovementTips(analytics) {
  const container = document.getElementById('improvement-tips');
  if (!container) return;

  const tips = [];

  // Find weakest subject
  const subjects = Object.entries(analytics.subjectStats);
  if (subjects.length > 0) {
    const weakest = subjects.reduce((min, [name, stat]) => {
      const acc = stat.total > 0 ? stat.correct / stat.total : 1;
      return acc < min.acc ? { name, acc } : min;
    }, { name: '', acc: 1 });

    if (weakest.acc < 0.6) {
      tips.push({
        icon: '📖',
        title: `${weakest.name} pe focus karo`,
        desc: `Tumhari accuracy sirf ${Math.round(weakest.acc * 100)}% hai. Zyada practice karo!`
      });
    }
  }

  // Speed tip
  if (analytics.avgTimePerQ > 60) {
    tips.push({
      icon: '⏱️',
      title: 'Speed badhao',
      desc: `Average ${analytics.avgTimePerQ}s per question hai. 45s ke andar try karo.`
    });
  }

  // Streak tip
  if ((currentProfile?.streak || 0) < 3) {
    tips.push({
      icon: '🔥',
      title: 'Daily quiz lo',
      desc: 'Streak banao — daily ek quiz dene se consistency improve hogi!'
    });
  }

  // General
  if (analytics.avgAccuracy < 70) {
    tips.push({
      icon: '🎯',
      title: 'Easy mode se start karo',
      desc: 'Pehle easy questions master karo, phir hard pe jaao.'
    });
  }

  if (tips.length === 0) {
    tips.push({
      icon: '🏆',
      title: 'Bahut badiya!',
      desc: 'Tumhari performance achhi hai. Keep it up!'
    });
  }

  container.innerHTML = tips.map(t => `
    <div class="tip-card">
      <div class="tip-icon">${t.icon}</div>
      <div><div class="tip-title">${t.title}</div><div class="tip-desc">${t.desc}</div></div>
    </div>
  `).join('');
}

// ── Utility Helpers ──

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function getLast7Days() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toLocaleDateString());
  }
  return days;
}

function formatShortDate(dateStr) {
  const d = new Date(dateStr);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[d.getDay()];
}

console.log('📊 Analytics module loaded');
