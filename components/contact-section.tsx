import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Instagram, Mail, MapPin, MessageCircle, Phone } from "lucide-react"
import Link from "next/link"

export function ContactSection() {
  return (
    <section id="contact" className="py-20 md:py-28 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-sm font-medium text-primary uppercase tracking-wider">
            Get in Touch
          </span>
          <h2 className="mt-2 text-3xl md:text-4xl lg:text-5xl font-bold text-foreground font-[var(--font-playfair)] text-balance">
            Contact Us
          </h2>
          <p className="mt-4 text-muted-foreground">
            Have questions? Reach out to us through any of the following channels
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Location</h3>
              <p className="text-sm text-muted-foreground">
                Bhadreshwar, Hooghly<br />
                West Bengal, India
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Phone className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Phone</h3>
              <p className="text-sm text-muted-foreground">
                <a href="tel:+916290525782" className="hover:text-primary transition-colors">
                  6290525782 (RK Sir)
                </a>
                <br />
                <a href="tel:+918240857467" className="hover:text-primary transition-colors">
                  8240857467
                </a>
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Email</h3>
              <p className="text-sm text-muted-foreground">
                <a 
                  href="mailto:deokantdubey663@gmail.com" 
                  className="hover:text-primary transition-colors break-all"
                >
                  deokantdubey663@gmail.com
                </a>
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Instagram className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Instagram</h3>
              <p className="text-sm text-muted-foreground">
                <a 
                  href="https://instagram.com/sirramakrishna2002"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  @sirramakrishna2002
                </a>
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold mb-2 font-[var(--font-playfair)]">
                WhatsApp Sunil Sir
              </h3>
              <p className="text-sm opacity-90 mb-4">
                For English classes and general inquiries
              </p>
              <Button variant="secondary" asChild>
                <Link 
                  href="https://wa.me/916289026660"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Chat on WhatsApp
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-accent text-accent-foreground">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold mb-2 font-[var(--font-playfair)]">
                Call/WhatsApp RK Sir
              </h3>
              <p className="text-sm opacity-90 mb-4">
                For Arts subjects and admissions
              </p>
              <div className="flex flex-wrap gap-3">
                <Button variant="secondary" asChild>
                  <Link href="tel:+916290525782">
                    <Phone className="h-4 w-4 mr-2" />
                    Call Now
                  </Link>
                </Button>
                <Button variant="secondary" asChild>
                  <Link 
                    href="https://wa.me/916290525782"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    WhatsApp
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
