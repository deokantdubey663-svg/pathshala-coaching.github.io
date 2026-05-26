"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Head from "next/head"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Award, Bell, ExternalLink, FileText, Circle as HelpCircle, LogIn, LogOut, Megaphone, MessageSquare, Timer, Users, UserCheck, Send, Lock, CircleAlert as AlertCircle, CircleCheck as CheckCircle, Clock } from "lucide-react"
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
  fetchDoubts,
  fetchDoubtsByStudent,
  addDoubt,
  answerDoubt,
  fetchAnnouncements,
  fetchAnnouncementsByClass,
  createAnnouncement,
  deleteAnnouncement,
  fetchNotificationsByStudent,
  type ApprovedStudent,
  type Test,
  type TestAttempt,
  type Doubt,
  type Announcement,
  type Notification,
} from "@/lib/supabase"

const TEACHER_NUMBERS = ["6289026660", "6290525782", "8240857467"]
const STUDENT_PASSWORD = "2006"
const AUTH_KEY = "pathshalaPortalAuth"

// AES-256 encryption for one-on-one doubt privacy
const ENCRYPTION_KEY = "pathshala2026securekey!@#$%^&*()"

async function encryptText(plaintext: string): Promise<{ encrypted: string; iv: string }> {
  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(ENCRYPTION_KEY.slice(0, 32)),
    { name: "AES-GCM" },
    false,
    ["encrypt"]
  )
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    keyMaterial,
    encoder.encode(plaintext)
  )
  return {
    encrypted: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
    iv: btoa(String.fromCharCode(...iv)),
  }
}

async function decryptText(encrypted: string, iv: string): Promise<string> {
  try {
    const encoder = new TextEncoder()
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      encoder.encode(ENCRYPTION_KEY.slice(0, 32)),
      { name: "AES-GCM" },
      false,
      ["decrypt"]
    )
    const encryptedBytes = Uint8Array.from(atob(encrypted), (c) => c.charCodeAt(0))
    const ivBytes = Uint8Array.from(atob(iv), (c) => c.charCodeAt(0))
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: ivBytes },
      keyMaterial,
      encryptedBytes
    )
    return new TextDecoder().decode(decrypted)
  } catch {
    return "[Decryption error]"
  }
}

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

// Convert datetime-local value to a proper UTC ISO string.
// The datetime-local input gives "2026-05-26T14:00" with no timezone.
// JavaScript's new Date() treats this as LOCAL browser time, which is correct.
// We then convert to UTC ISO so Supabase (PostgreSQL timestamptz) stores it accurately.
// When reading back, new Date(isoString) auto-converts to the student's local time.
function localDatetimeToUtc(localValue: string): string {
  if (!localValue) return ""
  // new Date("2026-05-26T14:00") interprets this in the browser's local timezone
  const localDate = new Date(localValue)
  // toISOString() gives UTC: "2026-05-26T08:30:00.000Z" (for IST +5:30)
  return localDate.toISOString()
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
  const [doubts, setDoubts] = useState<Doubt[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])

  // Loading states
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [loadingTests, setLoadingTests] = useState(false)
  const [loadingDoubts, setLoadingDoubts] = useState(false)

  // Decrypted doubt content
  const [decryptedQuestions, setDecryptedQuestions] = useState<Record<string, string>>({})
  const [decryptedAnswers, setDecryptedAnswers] = useState<Record<string, string>>({})

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

  // Doubt form
  const [doubtForm, setDoubtForm] = useState({
    subject: "English",
    question: "",
  })

  // Announcement form
  const [announcementForm, setAnnouncementForm] = useState({
    title: "",
    message: "",
    target_class: "all",
    priority: "normal" as "normal" | "important" | "urgent",
  })

  // Teacher answer form
  const [answerForm, setAnswerForm] = useState<Record<string, string>>({})

  // Restore auth from session
  useEffect(() => {
    const auth = loadAuth()
    if (auth) setCurrentUser(auth)
  }, [])

  // Decrypt doubt content when doubts change
  useEffect(() => {
    const decryptAll = async () => {
      const qDecrypted: Record<string, string> = {}
      const aDecrypted: Record<string, string> = {}
      for (const d of doubts) {
        qDecrypted[d.id] = await decryptText(d.question, d.question_iv)
        if (d.answer && d.answer_iv) {
          aDecrypted[d.id] = await decryptText(d.answer, d.answer_iv)
        }
      }
      setDecryptedQuestions(qDecrypted)
      setDecryptedAnswers(aDecrypted)
    }
    if (doubts.length > 0) decryptAll()
  }, [doubts])

  // Load data for teachers
  const loadTeacherData = useCallback(async () => {
    setLoadingStudents(true)
    setLoadingTests(true)
    setLoadingDoubts(false)
    const [students, allTests, allAttempts, allDoubts, allAnnouncements] = await Promise.all([
      fetchApprovedStudents(),
      fetchTests(),
      fetchTestAttempts(),
      fetchDoubts(),
      fetchAnnouncements(),
    ])
    setApprovedStudents(students)
    setTests(allTests)
    setAttempts(allAttempts)
    setDoubts(allDoubts)
    setAnnouncements(allAnnouncements)
    setLoadingStudents(false)
    setLoadingTests(false)
    setLoadingDoubts(false)
  }, [])

  // Load data for students
  const loadStudentData = useCallback(async (studentPhone: string, studentClass: string) => {
    setLoadingTests(true)
    const [classTests, studentAttempts, studentDoubts, classAnnouncements, studentNotifs] = await Promise.all([
      fetchTestsByClass(studentClass),
      fetchAttemptsByStudent(studentPhone),
      fetchDoubtsByStudent(studentPhone),
      fetchAnnouncementsByClass(studentClass),
      fetchNotificationsByStudent(studentPhone),
    ])
    setTests(classTests)
    setAttempts(studentAttempts)
    setDoubts(studentDoubts)
    setAnnouncements(classAnnouncements)
    setNotifications(studentNotifs)
    setLoadingTests(false)
  }, [])

  useEffect(() => {
    if (!currentUser) return
    if (currentUser.role === "teacher") {
      loadTeacherData()
      const interval = setInterval(loadTeacherData, 15000)
      return () => clearInterval(interval)
    } else {
      loadStudentData(currentUser.phone, currentUser.class)
      const interval = setInterval(() => loadStudentData(currentUser.phone, currentUser.class), 15000)
      return () => clearInterval(interval)
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
    setDoubts([])
    setAnnouncements([])
    setNotifications([])
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
    // Convert local datetime to UTC for accurate server storage
    const startAtUtc = testForm.start_at ? localDatetimeToUtc(testForm.start_at) : null
    const result = await createTest({
      class: testForm.class,
      subject: testForm.subject,
      type: testForm.type,
      title: testForm.title || `${testForm.subject} ${testForm.type}`,
      start_at: startAtUtc,
      duration: testForm.duration,
      total_marks: testForm.total_marks,
      pdf_url: testForm.pdf_url,
      status: "active",
    })

    if (result) {
      setMessage("Test created successfully. Start time saved in UTC for accuracy across all devices.")
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

  // Submit a doubt (student side, encrypted)
  const handleSubmitDoubt = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser || currentUser.role !== "student") return
    if (!doubtForm.question.trim()) {
      setMessage("Please type your doubt before submitting.")
      return
    }

    const { encrypted, iv } = await encryptText(doubtForm.question)

    const result = await addDoubt({
      student_phone: currentUser.phone,
      student_name: currentUser.name,
      student_class: currentUser.class,
      subject: doubtForm.subject,
      question: encrypted,
      question_iv: iv,
      answer: null,
      answer_iv: null,
      teacher_phone: null,
      status: "pending",
    })

    if (result) {
      setMessage("Doubt submitted. Your teacher will reply soon. Only you can see the answer.")
      setDoubtForm({ subject: "English", question: "" })
      await loadStudentData(currentUser.phone, currentUser.class)
    } else {
      setMessage("Failed to submit doubt. Please try again.")
    }
  }

  // Answer a doubt (teacher side, encrypted)
  const handleAnswerDoubt = async (doubtId: string) => {
    const answerText = answerForm[doubtId]
    if (!answerText?.trim()) {
      setMessage("Please type an answer before submitting.")
      return
    }

    const { encrypted, iv } = await encryptText(answerText)
    const ok = await answerDoubt(doubtId, encrypted, iv, currentUser?.phone ?? "teacher")

    if (ok) {
      setMessage("Doubt answered. The answer will only be visible to that student.")
      setAnswerForm((prev) => ({ ...prev, [doubtId]: "" }))
      await loadTeacherData()
    } else {
      setMessage("Failed to answer doubt. Please try again.")
    }
  }

  // Create announcement (teacher side)
  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser || currentUser.role !== "teacher") return

    const result = await createAnnouncement({
      teacher_phone: currentUser.phone,
      title: announcementForm.title,
      message: announcementForm.message,
      target_class: announcementForm.target_class,
      priority: announcementForm.priority,
    })

    if (result) {
      setMessage("Announcement created." + (announcementForm.target_class === "all"
        ? " All students will see it."
        : ` Only ${announcementForm.target_class} students will see it.`))

      // Send notifications via edge function
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        await fetch(`${supabaseUrl}/functions/v1/send-notifications`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${anonKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            announcement_id: result.id,
            title: announcementForm.title,
            message: announcementForm.message,
            target_class: announcementForm.target_class,
            teacher_phone: currentUser.phone,
          }),
        })
      } catch {
        // Notifications may fail if SMS API key not set, still save announcement
      }

      setAnnouncementForm({
        title: "",
        message: "",
        target_class: "all",
        priority: "normal",
      })
      await loadTeacherData()
    } else {
      setMessage("Failed to create announcement.")
    }
  }

  const handleDeleteAnnouncement = async (id: string) => {
    const ok = await deleteAnnouncement(id)
    if (ok) {
      setMessage("Announcement deleted.")
      setAnnouncements((prev) => prev.filter((a) => a.id !== id))
    } else {
      setMessage("Failed to delete announcement.")
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

  const pendingDoubts = useMemo(() => doubts.filter((d) => d.status === "pending"), [doubts])
  const answeredDoubts = useMemo(() => doubts.filter((d) => d.status === "answered"), [doubts])

  const unreadNotifications = useMemo(
    () => notifications.filter((n) => !n.delivered),
    [notifications]
  )

  // Countdown timer component for tests
  const TestCountdown = ({ test }: { test: Test }) => {
    const [timeLeft, setTimeLeft] = useState("")
    const [canOpen, setCanOpen] = useState(false)
    const [isLive, setIsLive] = useState(false)

    useEffect(() => {
      if (!test.start_at) {
        setCanOpen(true)
        setIsLive(true)
        return
      }

      const update = () => {
        const now = new Date()
        const start = new Date(test.start_at!)
        const end = new Date(start.getTime() + test.duration * 60000)
        const fiveMinBefore = new Date(start.getTime() - 5 * 60000)

        if (now >= start && now <= end) {
          // Test is live
          setIsLive(true)
          setCanOpen(true)
          const remaining = end.getTime() - now.getTime()
          const mins = Math.floor(remaining / 60000)
          const secs = Math.floor((remaining % 60000) / 1000)
          setTimeLeft(`${mins}m ${secs}s remaining`)
        } else if (now >= fiveMinBefore && now < start) {
          // 5 minutes before - paper accessible
          setIsLive(false)
          setCanOpen(true)
          const diff = start.getTime() - now.getTime()
          const mins = Math.floor(diff / 60000)
          const secs = Math.floor((diff % 60000) / 1000)
          setTimeLeft(`Starts in ${mins}m ${secs}s`)
        } else if (now < fiveMinBefore) {
          // Too early
          setIsLive(false)
          setCanOpen(false)
          const diff = start.getTime() - now.getTime()
          const hours = Math.floor(diff / 3600000)
          const mins = Math.floor((diff % 3600000) / 60000)
          setTimeLeft(`Opens in ${hours}h ${mins}m`)
        } else {
          // Test ended
          setIsLive(false)
          setCanOpen(false)
          setTimeLeft("Ended")
        }
      }

      update()
      const interval = setInterval(update, 1000)
      return () => clearInterval(interval)
    }, [test])

    return (
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <span className={`text-sm font-medium ${isLive ? "text-green-600" : canOpen ? "text-amber-600" : "text-muted-foreground"}`}>
          {timeLeft}
        </span>
      </div>
    )
  }

  // Teacher dashboard
  const renderTeacherDashboard = () => (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-4">
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
              <HelpCircle className="h-5 w-5 text-primary" />
              <p className="text-sm font-semibold">Pending Doubts</p>
            </div>
            <p className="text-3xl font-bold">{pendingDoubts.length}</p>
            <p className="text-sm text-muted-foreground">Awaiting answers</p>
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
            {(["add", "students", "tests", "grade", "doubts", "announce"] as const).map((tab) => (
              <Button key={tab} variant={activeTab === tab ? "default" : "outline"} onClick={() => setActiveTab(tab)}>
                {tab === "add" ? "Add Student" : tab === "students" ? "Student List" : tab === "tests" ? "Create Test" : tab === "grade" ? "Grade Tests" : tab === "doubts" ? "Doubts" : "Announcements"}
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
                      {testForm.start_at && (
                        <p className="text-xs text-green-600 font-medium">
                          Students will see: {new Date(testForm.start_at).toLocaleString()} (your local time)
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">Set the time in your local timezone. Students will see the correct time in their timezone.</p>
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
                    <p className="text-xs text-muted-foreground">Students can only open this 5 minutes before the test starts.</p>
                  </div>
                  <Button type="submit">Create Test</Button>
                </form>
              </CardContent>
            </Card>

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
                          {test.start_at && <p className="text-sm text-muted-foreground">Starts: {new Date(test.start_at).toLocaleString()}</p>}
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

        {activeTab === "doubts" && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="h-5 w-5 text-primary" />
              <p className="text-sm text-muted-foreground">All doubts are encrypted. Only the student who asked and the replying teacher can see the content.</p>
            </div>

            {pendingDoubts.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                  Pending Doubts ({pendingDoubts.length})
                </h3>
                {pendingDoubts.map((doubt) => (
                  <Card key={doubt.id} className="border border-amber-200">
                    <CardContent className="pt-4 space-y-3">
                      <div className="flex flex-wrap justify-between gap-3">
                        <div>
                          <p className="font-semibold">{doubt.student_name}</p>
                          <p className="text-sm text-muted-foreground">{doubt.student_class} &bull; {doubt.subject} &bull; Phone: {doubt.student_phone}</p>
                          <p className="text-sm text-muted-foreground">Asked: {new Date(doubt.created_at).toLocaleString()}</p>
                        </div>
                        <div className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-700">
                          Pending
                        </div>
                      </div>
                      <div className="rounded-2xl bg-muted/50 p-3">
                        <p className="text-sm">{decryptedQuestions[doubt.id] || "Decrypting..."}</p>
                      </div>
                      <div className="space-y-2">
                        <Label>Write Answer (encrypted, visible only to this student)</Label>
                        <textarea
                          value={answerForm[doubt.id] ?? ""}
                          onChange={(e) => setAnswerForm((prev) => ({ ...prev, [doubt.id]: e.target.value }))}
                          placeholder="Type your answer here..."
                          className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                        <Button onClick={() => handleAnswerDoubt(doubt.id)} className="inline-flex items-center gap-2">
                          <Send className="h-4 w-4" />
                          Send Answer
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {answeredDoubts.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Answered Doubts ({answeredDoubts.length})
                </h3>
                {answeredDoubts.map((doubt) => (
                  <Card key={doubt.id} className="border border-green-200">
                    <CardContent className="pt-4 space-y-3">
                      <div>
                        <p className="font-semibold">{doubt.student_name}</p>
                        <p className="text-sm text-muted-foreground">{doubt.student_class} &bull; {doubt.subject}</p>
                        <p className="text-sm text-muted-foreground">Answered: {doubt.answered_at ? new Date(doubt.answered_at).toLocaleString() : ""}</p>
                      </div>
                      <div className="rounded-2xl bg-muted/50 p-3">
                        <p className="text-sm font-medium">Q: {decryptedQuestions[doubt.id] || "Decrypting..."}</p>
                        <p className="text-sm mt-2">A: {decryptedAnswers[doubt.id] || "Decrypting..."}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {doubts.length === 0 && (
              <Card className="border-dashed border-2">
                <CardContent><p className="text-muted-foreground">No doubts submitted by students yet.</p></CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === "announce" && (
          <div className="space-y-6">
            <Card className="border">
              <CardHeader><CardTitle>Create Announcement</CardTitle></CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleCreateAnnouncement}>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input value={announcementForm.title} onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })} placeholder="e.g. Class cancelled tomorrow" required />
                    </div>
                    <div className="space-y-2">
                      <Label>Target Class</Label>
                      <select value={announcementForm.target_class} onChange={(e) => setAnnouncementForm({ ...announcementForm, target_class: e.target.value })} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                        <option value="all">All Classes</option>
                        {["Class 8","Class 9","Class 10","Class 11","Class 12"].map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <p className="text-xs text-muted-foreground">Only students of the selected class will see this.</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Message</Label>
                    <textarea
                      value={announcementForm.message}
                      onChange={(e) => setAnnouncementForm({ ...announcementForm, message: e.target.value })}
                      placeholder="Write your announcement..."
                      className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <select value={announcementForm.priority} onChange={(e) => setAnnouncementForm({ ...announcementForm, priority: e.target.value as "normal" | "important" | "urgent" })} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      <option value="normal">Normal</option>
                      <option value="important">Important</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <Button type="submit" className="inline-flex items-center gap-2">
                    <Megaphone className="h-4 w-4" />
                    Post Announcement &amp; Send Notifications
                  </Button>
                </form>
              </CardContent>
            </Card>

            {announcements.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">All Announcements</h3>
                {announcements.map((ann) => (
                  <Card key={ann.id} className="border">
                    <CardContent className="pt-4">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold">{ann.title}</p>
                            {ann.priority === "urgent" && <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">Urgent</span>}
                            {ann.priority === "important" && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">Important</span>}
                          </div>
                          <p className="text-sm text-muted-foreground">{ann.message}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            For: {ann.target_class === "all" ? "All Classes" : ann.target_class} &bull; {new Date(ann.created_at).toLocaleString()}
                          </p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => handleDeleteAnnouncement(ann.id)}>Delete</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
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

        {/* Notifications */}
        {notifications.length > 0 && (
          <Card className="border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-blue-500" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {notifications.slice(0, 5).map((notif) => (
                <div key={notif.id} className={`rounded-2xl p-3 ${notif.delivered ? "bg-blue-50" : "bg-amber-50 border border-amber-200"}`}>
                  <p className="text-sm font-medium">{notif.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{new Date(notif.created_at).toLocaleString()}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Announcements for this class */}
        {announcements.length > 0 && (
          <Card className="border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-primary" />
                Announcements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {announcements.map((ann) => (
                <div key={ann.id} className="rounded-2xl border border-border p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold">{ann.title}</p>
                    {ann.priority === "urgent" && <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">Urgent</span>}
                    {ann.priority === "important" && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">Important</span>}
                  </div>
                  <p className="text-sm text-muted-foreground">{ann.message}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    For: {ann.target_class === "all" ? "All Classes" : ann.target_class} &bull; {new Date(ann.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

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
                  return (
                    <div key={test.id} className="rounded-3xl border border-border p-5 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-foreground">{test.title}</p>
                          <p className="text-sm text-muted-foreground">{test.subject} &bull; {test.type} &bull; {test.total_marks} marks</p>
                          {test.start_at && (
                            <p className="text-sm text-muted-foreground">Starts: {new Date(test.start_at).toLocaleString()}</p>
                          )}
                          <p className="text-sm text-muted-foreground">Duration: {test.duration} min</p>
                        </div>
                        <TestCountdown test={test} />
                      </div>

                      {/* Question paper link - only accessible 5 min before test */}
                      {test.pdf_url && (
                        <TestPaperLink test={test} studentPhone={currentUser.phone} />
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
                          <TestSubmitButton test={test} onAttempt={() => handleAttemptTest(test.id)} />
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

        {/* Ask Doubt Section */}
        <Card className="border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" />
              Ask a Doubt
              <Lock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-normal text-muted-foreground">(End-to-end encrypted - only you and your teacher can see)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmitDoubt}>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <select value={doubtForm.subject} onChange={(e) => setDoubtForm({ ...doubtForm, subject: e.target.value })} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    {subjectOptions.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Your Doubt</Label>
                <textarea
                  value={doubtForm.question}
                  onChange={(e) => setDoubtForm({ ...doubtForm, question: e.target.value })}
                  placeholder="Type your doubt here. Only your teacher will see and reply to this."
                  className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  required
                />
              </div>
              <Button type="submit" className="inline-flex items-center gap-2">
                <Send className="h-4 w-4" />
                Submit Doubt (Encrypted)
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* My Doubts & Replies */}
        {doubts.length > 0 && (
          <Card className="border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                My Doubts &amp; Teacher Replies
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {doubts.map((doubt) => (
                <div key={doubt.id} className="rounded-2xl border border-border p-4 space-y-2">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-foreground">{doubt.subject}</p>
                    <div className={`rounded-full px-2 py-0.5 text-xs font-semibold ${doubt.status === "answered" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                      {doubt.status === "answered" ? "Answered" : "Pending"}
                    </div>
                    <Lock className="h-3 w-3 text-muted-foreground" />
                  </div>
                  <div className="rounded-xl bg-muted/50 p-3">
                    <p className="text-sm"><span className="font-medium">You asked:</span> {decryptedQuestions[doubt.id] || "Decrypting..."}</p>
                  </div>
                  {doubt.status === "answered" && decryptedAnswers[doubt.id] && (
                    <div className="rounded-xl bg-primary/5 p-3">
                      <p className="text-sm"><span className="font-medium">Teacher replied:</span> {decryptedAnswers[doubt.id]}</p>
                      <p className="text-xs text-muted-foreground mt-1">{doubt.answered_at ? new Date(doubt.answered_at).toLocaleString() : ""}</p>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">Asked: {new Date(doubt.created_at).toLocaleString()}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  // Test paper link component - enforces 5-minute-before rule
  const TestPaperLink = ({ test, studentPhone }: { test: Test; studentPhone: string }) => {
    const [canOpen, setCanOpen] = useState(false)
    const [statusText, setStatusText] = useState("")

    useEffect(() => {
      if (!test.start_at) {
        setCanOpen(true)
        setStatusText("")
        return
      }

      const update = () => {
        const now = new Date()
        const start = new Date(test.start_at!)
        const end = new Date(start.getTime() + test.duration * 60000)
        const fiveMinBefore = new Date(start.getTime() - 5 * 60000)

        if (now >= fiveMinBefore && now <= end) {
          setCanOpen(true)
          if (now < start) {
            const diff = start.getTime() - now.getTime()
            const mins = Math.floor(diff / 60000)
            const secs = Math.floor((diff % 60000) / 1000)
            setStatusText(`Paper accessible. Test starts in ${mins}m ${secs}s`)
          } else {
            setStatusText("Test is live - paper accessible")
          }
        } else if (now < fiveMinBefore) {
          setCanOpen(false)
          const diff = fiveMinBefore.getTime() - now.getTime()
          const hours = Math.floor(diff / 3600000)
          const mins = Math.floor((diff % 3600000) / 60000)
          setStatusText(`Paper locked. Opens ${hours}h ${mins}m before test`)
        } else {
          setCanOpen(false)
          setStatusText("Test has ended")
        }
      }

      update()
      const interval = setInterval(update, 1000)
      return () => clearInterval(interval)
    }, [test, studentPhone])

    if (canOpen) {
      return (
        <div className="space-y-1">
          <a
            href={test.pdf_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/20 transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            Open Question Paper
          </a>
          {statusText && <p className="text-xs text-green-600">{statusText}</p>}
        </div>
      )
    }

    return (
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2 rounded-lg bg-muted px-4 py-2 text-sm text-muted-foreground cursor-not-allowed">
          <Lock className="h-4 w-4" />
          Question Paper Locked
        </div>
        <p className="text-xs text-muted-foreground">{statusText}</p>
      </div>
    )
  }

  // Test submit button - only enabled during test window
  const TestSubmitButton = ({ test, onAttempt }: { test: Test; onAttempt: () => void }) => {
    const [canSubmit, setCanSubmit] = useState(false)

    useEffect(() => {
      if (!test.start_at) {
        setCanSubmit(true)
        return
      }

      const update = () => {
        const now = new Date()
        const start = new Date(test.start_at!)
        const end = new Date(start.getTime() + test.duration * 60000)
        setCanSubmit(now >= start && now <= end)
      }

      update()
      const interval = setInterval(update, 1000)
      return () => clearInterval(interval)
    }, [test])

    return (
      <Button onClick={onAttempt} disabled={!canSubmit}>
        {canSubmit ? "Submit Test Attempt" : "Test Not Open Yet"}
      </Button>
    )
  }

  return (
    <>
      <Head>
        <title>Student Portal | Pathshala Coaching</title>
        <meta name="description" content="Pathshala Coaching Student Portal - Access tests, submit answers, track results, ask doubts, and receive announcements." />
        <meta name="keywords" content="Pathshala Portal, student portal, teacher portal, online tests, coaching portal Bhadreshwar" />
        <link rel="canonical" href="https://pathshala-coaching.in/portal" />
        <meta property="og:title" content="Student Portal | Pathshala Coaching" />
        <meta property="og:description" content="Access tests, submit answers, and track results at Pathshala Coaching" />
        <meta property="og:url" content="https://pathshala-coaching.in/portal" />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
      </Head>
      <main className="min-h-screen bg-background py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 mb-10 text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-primary font-semibold">Pathshala Portal</p>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground font-[var(--font-playfair)]">Teacher and Student Login</h1>
          <p className="max-w-3xl mx-auto text-muted-foreground">
            Teachers manage students, tests, doubts, and announcements. Students view tests, ask doubts, and track their results.
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
    </>
  )
}
