import { NextResponse } from "next/server"
import { LeadRepository, seedSampleLeads } from "@/lib/database"

// Ensure we have sample data for development
seedSampleLeads()

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("query")
  const status = searchParams.get("status")

  let leads

  if (query) {
    leads = await LeadRepository.searchLeads(query)
  } else if (status) {
    leads = await LeadRepository.filterLeadsByStatus(status as any)
  } else {
    leads = await LeadRepository.getLeads()
  }

  return NextResponse.json(leads)
}

export async function POST(request: Request) {
  try {
    const leadData = await request.json()

    // Basic validation
    if (!leadData.name || !leadData.source) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Apply rule-based scoring for now (will be replaced with LLM later)
    if (!leadData.score) {
      leadData.score = calculateBasicScore(leadData)
    }

    const lead = await LeadRepository.createLead(leadData)

    return NextResponse.json(lead, { status: 201 })
  } catch (error) {
    console.error("Failed to create lead:", error)
    return NextResponse.json({ error: "Failed to create lead" }, { status: 500 })
  }
}

// Simple rule-based scoring function
function calculateBasicScore(lead) {
  let score = 50 // Base score

  // Portfolio size bonus
  const sizeMatch = lead.portfolioSize.match(/(\d+)/)
  if (sizeMatch) {
    const size = Number.parseInt(sizeMatch[1])
    if (size > 1000) score += 30
    else if (size > 500) score += 20
    else if (size > 100) score += 10
  }

  // Contact info bonus
  if (lead.contactInfo) {
    if (lead.contactInfo.email) score += 5
    if (lead.contactInfo.phone) score += 5
    if (lead.contactInfo.website) score += 5
  }

  // Web3 domain category bonus
  if (
    lead.domainCategories &&
    lead.domainCategories.some((cat) => ["crypto", "web3", "nft", "blockchain"].includes(cat.toLowerCase()))
  ) {
    score += 10
  }

  return Math.min(score, 100) // Cap at 100
}

