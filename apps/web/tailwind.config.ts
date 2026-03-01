import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        surface: {
          DEFAULT: '#fafaf9',
          secondary: '#ffffff',
          elevated: '#f4f4f5',
        },
        ink: {
          DEFAULT: '#18181b',
          secondary: '#52525b',
          muted: '#a1a1aa',
        },
        line: {
          DEFAULT: '#e4e4e7',
          light: '#f4f4f5',
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
