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
    'nav.home':        { en: 'Home',           hi: 'होम' },
    'nav.quiz':        { en: 'Take Quiz',      hi: 'Quiz करें' },
    'nav.leaderboard': { en: 'Leaderboard',    hi: 'लीडरबोर्ड' },
    'nav.profile':     { en: 'My Profile',     hi: 'मेरी प्रोफ़ाइल' },
    'nav.analytics':   { en: 'Analytics',      hi: 'विश्लेषण' },
    'nav.login':       { en: 'Login',          hi: 'लॉगिन' },
    'nav.join':        { en: 'Join Free 🚀',   hi: 'मुफ़्त जुड़ें 🚀' },
    'nav.logout':      { en: '🚪 Logout',      hi: '🚪 लॉगआउट' },
    'nav.admin':       { en: '⚙️ Admin Panel', hi: '⚙️ एडमिन पैनल' },

    // ═══════════ MOBILE MENU ═══════════
    'mob.home':        { en: '🏠 Home',           hi: '🏠 होम' },
    'mob.quiz':        { en: '❓ Take Quiz',      hi: '❓ Quiz करें' },
    'mob.leaderboard': { en: '🏆 Leaderboard',    hi: '🏆 लीडरबोर्ड' },
    'mob.profile':     { en: '👤 My Profile',     hi: '👤 मेरी प्रोफ़ाइल' },
    'mob.analytics':   { en: '📊 Analytics',      hi: '📊 विश्लेषण' },
    'mob.join':        { en: 'Join Free 🚀',      hi: 'मुफ़्त जुड़ें 🚀' },

    // ═══════════ HERO ═══════════
    'hero.tag':        { en: "India's #1 Free MCQ Platform",     hi: 'भारत का #1 मुफ़्त MCQ प्लेटफ़ॉर्म' },
    'hero.title':      { en: 'Practice Smart<br><span class="hero-title-highlight">for Exams</span><br>Score More', 
                         hi: 'परीक्षा के लिए<br><span class="hero-title-highlight">स्मार्ट तरीके से</span><br>अभ्यास करो' },
    'hero.sub':        { en: 'Class 9 to UPSC — MCQs for every Subject, Timed Quizzes, and AI-powered Analytics — All Free!',
                         hi: 'कक्षा 9 से UPSC तक — हर विषय के MCQ, समयबद्ध Quiz, और AI-संचालित विश्लेषण — सब मुफ़्त!' },
    'hero.btn.start':  { en: '🚀 Start Quiz Now',       hi: '🚀 अभी Quiz शुरू करो' },
    'hero.btn.join':   { en: 'Join Free →',              hi: 'मुफ़्त जुड़ें →' },
    'hero.stat.questions': { en: 'MCQ Questions',        hi: 'MCQ प्रश्न' },
    'hero.stat.students':  { en: 'Students',             hi: 'छात्र' },
    'hero.stat.subjects':  { en: 'Subjects',             hi: 'विषय' },
    'hero.stat.free':      { en: 'Free',                 hi: 'मुफ़्त' },
    'hero.stat.free.label':{ en: 'Forever',              hi: 'हमेशा के लिए' },

    // Mini floating cards
    'hero.mini.scored':  { en: 'Rahul Scored',            hi: 'राहुल ने स्कोर किया' },
    'hero.mini.streak':  { en: 'Daily Streak',            hi: 'दैनिक स्ट्रीक' },

    // ═══════════ LIVE DASHBOARD ═══════════
    'live.tag':           { en: '📊 Live Dashboard',      hi: '📊 लाइव डैशबोर्ड' },
    'live.title':         { en: 'Real-Time Question Bank', hi: 'रियल-टाइम प्रश्न बैंक' },
    'live.sub':           { en: 'Every question count is <strong>live</strong> — reflects instantly when added from Admin panel',
                           hi: 'हर प्रश्न की गिनती <strong>लाइव</strong> है — एडमिन पैनल से जोड़ते ही यहाँ दिखता है' },
    'live.total':         { en: 'Total Questions',        hi: 'कुल प्रश्न' },
    'live.subjects':      { en: 'Subjects',               hi: 'विषय' },
    'live.topics':        { en: 'Topics',                 hi: 'टॉपिक्स' },
    'live.today':         { en: 'Added Today',            hi: 'आज जोड़े गए' },
    'live.breakdown':     { en: '📈 Subject-wise Breakdown', hi: '📈 विषय-अनुसार विवरण' },
    'live.latest':        { en: '🆕 Latest Questions',    hi: '🆕 नवीनतम प्रश्न' },
    'live.allSubjects':   { en: 'All Subjects',           hi: 'सभी विषय' },
    'live.allTopics':     { en: 'All Topics',             hi: 'सभी टॉपिक्स' },
    'live.loadMore':      { en: 'Load More →',            hi: 'और दिखाओ →' },

    // ═══════════ SUBJECTS SECTION ═══════════
    'subj.tag':           { en: '📚 Subjects',            hi: '📚 विषय' },
    'subj.title':         { en: "Which Subject Today?",   hi: 'आज कौन सा विषय?' },
    'subj.sub':           { en: 'Class-wise, Topic-wise MCQs — Preparation for every Exam', 
                           hi: 'कक्षा-अनुसार, टॉपिक-अनुसार MCQs — हर परीक्षा की तैयारी यहाँ' },

    // ═══════════ FEATURES ═══════════
    'feat.tag':           { en: '✨ Features',            hi: '✨ विशेषताएँ' },
    'feat.title':         { en: 'Why Students Love QuizForge?', hi: 'छात्रों को QuizForge क्यों पसंद है?' },
    'feat.sub':           { en: 'Everything a Smart Student needs', hi: 'एक होशियार छात्र को जो कुछ चाहिए' },

    'feat.timer.title':   { en: 'Timed Mock Tests',       hi: 'समयबद्ध मॉक टेस्ट' },
    'feat.timer.text':    { en: 'Real Exam-like environment — Timer, Negative Marking, and Strict Mode. Perfect preparation for JEE/NEET/UPSC.',
                           hi: 'असली परीक्षा जैसा माहौल — टाइमर, नकारात्मक अंकन, और सख्त मोड। JEE/NEET/UPSC की बेहतरीन तैयारी।' },
    'feat.ai.title':      { en: 'AI Analytics',           hi: 'AI विश्लेषण' },
    'feat.ai.text':       { en: 'Weak topics are automatically detected. AI tells you where to focus more.',
                           hi: 'कमज़ोर विषय अपने आप पहचाने जाते हैं। AI बताता है कहाँ ज़्यादा ध्यान देना है।' },
    'feat.streak.title':  { en: 'Daily Streak',           hi: 'दैनिक स्ट्रीक' },
    'feat.streak.text':   { en: 'Take quizzes daily, build your streak, win badges. Gamification makes learning fun!',
                           hi: 'रोज़ quiz करो, स्ट्रीक बढ़ाओ, बैज जीतो। गेमिफ़िकेशन से पढ़ाई मज़ेदार बनती है!' },
    'feat.explain.title': { en: 'Detailed Explanations',  hi: 'विस्तृत व्याख्या' },
    'feat.explain.text':  { en: 'Step-by-step explanation for every question — in both Hindi and English.',
                           hi: 'हर सवाल की चरण-दर-चरण व्याख्या — हिंदी और अंग्रेज़ी दोनों में।' },
    'feat.lb.title':      { en: 'Live Leaderboard',       hi: 'लाइव लीडरबोर्ड' },
    'feat.lb.text':       { en: 'See your rank in your school, city, and all of India. Competition drives motivation!',
                           hi: 'अपने स्कूल, शहर, और पूरे भारत में रैंक देखो। प्रतियोगिता से हौसला बढ़ता है!' },
    'feat.mobile.title':  { en: 'Mobile Friendly',        hi: 'मोबाइल फ्रेंडली' },
    'feat.mobile.text':   { en: 'Works perfectly on phone too — study on the bus, in bed, anywhere!',
                           hi: 'फ़ोन पर भी बढ़िया काम करता है — बस में, बिस्तर में, कहीं भी पढ़ो!' },

    // ═══════════ HOW IT WORKS ═══════════
    'how.tag':            { en: '🗺️ Process',             hi: '🗺️ प्रक्रिया' },
    'how.title':          { en: 'How Does It Work?',       hi: 'यह कैसे काम करता है?' },
    'how.step1.title':    { en: 'Choose Subject',          hi: 'विषय चुनो' },
    'how.step1.text':     { en: 'Select Class, Subject, and Topic. Choose Practice or Exam mode.',
                           hi: 'कक्षा, विषय, और टॉपिक चुनो। अभ्यास या परीक्षा मोड चुनो।' },
    'how.step2.title':    { en: 'Take Quiz',               hi: 'Quiz दो' },
    'how.step2.text':     { en: 'Solve MCQs. Timer keeps running — just like a real exam!',
                           hi: 'MCQs हल करो। टाइमर चलता रहेगा — बिल्कुल असली परीक्षा जैसा!' },
    'how.step3.title':    { en: 'View Analysis',           hi: 'विश्लेषण देखो' },
    'how.step3.text':     { en: 'Score, accuracy, weak topics — everything shows in analytics.',
                           hi: 'अंक, सटीकता, कमज़ोर विषय — सब विश्लेषण में दिखेगा।' },
    'how.step4.title':    { en: 'Top the Charts!',         hi: 'टॉप करो!' },
    'how.step4.text':     { en: 'Practice daily, climb the leaderboard, win badges!',
                           hi: 'रोज़ अभ्यास करो, लीडरबोर्ड पर चढ़ो, बैज जीतो!' },

    // ═══════════ CTA BANNER ═══════════
    'cta.title':          { en: 'Start Today! 🚀',         hi: 'आज से ही शुरू करो! 🚀' },
    'cta.sub':            { en: 'Over 2 lakh students are already on QuizForge.<br>Join for free, no credit card needed.',
                           hi: '2 लाख से ज़्यादा छात्र पहले से QuizForge पर हैं।<br>मुफ़्त जुड़ो, कोई क्रेडिट कार्ड नहीं चाहिए।' },
    'cta.btn':            { en: '🎯 Create Free Account',  hi: '🎯 मुफ़्त खाता बनाओ' },

    // ═══════════ FOOTER ═══════════
    'footer.desc':        { en: "India's largest free MCQ platform. From Class 9 to UPSC, preparation for every exam happens here.",
                           hi: 'भारत का सबसे बड़ा मुफ़्त MCQ प्लेटफ़ॉर्म। कक्षा 9 से UPSC तक, हर परीक्षा की तैयारी यहाँ होती है।' },
    'footer.subjects':    { en: 'Subjects',                hi: 'विषय' },
    'footer.exams':       { en: 'Exams',                   hi: 'परीक्षाएँ' },
    'footer.company':     { en: 'Company',                 hi: 'कंपनी' },
    'footer.about':       { en: 'About Us',                hi: 'हमारे बारे में' },
    'footer.privacy':     { en: 'Privacy Policy',          hi: 'गोपनीयता नीति' },
    'footer.terms':       { en: 'Terms of Use',            hi: 'उपयोग की शर्तें' },
    'footer.contact':     { en: 'Contact',                 hi: 'संपर्क करें' },
    'footer.tagline':     { en: '© 2025 QuizForge. Made with ❤️ for Indian Students.',
                           hi: '© 2025 QuizForge. भारतीय छात्रों के लिए ❤️ से बनाया।' },

    // ═══════════ QUIZ SETUP ═══════════
    'quiz.back':          { en: '← Back',                  hi: '← वापस' },
    'quiz.title':         { en: 'Configure Quiz 🎯',       hi: 'Quiz सेट करो 🎯' },
    'quiz.sub':           { en: 'Choose settings as per your needs', hi: 'अपनी जरूरत के हिसाब से सेटिंग्स चुनो' },
    'quiz.mode':          { en: 'Quiz Mode',               hi: 'Quiz मोड' },
    'quiz.practice':      { en: 'Practice Mode',           hi: 'अभ्यास मोड' },
    'quiz.practice.sub':  { en: 'Explanation after every answer', hi: 'हर उत्तर के बाद व्याख्या' },
    'quiz.timed':         { en: 'Timed Mode',              hi: 'समयबद्ध मोड' },
    'quiz.timed.sub':     { en: 'Timer on, results at end', hi: 'टाइमर चालू, अंत में नतीजे' },
    'quiz.exam':          { en: 'Exam Mode',               hi: 'परीक्षा मोड' },
    'quiz.exam.sub':      { en: 'Strict, Negative Marking', hi: 'सख्त, नकारात्मक अंकन' },

    // ═══════════ AUTH MODAL ═══════════
    'auth.title':         { en: 'Welcome to QuizForge 🚀', hi: 'QuizForge में आपका स्वागत है 🚀' },
    'auth.sub':           { en: 'Login or create your account', hi: 'लॉगिन करें या अपना खाता बनाएं' },
    'auth.tab.login':     { en: 'Login / Sign Up',         hi: 'लॉगिन / साइन अप' },
    'auth.tab.phone':     { en: 'Phone OTP',               hi: 'फ़ोन OTP' },
    'auth.google':        { en: 'Continue with Google',    hi: 'Google से जारी रखें' },
    'auth.or':            { en: 'or',                      hi: 'या' },
    'auth.guest':         { en: '👤 Continue as Guest (3 quizzes / day)', hi: '👤 अतिथि के रूप में जारी रखें (3 quiz प्रतिदिन)' },
    'auth.phone.label':   { en: 'Mobile Number',           hi: 'मोबाइल नंबर' },
    'auth.phone.send':    { en: 'Send OTP',                hi: 'OTP भेजें' },

    // ═══════════ USER DROPDOWN ═══════════
    'dropdown.profile':   { en: '👤 My Profile',           hi: '👤 मेरी प्रोफ़ाइल' },
    'dropdown.analytics': { en: '📊 Analytics',            hi: '📊 विश्लेषण' },
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
