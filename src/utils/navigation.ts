/**
 * Central navigation helper for HTML5 History API path-based routing.
 * Ensures clean URLs (e.g. /dashboard/medical, /privacy) with zero page reloads.
 */

export const navigate = (path: string, replace = false): void => {
  if (replace) {
    window.history.replaceState(null, '', path);
  } else {
    window.history.pushState(null, '', path);
  }
  // Dispatch a popstate event so App and Dashboard immediately detect route change
  window.dispatchEvent(new PopStateEvent('popstate'));
};

/**
 * Normalizes legacy hash URLs (e.g. /#dashboard/schemes, /#privacy) into clean pathnames
 */
export const normalizeLegacyHash = (): void => {
  const hash = window.location.hash;
  if (!hash) return;

  // Ignore simple in-page anchor links on landing page (like #features, #pricing)
  if (['#features', '#how-it-works', '#localized-care', '#pricing', '#faq'].includes(hash)) {
    return;
  }

  // Convert #/path or #path to /path
  let cleanPath = hash.replace(/^#\/?/, '/');
  if (!cleanPath.startsWith('/')) {
    cleanPath = '/' + cleanPath;
  }

  window.history.replaceState(null, '', cleanPath);
};
