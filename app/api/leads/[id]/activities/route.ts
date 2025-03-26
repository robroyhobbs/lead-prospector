import { NextResponse } from "next/server"
import { LeadRepository } from "@/lib/database"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const { type, notes } = await request.json()

    if (!type || !notes) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const updatedLead = await LeadRepository.addActivity(params.id, { type, notes })

    if (!updatedLead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 })
    }

    return NextResponse.json(updatedLead)
  } catch (error) {
    console.error("Failed to add activity:", error)
    return NextResponse.json({ error: "Failed to add activity" }, { status: 500 })
  }
}

