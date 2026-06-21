import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#1a56db', light: '#3b82f6', dark: '#1e40af' },
      },
    },
  },
  plugins: [],
};

export default config;
