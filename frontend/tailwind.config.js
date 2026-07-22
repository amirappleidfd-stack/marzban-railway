/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          black: '#0a0a0f',
          dark: '#0d1117',
          gray: '#161b22',
          border: '#21262d',
          green: '#00ff41',
          greenDim: '#00cc33',
          blue: '#00aaff',
          blueDim: '#0088cc',
          red: '#ff3333',
          text: '#c9d1d9',
          muted: '#8b949e',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'neon-green': '0 0 15px rgba(0, 255, 65, 0.3)',
        'neon-blue': '0 0 15px rgba(0, 170, 255, 0.3)',
      },
    },
  },
  plugins: [],
}
