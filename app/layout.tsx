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
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
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
      <body className={`${geist.variable} ${geistMono.variable} ${playfair.variable} font-sans antialiased`}>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
