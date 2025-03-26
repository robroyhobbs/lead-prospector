import { NextResponse } from "next/server"
import { getAgentStatuses, runAllAgents } from "@/lib/aigne/runner"

export async function GET() {
  const statuses = getAgentStatuses()
  return NextResponse.json(statuses)
}

export async function POST() {
  try {
    const results = await runAllAgents()
    return NextResponse.json(results)
  } catch (error) {
    console.error("Error running agents:", error)
    return NextResponse.json({ error: "Failed to run agents" }, { status: 500 })
  }
}

