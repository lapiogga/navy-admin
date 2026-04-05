/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  corePlugins: {
    preflight: false, // antd CSS reset과 충돌 방지
  },
  theme: {
    extend: {},
  },
  plugins: [],
}
