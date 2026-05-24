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

type ApprovedStudent = EnrollmentRequest & {
  approvedAt: string
}

const ENROLLMENTS_KEY = "pathshalaEnrollments"
const APPROVED_KEY = "pathshalaApprovedStudents"

export async function POST(req: NextRequest) {
  if (!isRemoteStorageEnabled()) {
    return NextResponse.json({ error: "Remote storage is not configured." }, { status: 500 })
  }

  const { id } = await req.json()
  const pendingEnrollments = await getRemoteData<EnrollmentRequest[]>(ENROLLMENTS_KEY, [])
  const request = pendingEnrollments.find((item) => item.id === id)

  if (!request) {
    return NextResponse.json({ error: "Enrollment request not found." }, { status: 404 })
  }

  const approvedStudents = await getRemoteData<ApprovedStudent[]>(APPROVED_KEY, [])
  const approvedStudent: ApprovedStudent = {
    ...request,
    approvedAt: new Date().toISOString(),
  }

  await setRemoteData(APPROVED_KEY, [approvedStudent, ...approvedStudents])
  await setRemoteData(
    ENROLLMENTS_KEY,
    pendingEnrollments.filter((item) => item.id !== id)
  )

  return NextResponse.json({ success: true, approved: approvedStudent })
}
