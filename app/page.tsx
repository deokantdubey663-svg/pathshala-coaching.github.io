import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { AboutSection } from "@/components/about-section"
import { TeachersSection } from "@/components/teachers-section"
import { SubjectsSection } from "@/components/subjects-section"
import { SyllabusSection } from "@/components/syllabus-section"
import { ClassesSection } from "@/components/classes-section"
import { ResultsSection } from "@/components/results-section"
import { EnrollmentSection } from "@/components/enrollment-section"
import { ContactSection } from "@/components/contact-section"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Header />
      <HeroSection />
      <AboutSection />
      <TeachersSection />
      <SubjectsSection />
      <ClassesSection />
      <SyllabusSection />
      <ResultsSection />
      <EnrollmentSection />
      <ContactSection />
      <Footer />
    </main>
  )
}
