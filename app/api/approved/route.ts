import { NextRequest, NextResponse } from "next/server"
import { getRemoteData, isRemoteStorageEnabled } from "@/lib/kv"

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

const APPROVED_KEY = "pathshalaApprovedStudents"

export async function GET(req: NextRequest) {
  if (!isRemoteStorageEnabled()) {
    return NextResponse.json({ error: "Remote storage is not configured." }, { status: 500 })
  }

  const phone = req.nextUrl.searchParams.get("phone")
  const approvedStudents = await getRemoteData<ApprovedStudent[]>(APPROVED_KEY, [])

  if (phone) {
    return NextResponse.json(approvedStudents.filter((student) => student.phone === phone))
  }

  return NextResponse.json(approvedStudents)
}

export async function POST(req: NextRequest) {
  if (!isRemoteStorageEnabled()) {
    return NextResponse.json({ error: "Remote storage is not configured." }, { status: 500 })
  }

  const student = await req.json() as ApprovedStudent
  const approvedStudents = await getRemoteData<ApprovedStudent[]>(APPROVED_KEY, [])

  const alreadyExists = approvedStudents.some((item) => item.phone === student.phone)
  const nextApproved = alreadyExists ? approvedStudents : [student, ...approvedStudents]

  await setRemoteData(APPROVED_KEY, nextApproved)
  return NextResponse.json({ success: true, approved: student })
}
