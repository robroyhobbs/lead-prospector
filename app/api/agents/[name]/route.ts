import { NextResponse } from "next/server"
import { getAgentStatus, runAgent, toggleAgentStatus } from "@/lib/aigne/runner"

export async function GET(request: Request, { params }: { params: { name: string } }) {
  const status = getAgentStatus(params.name)

  if (!status) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 })
  }

  return NextResponse.json(status)
}

export async function POST(request: Request, { params }: { params: { name: string } }) {
  try {
    const result = await runAgent(params.name)
    return NextResponse.json(result)
  } catch (error) {
    console.error(`Error running agent ${params.name}:`, error)
    return NextResponse.json({ error: `Failed to run agent: ${error.message}` }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: { name: string } }) {
  const { action } = await request.json()

  if (action === "toggle") {
    const status = toggleAgentStatus(params.name)

    if (!status) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 })
    }

    return NextResponse.json(status)
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 })
}

