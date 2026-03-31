// ══════════════════════════════════════════════════════════
// FIREBASE AUTHENTICATION MODULE
// ══════════════════════════════════════════════════════════

const AUTH_ADMIN_EMAILS = ['vishwas.ag1887@gmail.com']; // 👈 Admin emails yahan add karo

// ── Fallback for UI notifications (Admin vs Index page) ──
if (typeof window.showToast === 'undefined') {
  window.showToast = function(msg, type='success') {
    if (typeof showNotif !== 'undefined') {
      showNotif(type === 'error' ? '❌' : (type === 'warning' ? '⚠️' : '✅'), 'Auth', msg);
    } else {
      console.log('Firebase Auth:', msg);
    }
  };
}

// ── Current User State ──
let currentUser = null;
let currentProfile = null;

// ══════════════════════════════════════════════════════════
// SIGN IN METHODS
// ══════════════════════════════════════════════════════════

async function signInWithGoogle() {
  try {
    showAuthLoading(true);
    const result = await auth.signInWithPopup(googleProvider);
    await ensureUserProfile(result.user);
    showToast('✅ Google से login successful!');
    closeAuthModal();
    return result.user;
  } catch (error) {
    console.error('Google sign-in error:', error);
    if (error.code === 'auth/popup-closed-by-user') {
      showToast('⚠️ Login cancel कर दिया', 'warning');
    } else {
      showToast('❌ Login failed: ' + error.message, 'error');
    }
    return null;
  } finally {
    showAuthLoading(false);
  }
}

async function signInWithPhone(phoneNumber) {
  try {
    showAuthLoading(true);

    // Always clear old reCAPTCHA and create a fresh one
    if (window.recaptchaVerifier) {
      try { window.recaptchaVerifier.clear(); } catch(e) { /* ignore */ }
      window.recaptchaVerifier = null;
    }

    // Clear the container DOM to avoid duplicate widgets
    const container = document.getElementById('recaptcha-container');
    if (container) container.innerHTML = '';

    window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
      size: 'invisible',
      callback: () => { console.log('reCAPTCHA solved'); }
    });

    // Explicitly render reCAPTCHA before calling signInWithPhoneNumber
    await window.recaptchaVerifier.render();

    const confirmation = await auth.signInWithPhoneNumber(phoneNumber, window.recaptchaVerifier);
    window.confirmationResult = confirmation;
    showOTPInput();
    showToast('📱 OTP भेज दिया गया!');
  } catch (error) {
    console.error('Phone sign-in error:', error);

    // User-friendly error messages
    const errorMessages = {
      'auth/invalid-phone-number': '❌ गलत phone number! सही 10-digit number डालो',
      'auth/too-many-requests': '⚠️ बहुत ज्यादा attempts! कुछ देर बाद try करो',
      'auth/quota-exceeded': '⚠️ SMS quota खत्म हो गया, बाद में try करो',
      'auth/captcha-check-failed': '❌ reCAPTCHA failed, page refresh करो',
      'auth/missing-phone-number': '❌ Phone number डालो',
      'auth/operation-not-allowed': '⚠️ Phone login enable नहीं है। Google से login करो',
    };
    const msg = errorMessages[error.code] || ('❌ OTP भेजने में error: ' + error.message);
    showToast(msg, 'error');

    // Reset reCAPTCHA for next attempt
    if (window.recaptchaVerifier) {
      try { window.recaptchaVerifier.clear(); } catch(e) { /* ignore */ }
      window.recaptchaVerifier = null;
    }
  } finally {
    showAuthLoading(false);
  }
}

async function verifyOTP(otp) {
  try {
    showAuthLoading(true);
    if (!window.confirmationResult) throw new Error('Pehle phone number enter karo');
    const result = await window.confirmationResult.confirm(otp);
    await ensureUserProfile(result.user);
    showToast('✅ Phone verify ho gaya!');
    closeAuthModal();
    return result.user;
  } catch (error) {
    console.error('OTP verify error:', error);
    showToast('❌ Galat OTP. Dobara try karo.', 'error');
    return null;
  } finally {
    showAuthLoading(false);
  }
}

async function signInAsGuest() {
  try {
    showAuthLoading(true);
    const result = await auth.signInAnonymously();
    await ensureUserProfile(result.user, true);
    showToast('👤 Guest mode active! (Limited features)');
    closeAuthModal();
    return result.user;
  } catch (error) {
    console.error('Guest sign-in error:', error);
    showToast('❌ Guest login failed', 'error');
    return null;
  } finally {
    showAuthLoading(false);
  }
}

async function signOutUser() {
  try {
    await auth.signOut();
    currentUser = null;
    currentProfile = null;
    showToast('👋 Logout ho gaya!');
    updateNavForAuth(null);
    if (typeof showPage === 'function') showPage('home');
  } catch (error) {
    console.error('Sign out error:', error);
  }
}

// ══════════════════════════════════════════════════════════
// USER PROFILE (Firestore)
// ══════════════════════════════════════════════════════════

async function ensureUserProfile(user, isGuest = false) {
  if (!isFirebaseConfigured() || !user) return;
  const ref = db.collection('users').doc(user.uid);
  const doc = await ref.get();

  if (!doc.exists) {
    // New user → create profile
    const profile = {
      name: user.displayName || (isGuest ? 'Guest User' : 'Student'),
      email: user.email || '',
      phone: user.phoneNumber || '',
      photoURL: user.photoURL || '',
      bio: '',
      class: '',
      school: '',
      role: AUTH_ADMIN_EMAILS.includes(user.email) ? 'admin' : 'student',
      isGuest: isGuest,
      points: 0,
      streak: 0,
      quizCount: 0,
      totalCorrect: 0,
      totalWrong: 0,
      badges: [],
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      lastLogin: firebase.firestore.FieldValue.serverTimestamp()
    };
    await ref.set(profile);
    currentProfile = { ...profile, uid: user.uid };
  } else {
    // Existing user → update lastLogin
    await ref.update({ lastLogin: firebase.firestore.FieldValue.serverTimestamp() });
    currentProfile = { ...doc.data(), uid: user.uid };
  }
}

async function updateUserProfile(data) {
  if (!currentUser) return;
  const ref = db.collection('users').doc(currentUser.uid);
  await ref.update(data);
  currentProfile = { ...currentProfile, ...data };
  showToast('✅ Profile update ho gaya!');
}

async function getUserProfile(uid) {
  const doc = await db.collection('users').doc(uid).get();
  return doc.exists ? { ...doc.data(), uid } : null;
}

function isAdmin() {
  return currentProfile?.role === 'admin';
}

function isGuest() {
  return currentProfile?.isGuest === true || currentUser?.isAnonymous === true;
}

// ══════════════════════════════════════════════════════════
// AUTH STATE LISTENER
// ══════════════════════════════════════════════════════════

let isInitialAuthCheck = true;

function initAuthListener() {
  auth.onAuthStateChanged(async (user) => {
    currentUser = user;
    if (user) {
      await ensureUserProfile(user, user.isAnonymous);
      updateNavForAuth(user);
      if (typeof onUserLoggedIn === 'function') onUserLoggedIn(user, currentProfile);
      isInitialAuthCheck = false;
    } else {
      currentProfile = null;
      updateNavForAuth(null);
      // Only call logged out hook if it's not the initial check or if we are sure there is no user
      // Firebase often fires a quick null before resolving the user from indexedDB
      if (!isInitialAuthCheck) {
        if (typeof onUserLoggedOut === 'function') onUserLoggedOut();
      } else {
        // Wait a small amount of time to be absolutely sure it's a real logged out state
        setTimeout(() => {
          if (!currentUser && typeof onUserLoggedOut === 'function') {
             onUserLoggedOut();
          }
        }, 1500);
      }
      isInitialAuthCheck = false;
    }
  });
}

// ══════════════════════════════════════════════════════════
// UI HELPERS
// ══════════════════════════════════════════════════════════

function updateNavForAuth(user) {
  const loginBtn = document.getElementById('btn-login');
  const registerBtn = document.getElementById('btn-register');
  const userMenu = document.getElementById('user-menu');
  const userAvatar = document.getElementById('user-avatar');
  const userName = document.getElementById('user-name');
  
  const deskHome = document.getElementById('nav-home-link');
  const deskQuiz = document.getElementById('nav-quiz-link');
  const deskLb = document.getElementById('nav-lb-link');
  const deskDash = document.getElementById('nav-dashboard-link');
  const deskProf = document.getElementById('nav-profile-link');

  const mobHome = document.getElementById('mob-home-link');
  const mobQuiz = document.getElementById('mob-quiz-link');
  const mobLb = document.getElementById('mob-lb-link');
  const mobDash = document.getElementById('mob-dashboard-link');
  const mobProf = document.getElementById('mob-profile-link');

  if (user && currentProfile) {
    // Logged in
    if (loginBtn) loginBtn.style.display = 'none';
    if (registerBtn) registerBtn.style.display = 'none';
    
    if (deskHome) deskHome.style.display = 'none';
    if (deskQuiz) deskQuiz.style.display = 'none';
    if (deskLb) deskLb.style.display = 'none';
    if (mobHome) mobHome.style.display = 'none';
    if (mobQuiz) mobQuiz.style.display = 'none';
    if (mobLb) mobLb.style.display = 'none';

    if (deskDash) deskDash.style.display = 'block';
    if (deskProf) deskProf.style.display = 'block';
    if (mobDash) mobDash.style.display = 'block';
    if (mobProf) mobProf.style.display = 'block';
    
    if (userMenu) {
      userMenu.style.display = 'flex';
      if (userAvatar) {
        if (user.photoURL) {
          userAvatar.innerHTML = `<img src="${user.photoURL}" alt="avatar" style="width:100%;height:100%;border-radius:50%;object-fit:cover">`;
        } else {
          userAvatar.textContent = (currentProfile.name || 'U')[0].toUpperCase();
        }
      }
      if (userName) userName.textContent = currentProfile.name || 'User';
    }
  } else {
    // Logged out
    if (loginBtn) loginBtn.style.display = '';
    if (registerBtn) registerBtn.style.display = '';
    
    if (deskHome) deskHome.style.display = 'block';
    if (deskQuiz) deskQuiz.style.display = 'block';
    if (deskLb) deskLb.style.display = 'block';
    if (mobHome) mobHome.style.display = 'block';
    if (mobQuiz) mobQuiz.style.display = 'block';
    if (mobLb) mobLb.style.display = 'block';

    if (deskDash) deskDash.style.display = 'none';
    if (deskProf) deskProf.style.display = 'none';
    if (mobDash) mobDash.style.display = 'none';
    if (mobProf) mobProf.style.display = 'none';
    
    if (userMenu) userMenu.style.display = 'none';
  }
}

function openAuthModal(tab = 'login') {
  const modal = document.getElementById('modal-auth');
  if (modal) {
    modal.classList.add('active');
    switchAuthTab(tab);
  }
}

function closeAuthModal() {
  const modal = document.getElementById('modal-auth');
  if (modal) modal.classList.remove('active');
}

function switchAuthTab(tab) {
  document.querySelectorAll('.auth-tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.auth-tab-content').forEach(c => c.classList.remove('active'));
  const btn = document.querySelector(`.auth-tab-btn[data-tab="${tab}"]`);
  const content = document.getElementById(`auth-tab-${tab}`);
  if (btn) btn.classList.add('active');
  if (content) content.classList.add('active');
}

function showOTPInput() {
  const phoneForm = document.getElementById('phone-form');
  const otpForm = document.getElementById('otp-form');
  if (phoneForm) phoneForm.style.display = 'none';
  if (otpForm) otpForm.style.display = 'block';
}

function showAuthLoading(show) {
  const loader = document.getElementById('auth-loader');
  if (loader) loader.style.display = show ? 'flex' : 'none';
}

function showProfilePage() {
  if (!currentUser || !currentProfile) {
    showToast('⚠️ Pehle login karo!', 'warning');
    openAuthModal();
    return;
  }

  const container = document.getElementById('profile-content');
  if (!container) return;

  container.innerHTML = `
    <div class="profile-header">
      <div class="profile-avatar-large">
        ${currentUser.photoURL
      ? `<img src="${currentUser.photoURL}" alt="Profile">`
      : `<span>${(currentProfile.name || 'U')[0].toUpperCase()}</span>`
    }
      </div>
      <h2>${currentProfile.name || 'User'}</h2>
      <p class="profile-email">${currentProfile.email || currentUser.phoneNumber || 'Guest User'}</p>
      ${isGuest() ? '<span class="badge-guest">👤 Guest Mode</span>' : ''}
    </div>

    <div class="profile-stats-row">
      <div class="profile-stat"><div class="profile-stat-val">${currentProfile.points || 0}</div><div class="profile-stat-lbl">Points</div></div>
      <div class="profile-stat"><div class="profile-stat-val">${currentProfile.quizCount || 0}</div><div class="profile-stat-lbl">Quizzes</div></div>
      <div class="profile-stat"><div class="profile-stat-val">${currentProfile.streak || 0}🔥</div><div class="profile-stat-lbl">Streak</div></div>
      <div class="profile-stat"><div class="profile-stat-val">${currentProfile.totalCorrect ? Math.round(currentProfile.totalCorrect / (currentProfile.totalCorrect + currentProfile.totalWrong) * 100) : 0}%</div><div class="profile-stat-lbl">Accuracy</div></div>
    </div>

    <form class="profile-form" onsubmit="saveProfileForm(event)">
      <div class="pf-row">
        <div class="pf-group"><label>Name</label><input class="inp" id="pf-name" value="${currentProfile.name || ''}" placeholder="Apna naam"></div>
        <div class="pf-group"><label>Bio</label><input class="inp" id="pf-bio" value="${currentProfile.bio || ''}" placeholder="Short bio..."></div>
      </div>
      <div class="pf-row">
        <div class="pf-group"><label>Class</label>
          <select class="sel" id="pf-class">
            <option value="">Class चुनो</option>
            <option ${currentProfile.class === 'Class 9' ? 'selected' : ''}>Class 9</option>
            <option ${currentProfile.class === 'Class 10' ? 'selected' : ''}>Class 10</option>
            <option ${currentProfile.class === 'Class 11' ? 'selected' : ''}>Class 11</option>
            <option ${currentProfile.class === 'Class 12' ? 'selected' : ''}>Class 12</option>
            <option ${currentProfile.class === 'Graduation' ? 'selected' : ''}>Graduation</option>
          </select>
        </div>
        <div class="pf-group"><label>School / College</label><input class="inp" id="pf-school" value="${currentProfile.school || ''}" placeholder="School ka naam"></div>
      </div>
      <button type="submit" class="btn-primary-full">💾 Save Profile</button>
    </form>

    <div class="profile-actions">
      <button class="btn-danger" onclick="signOutUser()">🚪 Logout</button>
    </div>
  `;
}

async function saveProfileForm(e) {
  e.preventDefault();
  await updateUserProfile({
    name: document.getElementById('pf-name')?.value || '',
    bio: document.getElementById('pf-bio')?.value || '',
    class: document.getElementById('pf-class')?.value || '',
    school: document.getElementById('pf-school')?.value || ''
  });
  // Update nav name
  const userName = document.getElementById('user-name');
  if (userName) userName.textContent = document.getElementById('pf-name')?.value || 'User';
}

// ══════════════════════════════════════════════════════════
// GUEST MODE LIMITS
// ══════════════════════════════════════════════════════════

const GUEST_QUIZ_LIMIT = 3;

function getGuestQuizCount() {
  const today = new Date().toDateString();
  const data = JSON.parse(localStorage.getItem('qf_guest_quizzes') || '{}');
  return data.date === today ? (data.count || 0) : 0;
}

function incrementGuestQuizCount() {
  const today = new Date().toDateString();
  const data = JSON.parse(localStorage.getItem('qf_guest_quizzes') || '{}');
  const count = data.date === today ? (data.count || 0) + 1 : 1;
  localStorage.setItem('qf_guest_quizzes', JSON.stringify({ date: today, count }));
  return count;
}

function canGuestTakeQuiz() {
  if (!isGuest()) return true;
  return getGuestQuizCount() < GUEST_QUIZ_LIMIT;
}

// Init auth on load
if (isFirebaseConfigured()) {
  initAuthListener();
}
