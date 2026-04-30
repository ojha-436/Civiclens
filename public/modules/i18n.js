// @ts-check
/**
 * @module i18n
 * @description Minimal English ↔ Hindi i18n for CivicLens India.
 *   Translates elements marked with data-i18n="key" attributes.
 *   Use initI18n() to activate and wire the #lang-toggle button.
 */

/** @type {'en' | 'hi'} */
let currentLang = 'en';

/**
 * All translatable strings keyed by identifier.
 * @type {Record<string, { en: string; hi: string }>}
 */
export const STRINGS = {
  // Header
  'tagline':              { en: 'The election process, demystified.', hi: 'चुनाव प्रक्रिया, सरल भाषा में।' },
  'nav-journey':          { en: 'Journey', hi: 'यात्रा' },
  'nav-simulator':        { en: 'EVM Simulator', hi: 'ईवीएम सिम्युलेटर' },
  'nav-security':         { en: 'EVM & VVPAT Security', hi: 'ईवीएम और वीवीपैट सुरक्षा' },
  'nav-quiz':             { en: 'Quiz', hi: 'प्रश्नोत्तरी' },
  'nav-assistant':        { en: 'Ask the Assistant', hi: 'सहायक से पूछें' },

  // Hero
  'hero-badge':           { en: 'Non-Partisan · ECI-Sourced · Accessible', hi: 'निष्पक्ष · ईसीआई स्रोत · सुलभ' },
  'hero-heading':         { en: "World's largest democracy, step by step.", hi: 'विश्व का सबसे बड़ा लोकतंत्र, कदम दर कदम।' },
  'hero-sub':             { en: 'Follow your vote from Form 6 registration to the final VVPAT cross-check. Every stage explained with the Election Commission of India\'s actual process.', hi: 'फ़ॉर्म 6 पंजीकरण से लेकर अंतिम वीवीपैट सत्यापन तक अपने वोट की यात्रा जानें। भारत निर्वाचन आयोग की वास्तविक प्रक्रिया से हर चरण की व्याख्या।' },
  'hero-cta-journey':     { en: 'Start the Journey →', hi: 'यात्रा शुरू करें →' },
  'hero-cta-sim':         { en: 'Try the EVM Simulator', hi: 'ईवीएम सिम्युलेटर आज़माएं' },

  // Section headings
  'journey-heading':      { en: "The Voter's Journey", hi: 'मतदाता की यात्रा' },
  'journey-sub':          { en: 'Click any stage to see what happens — and why it matters.', hi: 'किसी भी चरण पर क्लिक करें — और जानें यह क्यों महत्वपूर्ण है।' },
  'sim-heading':          { en: 'EVM + VVPAT Simulator', hi: 'ईवीएम + वीवीपैट सिम्युलेटर' },
  'sim-sub':              { en: 'Walk through the four steps of voting at an Indian polling booth — ID check, indelible ink, EVM button press, VVPAT verification.', hi: 'भारतीय मतदान केंद्र पर मतदान के चार चरणों से गुज़रें — पहचान जांच, अमिट स्याही, ईवीएम बटन दबाना, वीवीपैट सत्यापन।' },
  'sec-heading':          { en: 'How EVMs and VVPATs Stay Secure', hi: 'ईवीएम और वीवीपैट कैसे सुरक्षित रहते हैं' },
  'sec-sub':              { en: 'Every safeguard, explained in plain language.', hi: 'हर सुरक्षा उपाय, सरल भाषा में समझाया गया।' },
  'quiz-heading':         { en: 'Test Your Knowledge', hi: 'अपनी जानकारी परखें' },
  'quiz-sub':             { en: 'Seven questions. Instant feedback. Share your score.', hi: 'सात प्रश्न। तत्काल प्रतिक्रिया। अपना स्कोर साझा करें।' },
  'asst-heading':         { en: 'Ask the Assistant', hi: 'सहायक से पूछें' },
  'asst-sub':             { en: 'Ask anything about the Indian election process. Answers are based on Election Commission of India sources.', hi: 'भारतीय चुनाव प्रक्रिया के बारे में कुछ भी पूछें। उत्तर भारत निर्वाचन आयोग के स्रोतों पर आधारित हैं।' },

  // Footer
  'footer-disclaimer':    { en: 'CivicLens India is a non-partisan educational project. Always verify with the Election Commission of India before acting on any information.', hi: 'सिविकलेंस इंडिया एक निष्पक्ष शैक्षिक परियोजना है। किसी भी जानकारी पर कार्रवाई करने से पहले हमेशा भारत निर्वाचन आयोग से सत्यापित करें।' },
};

/**
 * Translate all [data-i18n] elements to the given language.
 * @param {'en' | 'hi'} lang
 */
export function applyLang(lang) {
  currentLang = lang;
  document.documentElement.lang = lang;

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n') || '';
    const entry = STRINGS[key];
    if (!entry) return;
    const text = entry[lang] || entry.en;
    // Preserve inner HTML for elements with child tags by only replacing textContent
    // when the element has no child elements (is a leaf text node).
    if (el.children.length === 0) {
      el.textContent = text;
    } else {
      // For elements with children (e.g., <h2> with a badge inside), set only the
      // first text node so child elements (icons, badges) are preserved.
      const firstText = Array.from(el.childNodes).find(
        (n) => n.nodeType === Node.TEXT_NODE && n.textContent?.trim()
      );
      if (firstText) firstText.textContent = text;
    }
  });

  // Update lang-toggle button label
  const btn = document.getElementById('lang-toggle');
  if (btn) {
    btn.textContent = lang === 'en' ? 'EN | हिं' : 'हिं | EN';
    btn.setAttribute('lang', lang === 'en' ? 'en' : 'hi');
  }

  // Persist preference
  try { localStorage.setItem('civiclens-lang', lang); } catch { /* private browsing */ }
}

/**
 * Wire the #lang-toggle button and apply the persisted language on load.
 */
export function initI18n() {
  /** @type {'en' | 'hi'} */
  let saved = 'en';
  try {
    const stored = localStorage.getItem('civiclens-lang');
    if (stored === 'hi' || stored === 'en') saved = stored;
  } catch { /* private browsing */ }

  applyLang(saved);

  const btn = document.getElementById('lang-toggle');
  if (btn) {
    btn.addEventListener('click', () => {
      applyLang(currentLang === 'en' ? 'hi' : 'en');
    });
  }
}
