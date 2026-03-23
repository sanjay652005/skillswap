/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        void: '#0a0a0f',
        surface: '#12121a',
        panel: '#1a1a26',
        border: '#2a2a3d',
        accent: '#6d28d9',
        'accent-light': '#8b5cf6',
        'accent-glow': '#a78bfa',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        muted: '#6b7280',
        text: '#e2e8f0',
        'text-dim': '#94a3b8'
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        display: ['Syne', 'sans-serif']
      },
      boxShadow: {
        'glow': '0 0 20px rgba(109, 40, 217, 0.3)',
        'glow-sm': '0 0 10px rgba(109, 40, 217, 0.2)'
      }
    }
  },
  plugins: []
};
