/** @type {import('tailwindcss').Config} */

const tailwindConfig = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e8f2f9',
          100: '#d1e5f3',
          200: '#a3cbe7',
          300: '#75b1db',
          400: '#4797cf',
          500: '#057BB5',
          600: '#0465a0',
          700: '#034f8b',
          800: '#023976',
          900: '#012361',
        },
        secondary: {
          50: '#fff5ed',
          100: '#ffebdb',
          200: '#ffd7b7',
          300: '#ffc393',
          400: '#ffaf6f',
          500: '#FF9E69',
          600: '#ff8a45',
          700: '#ff7621',
          800: '#e6620e',
          900: '#cc5607',
        },
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#eeeeee',
          300: '#d9d9d9',
          400: '#bdbdbd',
          500: '#9e9e9e',
          600: '#757575',
          700: '#626262',
          800: '#424242',
          900: '#212121',
        },
        black: '#000000',
        white: '#ffffff',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
      },
      borderRadius: {
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
};

export default tailwindConfig;
