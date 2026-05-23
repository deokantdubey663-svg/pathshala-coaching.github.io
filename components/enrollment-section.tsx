"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle, Loader2 } from "lucide-react"

export function EnrollmentSection() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    studentName: "",
    guardianName: "",
    phone: "",
    email: "",
    class: "",
    subjects: "",
    address: "",
  })
  const [statusPhone, setStatusPhone] = useState("")
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Create WhatsApp message
    const message = `*New Enrollment Request - Pathshala*
    
*Student Name:* ${formData.studentName}
*Guardian Name:* ${formData.guardianName}
*Phone:* ${formData.phone}
*Email:* ${formData.email || "Not provided"}
*Class:* ${formData.class}
*Subjects:* ${formData.subjects}
*Address:* ${formData.address || "Not provided"}`

    const enrollmentRequest = {
      id: `${Date.now()}`,
      studentName: formData.studentName,
      guardianName: formData.guardianName,
      phone: formData.phone,
      email: formData.email,
      class: formData.class,
      subjects: formData.subjects,
      address: formData.address,
      submittedAt: new Date().toISOString(),
    }

    const existingRequests = JSON.parse(window.localStorage.getItem("pathshalaEnrollments") || "[]")
    window.localStorage.setItem(
      "pathshalaEnrollments",
      JSON.stringify([...existingRequests, enrollmentRequest])
    )

    // Send to RK Sir's number (6290525782) or alternate (8240857467)
    const whatsappUrl = `https://wa.me/916290525782?text=${encodeURIComponent(message)}`
    
    // Simulate submission delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setIsSubmitting(false)
    setIsSubmitted(true)
    
    // Open WhatsApp
    window.open(whatsappUrl, "_blank")
  }

  const checkApprovalStatus = () => {
    const cleanedPhone = statusPhone.replace(/\D/g, "")
    if (!cleanedPhone) {
      setStatusMessage("Please enter your registered phone number to check approval status.")
      return
    }

    if (typeof window === "undefined") return
    const approvedList = JSON.parse(window.localStorage.getItem("pathshalaApprovedStudents") || "[]")
    const approved = approvedList.find((student: any) => student.phone === cleanedPhone)

    if (approved) {
      setStatusMessage(
        `Approved! ${approved.studentName}'s enrollment is confirmed. Please login to the portal using your registered phone number.`
      )
    } else {
      setStatusMessage("Your enrollment has not been approved yet. Please wait for teacher approval.")
    }
  }

  if (isSubmitted) {
    return (
      <section id="enroll" className="py-20 md:py-28 bg-card">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="border-2 border-primary">
            <CardContent className="p-8 md:p-12 text-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground font-[var(--font-playfair)]">
                Enrollment Request Submitted!
              </h3>
              <p className="mt-4 text-muted-foreground">
                Thank you for your interest in Pathshala. Your enrollment request has been sent via WhatsApp. 
                We will contact you shortly to complete the admission process.
              </p>
              <p className="mt-4 text-sm text-muted-foreground">
                If WhatsApp did not open, please call us directly at{" "}
                <a href="tel:+916290525782" className="text-primary font-medium">6290525782</a> or{" "}
                <a href="tel:+918240857467" className="text-primary font-medium">8240857467</a>
              </p>
              <Button 
                className="mt-6"
                onClick={() => {
                  setIsSubmitted(false)
                  setFormData({
                    studentName: "",
                    guardianName: "",
                    phone: "",
                    email: "",
                    class: "",
                    subjects: "",
                    address: "",
                  })
                }}
              >
                Submit Another Request
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    )
  }

  return (
    <section id="enroll" className="py-20 md:py-28 bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          <div>
            <span className="text-sm font-medium text-primary uppercase tracking-wider">
              Join Us
            </span>
            <h2 className="mt-2 text-3xl md:text-4xl lg:text-5xl font-bold text-foreground font-[var(--font-playfair)] text-balance">
              Start Your Learning Journey Today
            </h2>
            <p className="mt-6 text-muted-foreground leading-relaxed">
              Take the first step towards academic excellence. Fill out the enrollment form 
              and join our community of successful students. Our team will contact you 
              to guide you through the admission process.
            </p>
            
            <div className="mt-8 space-y-4">
              <div className="bg-primary/5 p-4 rounded-lg">
                <h4 className="font-semibold text-foreground">Enrollment Notifications</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Your enrollment request will be sent to our admissions team via WhatsApp for quick processing.
                </p>
              </div>
              <div className="bg-primary/5 p-4 rounded-lg">
                <h4 className="font-semibold text-foreground">Contact for Admissions</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Phone: <a href="tel:+916290525782" className="text-primary">6290525782</a> (RK Sir)<br />
                  Alternate: <a href="tel:+918240857467" className="text-primary">8240857467</a>
                </p>
              </div>
              <div className="bg-primary/5 p-4 rounded-lg">
                <h4 className="font-semibold text-foreground">Email</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  <a href="mailto:deokantdubey663@gmail.com" className="text-primary">
                    deokantdubey663@gmail.com
                  </a>
                </p>
              </div>
              <div className="bg-secondary/5 p-4 rounded-lg">
                <h4 className="font-semibold text-foreground">Portal Approval</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  After submitting this enrollment request, teachers can approve your registration from the portal. Once approved, students can login using their registered phone number.
                </p>
              </div>
              <div className="bg-secondary/5 p-4 rounded-lg">
                <h4 className="font-semibold text-foreground">Approval Status</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Enter your registered phone number to check whether your enrollment has been approved.
                </p>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <Input
                    type="tel"
                    placeholder="Registered phone number"
                    value={statusPhone}
                    onChange={(e) => setStatusPhone(e.target.value)}
                  />
                  <Button variant="outline" onClick={checkApprovalStatus}>
                    Check Status
                  </Button>
                </div>
                {statusMessage && (
                  <p className="mt-3 text-sm text-foreground">{statusMessage}</p>
                )}
              </div>
            </div>
          </div>

          <Card className="border-2">
            <CardHeader>
              <CardTitle className="font-[var(--font-playfair)]">Enrollment Form</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="studentName">Student Name *</Label>
                  <Input
                    id="studentName"
                    name="studentName"
                    placeholder="Enter student's full name"
                    value={formData.studentName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guardianName">Guardian Name *</Label>
                  <Input
                    id="guardianName"
                    name="guardianName"
                    placeholder="Enter parent/guardian name"
                    value={formData.guardianName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="Enter phone number"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email (Optional)</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter email address"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="class">Class *</Label>
                    <select
                      id="class"
                      name="class"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={formData.class}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select class</option>
                      <option value="Class 8">Class 8</option>
                      <option value="Class 9">Class 9</option>
                      <option value="Class 10">Class 10 (Madhyamik)</option>
                      <option value="Class 11">Class 11</option>
                      <option value="Class 12">Class 12 (HS)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subjects">Subjects *</Label>
                    <select
                      id="subjects"
                      name="subjects"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={formData.subjects}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select subjects</option>
                      <option value="English Only">English Only</option>
                      <option value="Arts Subjects Only">Arts Subjects Only</option>
                      <option value="English + Arts">English + Arts Subjects</option>
                      <option value="All Subjects">All Available Subjects</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address (Optional)</Label>
                  <textarea
                    id="address"
                    name="address"
                    rows={3}
                    placeholder="Enter your address"
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Enrollment Request"
                  )}
                </Button>
                
                <p className="text-xs text-muted-foreground text-center">
                  By submitting this form, you agree to be contacted regarding admission.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
