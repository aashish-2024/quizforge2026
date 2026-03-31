// ══════════════════════════════════════════════════════════
// i18n — Internationalization Module for QuizForge
// ══════════════════════════════════════════════════════════
// Usage: Add data-i18n="key" to any HTML element
// The text will be replaced with the translation for the current language
// ══════════════════════════════════════════════════════════

const I18N = {
  // Current language
  currentLang: 'en',

  // ── Translation Dictionary ──
  translations: {

    // ═══════════ NAVBAR ═══════════
    'nav.home':        { en: 'Home',        hi: 'होम' },
    'nav.quiz':        { en: 'Take Quiz',   hi: 'Quiz करें' },
    'nav.leaderboard': { en: 'Leaderboard', hi: 'Leaderboard' },
    'nav.profile':     { en: 'My Profile',  hi: 'मेरी Profile' },
    'nav.analytics':   { en: 'Analytics',   hi: 'Analytics' },
    'nav.login':       { en: 'Login',       hi: 'Login' },
    'nav.join':        { en: 'Join Free 🚀', hi: 'Free में Join करें 🚀' },
    'nav.logout':      { en: '🚪 Logout',   hi: '🚪 Logout' },
    'nav.admin':       { en: '⚙️ Admin Panel', hi: '⚙️ Admin Panel' },

    // ═══════════ MOBILE MENU ═══════════
    'mob.home':        { en: '🏠 Home',        hi: '🏠 होम' },
    'mob.quiz':        { en: '❓ Take Quiz',   hi: '❓ Quiz करें' },
    'mob.leaderboard': { en: '🏆 Leaderboard', hi: '🏆 Leaderboard' },
    'mob.profile':     { en: '👤 My Profile',  hi: '👤 मेरी Profile' },
    'mob.analytics':   { en: '📊 Analytics',   hi: '📊 Analytics' },
    'mob.join':        { en: 'Join Free 🚀',   hi: 'Free में Join करें 🚀' },

    // ═══════════ HERO ═══════════
    'hero.tag':        { en: "India's #1 Free MCQ Platform",          hi: 'India का #1 Free MCQ Platform' },
    'hero.title':      { en: 'Practice Smart<br><span class="hero-title-highlight">for Exams</span><br>Score More', 
                         hi: 'Exams के लिए<br><span class="hero-title-highlight">Smart तरीके से</span><br>Practice करो' },
    'hero.sub':        { en: 'Class 9 to UPSC — MCQs for every Subject, Timed Quizzes, and AI-powered Analytics — All Free!',
                         hi: 'Class 9 से UPSC तक — हर Subject के MCQ, Timed Quiz, और AI-powered Analytics — सब Free!' },
    'hero.btn.start':  { en: '🚀 Start Quiz Now',    hi: '🚀 अभी Quiz शुरू करो' },
    'hero.btn.join':   { en: 'Join Free →',           hi: 'Free में Join करें →' },
    'hero.stat.questions': { en: 'MCQ Questions',     hi: 'MCQ Questions' },
    'hero.stat.students':  { en: 'Students',          hi: 'Students' },
    'hero.stat.subjects':  { en: 'Subjects',          hi: 'Subjects' },
    'hero.stat.free':      { en: 'Free',              hi: 'Free' },
    'hero.stat.free.label':{ en: 'Forever',            hi: 'हमेशा के लिए' },

    // Mini floating cards
    'hero.mini.scored':  { en: 'Rahul Scored',         hi: 'Rahul ने Score किया' },
    'hero.mini.streak':  { en: 'Daily Streak',         hi: 'Daily Streak' },

    // ═══════════ LIVE DASHBOARD ═══════════
    'live.tag':           { en: '📊 Live Dashboard',   hi: '📊 Live Dashboard' },
    'live.title':         { en: 'Real-Time Question Bank', hi: 'Real-Time Question Bank' },
    'live.sub':           { en: 'Every question count is <strong>live</strong> — reflects instantly when added from Admin panel',
                           hi: 'हर question count <strong>live</strong> है — Admin panel से add होते ही यहाँ reflect होता है' },
    'live.total':         { en: 'Total Questions',     hi: 'कुल Questions' },
    'live.subjects':      { en: 'Subjects',            hi: 'Subjects' },
    'live.topics':        { en: 'Topics',              hi: 'Topics' },
    'live.today':         { en: 'Added Today',         hi: 'आज जोड़े गए' },
    'live.breakdown':     { en: '📈 Subject-wise Breakdown', hi: '📈 Subject-wise Breakdown' },
    'live.latest':        { en: '🆕 Latest Questions', hi: '🆕 नवीनतम Questions' },
    'live.allSubjects':   { en: 'All Subjects',        hi: 'सभी Subjects' },
    'live.allTopics':     { en: 'All Topics',          hi: 'सभी Topics' },
    'live.loadMore':      { en: 'Load More →',         hi: 'और दिखाओ →' },

    // ═══════════ SUBJECTS SECTION ═══════════
    'subj.tag':           { en: '📚 Subjects',         hi: '📚 Subjects' },
    'subj.title':         { en: "Which Subject Today?", hi: 'कौन सा Subject है आज?' },
    'subj.sub':           { en: 'Class-wise, Topic-wise MCQs — Preparation for every Exam', 
                           hi: 'Class-wise, Topic-wise MCQs — हर Exam की तैयारी यहाँ' },

    // ═══════════ FEATURES ═══════════
    'feat.tag':           { en: '✨ Features',         hi: '✨ Features' },
    'feat.title':         { en: 'Why Students Love QuizForge?', hi: 'क्यों Students को पसंद है QuizForge?' },
    'feat.sub':           { en: 'Everything a Smart Student needs', hi: 'सब कुछ जो एक Smart Student को चाहिए' },

    'feat.timer.title':   { en: 'Timed Mock Tests',    hi: 'Timed Mock Tests' },
    'feat.timer.text':    { en: 'Real Exam-like environment — Timer, Negative Marking, and Strict Mode. Perfect preparation for JEE/NEET/UPSC.',
                           hi: 'Real Exam जैसा माहौल — Timer, Negative Marking, और Strict Mode। JEE/NEET/UPSC की perfect preparation।' },
    'feat.ai.title':      { en: 'AI Analytics',        hi: 'AI Analytics' },
    'feat.ai.text':       { en: 'Weak topics are automatically detected. AI tells you where to focus more.',
                           hi: 'कमज़ोर Topics automatically detect होते हैं। AI बताता है कहाँ ज़्यादा ध्यान देना है।' },
    'feat.streak.title':  { en: 'Daily Streak',        hi: 'Daily Streak' },
    'feat.streak.text':   { en: 'Take quizzes daily, build your streak, win badges. Gamification makes learning fun!',
                           hi: 'रोज़ quiz करो, streak बढ़ाओ, badges जीतो। Gamification से learning fun बनती है!' },
    'feat.explain.title': { en: 'Detailed Explanations', hi: 'Detailed Explanations' },
    'feat.explain.text':  { en: 'Step-by-step explanation for every question — in both Hindi and English.',
                           hi: 'हर सवाल का step-by-step explanation — Hindi और English दोनों में।' },
    'feat.lb.title':      { en: 'Live Leaderboard',     hi: 'Live Leaderboard' },
    'feat.lb.text':       { en: 'See your rank in your school, city, and all of India. Competition drives motivation!',
                           hi: 'अपने school, city, और पूरे India में rank देखो। Competition motivation देती है!' },
    'feat.mobile.title':  { en: 'Mobile Friendly',      hi: 'Mobile Friendly' },
    'feat.mobile.text':   { en: 'Works perfectly on phone too — study on the bus, in bed, anywhere!',
                           hi: 'Phone पर भी perfectly काम करता है — bus में, bed में, कहीं भी पढ़ो!' },

    // ═══════════ HOW IT WORKS ═══════════
    'how.tag':            { en: '🗺️ Process',          hi: '🗺️ Process' },
    'how.title':          { en: 'How Does It Work?',    hi: 'कैसे काम करता है?' },
    'how.step1.title':    { en: 'Choose Subject',       hi: 'Subject चुनो' },
    'how.step1.text':     { en: 'Select Class, Subject, and Topic. Choose Practice or Exam mode.',
                           hi: 'Class, Subject, और Topic select करो। Practice या Exam mode choose करो।' },
    'how.step2.title':    { en: 'Take Quiz',            hi: 'Quiz दो' },
    'how.step2.text':     { en: 'Solve MCQs. Timer keeps running — just like a real exam!',
                           hi: 'MCQs solve करो। Timer चलता रहेगा — बिल्कुल real exam जैसा!' },
    'how.step3.title':    { en: 'View Analysis',        hi: 'Analysis देखो' },
    'how.step3.text':     { en: 'Score, accuracy, weak topics — everything shows in analytics.',
                           hi: 'Score, accuracy, weak topics — सब analytics में दिखेगा।' },
    'how.step4.title':    { en: 'Top the Charts!',      hi: 'Top करो!' },
    'how.step4.text':     { en: 'Practice daily, climb the leaderboard, win badges!',
                           hi: 'रोज़ practice करो, leaderboard पर climb करो, badges जीतो!' },

    // ═══════════ CTA BANNER ═══════════
    'cta.title':          { en: 'Start Today! 🚀',      hi: 'आज से ही शुरू करो! 🚀' },
    'cta.sub':            { en: 'Over 2 lakh students are already on QuizForge.<br>Join for free, no credit card needed.',
                           hi: '2 lakh से ज़्यादा students पहले से QuizForge पर हैं।<br>Free में join करो, कोई credit card नहीं चाहिए।' },
    'cta.btn':            { en: '🎯 Create Free Account', hi: '🎯 Free Account बनाओ' },

    // ═══════════ FOOTER ═══════════
    'footer.desc':        { en: "India's largest free MCQ platform. From Class 9 to UPSC, preparation for every exam happens here.",
                           hi: 'India का सबसे बड़ा free MCQ platform। Class 9 से UPSC तक, हर exam की preparation यहाँ होती है।' },
    'footer.subjects':    { en: 'Subjects',              hi: 'Subjects' },
    'footer.exams':       { en: 'Exams',                 hi: 'Exams' },
    'footer.company':     { en: 'Company',               hi: 'Company' },
    'footer.about':       { en: 'About Us',              hi: 'हमारे बारे में' },
    'footer.privacy':     { en: 'Privacy Policy',        hi: 'Privacy Policy' },
    'footer.terms':       { en: 'Terms of Use',          hi: 'Terms of Use' },
    'footer.contact':     { en: 'Contact',               hi: 'संपर्क करें' },
    'footer.tagline':     { en: '© 2025 QuizForge. Made with ❤️ for Indian Students.',
                           hi: '© 2025 QuizForge. Indian Students के लिए ❤️ से बनाया।' },

    // ═══════════ QUIZ SETUP ═══════════
    'quiz.back':          { en: '← Back',                hi: '← वापस' },
    'quiz.title':         { en: 'Configure Quiz 🎯',     hi: 'Quiz Configure करो 🎯' },
    'quiz.sub':           { en: 'Choose settings as per your needs', hi: 'अपनी जरूरत के हिसाब से settings choose करो' },
    'quiz.mode':          { en: 'Quiz Mode',             hi: 'Quiz Mode' },
    'quiz.practice':      { en: 'Practice Mode',         hi: 'Practice Mode' },
    'quiz.practice.sub':  { en: 'Explanation after every answer', hi: 'हर answer के बाद explanation' },
    'quiz.timed':         { en: 'Timed Mode',            hi: 'Timed Mode' },
    'quiz.timed.sub':     { en: 'Timer on, results at end', hi: 'Timer on, results end में' },
    'quiz.exam':          { en: 'Exam Mode',             hi: 'Exam Mode' },
    'quiz.exam.sub':      { en: 'Strict, Negative Marking', hi: 'Strict, Negative Marking' },

    // ═══════════ AUTH MODAL ═══════════
    'auth.title':         { en: 'Welcome to QuizForge 🚀', hi: 'QuizForge में आपका स्वागत है 🚀' },
    'auth.sub':           { en: 'Login or create your account', hi: 'Apna account login ya create karo' },
    'auth.tab.login':     { en: 'Login / Sign Up',      hi: 'Login / Sign Up' },
    'auth.tab.phone':     { en: 'Phone OTP',            hi: 'Phone OTP' },
    'auth.google':        { en: 'Continue with Google',  hi: 'Google से Continue करें' },
    'auth.or':            { en: 'or',                    hi: 'या' },
    'auth.guest':         { en: '👤 Continue as Guest (3 quizzes / day)', hi: '👤 Guest के रूप में जारी रखें (3 quiz / day)' },
    'auth.phone.label':   { en: 'Mobile Number',         hi: 'Mobile Number' },
    'auth.phone.send':    { en: 'Send OTP',              hi: 'OTP भेजो' },

    // ═══════════ USER DROPDOWN ═══════════
    'dropdown.profile':   { en: '👤 My Profile',         hi: '👤 मेरी Profile' },
    'dropdown.analytics': { en: '📊 Analytics',          hi: '📊 Analytics' },
  },

  // ── Get translation ──
  t(key) {
    const entry = this.translations[key];
    if (!entry) return key;
    return entry[this.currentLang] || entry['en'] || key;
  },

  // ── Apply all translations to DOM ──
  applyLanguage(lang) {
    if (lang) this.currentLang = lang;

    // Save to localStorage
    localStorage.setItem('qf_lang', this.currentLang);

    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const text = this.t(key);
      if (text !== key) {
        // Check if translation contains HTML
        if (text.includes('<')) {
          el.innerHTML = text;
        } else {
          el.textContent = text;
        }
      }
    });

    // Update placeholder translations
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const text = this.t(key);
      if (text !== key) el.placeholder = text;
    });

    // Update lang toggle button states
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.textContent.trim().toLowerCase() === this.currentLang);
    });

    // Set HTML lang attribute
    document.documentElement.lang = this.currentLang === 'hi' ? 'hi' : 'en';

    console.log(`🌐 Language switched to: ${this.currentLang.toUpperCase()}`);
  },

  // ── Initialize ──
  init() {
    // Load saved language or detect from browser
    const saved = localStorage.getItem('qf_lang');
    if (saved && (saved === 'en' || saved === 'hi')) {
      this.currentLang = saved;
    } else {
      // Auto-detect browser language
      const browserLang = navigator.language || navigator.userLanguage || 'en';
      this.currentLang = browserLang.startsWith('hi') ? 'hi' : 'en';
    }

    this.applyLanguage();
  }
};

// ── Global setLang function (called from navbar buttons) ──
function setLang(lang) {
  I18N.applyLanguage(lang);
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  I18N.init();
});

console.log('🌐 i18n module loaded');
