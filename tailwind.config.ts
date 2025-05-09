
import type { Config } from "tailwindcss";

export default {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}", // This includes (app) group
  ],
  theme: {
  	extend: {
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
        'input-border': 'hsl(var(--input-border))', 
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			},
        'plan-node-bg': 'hsl(var(--plan-node-bg))',
        'plan-node-text': 'hsl(var(--plan-node-text))',
        'plan-node-border': 'hsl(var(--plan-node-border))',
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		fontFamily: {
        sans: ['var(--font-inter)'],
        mono: ['var(--font-roboto-mono)'],
      },
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		},
      typography: (theme: (path: string) => string) => ({
        DEFAULT: {
          css: {
            // Default prose styles (effectively dark theme now)
            '--tw-prose-body': theme('colors.foreground'), // Light gray text
            '--tw-prose-headings': theme('colors.foreground'),
            '--tw-prose-lead': theme('colors.foreground'),
            '--tw-prose-links': theme('colors.primary.DEFAULT'), // Green links
            '--tw-prose-bold': theme('colors.foreground'),
            '--tw-prose-counters': theme('colors.muted.foreground'),
            '--tw-prose-bullets': theme('colors.muted.foreground'),
            '--tw-prose-hr': theme('colors.border'),
            '--tw-prose-quotes': theme('colors.foreground'),
            '--tw-prose-quote-borders': theme('colors.primary.DEFAULT'),
            '--tw-prose-captions': theme('colors.muted.foreground'),
            '--tw-prose-code': theme('colors.foreground'), // Monospace code text color
            '--tw-prose-pre-code': theme('colors.foreground'),
            '--tw-prose-pre-bg': theme('colors.secondary.DEFAULT'), // Background for code blocks (darker blue)
            '--tw-prose-th-borders': theme('colors.border'),
            '--tw-prose-td-borders': theme('colors.border'),
            
            // Inverted prose styles (for light theme context if dark:prose-invert is used, or if 'dark' class is removed from html)
            // These ensure readability on a light background.
            '--tw-prose-invert-body': theme('colors.card.foreground'), // This was theme('colors.background') before for invert, which was wrong
                                                                   // Now this will be light gray text, which is also not good for light background.
                                                                   // It should be a dark text for light backgrounds.
                                                                   // Let's use a specific dark text. The initial theme had `card-foreground: 0 0% 10.8%;` for light theme.
                                                                   // Since we removed light theme variables, we define it here or use a generic dark text.
                                                                   // For now, using a hardcoded darkish gray if card-foreground is light.
                                                                   // The card-foreground is `hsl(0, 0%, 90%)` which is light.
                                                                   // So `--tw-prose-invert-body` should be something like `hsl(0, 0%, 20%)`
                                                                   // Let's assume `text-foreground` of the body of light theme was `hsl(0 0% 10.8%)`.
            // Corrected Invert Colors (for light backgrounds, when 'dark:prose-invert' is active on a light background element, or 'prose' on light html)
            // Since dark is default, 'dark:prose-invert' means we ARE in dark mode and want to apply inverted (light text) styles.
            // The initial request was about unreadable white font in PREVIEW. Preview bg is `bg-input`.
            // In dark mode, `bg-input` is dark. `dark:prose-invert` is active. We need light text.
            // `--tw-prose-invert-body` should be light. `theme('colors.foreground')` is correct (light gray).

            // Let's trace:
            // HTML class="dark"
            // MarkdownRenderer -> `prose dark:prose-invert`
            // `dark:prose-invert` is active. It uses `--tw-prose-invert-*` variables.
            // So, `--tw-prose-invert-body` should be light colored. `theme('colors.foreground')` is light gray (good).
            // And `--tw-prose-body` (used if NOT `dark:prose-invert`) should be dark colored.
            // `theme('hsl(0,0%,20%)')` or a specific dark text variable.
            // Original light theme `card-foreground` was `0 0% 10.8%`.
            
            // Base prose (used when `dark:prose-invert` is NOT active, e.g., if you had a light section in dark mode)
            // This should be dark text on light background.
            '--tw-prose-body': 'hsl(0, 0%, 20%)', // Dark gray for body text
            '--tw-prose-headings': 'hsl(0, 0%, 15%)', // Slightly darker for headings
            '--tw-prose-lead': 'hsl(0, 0%, 25%)',
            '--tw-prose-links': theme('colors.primary.DEFAULT'), // Green links
            '--tw-prose-bold': 'hsl(0, 0%, 15%)',
            '--tw-prose-counters': 'hsl(0, 0%, 40%)',
            '--tw-prose-bullets': 'hsl(0, 0%, 40%)',
            '--tw-prose-hr': theme('colors.border'), // Use dark theme border, or a light theme one like `hsl(0,0%,85%)`
            '--tw-prose-quotes': 'hsl(0, 0%, 20%)',
            '--tw-prose-quote-borders': theme('colors.primary.DEFAULT'),
            '--tw-prose-captions': 'hsl(0, 0%, 40%)',
            '--tw-prose-code': 'hsl(0, 0%, 20%)',
            '--tw-prose-pre-code': 'hsl(0, 0%, 20%)',
            '--tw-prose-pre-bg': 'hsl(0, 0%, 92%)', // Light gray background for code blocks
            '--tw-prose-th-borders': 'hsl(0,0%,80%)',
            '--tw-prose-td-borders': 'hsl(0,0%,80%)',

            // Inverted prose (used when `dark:prose-invert` is active, i.e. for dark backgrounds)
            '--tw-prose-invert-body': theme('colors.foreground'), // Light gray from dark theme
            '--tw-prose-invert-headings': theme('colors.foreground'),
            '--tw-prose-invert-lead': theme('colors.foreground'),
            '--tw-prose-invert-links': theme('colors.primary.DEFAULT'),
            '--tw-prose-invert-bold': theme('colors.foreground'),
            '--tw-prose-invert-counters': theme('colors.muted.foreground'),
            '--tw-prose-invert-bullets': theme('colors.muted.foreground'),
            '--tw-prose-invert-hr': theme('colors.border'),
            '--tw-prose-invert-quotes': theme('colors.foreground'),
            '--tw-prose-invert-quote-borders': theme('colors.primary.DEFAULT'),
            '--tw-prose-invert-captions': theme('colors.muted.foreground'),
            '--tw-prose-invert-code': theme('colors.foreground'),
            '--tw-prose-invert-pre-code': theme('colors.foreground'),
            '--tw-prose-invert-pre-bg': theme('colors.secondary.DEFAULT'), // Darker blue bg for code blocks
            '--tw-prose-invert-th-borders': theme('colors.border'),
            '--tw-prose-invert-td-borders': theme('colors.border'),
          },
        },
        sm: { 
          css: {
             p: { marginTop: '0.25em', marginBottom: '0.25em' },
             h1: { marginTop: '0.5em', marginBottom: '0.25em' },
             h2: { marginTop: '0.4em', marginBottom: '0.2em' },
             h3: { marginTop: '0.3em', marginBottom: '0.1em' },
             ul: { marginTop: '0.25em', marginBottom: '0.25em' },
             li: { marginTop: '0.1em', marginBottom: '0.1em' },
          }
        },
      }),
  	}
  },
  plugins: [require("tailwindcss-animate"), require('@tailwindcss/typography')],
} satisfies Config;
