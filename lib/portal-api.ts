export const STORAGE_KEYS = {
  enrollments: "pathshalaEnrollments",
  approved: "pathshalaApprovedStudents",
}

function isBrowser() {
  return typeof window !== "undefined"
}

function parseJson<T>(value: string | null, fallback: T): T {
  if (!value) return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

function getLocalStorageItem<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback
  return parseJson(window.localStorage.getItem(key), fallback)
}

function setLocalStorageItem<T>(key: string, value: T) {
  if (!isBrowser()) return
  window.localStorage.setItem(key, JSON.stringify(value))
}

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T | null> {
  try {
    const response = await fetch(url, options)
    if (!response.ok) return null
    return (await response.json()) as T
  } catch {
    return null
  }
}

export type EnrollmentRequest = {
  id: string
  studentName: string
  guardianName: string
  phone: string
  email: string
  class: string
  subjects: string
  address: string
  submittedAt: string
}

export type ApprovedStudent = EnrollmentRequest & {
  approvedAt: string
}

export async function submitEnrollmentRemote(enrollment: EnrollmentRequest) {
  return fetchJson<{ success: boolean; enrollment: EnrollmentRequest }>("/api/enrollments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(enrollment),
  })
}

export async function fetchPendingEnrollmentsRemote() {
  return fetchJson<EnrollmentRequest[]>("/api/enrollments")
}

export async function fetchApprovedStudentsRemote(phone?: string) {
  const url = new URL("/api/approved", isBrowser() ? window.location.origin : "http://localhost")
  if (phone) {
    url.searchParams.set("phone", phone)
  }
  return fetchJson<ApprovedStudent[]>(url.toString())
}

export async function createApprovedStudentRemote(student: ApprovedStudent) {
  return fetchJson<{ success: boolean; approved?: ApprovedStudent }>("/api/approved", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(student),
  })
}

export async function approveEnrollmentRemote(id: string) {
  return fetchJson<{ success: boolean; approved?: ApprovedStudent }>("/api/enrollments/approve", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  })
}

export function loadLocalEnrollments() {
  return getLocalStorageItem<EnrollmentRequest[]>(STORAGE_KEYS.enrollments, [])
}

export function saveLocalEnrollments(value: EnrollmentRequest[]) {
  setLocalStorageItem(STORAGE_KEYS.enrollments, value)
}

export function loadLocalApprovedStudents() {
  return getLocalStorageItem<ApprovedStudent[]>(STORAGE_KEYS.approved, [])
}

export function saveLocalApprovedStudents(value: ApprovedStudent[]) {
  setLocalStorageItem(STORAGE_KEYS.approved, value)
}
