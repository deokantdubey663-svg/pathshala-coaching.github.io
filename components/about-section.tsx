import { CheckCircle } from "lucide-react"
import Image from "next/image"

export function AboutSection() {
  return (
    <section id="about" className="py-20 md:py-28 bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <span className="text-sm font-medium text-primary uppercase tracking-wider">
              About Us
            </span>
            <h2 className="mt-2 text-3xl md:text-4xl lg:text-5xl font-bold text-foreground font-[var(--font-playfair)] text-balance">
              Dedicated to Shaping Young Minds
            </h2>
            <p className="mt-6 text-muted-foreground leading-relaxed">
              Founded in 2012 by Sunil Sir, Pathshala has been a beacon of quality education 
              in Bhadreshwar, Hooghly, West Bengal. We specialize in preparing students for 
              WBBSE (Madhyamik) and WBCHSE (Higher Secondary) examinations with a focus on 
              building strong fundamentals and conceptual clarity.
            </p>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Our small batch sizes ensure personalized attention, while our experienced 
              faculty brings years of teaching expertise to help every student reach their 
              full potential.
            </p>
            
            <ul className="mt-8 space-y-4">
              {[
                "Personalized attention with small batch sizes",
                "Expert faculty with 10+ years experience",
                "Comprehensive coverage of WBBSE & WBCHSE syllabus",
                "Regular tests and performance tracking",
                "Affordable fee structure",
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="relative flex items-center justify-center">
            <div className="relative bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-8 md:p-12">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202026-05-21%20at%2023.34.01-kuMFZzsiL0Rk1buDgTtjnZ67W3AUMg.jpeg"
                alt="Pathshala - An Institute Upto H.S Since 2012"
                width={400}
                height={400}
                className="w-64 h-64 md:w-80 md:h-80 object-contain mx-auto"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 bg-primary text-primary-foreground p-6 rounded-xl shadow-lg hidden md:block">
              <div className="text-4xl font-bold">2012</div>
              <div className="text-sm opacity-90">Since</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
