import { NextResponse } from "next/server"
import { LeadRepository } from "@/lib/database"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const lead = await LeadRepository.getLeadById(params.id)

  if (!lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 })
  }

  return NextResponse.json(lead)
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const updates = await request.json()
    const updatedLead = await LeadRepository.updateLead(params.id, updates)

    if (!updatedLead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 })
    }

    return NextResponse.json(updatedLead)
  } catch (error) {
    console.error("Failed to update lead:", error)
    return NextResponse.json({ error: "Failed to update lead" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const success = await LeadRepository.deleteLead(params.id)

  if (!success) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}

