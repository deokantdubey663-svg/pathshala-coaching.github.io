import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Instagram, MessageCircle, Phone, Award } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

const teachers = [
  {
    name: "Sunil Sir",
    role: "Founder & English Teacher",
    experience: "Teaching since 2012",
    subjects: ["English"],
    classes: "Class 8 to 12",
    description: "The founder of Pathshala, Sunil Sir has been dedicated to teaching English since 2012. He specializes in board exam preparation for classes 8 through 12, with a strong focus on grammar, literature, and communication skills.",
    contact: {
      whatsapp: "6289026660",
    },
    highlights: [
      "Founder of Pathshala",
      "Expert in English language and literature",
      "12+ years of teaching experience",
      "Focused on Madhyamik and HS success",
    ],
    image: null,
  },
  {
    name: "RK Sir",
    fullName: "Ramakrishna Sir",
    role: "Arts Subjects Teacher",
    experience: "Experienced Faculty",
    subjects: ["History", "Geography", "Philosophy", "Education", "Hindi", "EVS"],
    classes: "Class 9 to 12",
    description: "RK Sir (Ramakrishna Sir) teaches all Arts subjects for WBBSE and WBCHSE. His lessons are designed to cover the full board syllabus and help students gain confidence in exams.",
    contact: {
      phone: "6290525782",
      instagram: "sirramakrishna2002",
    },
    highlights: [
      "WBBSE and WBCHSE specialist",
      "Strong performance in board exams",
      "Complete Arts syllabus coverage",
      "Personalized coaching and support",
    ],
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202026-05-21%20at%2023.29.54-esHLHgNm1Dn4hvxA7ub3G6QZgVFP1h.jpeg",
  },
]

export function TeachersSection() {
  return (
    <section id="teachers" className="py-20 md:py-28 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-sm font-medium text-primary uppercase tracking-wider">
            Our Faculty
          </span>
          <h2 className="mt-2 text-3xl md:text-4xl lg:text-5xl font-bold text-foreground font-[var(--font-playfair)] text-balance">
            Meet Our Expert Teachers
          </h2>
          <p className="mt-4 text-muted-foreground">
            Learn from experienced educators who are committed to your academic success
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {teachers.map((teacher, index) => (
            <Card key={index} className="overflow-hidden border-2 hover:border-primary/30 transition-colors">
              <CardContent className="p-0">
                <div className="bg-primary/5 p-8">
                  <div className="flex items-start gap-6">
                    {teacher.image ? (
                      <div className="h-24 w-24 rounded-full overflow-hidden flex-shrink-0 border-4 border-primary/20">
                        <Image
                          src={teacher.image}
                          alt={teacher.name}
                          width={96}
                          height={96}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-3xl font-bold text-primary font-[var(--font-playfair)]">
                          {teacher.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div>
                      <h3 className="text-2xl font-bold text-foreground font-[var(--font-playfair)]">
                        {teacher.name}
                      </h3>
                      {teacher.fullName && (
                        <p className="text-sm text-muted-foreground">({teacher.fullName})</p>
                      )}
                      <p className="text-primary font-medium mt-1">{teacher.role}</p>
                      <p className="text-sm text-muted-foreground mt-1">{teacher.experience}</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-8">
                  <p className="text-muted-foreground leading-relaxed">
                    {teacher.description}
                  </p>
                  
                  <div className="mt-6 flex flex-wrap gap-2">
                    <div className="flex items-center gap-2 bg-secondary px-3 py-1.5 rounded-full">
                      <BookOpen className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">{teacher.classes}</span>
                    </div>
                    {teacher.subjects.map((subject, idx) => (
                      <span 
                        key={idx} 
                        className="bg-muted px-3 py-1.5 rounded-full text-sm text-muted-foreground"
                      >
                        {subject}
                      </span>
                    ))}
                  </div>
                  
                  <div className="mt-6 space-y-2">
                    {teacher.highlights.map((highlight, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <Award className="h-4 w-4 text-accent" />
                        <span>{highlight}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-8 flex flex-wrap gap-3">
                    {teacher.contact.whatsapp && (
                      <Button variant="outline" size="sm" asChild>
                        <Link 
                          href={`https://wa.me/91${teacher.contact.whatsapp}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          WhatsApp
                        </Link>
                      </Button>
                    )}
                    {teacher.contact.phone && (
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`tel:+91${teacher.contact.phone}`}>
                          <Phone className="h-4 w-4 mr-2" />
                          Call
                        </Link>
                      </Button>
                    )}
                    {teacher.contact.instagram && (
                      <Button variant="outline" size="sm" asChild>
                        <Link 
                          href={`https://instagram.com/${teacher.contact.instagram}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Instagram className="h-4 w-4 mr-2" />
                          Instagram
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
