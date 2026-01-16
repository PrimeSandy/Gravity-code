/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    content: [
        "./*.{html,js}",
        "./Base64-Encode-Decode/**/*.html",
        "./E-trax-files/**/*.html",
        "./image-tools/**/*.html",
        "./Password-generator/**/*.html",
        "./Text-Case-Converter/**/*.html",
        "./Word-counter/**/*.html"
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Outfit', 'sans-serif'],
                display: ['Space Grotesk', 'sans-serif'],
            },
            colors: {
                primary: {
                    DEFAULT: "#4f46e5",
                    50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd', 400: '#60a5fa',
                    500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8', 800: '#1e40af', 900: '#1e3a8a',
                    hover: '#4338ca'
                },
                secondary: {
                    DEFAULT: "#818cf8",
                    50: '#f5f3ff', 100: '#ede9fe', 200: '#ddd6fe', 300: '#c4b5fd', 400: '#a78bfa',
                    500: '#8b5cf6', 600: '#7c3aed', 700: '#6d28d9', 800: '#5b21b6', 900: '#4c1d95',
                },
                accent: "#06b6d4",
                "bg-dark": "#030014",
                "card-dark": "rgba(17, 25, 40, 0.7)",
                "card-hover": "rgba(255, 255, 255, 0.1)",
                "border-dark": "rgba(255, 255, 255, 0.08)",
                "text-main": "#f8fafc",
                "text-muted": "#94a3b8",
                "muted-dark": "#94a3b8",
                "background-dark": "#1e293b"
            },
            animation: {
                'blob': 'blob 7s infinite',
                'enter': 'enter 0.5s ease-out forwards',
            },
            keyframes: {
                enter: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                }
            }
        },
    },
    plugins: [
        require('@tailwindcss/forms'),
        require('@tailwindcss/container-queries'),
    ],
}
