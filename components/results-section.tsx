import { Card, CardContent } from "@/components/ui/card"
import { Award, Trophy, Star, Medal } from "lucide-react"
import Image from "next/image"

const toppers2026 = [
  { rank: 1, name: "Shivesh Choudhury", marks: 431, school: "Adarsh Sramik Vidyamandir" },
  { rank: 2, name: "Binay Kumar Shaw", marks: 431, school: "Adarsh Sramik Vidyamandir" },
  { rank: 3, name: "Roshan Kumar Ram", marks: 422, school: "Adarsh Sramik Vidyamandir" },
  { rank: 4, name: "Mrinal Singh", marks: 423, school: "Chourihari Haridan" },
  { rank: 5, name: "Subham Kumar Patwa", marks: 391, school: "Adarsh Sramik Vidyamandir" },
  { rank: 6, name: "Rohit Thakur", marks: 385, school: "Adarsh Sramik Vidyamandir" },
  { rank: 7, name: "Sohan Paswan", marks: 384, school: "Adarsh Sramik Vidyamandir" },
  { rank: 8, name: "Ragini Kumari Yadav", marks: 383, school: "Mahatma Gandhi" },
  { rank: 9, name: "Sanjana Kumari Poddar", marks: 380, school: "Vivekananda" },
  { rank: 10, name: "Mukesh Ram", marks: 370, school: "Adarsh Sramik Vidyamandir" },
  { rank: 11, name: "Sagar Basfore", marks: 370, school: "Pearl Rosary" },
  { rank: 12, name: "Shreya Rajbhar", marks: 366, school: "Mahatma Gandhi" },
  { rank: 13, name: "Anjali Yadav", marks: 364, school: "Arya Vidhyapeeth" },
  { rank: 14, name: "Sneha Singh", marks: 361, school: "Mahatma Gandhi" },
  { rank: 15, name: "Nandini Prasad", marks: 354, school: "Seosraphuli Vivekanand" },
  { rank: 16, name: "Prity Shaw", marks: 350, school: "Chondal Para Sastri" },
  { rank: 17, name: "Dev Kumar Singh", marks: 347, school: "Adarsh Sramik Vidyamandir" },
  { rank: 18, name: "OMM Nayak", marks: 344, school: "Adarsh Sramik Vidyamandir" },
  { rank: 19, name: "Aankita Shaw", marks: 343, school: "Arya Vidhyapith" },
  { rank: 20, name: "Rohan Kumar Prasad", marks: 343, school: "Adarsh Sramik Vidyamandir" },
]

export function ResultsSection() {
  return (
    <section id="results" className="py-20 md:py-28 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-sm font-medium text-primary uppercase tracking-wider">
            Our Achievements
          </span>
          <h2 className="mt-2 text-3xl md:text-4xl lg:text-5xl font-bold text-foreground font-[var(--font-playfair)] text-balance">
            Student Results & Success Stories
          </h2>
          <p className="mt-4 text-muted-foreground">
            Celebrating the achievements of our students in board examinations
          </p>
        </div>

        <div className="bg-primary/5 rounded-2xl p-8 md:p-12 mb-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold text-primary">90%+</div>
              <div className="text-sm text-muted-foreground mt-1">Pass Rate</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-primary">50+</div>
              <div className="text-sm text-muted-foreground mt-1">First Division</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-primary">20+</div>
              <div className="text-sm text-muted-foreground mt-1">Star Marks</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-primary">500+</div>
              <div className="text-sm text-muted-foreground mt-1">Students Taught</div>
            </div>
          </div>
        </div>

        {/* 2026 HS Results Highlight */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <Trophy className="h-8 w-8 text-accent" />
            <h3 className="text-2xl md:text-3xl font-bold text-foreground font-[var(--font-playfair)]">
              H.S Examination 2026 Toppers
            </h3>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Results Poster Image */}
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="relative aspect-[3/4] w-full">
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/41b7f460-5748-474a-89da-beee9196722d-ilaTGeBkZ3nSijiE88Elpkqf71DhuH.jpg"
                    alt="Pathshala HS Examination 2026 Toppers"
                    fill
                    className="object-contain"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Top 3 Students Highlight */}
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-accent/20 to-primary/20 rounded-2xl p-6 md:p-8">
                <h4 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                  <Star className="h-5 w-5 text-accent" />
                  Top 3 Achievers
                </h4>
                <div className="space-y-4">
                  {toppers2026.slice(0, 3).map((student, index) => (
                    <div 
                      key={index} 
                      className="flex items-center gap-4 bg-background rounded-xl p-4"
                    >
                      <div className={`h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                        index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-amber-600'
                      }`}>
                        <Medal className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">{student.name}</p>
                        <p className="text-sm text-muted-foreground">{student.school}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">{student.marks}</p>
                        <p className="text-xs text-muted-foreground">Marks</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Full Results Table */}
              <Card>
                <CardContent className="p-0">
                  <div className="p-4 border-b border-border">
                    <h4 className="font-semibold text-foreground flex items-center gap-2">
                      <Award className="h-5 w-5 text-primary" />
                      Complete Results 2026
                    </h4>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    <table className="w-full">
                      <thead className="bg-muted sticky top-0">
                        <tr>
                          <th className="text-left p-3 text-sm font-medium text-muted-foreground">Rank</th>
                          <th className="text-left p-3 text-sm font-medium text-muted-foreground">Name</th>
                          <th className="text-right p-3 text-sm font-medium text-muted-foreground">Marks</th>
                        </tr>
                      </thead>
                      <tbody>
                        {toppers2026.map((student, index) => (
                          <tr key={index} className="border-b border-border last:border-0">
                            <td className="p-3 text-sm font-medium text-foreground">{student.rank}.</td>
                            <td className="p-3 text-sm text-foreground">{student.name}</td>
                            <td className="p-3 text-sm text-right font-semibold text-primary">{student.marks}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Motivational Quote */}
        <div className="bg-primary text-primary-foreground rounded-2xl p-8 md:p-12 text-center">
          <p className="text-xl md:text-2xl font-medium mb-2">
            {"\"मेहनत, लगन और सही मार्गदर्शन से\""}
          </p>
          <p className="text-2xl md:text-3xl font-bold font-[var(--font-playfair)]">
            {"टॉपर आप ही होंगे!"}
          </p>
          <p className="mt-4 text-primary-foreground/80">
            With hard work, dedication, and right guidance - You will be the topper!
          </p>
        </div>
      </div>
    </section>
  )
}
