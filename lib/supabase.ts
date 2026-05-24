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
