export interface SupportedLanguage {
  code: string;
  label: string;
  native: string;
  name: string;
}

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  { code: 'en', label: 'English', native: 'English', name: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी', name: 'हिन्दी (Hindi)' },
  { code: 'mr', label: 'Marathi', native: 'मराठी', name: 'मराठी (Marathi)' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்', name: 'தமிழ் (Tamil)' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు', name: 'తెలుగు (Telugu)' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা', name: 'বাংলা (Bengali)' },
  { code: 'gu', label: 'Gujarati', native: 'ગુજરાતી', name: 'ગુજરાતી (Gujarati)' },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ', name: 'ಕನ್ನಡ (Kannada)' },
  { code: 'pa', label: 'Punjabi', native: 'ਪੰਜਾਬੀ', name: 'ਪੰਜਾਬੀ (Punjabi)' },
  { code: 'ml', label: 'Malayalam', native: 'മലയാളം', name: 'മലയാളം (Malayalam)' },
  { code: 'ur', label: 'Urdu', native: 'اردو', name: 'اردو (Urdu)' },
  { code: 'de', label: 'German', native: 'Deutsch', name: 'Deutsch (German)' }
];

const STORAGE_KEY = 'bloom_selected_language';

/**
 * Reads the currently active language code from:
 * 1. localStorage
 * 2. googtrans cookie
 * 3. HTML lang attribute
 * Defaults to 'en'
 */
export function getActiveLanguage(): string {
  try {
    // 1. Check localStorage first
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && SUPPORTED_LANGUAGES.some(l => l.code === saved)) {
      return saved;
    }
  } catch (e) {
    // localStorage might be unavailable in restricted webview contexts
  }

  // 2. Check HTML lang attribute
  try {
    const htmlLang = document.documentElement.lang;
    if (htmlLang && htmlLang !== 'en' && htmlLang.length <= 5) {
      const cleanLang = htmlLang.split('-')[0].toLowerCase();
      if (SUPPORTED_LANGUAGES.some(l => l.code === cleanLang)) {
        return cleanLang;
      }
    }
  } catch (e) {}

  // 3. Check googtrans cookie
  try {
    const match = document.cookie.match(/googtrans=([^;]+)/);
    if (match) {
      const decoded = decodeURIComponent(match[1]);
      const parts = decoded.split('/');
      const code = parts[parts.length - 1];
      if (code) {
        const cleanCode = code.toLowerCase();
        if (SUPPORTED_LANGUAGES.some(l => l.code === cleanCode)) {
          return cleanCode;
        }
      }
    }
  } catch (e) {}

  return 'en';
}

/**
 * Triggers Google Translate translation to the requested language code.
 * Handles DOM select manipulation, cookie persistence, and fallbacks.
 */
export function changeLanguage(langCode: string): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, langCode);
  } catch (e) {}

  // Set googtrans cookie for all possible domain scopes
  const cookieValue = langCode === 'en' ? '/en/en' : `/en/${langCode}`;
  
  // 1. Root path cookie
  document.cookie = `googtrans=${cookieValue}; path=/; SameSite=Lax;`;
  
  // 2. Specific domain cookie if hostname is non-empty and not localhost
  const hostname = window.location.hostname;
  if (hostname && !hostname.includes('localhost') && hostname.includes('.')) {
    document.cookie = `googtrans=${cookieValue}; path=/; domain=${hostname}; SameSite=Lax;`;
    const rootDomain = hostname.replace(/^www\./, '');
    if (rootDomain.includes('.')) {
      document.cookie = `googtrans=${cookieValue}; path=/; domain=.${rootDomain}; SameSite=Lax;`;
    }
  }

  // 3. Try to change the Google Translate select dropdown directly
  const select = document.querySelector<HTMLSelectElement>('.goog-te-combo');
  if (select) {
    select.value = langCode === 'en' ? '' : langCode;
    select.dispatchEvent(new Event('change', { bubbles: true }));
    
    // Also dispatch on document for custom listeners
    window.dispatchEvent(new CustomEvent('app_language_changed', { detail: { langCode } }));
    return true;
  }

  // 4. If Google Translate combo isn't yet in DOM (e.g. still initializing),
  // a soft reload will boot Google Translate with the newly saved googtrans cookie
  setTimeout(() => {
    window.location.reload();
  }, 100);

  return false;
}
