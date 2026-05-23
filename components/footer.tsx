import Link from "next/link"
import { Instagram, Mail, MapPin, MessageCircle, Phone } from "lucide-react"
import Image from "next/image"

const logoSrc = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202026-05-21%20at%2023.34.01-kuMFZzsiL0Rk1buDgTtjnZ67W3AUMg.jpeg"

export function Footer() {
  return (
    <footer className="bg-foreground text-background py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-3">
              <Image
                src={logoSrc}
                alt="Pathshala Logo"
                width={56}
                height={56}
                className="h-14 w-14 object-contain bg-white rounded-lg p-1"
              />
              <div>
                <span className="text-2xl font-bold font-[var(--font-playfair)] block">
                  Pathshala
                </span>
                <span className="text-xs text-background/70">An Institute Upto H.S Since 2012</span>
              </div>
            </Link>
            <p className="mt-4 text-background/70 max-w-md leading-relaxed">
              A premier coaching institute in Bhadreshwar, Hooghly, West Bengal, 
              dedicated to academic excellence since 2012. Preparing students for 
              WBBSE and WBCHSE board examinations.
            </p>
            <div className="mt-6 flex items-center gap-4">
              <Link 
                href="https://wa.me/916289026660"
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 w-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-background/20 transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle className="h-5 w-5" />
              </Link>
              <Link 
                href="https://instagram.com/sirramakrishna2002"
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 w-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-background/20 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </Link>
              <Link 
                href="mailto:deokantdubey663@gmail.com"
                className="h-10 w-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-background/20 transition-colors"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </Link>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link href="#about" className="text-background/70 hover:text-background transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="#teachers" className="text-background/70 hover:text-background transition-colors">
                  Our Teachers
                </Link>
              </li>
              <li>
                <Link href="#subjects" className="text-background/70 hover:text-background transition-colors">
                  Subjects
                </Link>
              </li>
              <li>
                <Link href="#results" className="text-background/70 hover:text-background transition-colors">
                  Results
                </Link>
              </li>
              <li>
                <Link href="#enroll" className="text-background/70 hover:text-background transition-colors">
                  Enroll Now
                </Link>
              </li>
              <li>
                <Link href="/portal" className="text-background/70 hover:text-background transition-colors">
                  Student Portal
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-4">Contact Info</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <span className="text-background/70">
                  Bhadreshwar, Hooghly<br />
                  West Bengal, India
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 flex-shrink-0" />
                <div className="text-background/70">
                  <a href="tel:+916290525782" className="hover:text-background transition-colors block">
                    6290525782
                  </a>
                  <a href="tel:+918240857467" className="hover:text-background transition-colors block">
                    8240857467
                  </a>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 flex-shrink-0" />
                <a 
                  href="mailto:deokantdubey663@gmail.com" 
                  className="text-background/70 hover:text-background transition-colors break-all"
                >
                  deokantdubey663@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-background/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-background/50 text-sm">
            {new Date().getFullYear()} Pathshala. All rights reserved.
          </p>
          <p className="text-background/50 text-sm">
            Quality Education Since 2012
          </p>
        </div>
      </div>
    </footer>
  )
}
