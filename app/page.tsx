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

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "EducationalOrganization",
      "@id": "https://pathshala-coaching.in/#organization",
      "name": "Pathshala Coaching",
      "alternateName": "Pathshala Coaching Institute",
      "url": "https://pathshala-coaching.in",
      "logo": {
        "@type": "ImageObject",
        "url": "https://pathshala-coaching.in/icon.svg",
        "width": 600,
        "height": 60
      },
      "description": "Premier coaching institute in Bhadreshwar, Hooghly, West Bengal specializing in English and Arts subjects for WBBSE and WBCHSE students.",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Bhadreshwar",
        "addressLocality": "Bhadreshwar, Hooghly",
        "addressRegion": "West Bengal",
        "postalCode": "712502",
        "addressCountry": "IN"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": "22.8167",
        "longitude": "88.0333"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+91-9876543210",
        "contactType": "customer service",
        "areaServed": "IN",
        "availableLanguage": ["English", "Bengali", "Hindi"]
      },
      "sameAs": [
        "https://www.facebook.com/pathshalacoaching",
        "https://www.instagram.com/pathshala_coaching"
      ],
      "openingHours": "Mo-Sa 08:00-20:00",
      "priceRange": "₹₹"
    },
    {
      "@type": "WebSite",
      "@id": "https://pathshala-coaching.in/#website",
      "url": "https://pathshala-coaching.in",
      "name": "Pathshala Coaching",
      "description": "Quality education for English and Arts subjects",
      "publisher": {
        "@id": "https://pathshala-coaching.in/#organization"
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://pathshala-coaching.in/?s={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@type": "WebPage",
      "@id": "https://pathshala-coaching.in/#webpage",
      "url": "https://pathshala-coaching.in",
      "name": "Pathshala Coaching | Best English & Arts Coaching in Bhadreshwar",
      "isPartOf": {
        "@id": "https://pathshala-coaching.in/#website"
      },
      "about": {
        "@id": "https://pathshala-coaching.in/#organization"
      },
      "description": "Premier coaching institute in Bhadreshwar, Hooghly specializing in English and Arts subjects for WBBSE and WBCHSE students from Class 8 to 12.",
      "inLanguage": "en-IN"
    },
    {
      "@type": "Course",
      "name": "English Coaching Classes",
      "description": "Comprehensive English coaching for WBBSE and WBCHSE students",
      "provider": {
        "@type": "EducationalOrganization",
        "name": "Pathshala Coaching",
        "@id": "https://pathshala-coaching.in/#organization"
      },
      "educationalLevel": "Secondary and Higher Secondary"
    },
    {
      "@type": "Course",
      "name": "Arts Subjects Coaching",
      "description": "Expert coaching in Arts subjects including History, Geography, Political Science for WBBSE and WBCHSE",
      "provider": {
        "@type": "EducationalOrganization",
        "name": "Pathshala Coaching",
        "@id": "https://pathshala-coaching.in/#organization"
      },
      "educationalLevel": "Secondary and Higher Secondary"
    }
  ]
}

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
    </>
  )
}
