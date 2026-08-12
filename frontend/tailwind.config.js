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
        ink: {
          base:      '#0C1117',
          surface:   '#161B22',
          surface2:  '#1C2128',
          border:    '#21262D',
          border2:   '#30363D',
          text:      '#E6EDF3',
          muted:     '#8B949E',
          subtle:    '#57606A',
          accent:    '#2F81F7',
        },
        status: {
          completed: '#3FB950',
          ongoing:   '#58A6FF',
          atrisk:    '#E3B341',
          delayed:   '#F0789A',
          planned:   '#8B949E',
          onhold:    '#D47A4F',
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
