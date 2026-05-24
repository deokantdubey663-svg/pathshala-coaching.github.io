"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Award,
  ExternalLink,
  FileText,
  LogIn,
  LogOut,
  Timer,
  Users,
  UserCheck,
} from "lucide-react"
import {
  fetchApprovedStudents,
  fetchApprovedStudentByPhone,
  addApprovedStudent,
  removeApprovedStudent,
  fetchTests,
  fetchTestsByClass,
  createTest,
  updateTestStatus,
  fetchTestAttempts,
  fetchAttemptsByStudent,
  addTestAttempt,
  updateAttemptMarks,
  type ApprovedStudent,
  type Test,
  type TestAttempt,
} from "@/lib/supabase"

const TEACHER_NUMBERS = ["6289026660", "6290525782", "8240857467"]
const STUDENT_PASSWORD = "2006"

const AUTH_KEY = "pathshalaPortalAuth"

const subjectOptions = [
  "English",
  "Hindi",
  "History",
  "Geography",
  "Philosophy",
  "Education",
  "EVS",
]

type AuthUser =
  | { role: "teacher"; phone: string }
  | { role: "student"; phone: string; name: string; class: string }

function loadAuth(): AuthUser | null {
  if (typeof window === "undefined") return null
  try {
    const raw = sessionStorage.getItem(AUTH_KEY)
    return raw ? (JSON.parse(raw) as AuthUser) : null
  } catch {
    return null
  }
}

function saveAuth(user: AuthUser | null) {
  if (typeof window === "undefined") return
  if (user) {
    sessionStorage.setItem(AUTH_KEY, JSON.stringify(user))
  } else {
    sessionStorage.removeItem(AUTH_KEY)
  }
}

export default function PortalPage() {
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null)
  const [activeTab, setActiveTab] = useState("students")

  // Data
  const [approvedStudents, setApprovedStudents] = useState<ApprovedStudent[]>([])
  const [tests, setTests] = useState<Test[]>([])
  const [attempts, setAttempts] = useState<TestAttempt[]>([])

  // Loading states
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [loadingTests, setLoadingTests] = useState(false)

  // Forms
  const [testForm, setTestForm] = useState({
    class: "Class 8",
    subject: "English",
    type: "MCQ",
    title: "",
    start_at: "",
    duration: 60,
    total_marks: 50,
    pdf_url: "",
  })
  const [manualForm, setManualForm] = useState({
    student_name: "",
    guardian_name: "",
    phone: "",
    email: "",
    class: "Class 8",
    subjects: "English Only",
    address: "",
  })
  const [attemptNote, setAttemptNote] = useState<Record<string, string>>({})
  const [gradingMarks, setGradingMarks] = useState<Record<string, string>>({})

  // Restore auth from session
  useEffect(() => {
    const auth = loadAuth()
    if (auth) setCurrentUser(auth)
  }, [])

  // Load data for teachers
  const loadTeacherData = useCallback(async () => {
    setLoadingStudents(true)
    setLoadingTests(true)
    const [students, allTests, allAttempts] = await Promise.all([
      fetchApprovedStudents(),
      fetchTests(),
      fetchTestAttempts(),
    ])
    setApprovedStudents(students)
    setTests(allTests)
    setAttempts(allAttempts)
    setLoadingStudents(false)
    setLoadingTests(false)
  }, [])

  // Load data for students
  const loadStudentData = useCallback(async (studentPhone: string, studentClass: string) => {
    setLoadingTests(true)
    const [classTests, studentAttempts] = await Promise.all([
      fetchTestsByClass(studentClass),
      fetchAttemptsByStudent(studentPhone),
    ])
    setTests(classTests)
    setAttempts(studentAttempts)
    setLoadingTests(false)
  }, [])

  useEffect(() => {
    if (!currentUser) return
    if (currentUser.role === "teacher") {
      loadTeacherData()
      // Poll every 15s for cross-device sync
      const interval = setInterval(loadTeacherData, 15000)
      return () => clearInterval(interval)
    } else {
      loadStudentData(currentUser.phone, currentUser.class)
    }
  }, [currentUser, loadTeacherData, loadStudentData])

  const handleLogin = async () => {
    const normalizedPhone = phone.replace(/\D/g, "")
    if (TEACHER_NUMBERS.includes(normalizedPhone)) {
      const user: AuthUser = { role: "teacher", phone: normalizedPhone }
      setCurrentUser(user)
      saveAuth(user)
      setMessage("")
      return
    }

    if (password !== STUDENT_PASSWORD) {
      setMessage("Students must use the password provided by their teacher.")
      return
    }

    const approved = await fetchApprovedStudentByPhone(normalizedPhone)
    if (!approved) {
      setMessage("No registered student found. Ask your teacher to add your phone number in the portal.")
      return
    }

    const user: AuthUser = {
      role: "student",
      phone: normalizedPhone,
      name: approved.student_name,
      class: approved.class,
    }
    setCurrentUser(user)
    saveAuth(user)
    setMessage("")
  }

  const handleLogout = () => {
    setCurrentUser(null)
    saveAuth(null)
    setPhone("")
    setPassword("")
    setMessage("")
    setActiveTab("students")
    setApprovedStudents([])
    setTests([])
    setAttempts([])
  }

  const handleManualStudentAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    const now = new Date().toISOString()
    const result = await addApprovedStudent({
      student_name: manualForm.student_name,
      guardian_name: manualForm.guardian_name,
      phone: manualForm.phone.replace(/\D/g, ""),
      email: manualForm.email,
      class: manualForm.class,
      subjects: manualForm.subjects,
      address: manualForm.address,
      submitted_at: now,
      approved_at: now,
    })

    if (result) {
      setMessage("Student added successfully and is now visible on all devices.")
      await loadTeacherData()
      setManualForm({
        student_name: "",
        guardian_name: "",
        phone: "",
        email: "",
        class: "Class 8",
        subjects: "English Only",
        address: "",
      })
    } else {
      setMessage("Failed to add student. Please try again.")
    }
  }

  const handleRemoveStudent = async (studentPhone: string) => {
    const ok = await removeApprovedStudent(studentPhone)
    if (ok) {
      setApprovedStudents((prev) => prev.filter((s) => s.phone !== studentPhone))
      setMessage("Student removed.")
    } else {
      setMessage("Failed to remove student.")
    }
  }

  const handleCreateTest = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await createTest({
      class: testForm.class,
      subject: testForm.subject,
      type: testForm.type,
      title: testForm.title || `${testForm.subject} ${testForm.type}`,
      start_at: testForm.start_at || null,
      duration: testForm.duration,
      total_marks: testForm.total_marks,
      pdf_url: testForm.pdf_url,
      status: "active",
    })

    if (result) {
      setMessage("Test created successfully.")
      await loadTeacherData()
      setTestForm({
        class: "Class 8",
        subject: "English",
        type: "MCQ",
        title: "",
        start_at: "",
        duration: 60,
        total_marks: 50,
        pdf_url: "",
      })
    } else {
      setMessage("Failed to create test.")
    }
  }

  const handleCloseTest = async (testId: string) => {
    const ok = await updateTestStatus(testId, "completed")
    if (ok) {
      setTests((prev) => prev.map((t) => t.id === testId ? { ...t, status: "completed" } : t))
      setMessage("Test closed. You can now grade student submissions.")
    }
  }

  const handleGradeSubmit = async (test: Test) => {
    const testAttempts = attempts.filter((a) => a.test_id === test.id)
    let allGraded = true

    for (const attempt of testAttempts) {
      const key = `${test.id}-${attempt.student_phone}`
      const marksStr = gradingMarks[key]
      if (marksStr !== undefined && marksStr !== "") {
        const marks = Number(marksStr)
        if (!isNaN(marks)) {
          await updateAttemptMarks(test.id, attempt.student_phone, marks, currentUser?.phone ?? "teacher")
        }
      } else if (attempt.marks === null) {
        allGraded = false
      }
    }

    if (allGraded || testAttempts.length === 0) {
      await updateTestStatus(test.id, "graded", new Date().toISOString())
      setMessage("Results published. Test is now hidden from the teacher panel.")
    } else {
      setMessage("Marks saved. Grade remaining students before publishing.")
    }

    await loadTeacherData()
    setGradingMarks({})
  }

  const handleAttemptTest = async (testId: string) => {
    if (!currentUser || currentUser.role !== "student") return
    const already = attempts.find((a) => a.test_id === testId && a.student_phone === currentUser.phone)
    if (already) {
      setMessage("You have already submitted this test.")
      return
    }
    const result = await addTestAttempt({
      test_id: testId,
      student_phone: currentUser.phone,
      student_name: currentUser.name,
      class: currentUser.class,
      attempted_at: new Date().toISOString(),
      note: attemptNote[testId] ?? "",
      marks: null,
      graded_at: null,
      graded_by: null,
    })
    if (result) {
      setAttempts((prev) => [...prev, result])
      setAttemptNote((prev) => ({ ...prev, [testId]: "" }))
      setMessage("Test submitted. Your teacher will grade it soon.")
    }
  }

  // Derived data
  const approvedByClass = useMemo(() => {
    const groups: Record<string, ApprovedStudent[]> = {}
    approvedStudents.forEach((s) => {
      groups[s.class] ??= []
      groups[s.class].push(s)
    })
    return groups
  }, [approvedStudents])

  const activeTests = useMemo(() => tests.filter((t) => t.status === "active"), [tests])
  const completedTests = useMemo(() => tests.filter((t) => t.status === "completed"), [tests])

  const studentActiveTests = useMemo(() => {
    if (!currentUser || currentUser.role !== "student") return []
    return activeTests
  }, [activeTests, currentUser])

  const studentGradedResults = useMemo(() => {
    if (!currentUser || currentUser.role !== "student") return []
    return tests
      .filter((t) => t.status === "graded")
      .map((t) => {
        const attempt = attempts.find((a) => a.test_id === t.id && a.student_phone === currentUser.phone)
        return { test: t, attempt }
      })
      .filter((r) => r.attempt)
  }, [tests, attempts, currentUser])

  // Teacher dashboard
  const renderTeacherDashboard = () => (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent>
            <div className="flex items-center gap-3 mb-4">
              <Users className="h-5 w-5 text-primary" />
              <p className="text-sm font-semibold">Students</p>
            </div>
            <p className="text-3xl font-bold">{approvedStudents.length}</p>
            <p className="text-sm text-muted-foreground">Enrolled students</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="flex items-center gap-3 mb-4">
              <FileText className="h-5 w-5 text-primary" />
              <p className="text-sm font-semibold">Active Tests</p>
            </div>
            <p className="text-3xl font-bold">{activeTests.length}</p>
            <p className="text-sm text-muted-foreground">Open for students</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="flex items-center gap-3 mb-4">
              <Award className="h-5 w-5 text-primary" />
              <p className="text-sm font-semibold">Pending Grading</p>
            </div>
            <p className="text-3xl font-bold">{completedTests.length}</p>
            <p className="text-sm text-muted-foreground">Tests awaiting grades</p>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-3xl border border-border bg-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-primary font-semibold">Teacher Panel</p>
            <h2 className="mt-2 text-2xl font-bold text-foreground">Manage students and tests</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {(["add", "students", "tests", "grade"] as const).map((tab) => (
              <Button key={tab} variant={activeTab === tab ? "default" : "outline"} onClick={() => setActiveTab(tab)}>
                {tab === "add" ? "Add Student" : tab === "students" ? "Student List" : tab === "tests" ? "Create Test" : "Grade Tests"}
              </Button>
            ))}
          </div>
        </div>

        {activeTab === "add" && (
          <Card className="border">
            <CardHeader><CardTitle>Add a Student Manually</CardTitle></CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleManualStudentAdd}>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Student Name</Label>
                    <Input value={manualForm.student_name} onChange={(e) => setManualForm({ ...manualForm, student_name: e.target.value })} placeholder="Full name" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Guardian Name</Label>
                    <Input value={manualForm.guardian_name} onChange={(e) => setManualForm({ ...manualForm, guardian_name: e.target.value })} placeholder="Parent / guardian" />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input value={manualForm.phone} onChange={(e) => setManualForm({ ...manualForm, phone: e.target.value })} placeholder="Student phone" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={manualForm.email} onChange={(e) => setManualForm({ ...manualForm, email: e.target.value })} placeholder="Email (optional)" />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Class</Label>
                    <select value={manualForm.class} onChange={(e) => setManualForm({ ...manualForm, class: e.target.value })} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      {["Class 8","Class 9","Class 10","Class 11","Class 12"].map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Subjects</Label>
                    <select value={manualForm.subjects} onChange={(e) => setManualForm({ ...manualForm, subjects: e.target.value })} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      <option>English Only</option>
                      <option>Arts Only</option>
                      <option>All Subjects</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Address</Label>
                    <Input value={manualForm.address} onChange={(e) => setManualForm({ ...manualForm, address: e.target.value })} placeholder="Address" />
                  </div>
                </div>
                <Button type="submit">Save Student</Button>
              </form>
            </CardContent>
          </Card>
        )}

        {activeTab === "students" && (
          <div className="space-y-6">
            {loadingStudents ? (
              <p className="text-muted-foreground">Loading students...</p>
            ) : Object.keys(approvedByClass).length === 0 ? (
              <Card className="border-dashed border-2">
                <CardContent><p className="text-muted-foreground">No students added yet.</p></CardContent>
              </Card>
            ) : (
              Object.entries(approvedByClass).map(([cls, students]) => (
                <Card key={cls} className="border">
                  <CardHeader><CardTitle>{cls} ({students.length})</CardTitle></CardHeader>
                  <CardContent>
                    <div className="grid gap-3">
                      {students.map((s) => (
                        <div key={s.id} className="rounded-2xl border border-border p-4 flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold">{s.student_name}</p>
                            <p className="text-sm text-muted-foreground">Phone: {s.phone}</p>
                            <p className="text-sm text-muted-foreground">Subjects: {s.subjects}</p>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => handleRemoveStudent(s.phone)}>Remove</Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {activeTab === "tests" && (
          <div className="space-y-6">
            <Card className="border">
              <CardHeader><CardTitle>Create a New Test</CardTitle></CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleCreateTest}>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Test Title</Label>
                      <Input value={testForm.title} onChange={(e) => setTestForm({ ...testForm, title: e.target.value })} placeholder="e.g. Chapter 3 MCQ Test" />
                    </div>
                    <div className="space-y-2">
                      <Label>Class</Label>
                      <select value={testForm.class} onChange={(e) => setTestForm({ ...testForm, class: e.target.value })} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                        {["Class 8","Class 9","Class 10","Class 11","Class 12"].map((c) => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label>Subject</Label>
                      <select value={testForm.subject} onChange={(e) => setTestForm({ ...testForm, subject: e.target.value })} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                        {subjectOptions.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Test Type</Label>
                      <select value={testForm.type} onChange={(e) => setTestForm({ ...testForm, type: e.target.value })} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                        {["MCQ","Short Test","SAQ","Long Test"].map((t) => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Start Date &amp; Time</Label>
                      <Input type="datetime-local" value={testForm.start_at} onChange={(e) => setTestForm({ ...testForm, start_at: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Duration (minutes)</Label>
                      <Input type="number" min={10} value={testForm.duration} onChange={(e) => setTestForm({ ...testForm, duration: Number(e.target.value) })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Total Marks</Label>
                      <Input type="number" min={1} value={testForm.total_marks} onChange={(e) => setTestForm({ ...testForm, total_marks: Number(e.target.value) })} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Question Paper URL (Google Drive / PDF link)</Label>
                    <Input value={testForm.pdf_url} onChange={(e) => setTestForm({ ...testForm, pdf_url: e.target.value })} placeholder="https://drive.google.com/file/d/..." />
                    <p className="text-xs text-muted-foreground">Students will see a button to open this link directly.</p>
                  </div>
                  <Button type="submit">Create Test</Button>
                </form>
              </CardContent>
            </Card>

            {/* Active tests list */}
            {activeTests.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Active Tests</h3>
                {activeTests.map((test) => (
                  <Card key={test.id} className="border">
                    <CardContent className="pt-4">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <p className="font-semibold">{test.title}</p>
                          <p className="text-sm text-muted-foreground">{test.class} &bull; {test.subject} &bull; {test.type} &bull; {test.total_marks} marks</p>
                          <p className="text-sm text-muted-foreground">Attempts: {attempts.filter((a) => a.test_id === test.id).length}</p>
                        </div>
                        <Button variant="outline" onClick={() => handleCloseTest(test.id)}>
                          Close Test &amp; Start Grading
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "grade" && (
          <div className="space-y-6">
            {completedTests.length === 0 ? (
              <Card className="border-dashed border-2">
                <CardContent><p className="text-muted-foreground">No tests pending grading. Close an active test first.</p></CardContent>
              </Card>
            ) : (
              completedTests.map((test) => {
                const testAttempts = attempts.filter((a) => a.test_id === test.id)
                return (
                  <Card key={test.id} className="border">
                    <CardHeader>
                      <CardTitle>{test.title} &mdash; {test.class} &bull; {test.subject}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">Total Marks: {test.total_marks} &bull; {testAttempts.length} submission(s)</p>
                      {testAttempts.length === 0 ? (
                        <div className="space-y-3">
                          <p className="text-muted-foreground">No submissions yet.</p>
                          <Button onClick={() => handleGradeSubmit(test)}>Publish Results (No Submissions)</Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {testAttempts.map((attempt) => {
                            const key = `${test.id}-${attempt.student_phone}`
                            return (
                              <div key={key} className="rounded-2xl border border-border p-4">
                                <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
                                  <div>
                                    <p className="font-semibold">{attempt.student_name}</p>
                                    <p className="text-sm text-muted-foreground">Phone: {attempt.student_phone} &bull; {attempt.class}</p>
                                    <p className="text-sm text-muted-foreground">Submitted: {new Date(attempt.attempted_at).toLocaleString()}</p>
                                    {attempt.note && <p className="text-sm text-muted-foreground">Note: {attempt.note}</p>}
                                  </div>
                                  {attempt.marks !== null && (
                                    <div className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                                      {attempt.marks}/{test.total_marks}
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center gap-3">
                                  <Label>Marks</Label>
                                  <Input
                                    type="number"
                                    min={0}
                                    max={test.total_marks}
                                    className="w-32"
                                    placeholder={attempt.marks !== null ? String(attempt.marks) : "Enter marks"}
                                    value={gradingMarks[key] ?? (attempt.marks !== null ? String(attempt.marks) : "")}
                                    onChange={(e) => setGradingMarks((prev) => ({ ...prev, [key]: e.target.value }))}
                                  />
                                </div>
                              </div>
                            )
                          })}
                          <Button onClick={() => handleGradeSubmit(test)}>
                            Save Marks &amp; Publish Results
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        )}
      </div>
    </div>
  )

  const renderStudentDashboard = () => {
    if (!currentUser || currentUser.role !== "student") return null
    return (
      <div className="space-y-8">
        <Card>
          <CardContent>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-primary font-semibold">Student Portal</p>
                <h2 className="mt-2 text-2xl font-bold text-foreground">Welcome, {currentUser.name}</h2>
                <p className="text-sm text-muted-foreground">Class: {currentUser.class} &bull; Phone: {currentUser.phone}</p>
              </div>
              <div className="rounded-3xl bg-primary/5 px-4 py-3 text-primary inline-flex items-center gap-2">
                <Timer className="h-5 w-5" />
                <span>Password: 2006</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Active Tests */}
          <Card>
            <CardHeader><CardTitle>Active Tests for {currentUser.class}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {loadingTests ? (
                <p className="text-muted-foreground">Loading tests...</p>
              ) : studentActiveTests.length === 0 ? (
                <p className="text-muted-foreground">No active tests at the moment.</p>
              ) : (
                studentActiveTests.map((test) => {
                  const attempt = attempts.find((a) => a.test_id === test.id && a.student_phone === currentUser.phone)
                  const startTime = test.start_at ? new Date(test.start_at) : null
                  const endTime = startTime ? new Date(startTime.getTime() + test.duration * 60000) : null
                  const now = new Date()
                  const isOpen = startTime ? (now >= startTime && now <= (endTime ?? now)) : true
                  return (
                    <div key={test.id} className="rounded-3xl border border-border p-5 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-foreground">{test.title}</p>
                          <p className="text-sm text-muted-foreground">{test.subject} &bull; {test.type} &bull; {test.total_marks} marks</p>
                          {startTime && <p className="text-sm text-muted-foreground">Starts: {startTime.toLocaleString()}</p>}
                          <p className="text-sm text-muted-foreground">Duration: {test.duration} min</p>
                        </div>
                        <div className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                          {isOpen ? "Open" : "Scheduled"}
                        </div>
                      </div>

                      {/* Question paper link */}
                      {test.pdf_url && (
                        <a
                          href={test.pdf_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/20 transition-colors"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Open Question Paper
                        </a>
                      )}

                      {attempt ? (
                        <div className="rounded-2xl bg-primary/5 p-3">
                          <p className="text-sm font-semibold">Submitted</p>
                          <p className="text-sm text-muted-foreground">
                            {attempt.marks !== null ? `Marks: ${attempt.marks}/${test.total_marks}` : "Waiting for grading..."}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <textarea
                            value={attemptNote[test.id] ?? ""}
                            onChange={(e) => setAttemptNote((prev) => ({ ...prev, [test.id]: e.target.value }))}
                            placeholder="Optional: add a note for your teacher"
                            className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          />
                          <Button onClick={() => handleAttemptTest(test.id)} disabled={!isOpen}>
                            {isOpen ? "Submit Test Attempt" : "Test Not Open Yet"}
                          </Button>
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </CardContent>
          </Card>

          {/* My Results */}
          <Card>
            <CardHeader><CardTitle>My Results</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {studentGradedResults.length === 0 ? (
                <p className="text-muted-foreground">No results yet. Results appear here after your teacher publishes grades.</p>
              ) : (
                studentGradedResults.map(({ test, attempt }) => (
                  <div key={test.id} className="rounded-2xl border border-border p-4">
                    <p className="font-semibold text-foreground">{test.title}</p>
                    <p className="text-sm text-muted-foreground">{test.subject} &bull; {test.type} &bull; {test.class}</p>
                    {attempt && (
                      <>
                        <p className="text-sm text-muted-foreground">Attempted: {new Date(attempt.attempted_at).toLocaleDateString()}</p>
                        <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1">
                          <Award className="h-4 w-4 text-primary" />
                          <span className="text-sm font-bold text-primary">
                            {attempt.marks !== null ? `${attempt.marks} / ${test.total_marks}` : "Not graded"}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 mb-10 text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-primary font-semibold">Pathshala Portal</p>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground font-[var(--font-playfair)]">Teacher and Student Login</h1>
          <p className="max-w-3xl mx-auto text-muted-foreground">
            Teachers manage students and tests from any device. Students view tests, open question papers, and track their results over time.
          </p>
        </div>

        {message && (
          <div className="mb-6 rounded-3xl border border-primary/30 bg-primary/5 p-4 text-sm text-primary">
            {message}
          </div>
        )}

        {!currentUser ? (
          <Card className="border max-w-xl mx-auto">
            <CardHeader><CardTitle>Login</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Enter phone number" />
                </div>
                <div className="space-y-2">
                  <Label>Password (students only)</Label>
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Student password" />
                </div>
                <Button onClick={handleLogin} className="inline-flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Login
                </Button>
                <div className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground space-y-1">
                  <p className="font-medium">How to login</p>
                  <p>Teachers: enter your phone number only (no password needed).</p>
                  <p>Students: enter your registered phone number and the password shared by your teacher.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3 rounded-3xl bg-primary/5 px-5 py-4">
                <UserCheck className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Logged in as</p>
                  <p className="font-semibold text-foreground">
                    {currentUser.role === "teacher" ? "Teacher" : currentUser.name} &bull; {currentUser.phone}
                  </p>
                </div>
              </div>
              <Button variant="outline" onClick={handleLogout} className="inline-flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>

            {currentUser.role === "teacher" ? renderTeacherDashboard() : renderStudentDashboard()}
          </div>
        )}
      </div>
    </main>
  )
}
