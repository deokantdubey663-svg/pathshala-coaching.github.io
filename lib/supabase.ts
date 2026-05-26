import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type ApprovedStudent = {
  id: string
  student_name: string
  guardian_name: string
  phone: string
  email: string
  class: string
  subjects: string
  address: string
  submitted_at: string
  approved_at: string
}

export type Test = {
  id: string
  class: string
  subject: string
  type: string
  title: string
  start_at: string | null
  duration: number
  total_marks: number
  pdf_url: string
  status: "active" | "completed" | "graded"
  created_at: string
  graded_at: string | null
}

export type TestAttempt = {
  id: string
  test_id: string
  student_phone: string
  student_name: string
  class: string
  attempted_at: string
  note: string
  marks: number | null
  graded_at: string | null
  graded_by: string | null
}

// Approved Students API
export async function fetchApprovedStudents(): Promise<ApprovedStudent[]> {
  const { data, error } = await supabase
    .from("approved_students")
    .select("*")
    .order("approved_at", { ascending: false })
  if (error) {
    console.error("fetchApprovedStudents error:", error)
    return []
  }
  return data ?? []
}

export async function fetchApprovedStudentByPhone(phone: string): Promise<ApprovedStudent | null> {
  const { data, error } = await supabase
    .from("approved_students")
    .select("*")
    .eq("phone", phone)
    .maybeSingle()
  if (error) {
    console.error("fetchApprovedStudentByPhone error:", error)
    return null
  }
  return data
}

export async function addApprovedStudent(student: Omit<ApprovedStudent, "id">): Promise<ApprovedStudent | null> {
  const { data, error } = await supabase
    .from("approved_students")
    .upsert({ ...student }, { onConflict: "phone" })
    .select()
    .maybeSingle()
  if (error) {
    console.error("addApprovedStudent error:", error)
    return null
  }
  return data
}

export async function removeApprovedStudent(phone: string): Promise<boolean> {
  const { error } = await supabase
    .from("approved_students")
    .delete()
    .eq("phone", phone)
  if (error) {
    console.error("removeApprovedStudent error:", error)
    return false
  }
  return true
}

// Tests API
export async function fetchTests(): Promise<Test[]> {
  const { data, error } = await supabase
    .from("tests")
    .select("*")
    .order("created_at", { ascending: false })
  if (error) {
    console.error("fetchTests error:", error)
    return []
  }
  return data ?? []
}

export async function fetchTestsByClass(className: string): Promise<Test[]> {
  const { data, error } = await supabase
    .from("tests")
    .select("*")
    .eq("class", className)
    .order("created_at", { ascending: false })
  if (error) {
    console.error("fetchTestsByClass error:", error)
    return []
  }
  return data ?? []
}

export async function createTest(test: Omit<Test, "id" | "created_at" | "graded_at">): Promise<Test | null> {
  const { data, error } = await supabase
    .from("tests")
    .insert(test)
    .select()
    .maybeSingle()
  if (error) {
    console.error("createTest error:", error)
    return null
  }
  return data
}

export async function updateTestStatus(id: string, status: Test["status"], gradedAt?: string): Promise<boolean> {
  const update: Partial<Test> = { status }
  if (gradedAt) update.graded_at = gradedAt
  const { error } = await supabase
    .from("tests")
    .update(update)
    .eq("id", id)
  if (error) {
    console.error("updateTestStatus error:", error)
    return false
  }
  return true
}

// Test Attempts API
export async function fetchTestAttempts(): Promise<TestAttempt[]> {
  const { data, error } = await supabase
    .from("test_attempts")
    .select("*")
    .order("attempted_at", { ascending: false })
  if (error) {
    console.error("fetchTestAttempts error:", error)
    return []
  }
  return data ?? []
}

export async function fetchAttemptsByStudent(studentPhone: string): Promise<TestAttempt[]> {
  const { data, error } = await supabase
    .from("test_attempts")
    .select("*")
    .eq("student_phone", studentPhone)
    .order("attempted_at", { ascending: false })
  if (error) {
    console.error("fetchAttemptsByStudent error:", error)
    return []
  }
  return data ?? []
}

export async function addTestAttempt(attempt: Omit<TestAttempt, "id">): Promise<TestAttempt | null> {
  const { data, error } = await supabase
    .from("test_attempts")
    .insert(attempt)
    .select()
    .maybeSingle()
  if (error) {
    console.error("addTestAttempt error:", error)
    return null
  }
  return data
}

export async function updateAttemptMarks(
  testId: string,
  studentPhone: string,
  marks: number,
  gradedBy: string
): Promise<boolean> {
  const { error } = await supabase
    .from("test_attempts")
    .update({
      marks,
      graded_at: new Date().toISOString(),
      graded_by: gradedBy,
    })
    .eq("test_id", testId)
    .eq("student_phone", studentPhone)
  if (error) {
    console.error("updateAttemptMarks error:", error)
    return false
  }
  return true
}

// Doubts API
export type Doubt = {
  id: string
  student_phone: string
  student_name: string
  student_class: string
  subject: string
  question: string
  question_iv: string
  answer: string | null
  answer_iv: string | null
  teacher_phone: string | null
  status: "pending" | "answered"
  created_at: string
  answered_at: string | null
}

export async function fetchDoubts(): Promise<Doubt[]> {
  const { data, error } = await supabase
    .from("doubts")
    .select("*")
    .order("created_at", { ascending: false })
  if (error) {
    console.error("fetchDoubts error:", error)
    return []
  }
  return data ?? []
}

export async function fetchDoubtsByStudent(phone: string): Promise<Doubt[]> {
  const { data, error } = await supabase
    .from("doubts")
    .select("*")
    .eq("student_phone", phone)
    .order("created_at", { ascending: false })
  if (error) {
    console.error("fetchDoubtsByStudent error:", error)
    return []
  }
  return data ?? []
}

export async function addDoubt(doubt: Omit<Doubt, "id" | "created_at" | "answered_at">): Promise<Doubt | null> {
  const { data, error } = await supabase
    .from("doubts")
    .insert(doubt)
    .select()
    .maybeSingle()
  if (error) {
    console.error("addDoubt error:", error)
    return null
  }
  return data
}

export async function answerDoubt(
  doubtId: string,
  answer: string,
  answerIv: string,
  teacherPhone: string
): Promise<boolean> {
  const { error } = await supabase
    .from("doubts")
    .update({
      answer,
      answer_iv: answerIv,
      teacher_phone: teacherPhone,
      status: "answered",
      answered_at: new Date().toISOString(),
    })
    .eq("id", doubtId)
  if (error) {
    console.error("answerDoubt error:", error)
    return false
  }
  return true
}

// Announcements API
export type Announcement = {
  id: string
  teacher_phone: string
  title: string
  message: string
  target_class: string
  priority: "normal" | "important" | "urgent"
  created_at: string
}

export async function fetchAnnouncements(): Promise<Announcement[]> {
  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .order("created_at", { ascending: false })
  if (error) {
    console.error("fetchAnnouncements error:", error)
    return []
  }
  return data ?? []
}

export async function fetchAnnouncementsByClass(className: string): Promise<Announcement[]> {
  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .or(`target_class.eq.${className},target_class.eq.all`)
    .order("created_at", { ascending: false })
  if (error) {
    console.error("fetchAnnouncementsByClass error:", error)
    return []
  }
  return data ?? []
}

export async function createAnnouncement(announcement: Omit<Announcement, "id" | "created_at">): Promise<Announcement | null> {
  const { data, error } = await supabase
    .from("announcements")
    .insert(announcement)
    .select()
    .maybeSingle()
  if (error) {
    console.error("createAnnouncement error:", error)
    return null
  }
  return data
}

export async function deleteAnnouncement(id: string): Promise<boolean> {
  const { error } = await supabase
    .from("announcements")
    .delete()
    .eq("id", id)
  if (error) {
    console.error("deleteAnnouncement error:", error)
    return false
  }
  return true
}

// Notifications API
export type Notification = {
  id: string
  student_phone: string
  student_name: string
  announcement_id: string | null
  type: "announcement" | "test_reminder"
  message: string
  delivered: boolean
  delivered_at: string | null
  created_at: string
}

export async function fetchNotificationsByStudent(phone: string): Promise<Notification[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("student_phone", phone)
    .order("created_at", { ascending: false })
  if (error) {
    console.error("fetchNotificationsByStudent error:", error)
    return []
  }
  return data ?? []
}

export async function createNotification(notification: Omit<Notification, "id" | "created_at" | "delivered_at">): Promise<Notification | null> {
  const { data, error } = await supabase
    .from("notifications")
    .insert(notification)
    .select()
    .maybeSingle()
  if (error) {
    console.error("createNotification error:", error)
    return null
  }
  return data
}

export async function markNotificationDelivered(id: string): Promise<boolean> {
  const { error } = await supabase
    .from("notifications")
    .update({ delivered: true, delivered_at: new Date().toISOString() })
    .eq("id", id)
  if (error) {
    console.error("markNotificationDelivered error:", error)
    return false
  }
  return true
}
