// ══════════════════════════════════════════════════════════
// FIRESTORE DATABASE MODULE
// ══════════════════════════════════════════════════════════

// ── Questions CRUD ──

async function fbGetQuestions(filters = {}) {
  let query = db.collection('questions');
  if (filters.subject) query = query.where('subject', '==', filters.subject);
  if (filters.status) query = query.where('status', '==', filters.status);
  if (filters.difficulty) query = query.where('difficulty', '==', filters.difficulty);
  if (filters.className) query = query.where('class', '==', filters.className);

  const snapshot = await query.orderBy('createdAt', 'desc').get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function fbAddQuestion(data) {
  data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
  data.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
  data.createdBy = currentUser?.uid || 'admin';
  const ref = await db.collection('questions').add(data);
  // Update subject question count
  if (data.subject) fbUpdateSubjectCount(data.subject);
  return ref.id;
}

async function fbUpdateQuestion(id, data) {
  data.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
  await db.collection('questions').doc(id).update(data);
}

async function fbDeleteQuestion(id) {
  await db.collection('questions').doc(id).delete();
}

// ── Subjects CRUD ──

async function fbGetSubjects() {
  const snapshot = await db.collection('subjects').orderBy('name').get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function fbAddSubject(data) {
  data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
  data.questionCount = 0;
  return await db.collection('subjects').add(data);
}

async function fbUpdateSubject(id, data) {
  await db.collection('subjects').doc(id).update(data);
}

async function fbDeleteSubject(id) {
  await db.collection('subjects').doc(id).delete();
}

async function fbUpdateSubjectCount(subjectName) {
  const snapshot = await db.collection('questions')
    .where('subject', '==', subjectName)
    .where('status', '==', 'active')
    .get();
  const subjects = await db.collection('subjects').where('name', '==', subjectName).get();
  subjects.forEach(doc => {
    doc.ref.update({ questionCount: snapshot.size });
  });
}

// ── Classes CRUD ──

async function fbGetClasses() {
  const snapshot = await db.collection('classes').orderBy('name').get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function fbAddClass(data) {
  data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
  return await db.collection('classes').add(data);
}

async function fbUpdateClass(id, data) {
  await db.collection('classes').doc(id).update(data);
}

async function fbDeleteClass(id) {
  await db.collection('classes').doc(id).delete();
}

// ── Topics CRUD ──

async function fbGetTopics() {
  const snapshot = await db.collection('topics').orderBy('name').get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function fbAddTopic(data) {
  data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
  return await db.collection('topics').add(data);
}

async function fbDeleteTopic(id) {
  await db.collection('topics').doc(id).delete();
}

// ── Quiz Results ──

async function fbSaveQuizResult(result) {
  if (!currentUser) return null;
  result.userId = currentUser.uid;
  result.createdAt = firebase.firestore.FieldValue.serverTimestamp();

  const ref = await db.collection('quizResults').add(result);

  // Update user stats
  const userRef = db.collection('users').doc(currentUser.uid);
  await userRef.update({
    quizCount: firebase.firestore.FieldValue.increment(1),
    totalCorrect: firebase.firestore.FieldValue.increment(result.correctCount || 0),
    totalWrong: firebase.firestore.FieldValue.increment(result.wrongCount || 0),
    points: firebase.firestore.FieldValue.increment(result.points || 0),
    lastLogin: firebase.firestore.FieldValue.serverTimestamp()
  });

  // Refresh local profile
  if (currentProfile) {
    currentProfile.quizCount = (currentProfile.quizCount || 0) + 1;
    currentProfile.totalCorrect = (currentProfile.totalCorrect || 0) + (result.correctCount || 0);
    currentProfile.totalWrong = (currentProfile.totalWrong || 0) + (result.wrongCount || 0);
    currentProfile.points = (currentProfile.points || 0) + (result.points || 0);
  }

  return ref.id;
}

async function fbGetUserHistory(uid, limit = 20) {
  const snapshot = await db.collection('quizResults')
    .where('userId', '==', uid)
    .orderBy('createdAt', 'desc')
    .limit(limit)
    .get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// ── Leaderboard ──

async function fbGetLeaderboard(limit = 50) {
  const snapshot = await db.collection('users')
    .where('isGuest', '==', false)
    .orderBy('points', 'desc')
    .limit(limit)
    .get();
  return snapshot.docs.map((doc, i) => ({
    rank: i + 1,
    ...doc.data(),
    uid: doc.id
  }));
}

// ── Users (Admin) ──

async function fbGetUsers(limit = 100) {
  const snapshot = await db.collection('users')
    .orderBy('createdAt', 'desc')
    .limit(limit)
    .get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function fbUpdateUser(uid, data) {
  await db.collection('users').doc(uid).update(data);
}

// ── Real-time Listeners (with error callbacks) ──

function fbListenQuestions(callback, onError) {
  return db.collection('questions')
    .orderBy('createdAt', 'desc')
    .onSnapshot(snapshot => {
      const questions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(questions);
    }, err => {
      console.error('Firestore questions listener error:', err);
      if (typeof onError === 'function') onError(err);
    });
}

function fbListenSubjects(callback, onError) {
  return db.collection('subjects')
    .orderBy('name')
    .onSnapshot(snapshot => {
      const subjects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(subjects);
    }, err => {
      console.error('Firestore subjects listener error:', err);
      if (typeof onError === 'function') onError(err);
    });
}

function fbListenTopics(callback, onError) {
  return db.collection('topics')
    .orderBy('name')
    .onSnapshot(snapshot => {
      const topics = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(topics);
    }, err => {
      console.error('Firestore topics listener error:', err);
      if (typeof onError === 'function') onError(err);
    });
}

// ══════════════════════════════════════════════════════════
// LOGIN CONTROL — Admin/User Mutex
// ══════════════════════════════════════════════════════════

// Read current login control state
async function fbGetLoginControl() {
  const doc = await db.collection('siteConfig').doc('loginControl').get();
  if (doc.exists) return doc.data();
  // Initialize default if not exists
  const defaults = { login_mode: 'none', user_login_enabled: true, admin_active_since: null, updated_at: firebase.firestore.FieldValue.serverTimestamp() };
  await db.collection('siteConfig').doc('loginControl').set(defaults);
  return defaults;
}

// Update login control state (admin only)
async function fbSetLoginControl(data) {
  data.updated_at = firebase.firestore.FieldValue.serverTimestamp();
  await db.collection('siteConfig').doc('loginControl').set(data, { merge: true });
}

// Real-time listener on login control
function fbListenLoginControl(callback, onError) {
  return db.collection('siteConfig').doc('loginControl')
    .onSnapshot(doc => {
      if (doc.exists) {
        callback(doc.data());
      } else {
        callback({ login_mode: 'none', user_login_enabled: true, admin_active_since: null });
      }
    }, err => {
      console.error('Login control listener error:', err);
      if (typeof onError === 'function') onError(err);
    });
}

// ── Analytics Queries ──

async function fbGetAnalytics(uid) {
  const results = await fbGetUserHistory(uid, 100);
  if (!results.length) return null;

  const analytics = {
    totalQuizzes: results.length,
    totalQuestions: 0,
    totalCorrect: 0,
    totalWrong: 0,
    totalTime: 0,
    subjectStats: {},
    dailyStats: {},
    recentResults: results.slice(0, 10)
  };

  results.forEach(r => {
    analytics.totalQuestions += (r.total || 0);
    analytics.totalCorrect += (r.correctCount || 0);
    analytics.totalWrong += (r.wrongCount || 0);
    analytics.totalTime += (r.timeTaken || 0);

    // Subject-wise
    const subj = r.subject || 'General';
    if (!analytics.subjectStats[subj]) {
      analytics.subjectStats[subj] = { quizzes: 0, correct: 0, total: 0 };
    }
    analytics.subjectStats[subj].quizzes++;
    analytics.subjectStats[subj].correct += (r.correctCount || 0);
    analytics.subjectStats[subj].total += (r.total || 0);

    // Daily stats (last 7 days)
    if (r.createdAt) {
      const date = r.createdAt.toDate ? r.createdAt.toDate().toLocaleDateString() : new Date().toLocaleDateString();
      if (!analytics.dailyStats[date]) analytics.dailyStats[date] = 0;
      analytics.dailyStats[date]++;
    }
  });

  analytics.avgAccuracy = analytics.totalQuestions > 0
    ? Math.round(analytics.totalCorrect / analytics.totalQuestions * 100) : 0;
  analytics.avgTimePerQ = analytics.totalQuestions > 0
    ? Math.round(analytics.totalTime / analytics.totalQuestions) : 0;

  return analytics;
}

// ── Sync Helper: Firebase → localStorage fallback ──

async function syncQuestionsToLocal() {
  if (!isFirebaseConfigured()) return;
  try {
    const questions = await fbGetQuestions({ status: 'active' });
    localStorage.setItem('qf_admin_questions', JSON.stringify(questions));
    const subjects = await fbGetSubjects();
    localStorage.setItem('qf_admin_subjects', JSON.stringify(subjects));
    const classes = await fbGetClasses();
    localStorage.setItem('qf_admin_classes', JSON.stringify(classes));
    const topics = await fbGetTopics();
    localStorage.setItem('qf_admin_topics', JSON.stringify(topics));
  } catch (e) {
    console.warn('Firebase sync failed, using localStorage fallback:', e);
  }
}

console.log('📦 Firebase DB module loaded');
