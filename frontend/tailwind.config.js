/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            colors: {
                background: '#020617', // slate-950
                surface: '#0f172a',    // slate-900
                primary: {
                    DEFAULT: '#7c3aed', // violet-600
                    hover: '#6d28d9',   // violet-700
                    light: '#8b5cf6',   // violet-500
                    soft: 'rgba(124, 58, 237, 0.1)',
                },
                secondary: {
                    DEFAULT: '#c026d3', // fuchsia-600
                    hover: '#a21caf',   // fuchsia-700
                },
                text: {
                    main: '#e2e8f0',    // slate-200
                    muted: '#94a3b8',   // slate-400
                },
                border: '#1e293b',      // slate-800
            },
            animation: {
                'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
            },
            keyframes: {
                fadeInUp: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
            },
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
}
