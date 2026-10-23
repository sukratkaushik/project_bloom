import { useState, useEffect } from 'react';
import { TRANSLATION_DICTIONARY, SupportedLanguageCode } from './translationsData';

export interface SupportedLanguage {
  code: SupportedLanguageCode;
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

// Tracks the original English text for DOM text nodes so switching languages is 100% lossless
const originalTextMap = new WeakMap<Text, string>();
const originalPlaceholderMap = new WeakMap<Element, string>();

let isTranslating = false;
let mutationObserver: MutationObserver | null = null;

/**
 * Reads the currently active language code from:
 * 1. localStorage
 * 2. googtrans cookie
 * 3. HTML lang attribute
 * Defaults to 'en'
 */
export function getActiveLanguage(): SupportedLanguageCode {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && SUPPORTED_LANGUAGES.some(l => l.code === saved)) {
      return saved as SupportedLanguageCode;
    }
  } catch (e) {}

  try {
    const htmlLang = document.documentElement.lang;
    if (htmlLang && htmlLang !== 'en' && htmlLang.length <= 5) {
      const cleanLang = htmlLang.split('-')[0].toLowerCase();
      if (SUPPORTED_LANGUAGES.some(l => l.code === cleanLang)) {
        return cleanLang as SupportedLanguageCode;
      }
    }
  } catch (e) {}

  try {
    const match = document.cookie.match(/googtrans=([^;]+)/);
    if (match) {
      const decoded = decodeURIComponent(match[1]);
      const parts = decoded.split('/');
      const code = parts[parts.length - 1];
      if (code) {
        const cleanCode = code.toLowerCase();
        if (SUPPORTED_LANGUAGES.some(l => l.code === cleanCode)) {
          return cleanCode as SupportedLanguageCode;
        }
      }
    }
  } catch (e) {}

  return 'en';
}

/**
 * Returns translated text for a given string in the active or specified language.
 * Falls back to the original English string if no translation exists.
 */
export function t(text: string, langCode?: SupportedLanguageCode): string {
  if (!text) return '';
  const lang = langCode || getActiveLanguage();
  if (lang === 'en') return text;

  const trimmed = text.trim();
  const entry = TRANSLATION_DICTIONARY[trimmed];
  if (entry && entry[lang]) {
    const translated = entry[lang]!;
    if (text === trimmed) return translated;
    return text.replace(trimmed, translated);
  }

  return text;
}

/**
 * Translates a single text node to the target language.
 */
function translateTextNode(node: Text, targetLang: SupportedLanguageCode) {
  if (!node.nodeValue) return;

  const currentVal = node.nodeValue;
  const trimmed = currentVal.trim();
  if (!trimmed || trimmed.length < 2) return;

  // Retrieve original English text, or store it if not yet tracked
  let original = originalTextMap.get(node);
  if (!original) {
    if (TRANSLATION_DICTIONARY[trimmed]) {
      original = trimmed;
      originalTextMap.set(node, original);
    } else {
      // Check for partial sub-string matches
      for (const enKey in TRANSLATION_DICTIONARY) {
        if (trimmed === enKey || trimmed.includes(enKey)) {
          original = trimmed;
          originalTextMap.set(node, original);
          break;
        }
      }
    }
  }

  if (!original) return;

  if (targetLang === 'en') {
    if (currentVal !== original) {
      node.nodeValue = original;
    }
    return;
  }

  const exactTrans = TRANSLATION_DICTIONARY[original]?.[targetLang];
  if (exactTrans) {
    const nextVal = currentVal.replace(original, exactTrans);
    if (nextVal !== currentVal) {
      node.nodeValue = nextVal;
    }
    return;
  }

  // Handle case where trimmed original is in dictionary
  const trimmedOriginal = original.trim();
  const trimmedTrans = TRANSLATION_DICTIONARY[trimmedOriginal]?.[targetLang];
  if (trimmedTrans) {
    const nextVal = currentVal.replace(trimmedOriginal, trimmedTrans);
    if (nextVal !== currentVal) {
      node.nodeValue = nextVal;
    }
  }
}

/**
 * Translates element attributes like placeholders and titles
 */
function translateElementAttributes(el: Element, targetLang: SupportedLanguageCode) {
  if (el.hasAttribute('placeholder')) {
    const current = el.getAttribute('placeholder') || '';
    let original = originalPlaceholderMap.get(el);
    if (!original) {
      original = current;
      originalPlaceholderMap.set(el, original);
    }
    if (targetLang === 'en') {
      if (current !== original) el.setAttribute('placeholder', original);
    } else {
      const trans = TRANSLATION_DICTIONARY[original]?.[targetLang];
      if (trans && current !== trans) {
        el.setAttribute('placeholder', trans);
      }
    }
  }
}

/**
 * Traverses a DOM tree and translates all text nodes to the target language.
 */
export function translateDomTree(root: Node, targetLang: SupportedLanguageCode) {
  if (typeof document === 'undefined' || !root) return;

  isTranslating = true;
  try {
    if (root.nodeType === Node.TEXT_NODE) {
      translateTextNode(root as Text, targetLang);
      return;
    }

    if (root.nodeType === Node.ELEMENT_NODE) {
      translateElementAttributes(root as Element, targetLang);
    }

    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node: Node) {
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;

          const tag = parent.tagName;
          if (
            tag === 'SCRIPT' ||
            tag === 'STYLE' ||
            tag === 'NOSCRIPT' ||
            tag === 'SVG' ||
            tag === 'CODE' ||
            tag === 'TEXTAREA'
          ) {
            return NodeFilter.FILTER_REJECT;
          }

          // Protect brand identity
          if (parent.classList.contains('brand-protected')) {
            return NodeFilter.FILTER_REJECT;
          }

          const val = node.nodeValue?.trim();
          if (!val || val.length < 2) {
            return NodeFilter.FILTER_SKIP;
          }

          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    let currentNode = walker.nextNode();
    while (currentNode) {
      translateTextNode(currentNode as Text, targetLang);
      currentNode = walker.nextNode();
    }
  } finally {
    isTranslating = false;
  }
}

/**
 * Initializes a MutationObserver that automatically translates new DOM nodes as they render.
 */
export function initTranslationObserver() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const currentLang = getActiveLanguage();
  if (currentLang !== 'en') {
    translateDomTree(document.body, currentLang);
  }

  if (mutationObserver) {
    mutationObserver.disconnect();
  }

  mutationObserver = new MutationObserver((mutations) => {
    if (isTranslating) return;

    const lang = getActiveLanguage();
    if (lang === 'en') return;

    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            translateDomTree(node, lang);
          } else if (node.nodeType === Node.TEXT_NODE) {
            translateTextNode(node as Text, lang);
          }
        });
      }
    }
  });

  mutationObserver.observe(document.body, {
    childList: true,
    subtree: true
  });
}

/**
 * Triggers language translation to the requested language code across the app.
 * - Updates localStorage and HTML lang
 * - Immediately updates the DOM without requiring a disruptive full-page reload
 * - Synchronizes Google Translate .goog-te-combo if present as a fallback
 * - Dispatches 'app_language_changed' event for React subscribers
 */
export function changeLanguage(langCode: string, reload: boolean = false): boolean {
  const code = (SUPPORTED_LANGUAGES.some(l => l.code === langCode) ? langCode : 'en') as SupportedLanguageCode;

  try {
    localStorage.setItem(STORAGE_KEY, code);
  } catch (e) {}

  document.documentElement.lang = code;
  document.documentElement.setAttribute('data-lang', code);

  // Set googtrans cookie for fallback web compatibility
  const cookieValue = code === 'en' ? '/en/en' : `/en/${code}`;
  document.cookie = `googtrans=${cookieValue}; path=/; SameSite=Lax;`;
  const hostname = window.location.hostname;
  if (hostname && !hostname.includes('localhost') && hostname.includes('.')) {
    document.cookie = `googtrans=${cookieValue}; path=/; domain=${hostname}; SameSite=Lax;`;
    const rootDomain = hostname.replace(/^www\./, '');
    if (rootDomain.includes('.')) {
      document.cookie = `googtrans=${cookieValue}; path=/; domain=.${rootDomain}; SameSite=Lax;`;
    }
  }

  // 1. Immediately translate current DOM in-place
  if (typeof document !== 'undefined') {
    translateDomTree(document.body, code);
  }

  // 2. Synchronize Google Translate select dropdown if present
  try {
    const select = document.querySelector<HTMLSelectElement>('.goog-te-combo');
    if (select) {
      const desiredVal = code === 'en' ? '' : code;
      if (select.value !== desiredVal) {
        select.value = desiredVal;
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
  } catch (e) {}

  // 3. Dispatch global custom event for React components
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('app_language_changed', { detail: { langCode: code } }));
  }

  // 4. Reload only if explicitly asked by caller
  if (reload) {
    setTimeout(() => {
      window.location.reload();
    }, 200);
  }

  return true;
}

/**
 * React hook to subscribe to the active app language in real-time.
 */
export function useActiveLanguage(): SupportedLanguageCode {
  const [lang, setLang] = useState<SupportedLanguageCode>(getActiveLanguage);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.langCode) {
        setLang(detail.langCode as SupportedLanguageCode);
      }
    };

    window.addEventListener('app_language_changed', handler);
    return () => window.removeEventListener('app_language_changed', handler);
  }, []);

  return lang;
}
