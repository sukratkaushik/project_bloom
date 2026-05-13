/** Our Pregnancy — Tailwind v4 preset
 *
 * Drop-in preset for any Tailwind v4 project. Mirrors src/index.css from
 * the shipped product so component utilities work identically.
 *
 * Usage in tailwind.config.js:
 *   import ourPregnancyPreset from './design-system/tokens/tailwind.preset.js';
 *   export default { presets: [ourPregnancyPreset], content: [...] };
 */

module.exports = {
  theme: {
    extend: {
      colors: {
        sage: {
          DEFAULT: '#8AB6A3',
          light: '#B5D5C7',
          pale: '#E9F5E9',
        },
        blush: {
          DEFAULT: '#F9C7D2',
          light: '#FCE1E8',
          pale: '#FEF5F7',
        },
        gold: {
          DEFAULT: '#F4A261',
          pale: '#FCF1E8',
        },
        cream: '#FDFBF7',
        charcoal: '#2C3E50',
        medium: '#6B7A87',
        light: '#9BA7B0',
        border: '#E8E6E1',
        critical: {
          DEFAULT: '#D97777',
          bg: '#FDF5F5',
        },
        optional: {
          DEFAULT: '#F4A261',
          bg: '#FCF1E8',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', '"Iowan Old Style"', 'Georgia', 'serif'],
        sans: ['Nunito', 'Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        calm: ['Lexend', '"Atkinson Hyperlegible"', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        overline: ['12px', { lineHeight: '1.4', letterSpacing: '0.08em' }],
        caption: ['13px', { lineHeight: '1.45' }],
        body: ['16px', { lineHeight: '1.6' }],
        'body-app': ['15px', { lineHeight: '1.6' }],
        'h6': ['18px', { lineHeight: '1.4' }],
        'h5': ['20px', { lineHeight: '1.35' }],
        'h4': ['24px', { lineHeight: '1.3' }],
        'h3': ['32px', { lineHeight: '1.25' }],
        'h2': ['40px', { lineHeight: '1.2' }],
        'h1': ['56px', { lineHeight: '1.1' }],
        display: ['72px', { lineHeight: '1.05' }],
      },
      spacing: {
        0: '0',
        1: '4px',
        2: '8px',
        3: '12px',
        4: '16px',
        5: '24px',
        6: '32px',
        7: '40px',
        8: '48px',
        9: '64px',
        10: '80px',
        11: '96px',
      },
      borderRadius: {
        xs: '6px',
        sm: '8px',
        md: '12px',
        soft: '16px',
        card: '24px',
        hero: '32px',
        pill: '9999px',
      },
      boxShadow: {
        card: '0 4px 20px -4px rgba(44, 62, 80, 0.05)',
        'card-hover': '0 12px 30px -10px rgba(138, 182, 163, 0.15)',
        float: '0 8px 24px rgba(244, 162, 97, 0.1)',
        modal: '0 20px 60px -20px rgba(44, 62, 80, 0.18)',
        calm: '0 10px 40px rgba(0, 0, 0, 0.02)',
      },
      transitionDuration: {
        fast: '160ms',
        base: '240ms',
        slow: '480ms',
        ambient: '800ms',
        entry: '700ms',
      },
      transitionTimingFunction: {
        soft: 'cubic-bezier(0.33, 1, 0.68, 1)',
        out: 'cubic-bezier(0.16, 1, 0.3, 1)',
        active: 'cubic-bezier(0, 0, 0.2, 1)',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideInFromBottom: {
          from: { transform: 'translateY(16px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        zoomIn: {
          from: { transform: 'scale(0.95)', opacity: '0' },
          to: { transform: 'scale(1)', opacity: '1' },
        },
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 700ms cubic-bezier(0.16, 1, 0.3, 1) both',
        'slide-in': 'slideInFromBottom 700ms cubic-bezier(0.16, 1, 0.3, 1) both',
        'zoom-in': 'zoomIn 700ms cubic-bezier(0.16, 1, 0.3, 1) both',
        blob: 'blob 8s infinite cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
};
