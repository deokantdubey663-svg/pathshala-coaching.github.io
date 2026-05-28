import type { Metadata } from 'next'
import { Geist, Geist_Mono, Playfair_Display } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const geist = Geist({ 
  subsets: ["latin"],
  variable: '--font-geist-sans'
});

const geistMono = Geist_Mono({ 
  subsets: ["latin"],
  variable: '--font-geist-mono'
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: '--font-playfair'
});

export const metadata: Metadata = {
  metadataBase: new URL('https://pathshala-coaching.in'),
  title: {
    default: 'Pathshala Coaching | Best English & Arts Coaching in Bhadreshwar, Hooghly',
    template: '%s | Pathshala Coaching'
  },
  description: 'Pathshala Coaching - Premier coaching institute in Bhadreshwar, Hooghly, West Bengal. Specialized in English and Arts subjects for WBBSE & WBCHSE students (Class 8-12). Expert teachers, proven results, and personalized attention.',
  keywords: [
    'Pathshala Coaching',
    'Coaching classes Bhadreshwar',
    'English coaching Hooghly',
    'Arts subjects West Bengal',
    'WBBSE coaching',
    'WBCHSE coaching',
    'Class 8 to 12 coaching',
    'Best coaching Bhadreshwar',
    'English tuition Bhadreshwar',
    'Arts tuition Hooghly',
    'Education Bhadreshwar',
    'Private tuition West Bengal'
  ],
  authors: [{ name: 'Pathshala Coaching Institute' }],
  creator: 'Pathshala Coaching',
  publisher: 'Pathshala Coaching Institute',
  manifest: '/manifest.json',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://pathshala-coaching.in',
    siteName: 'Pathshala Coaching',
    title: 'Pathshala Coaching | Best English & Arts Coaching in Bhadreshwar',
    description: 'Premier coaching institute in Bhadreshwar, Hooghly. Specialized in English and Arts for WBBSE & WBCHSE students.',
    images: [
      {
        url: 'https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg?auto=compress&cs=tinysrgb&w=1200',
        width: 1200,
        height: 630,
        alt: 'Pathshala Coaching Institute - Quality Education in Bhadreshwar',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@pathshala_coaching',
    title: 'Pathshala Coaching | Best English & Arts Coaching in Bhadreshwar',
    description: 'Premier coaching institute in Bhadreshwar, Hooghly. Specialized in English and Arts for WBBSE & WBCHSE students.',
    images: ['https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg?auto=compress&cs=tinysrgb&w=1200'],
  },
  alternates: {
    canonical: 'https://pathshala-coaching.in',
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png' },
      { url: '/apple-icon-180.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  verification: {
    google: 'google-site-verification-code',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background">
      <head>
        <meta name="application-name" content="Pathshala Coaching App" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Pathshala" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#0f766e" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#0f766e" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/apple-icon-152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-icon-180.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/apple-icon-167.png" />
      </head>
      <body className={`${geist.variable} ${geistMono.variable} ${playfair.variable} font-sans antialiased`}>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('Pathshala SW registered: ', registration.scope);
                    },
                    function(err) {
                      console.log('Pathshala SW registration failed: ', err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
