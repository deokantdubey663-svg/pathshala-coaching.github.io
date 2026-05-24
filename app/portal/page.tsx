"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Award,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  FileText,
  LogIn,
  LogOut,
  ShieldCheck,
  Timer,
  Users,
  UserCheck,
} from "lucide-react"
import {
  createApprovedStudentRemote,
  fetchApprovedStudentsRemote,
  loadLocalApprovedStudents,
  saveLocalApprovedStudents,
} from "@/lib/portal-api"

const TEACHER_NUMBERS = ["6289026660", "6290525782", "8240857467"]
const STUDENT_PASSWORD = "2006"
const STORAGE_KEYS = {
  approved: "pathshalaApprovedStudents",
  notifications: "pathshalaApprovalNotifications",
  tests: "pathshalaTests",
  attempts: "pathshalaTestAttempts",
  auth: "pathshalaPortalAuth",
}

type ApprovedStudent = {
  id: string
  studentName: string
  guardianName: string
  phone: string
  email: string
  class: string
  subjects: string
  address: string
  submittedAt: string
  approvedAt: string
}

type TestEntry = {
  id: string
  class: string
  subject: string
  type: string
  startAt: string
  duration: number
  totalMarks: number
  pdfName: string
  createdAt: string
}

type TestAttempt = {
  testId: string
  studentPhone: string
  studentName: string
  class: string
  attemptedAt: string
  note?: string
  marks?: number
  gradedAt?: string
  gradedBy?: string
}

type AuthUser =
  | { role: "teacher"; phone: string }
  | { role: "student"; phone: string; name: string; class: string }

const subjectOptions = [
  "English",
  "Hindi",
  "History",
  "Geography",
  "Philosophy",
  "Education",
  "EVS",
]

function loadStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    return JSON.parse(window.localStorage.getItem(key) ?? JSON.stringify(fallback)) as T
  } catch {
    return fallback
  }
}

export default function PortalPage() {
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null)
  const [activeTab, setActiveTab] = useState("students")
  const [approvedStudents, setApprovedStudents] = useState<ApprovedStudent[]>([])
  const [tests, setTests] = useState<TestEntry[]>([])
  const [attempts, setAttempts] = useState<TestAttempt[]>([])
  const [notifications, setNotifications] = useState<string[]>([])
  const [testForm, setTestForm] = useState({
    class: "Class 8",
    subject: "English",
    type: "MCQ",
    startAt: "",
    duration: 60,
    totalMarks: 50,
    pdfName: "",
  })
  const [attemptNote, setAttemptNote] = useState("")
  const [manualForm, setManualForm] = useState({
    studentName: "",
    guardianName: "",
    phone: "",
    email: "",
    class: "Class 8",
    subjects: "English Only",
    address: "",
  })

  useEffect(() => {
    const loadPortalData = async () => {
      const remoteApproved = await fetchApprovedStudentsRemote()

      if (remoteApproved) {
        setApprovedStudents(remoteApproved)
        saveLocalApprovedStudents(remoteApproved)
      } else {
        setApprovedStudents(loadStorage<ApprovedStudent[]>(STORAGE_KEYS.approved, []))
      }

      setNotifications(loadStorage<string[]>(STORAGE_KEYS.notifications, []))
      setTests(loadStorage<TestEntry[]>(STORAGE_KEYS.tests, []))
      setAttempts(loadStorage<TestAttempt[]>(STORAGE_KEYS.attempts, []))
      const auth = loadStorage<AuthUser | null>(STORAGE_KEYS.auth, null)
      if (auth) {
        setCurrentUser(auth)
      }
    }

    loadPortalData()
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    window.localStorage.setItem(STORAGE_KEYS.approved, JSON.stringify(approvedStudents))
  }, [approvedStudents])

  useEffect(() => {
    if (typeof window === "undefined") return
    window.localStorage.setItem(STORAGE_KEYS.tests, JSON.stringify(tests))
  }, [tests])

  useEffect(() => {
    if (typeof window === "undefined") return
    window.localStorage.setItem(STORAGE_KEYS.attempts, JSON.stringify(attempts))
  }, [attempts])

  useEffect(() => {
    if (typeof window === "undefined") return
    window.localStorage.setItem(STORAGE_KEYS.notifications, JSON.stringify(notifications))
  }, [notifications])

  useEffect(() => {
    if (typeof window === "undefined") return
    if (currentUser) {
      window.localStorage.setItem(STORAGE_KEYS.auth, JSON.stringify(currentUser))
    } else {
      window.localStorage.removeItem(STORAGE_KEYS.auth)
    }
  }, [currentUser])

  useEffect(() => {
    if (typeof window === "undefined") return
    const handleStorage = (event: StorageEvent) => {
      if (!event.key) return

      if (event.key === STORAGE_KEYS.approved) {
        setApprovedStudents(loadStorage<ApprovedStudent[]>(STORAGE_KEYS.approved, []))
      }

      if (event.key === STORAGE_KEYS.tests) {
        setTests(loadStorage<TestEntry[]>(STORAGE_KEYS.tests, []))
      }

      if (event.key === STORAGE_KEYS.attempts) {
        setAttempts(loadStorage<TestAttempt[]>(STORAGE_KEYS.attempts, []))
      }
    }

    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, [currentUser])


  const normalizedPhone = phone.replace(/\D/g, "")

  const handleLogin = async () => {
    if (TEACHER_NUMBERS.includes(normalizedPhone)) {
      setCurrentUser({ role: "teacher", phone: normalizedPhone })
      setMessage("")
      return
    }

    if (password !== STUDENT_PASSWORD) {
      setMessage("Students must use the password provided by their teacher after approval.")
      return
    }

    const approvedList =
      approvedStudents.length > 0
        ? approvedStudents
        : (await fetchApprovedStudentsRemote()) || []

    const approved = approvedList.find((student) => student.phone === normalizedPhone)
    if (!approved) {
      setMessage("No approved student found. Ask your teacher to add your details manually in the portal.")
      return
    }

    setCurrentUser({
      role: "student",
      phone: normalizedPhone,
      name: approved.studentName,
      class: approved.class,
    })
    setMessage("")
  }

  const handleLogout = () => {
    setCurrentUser(null)
    setPhone("")
    setPassword("")
    setMessage("")
    setActiveTab("students")
  }

  const handleManualStudentAdd = async (e: React.FormEvent) => {
    e.preventDefault()

    const newStudent = {
      id: `${Date.now()}`,
      studentName: manualForm.studentName,
      guardianName: manualForm.guardianName,
      phone: manualForm.phone,
      email: manualForm.email,
      class: manualForm.class,
      subjects: manualForm.subjects,
      address: manualForm.address,
      submittedAt: new Date().toISOString(),
      approvedAt: new Date().toISOString(),
    }

    const remoteResult = await createApprovedStudentRemote(newStudent)

    setApprovedStudents((prev) => {
      const alreadyApproved = prev.some((student) => student.phone === newStudent.phone)
      return alreadyApproved ? prev : [newStudent, ...prev]
    })

    const existingApproved = loadLocalApprovedStudents()
    saveLocalApprovedStudents([
      newStudent,
      ...existingApproved.filter((student) => student.phone !== newStudent.phone),
    ])

    if (!remoteResult?.success) {
      setMessage("Student added locally. Remote storage is unavailable or not configured.")
      return
    }

    setManualForm({
      studentName: "",
      guardianName: "",
      phone: "",
      email: "",
      class: "Class 8",
      subjects: "English Only",
      address: "",
    })
    setMessage("Student added manually and is now available in the teacher dashboard.")
  }

  const handleCreateTest = (e: React.FormEvent) => {
    e.preventDefault()
    const newTest: TestEntry = {
      id: `${Date.now()}`,
      class: testForm.class,
      subject: testForm.subject,
      type: testForm.type,
      startAt: testForm.startAt,
      duration: testForm.duration,
      totalMarks: testForm.totalMarks,
      pdfName: testForm.pdfName,
      createdAt: new Date().toISOString(),
    }
    setTests((prev) => [newTest, ...prev])
    setTestForm({
      class: "Class 8",
      subject: "English",
      type: "MCQ",
      startAt: "",
      duration: 60,
      totalMarks: 50,
      pdfName: "",
    })
    setMessage("Test created successfully.")
  }

  const handleAttemptTest = (testId: string) => {
    if (!currentUser || currentUser.role !== "student") return

    const existing = attempts.find(
      (attempt) => attempt.testId === testId && attempt.studentPhone === currentUser.phone
    )
    if (existing) {
      setMessage("You have already marked this test as attempted.")
      return
    }

    const approved = approvedStudents.find((student) => student.phone === currentUser.phone)
    if (!approved) {
      setMessage("No approved student profile found.")
      return
    }

    const attempt: TestAttempt = {
      testId,
      studentPhone: currentUser.phone,
      studentName: approved.studentName,
      class: approved.class,
      attemptedAt: new Date().toISOString(),
      note: attemptNote.trim(),
    }
    setAttempts((prev) => [attempt, ...prev])
    setAttemptNote("")
    setMessage("Test marked as attempted. Your teacher can now grade it.")
  }

  const handleGrade = (testId: string, studentPhone: string, marks: number) => {
    setAttempts((prev) =>
      prev.map((attempt) =>
        attempt.testId === testId && attempt.studentPhone === studentPhone
          ? {
              ...attempt,
              marks,
              gradedAt: new Date().toISOString(),
              gradedBy: currentUser && currentUser.role === "teacher" ? currentUser.phone : undefined,
            }
          : attempt
      )
    )
    setMessage("Marks updated successfully.")
  }

  const handleRemoveStudent = (studentPhone: string) => {
    setApprovedStudents((prev) => prev.filter((student) => student.phone !== studentPhone))
    setAttempts((prev) => prev.filter((attempt) => attempt.studentPhone !== studentPhone))
    setMessage(`Student with phone ${studentPhone} has been removed from the program.`)
  }

  const studentAttempts = useMemo(
    () => attempts.filter((attempt) => attempt.studentPhone === currentUser?.phone),
    [attempts, currentUser]
  )

  const studentClass = currentUser?.role === "student" ? currentUser.class : ""

  const studentTests = useMemo(
    () => tests.filter((test) => test.class === studentClass),
    [tests, studentClass]
  )

  const approvedByClass = useMemo(() => {
    const groups: Record<string, ApprovedStudent[]> = {}
    approvedStudents.forEach((student) => {
      groups[student.class] ??= []
      groups[student.class].push(student)
    })
    return groups
  }, [approvedStudents])

  const now = new Date()

  const renderTeacherDashboard = () => (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent>
            <div className="flex items-center gap-3 mb-4">
              <Users className="h-5 w-5 text-primary" />
              <p className="text-sm font-semibold">Approved Students</p>
            </div>
            <p className="text-3xl font-bold">{approvedStudents.length}</p>
            <p className="text-sm text-muted-foreground">Students added manually</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="flex items-center gap-3 mb-4">
              <FileText className="h-5 w-5 text-primary" />
              <p className="text-sm font-semibold">Created Tests</p>
            </div>
            <p className="text-3xl font-bold">{tests.length}</p>
            <p className="text-sm text-muted-foreground">Assigned by teachers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="flex items-center gap-3 mb-4">
              <Award className="h-5 w-5 text-primary" />
              <p className="text-sm font-semibold">Student Attempts</p>
            </div>
            <p className="text-3xl font-bold">{attempts.length}</p>
            <p className="text-sm text-muted-foreground">Tests attempted</p>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-3xl border border-border bg-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-primary font-semibold">Teacher Panel</p>
            <h2 className="mt-2 text-2xl font-bold text-foreground">Manage students and tests</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant={activeTab === "add" ? "default" : "outline"} onClick={() => setActiveTab("add")}>Add Student</Button>
            <Button variant={activeTab === "students" ? "default" : "outline"} onClick={() => setActiveTab("students")}>Student List</Button>
            <Button variant={activeTab === "tests" ? "default" : "outline"} onClick={() => setActiveTab("tests")}>Create Test</Button>
            <Button variant={activeTab === "grade" ? "default" : "outline"} onClick={() => setActiveTab("grade")}>Grade Tests</Button>
          </div>
        </div>

        <div className="mt-8">
          {activeTab === "add" && (
            <Card className="border">
              <CardHeader>
                <CardTitle>Add a Student Manually</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleManualStudentAdd}>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="studentName">Student Name</Label>
                      <Input
                        id="studentName"
                        value={manualForm.studentName}
                        onChange={(e) => setManualForm({ ...manualForm, studentName: e.target.value })}
                        placeholder="Student full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="guardianName">Guardian Name</Label>
                      <Input
                        id="guardianName"
                        value={manualForm.guardianName}
                        onChange={(e) => setManualForm({ ...manualForm, guardianName: e.target.value })}
                        placeholder="Guardian / parent name"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={manualForm.phone}
                        onChange={(e) => setManualForm({ ...manualForm, phone: e.target.value })}
                        placeholder="Student phone number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={manualForm.email}
                        onChange={(e) => setManualForm({ ...manualForm, email: e.target.value })}
                        placeholder="Student email address"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="class">Class</Label>
                      <select
                        id="class"
                        value={manualForm.class}
                        onChange={(e) => setManualForm({ ...manualForm, class: e.target.value })}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <option>Class 8</option>
                        <option>Class 9</option>
                        <option>Class 10</option>
                        <option>Class 11</option>
                        <option>Class 12</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subjects">Subjects</Label>
                      <Input
                        id="subjects"
                        value={manualForm.subjects}
                        onChange={(e) => setManualForm({ ...manualForm, subjects: e.target.value })}
                        placeholder="English Only"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        value={manualForm.address}
                        onChange={(e) => setManualForm({ ...manualForm, address: e.target.value })}
                        placeholder="Student address"
                      />
                    </div>
                  </div>

                  <Button type="submit">Save Student</Button>
                </form>
              </CardContent>
            </Card>
          )}

          {activeTab === "students" && (
            <div className="space-y-6">
              {Object.entries(approvedByClass).length === 0 ? (
                <Card className="border-dashed border-2 border-border bg-background/60">
                  <CardContent>
                    <p className="text-muted-foreground">No students have been added yet. Use Add Student to add them manually.</p>
                  </CardContent>
                </Card>
              ) : (
                Object.entries(approvedByClass).map(([className, students]) => (
                  <Card key={className} className="border">
                    <CardHeader>
                      <CardTitle>{className} Students ({students.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-3">
                        {students.map((student) => (
                          <div key={student.id} className="rounded-2xl border border-border p-4">
                            <div className="flex flex-col gap-3">
                              <div>
                                <p className="font-semibold">{student.studentName}</p>
                                <p className="text-sm text-muted-foreground">Phone: {student.phone}</p>
                                <p className="text-sm text-muted-foreground">Subjects: {student.subjects}</p>
                              </div>
                              <div className="flex flex-wrap gap-3 items-center">
                                <Button variant="outline" size="sm" onClick={() => handleRemoveStudent(student.phone)}>
                                  Remove from Program
                                </Button>
                              </div>
                            </div>
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
            <Card className="border">
              <CardHeader>
                <CardTitle>Create a New Class Test</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleCreateTest}>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="class">Class</Label>
                      <select
                        id="class"
                        value={testForm.class}
                        onChange={(e) => setTestForm({ ...testForm, class: e.target.value })}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <option>Class 8</option>
                        <option>Class 9</option>
                        <option>Class 10</option>
                        <option>Class 11</option>
                        <option>Class 12</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <select
                        id="subject"
                        value={testForm.subject}
                        onChange={(e) => setTestForm({ ...testForm, subject: e.target.value })}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {subjectOptions.map((subject) => (
                          <option key={subject}>{subject}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Test Type</Label>
                      <select
                        id="type"
                        value={testForm.type}
                        onChange={(e) => setTestForm({ ...testForm, type: e.target.value })}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <option>MCQ</option>
                        <option>Short Test</option>
                        <option>SAQ</option>
                        <option>Long Test</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="startAt">Start Date & Time</Label>
                      <Input
                        id="startAt"
                        type="datetime-local"
                        value={testForm.startAt}
                        onChange={(e) => setTestForm({ ...testForm, startAt: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration (minutes)</Label>
                      <Input
                        id="duration"
                        type="number"
                        value={testForm.duration}
                        min={10}
                        onChange={(e) => setTestForm({ ...testForm, duration: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="totalMarks">Total Marks</Label>
                      <Input
                        id="totalMarks"
                        type="number"
                        value={testForm.totalMarks}
                        min={10}
                        onChange={(e) => setTestForm({ ...testForm, totalMarks: Number(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pdf">Upload Question PDF</Label>
                    <input
                      id="pdf"
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          setTestForm({ ...testForm, pdfName: file.name })
                        }
                      }}
                      className="w-full text-sm text-muted-foreground"
                    />
                    {testForm.pdfName && (
                      <p className="text-sm text-muted-foreground">Uploaded: {testForm.pdfName}</p>
                    )}
                  </div>

                  <Button type="submit">Create Test</Button>
                </form>
              </CardContent>
            </Card>
          )}

          {activeTab === "grade" && (
            <div className="space-y-6">
              {tests.length === 0 ? (
                <Card className="border-dashed border-2 border-border bg-background/60">
                  <CardContent>
                    <p className="text-muted-foreground">Create a test first. Once students attempt it, you can grade their answers here.</p>
                  </CardContent>
                </Card>
              ) : (
                tests.map((test) => {
                  const testAttempts = attempts.filter((attempt) => attempt.testId === test.id)
                  return (
                    <Card key={test.id} className="border">
                      <CardHeader>
                        <CardTitle>{test.class} • {test.subject} • {test.type}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">Starts at: {test.startAt || "Not scheduled"}</p>
                        <p className="text-sm text-muted-foreground">Duration: {test.duration} minutes</p>
                        <p className="text-sm text-muted-foreground">Total Marks: {test.totalMarks}</p>
                        {test.pdfName && <p className="text-sm text-muted-foreground">PDF: {test.pdfName}</p>}

                        <div className="mt-6 space-y-4">
                          {testAttempts.length === 0 ? (
                            <p className="text-muted-foreground">No student has attempted this test yet.</p>
                          ) : (
                            testAttempts.map((attempt) => (
                              <div key={`${test.id}-${attempt.studentPhone}`} className="rounded-2xl border border-border p-4">
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                  <div>
                                    <p className="font-semibold">{attempt.studentName}</p>
                                    <p className="text-sm text-muted-foreground">Phone: {attempt.studentPhone}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm text-muted-foreground">Attempted at</p>
                                    <p>{new Date(attempt.attemptedAt).toLocaleString()}</p>
                                  </div>
                                </div>
                                {attempt.note && <p className="mt-3 text-sm text-muted-foreground">Note: {attempt.note}</p>}
                                <div className="mt-4 grid gap-4 md:grid-cols-3">
                                  <div className="space-y-2">
                                    <Label htmlFor={`marks-${test.id}-${attempt.studentPhone}`}>Marks</Label>
                                    <Input
                                      id={`marks-${test.id}-${attempt.studentPhone}`}
                                      type="number"
                                      min={0}
                                      max={test.totalMarks}
                                      value={attempt.marks ?? ""}
                                      onChange={(e) => {
                                        const marks = Number(e.target.value)
                                        handleGrade(test.id, attempt.studentPhone, marks)
                                      }}
                                    />
                                  </div>
                                  <div className="space-y-2 md:col-span-2">
                                    <Label>Graded by</Label>
                                    <p className="text-sm text-muted-foreground">{attempt.gradedBy ?? "Not graded"}</p>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const renderStudentDashboard = () => (
    <div className="space-y-8">
      <Card>
        <CardContent>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-primary font-semibold">Student Portal</p>
              <h2 className="mt-2 text-2xl font-bold text-foreground">Welcome, {currentUser?.role === "student" ? currentUser.name : "Student"}</h2>
              <p className="text-sm text-muted-foreground">Class: {studentClass} • Login phone: {currentUser?.phone}</p>
            </div>
            <div className="rounded-3xl bg-primary/5 px-4 py-3 text-primary inline-flex items-center gap-2">
              <Timer className="h-5 w-5" />
              <span>Use password 2006 to login</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Available Tests for {studentClass}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {studentTests.length === 0 ? (
              <p className="text-muted-foreground">No tests have been assigned to your class yet.</p>
            ) : (
              studentTests.map((test) => {
                const startTime = test.startAt ? new Date(test.startAt) : null
                const endTime = startTime ? new Date(startTime.getTime() + test.duration * 60000) : null
                const attempt = attempts.find(
                  (item) => item.testId === test.id && item.studentPhone === currentUser?.phone
                )
                const isOpen = startTime ? now >= startTime && now <= (endTime ?? now) : true
                return (
                  <div key={test.id} className="rounded-3xl border border-border p-5">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-foreground">{test.subject} ({test.type})</p>
                        <p className="text-sm text-muted-foreground">Total Marks: {test.totalMarks}</p>
                      </div>
                      <div className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                        {isOpen ? "Open" : startTime ? "Scheduled" : "Ready"}
                      </div>
                    </div>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      <p className="text-sm text-muted-foreground">Starts: {startTime ? startTime.toLocaleString() : "Immediately"}</p>
                      <p className="text-sm text-muted-foreground">Duration: {test.duration} minutes</p>
                    </div>
                    {test.pdfName && <p className="mt-2 text-sm text-muted-foreground">Question PDF: {test.pdfName}</p>}
                    {attempt ? (
                      <div className="mt-4 rounded-2xl bg-primary/5 p-4">
                        <p className="text-sm font-semibold">Attempted</p>
                        {attempt.marks !== undefined ? (
                          <p className="text-sm text-muted-foreground">Marks awarded: {attempt.marks}</p>
                        ) : (
                          <p className="text-sm text-muted-foreground">Waiting for grading.</p>
                        )}
                      </div>
                    ) : (
                      <div className="mt-4 space-y-3">
                        <textarea
                          value={attemptNote}
                          onChange={(e) => setAttemptNote(e.target.value)}
                          placeholder="Optional note for the teacher or short answer summary"
                          className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                        <Button onClick={() => handleAttemptTest(test.id)} disabled={!isOpen}>
                          {isOpen ? "Mark Test Attempted" : "Test Not Open"}
                        </Button>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Grades</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {studentAttempts.length === 0 ? (
              <p className="text-muted-foreground">You have not attempted any tests yet.</p>
            ) : (
              studentAttempts.map((attempt) => (
                <div key={`${attempt.testId}-${attempt.studentPhone}`} className="rounded-2xl border border-border p-4">
                  <p className="font-semibold">{tests.find((test) => test.id === attempt.testId)?.subject || "Unknown Test"}</p>
                  <p className="text-sm text-muted-foreground">Attempted at: {new Date(attempt.attemptedAt).toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Marks: {attempt.marks ?? "Not graded yet"}</p>
                  {attempt.note && <p className="text-sm text-muted-foreground">Teacher note: {attempt.note}</p>}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )

  return (
    <main className="min-h-screen bg-background py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 mb-10 text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-primary font-semibold">Pathshala Portal</p>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground font-[var(--font-playfair)]">Teacher and Student Login</h1>
          <p className="max-w-3xl mx-auto text-muted-foreground">
            Teachers can add students manually, create tests, and grade students. Once a teacher adds a student, that student can login with the phone number and shared password.
          </p>
        </div>

        {message && (
          <div className="mb-6 rounded-3xl border border-primary/30 bg-primary/5 p-4 text-sm text-primary">
            {message}
          </div>
        )}

        {!currentUser ? (
          <Card className="border">
            <CardHeader>
              <CardTitle>Login</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="portal-phone">Phone Number</Label>
                    <Input
                      id="portal-phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="portal-password">Password</Label>
                    <Input
                      id="portal-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter student password"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 items-center">
                  <Button onClick={handleLogin} className="inline-flex items-center gap-2">
                    <LogIn className="h-4 w-4" />
                    Login
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    Teacher logins are phone-based for: 6289026660, 6290525782, 8240857467.
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  If you are a student, use the phone number your teacher added for you and the password shared by the teacher.
                </p>
                <div className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
                  <p className="font-medium">Note</p>
                  <p>
                    Students are added manually by the teacher in this portal. No external enrollment approval is required.
                  </p>
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
                    {currentUser.role === "teacher" ? "Teacher" : currentUser.name} • {currentUser.phone}
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

        <div className="mt-10 text-center text-sm text-muted-foreground">
          <p>
            Students should ask their teacher to add them manually in the portal. Teacher access is phone-based and grants manual student creation.
          </p>
        </div>
      </div>
    </main>
  )
}
