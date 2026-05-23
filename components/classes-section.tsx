import { BookOpen, CalendarDays, GraduationCap } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const classPlans = [
  {
    title: "Class 8",
    description: "Strong English foundation with board-style practice and writing skills.",
    subjects: ["English"],
    board: "WBBSE preparation starts here",
  },
  {
    title: "Class 9",
    description: "WBBSE Arts preparation begins with History, Geography, Hindi and EVS.",
    subjects: ["English", "History", "Geography", "Hindi", "EVS"],
    board: "WBBSE Arts + English",
  },
  {
    title: "Class 10",
    description: "Madhyamik board guidance for Arts students with complete syllabus support.",
    subjects: ["English", "History", "Geography", "Hindi", "EVS"],
    board: "WBBSE Madhyamik",
  },
  {
    title: "Class 11",
    description: "WBCHSE Arts subjects with strong chapter-wise coverage and exam strategy.",
    subjects: ["English", "History", "Geography", "Philosophy", "Education", "Hindi", "EVS"],
    board: "WBCHSE Higher Secondary",
  },
  {
    title: "Class 12",
    description: "Full board preparation for HS exams and test practice for sustained success.",
    subjects: ["English", "History", "Geography", "Philosophy", "Education", "Hindi", "EVS"],
    board: "WBCHSE Higher Secondary",
  },
]

export function ClassesSection() {
  return (
    <section className="py-20 md:py-28 bg-muted/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-sm font-medium text-primary uppercase tracking-wider">
            Class Plans
          </span>
          <h2 className="mt-2 text-3xl md:text-4xl lg:text-5xl font-bold text-foreground font-[var(--font-playfair)] text-balance">
            Classes 8 to 12 with Full Subject Coverage
          </h2>
          <p className="mt-4 text-muted-foreground">
            Study with Pathshala across all classes and receive chapter-wise guidance for every subject.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {classPlans.map((item) => (
            <Card key={item.title} className="border hover:border-primary/40 transition-all">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                    {item.title === "Class 8" ? (
                      <CalendarDays className="h-5 w-5" />
                    ) : (
                      <GraduationCap className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] font-semibold text-primary">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.board}</p>
                  </div>
                </div>
                <p className="text-foreground font-semibold mb-4">{item.description}</p>
                <div className="flex flex-wrap gap-2">
                  {item.subjects.map((subject) => (
                    <span key={subject} className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
                      {subject}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-10 text-center text-sm text-muted-foreground">
          <p>
            Pathshala offers personalized coaching, exam practice and full syllabus coverage for every class from 8 through 12.
          </p>
        </div>
      </div>
    </section>
  )
}
