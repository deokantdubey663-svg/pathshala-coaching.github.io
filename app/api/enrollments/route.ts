import { NextRequest, NextResponse } from "next/server"
import { getRemoteData, isRemoteStorageEnabled, setRemoteData } from "@/lib/kv"

type EnrollmentRequest = {
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

const ENROLLMENTS_KEY = "pathshalaEnrollments"

export async function GET() {
  if (!isRemoteStorageEnabled()) {
    return NextResponse.json({ error: "Remote storage is not configured." }, { status: 500 })
  }

  const pendingEnrollments = await getRemoteData<EnrollmentRequest[]>(ENROLLMENTS_KEY, [])
  return NextResponse.json(pendingEnrollments)
}

export async function POST(req: NextRequest) {
  if (!isRemoteStorageEnabled()) {
    return NextResponse.json({ error: "Remote storage is not configured." }, { status: 500 })
  }

  const payload = await req.json()
  const newEnrollment: EnrollmentRequest = {
    id: `${Date.now()}`,
    studentName: payload.studentName ?? "",
    guardianName: payload.guardianName ?? "",
    phone: payload.phone ?? "",
    email: payload.email ?? "",
    class: payload.class ?? "",
    subjects: payload.subjects ?? "",
    address: payload.address ?? "",
    submittedAt: new Date().toISOString(),
  }

  const pendingEnrollments = await getRemoteData<EnrollmentRequest[]>(ENROLLMENTS_KEY, [])
  await setRemoteData(ENROLLMENTS_KEY, [newEnrollment, ...pendingEnrollments])

  return NextResponse.json({ success: true, enrollment: newEnrollment })
}
