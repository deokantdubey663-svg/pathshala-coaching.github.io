import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, FileText, GraduationCap, Languages } from "lucide-react"

const subjects = [
  {
    category: "English",
    teacher: "Sunil Sir",
    classes: "Class 8 - 12",
    icon: Languages,
    items: [
      "English Literature",
      "English Grammar",
      "Writing Skills",
      "Reading Comprehension",
      "Board Exam Practice",
    ],
  },
  {
    category: "Arts Subjects (WBBSE)",
    teacher: "RK Sir",
    classes: "Class 9 - 10",
    icon: BookOpen,
    items: [
      "History",
      "Geography",
      "Hindi",
      "English Communication",
      "EVS",
    ],
  },
  {
    category: "Arts Subjects (WBCHSE)",
    teacher: "RK Sir",
    classes: "Class 11 - 12",
    icon: FileText,
    items: [
      "History",
      "Geography",
      "Philosophy",
      "Education",
      "Hindi",
      "EVS",
    ],
  },
]

const boards = [
  {
    name: "WBBSE",
    fullName: "West Bengal Board of Secondary Education",
    exam: "Madhyamik Pariksha",
    classes: "Class 9 & 10",
    icon: GraduationCap,
  },
  {
    name: "WBCHSE",
    fullName: "West Bengal Council of Higher Secondary Education",
    exam: "Uccha Madhyamik Pariksha",
    classes: "Class 11 & 12",
    icon: GraduationCap,
  },
]

export function SubjectsSection() {
  return (
    <section id="subjects" className="py-20 md:py-28 bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-sm font-medium text-primary uppercase tracking-wider">
            What We Teach
          </span>
          <h2 className="mt-2 text-3xl md:text-4xl lg:text-5xl font-bold text-foreground font-[var(--font-playfair)] text-balance">
            Comprehensive Subject Coverage
          </h2>
          <p className="mt-4 text-muted-foreground">
            Complete preparation for WBBSE and WBCHSE board examinations
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-12">
          {boards.map((board, index) => (
            <Card key={index} className="bg-primary text-primary-foreground">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary-foreground/10 flex items-center justify-center">
                    <board.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{board.name}</h3>
                    <p className="text-sm opacity-90">{board.fullName}</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-4 text-sm">
                  <span className="bg-primary-foreground/10 px-3 py-1 rounded-full">
                    {board.exam}
                  </span>
                  <span className="bg-primary-foreground/10 px-3 py-1 rounded-full">
                    {board.classes}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <subject.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-1">
                  {subject.category}
                </h3>
                <p className="text-sm text-primary font-medium">
                  {subject.teacher} | {subject.classes}
                </p>
                <ul className="mt-4 space-y-2">
                  {subject.items.map((item, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
