import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BookOpen, GraduationCap, Users } from "lucide-react"
import Image from "next/image"

const logoImg = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202026-05-21%20at%2023.34.01-kuMFZzsiL0Rk1buDgTtjnZ67W3AUMg.jpeg"

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16 md:pt-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_0.9fr] items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <GraduationCap className="h-4 w-4" />
              <span>An Institute Upto H.S Since 2012</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground font-[var(--font-playfair)] leading-tight text-balance">
              Excellence in Education, <span className="text-primary">Foundation for Success</span>
            </h1>

            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed text-pretty">
              Pathshala is a premier coaching institute in Bhadreshwar, Hooghly, West Bengal,
              dedicated to nurturing students from Class 8 to 12 in English and Arts subjects
              for WBBSE and WBCHSE board examinations.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild className="w-full sm:w-auto">
                <Link href="#enroll">Start Your Journey</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="w-full sm:w-auto">
                <Link href="#teachers">Meet Our Teachers</Link>
              </Button>
            </div>

            <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
              <div className="flex flex-col items-center gap-2 p-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <span className="text-3xl font-bold text-foreground">12+</span>
                <span className="text-sm text-muted-foreground">Years of Excellence</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <span className="text-3xl font-bold text-foreground">500+</span>
                <span className="text-sm text-muted-foreground">Students Taught</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <GraduationCap className="h-6 w-6 text-primary" />
                </div>
                <span className="text-3xl font-bold text-foreground">2</span>
                <span className="text-sm text-muted-foreground">Expert Teachers</span>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[2rem] border border-border/10 bg-white/90 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent" />
            <Image
              src={logoImg}
              alt="Pathshala Coaching Logo"
              width={560}
              height={560}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
