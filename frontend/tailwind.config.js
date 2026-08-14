/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Cascadia Code', 'Fira Code', 'monospace'],
      },
      colors: {
        // ── CivicLens Design Token Colors ─────────────────────────
        // These MUST match the CSS variables in index.css exactly.
        // Light cream/beige document design (Independence Day / civic theme).
        ink: {
          base:      '#FAF6F0',   // --ink-base      : page bg (cream)
          surface:   '#FCF9F5',   // --ink-surface   : card / panel
          'surface-2': '#F3ECE2', // --ink-surface-2 : raised elements
          border:    '#E8DFD0',   // --ink-border    : dividers, input outlines
          'border-2':'#D1C4AF',   // --ink-border-2  : stronger dividers
          text:      '#1C1814',   // --ink-text      : primary body (dark ink)
          muted:     '#6E6254',   // --ink-muted     : secondary / metadata
          subtle:    '#9C8C7B',   // --ink-subtle    : timestamps, tertiary
          accent:    '#D97324',   // --ink-accent    : saffron primary accent
        },
        status: {
          completed: '#226E35',   // --status-completed-text (dark green)
          ongoing:   '#1B5EBA',   // --status-ongoing-text (dark blue)
          atrisk:    '#8F6500',   // --status-atrisk-text (dark amber)
          delayed:   '#C22F4E',   // --status-delayed-text (dark red)
          planned:   '#595959',   // --status-planned-text
          onhold:    '#7A4B00',   // --status-onhold-text
        },
      },
      fontSize: {
        'data': ['0.8125rem', { lineHeight: '1.4', fontFamily: 'JetBrains Mono, monospace' }],
      },
      minHeight: {
        'touch': '44px',
      },
      borderRadius: {
        'token-sm': '0.375rem',
        'token-md': '0.5rem',
        'token-lg': '0.75rem',
        'token-xl': '1rem',
      },
    },
  },
  plugins: [],
}
