import typography from '@tailwindcss/typography';

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
                // Base
                background: '#020617', // slate-950 (legacy)
                surface: '#0f172a',    // slate-900 (legacy)

                // --- SEMANTIC TOKENS (Strict) ---
                // Backgrounds
                'app': '#0B0E14',           // Deep Dark
                'surface-solid': '#151921', // Card Solid
                'surface-glass': 'rgba(21, 25, 33, 0.6)', // Card Glass (Apply backdrop-blur-md utility)
                'surface-hover': '#1e2330', // Interactive Hover

                // Borders
                'border-subtle': 'rgba(255, 255, 255, 0.05)',
                'border-highlight': 'rgba(255, 255, 255, 0.1)',
                'border-accent': 'rgba(124, 58, 237, 0.3)', // Violet hint

                // Text
                'primary': '#F9FAFB',       // White 95%
                'secondary': '#9CA3AF',     // Gray 60%
                'muted': 'rgba(148, 163, 184, 0.6)', // Slate 40%

                // Brand
                'accent': '#7c3aed',        // Violet-600
                'success': '#10B981',       // Emerald-500

                // Legacy (Keep for non-refactored pages for now)
                'brand-primary': '#7c3aed',
                'brand-secondary': '#10B981',
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
        typography,
    ],
}
