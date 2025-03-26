import { AIGNE_CONFIG, type AgentConfig } from "./config"
import { LeadRepository } from "../database"

// Implementation of the AIGNE agent runner based on the framework
// https://github.com/AIGNE-io/aigne-framework

export interface AgentRunResult {
  agentName: string
  success: boolean
  leadsFound: number
  error?: string
  timestamp: string
}

export interface AgentStatus {
  agentName: string
  status: "active" | "paused" | "error"
  lastRun: string | null
  lastRunResult: AgentRunResult | null
}

// Store agent statuses
const agentStatuses: Record<string, AgentStatus> = {}

// Initialize agent statuses
AIGNE_CONFIG.getAgents().forEach((agent) => {
  agentStatuses[agent.name] = {
    agentName: agent.name,
    status: agent.enabled ? "active" : "paused",
    lastRun: null,
    lastRunResult: null,
  }
})

// AIGNE tool implementations
const tools = {
  // Web scraper tool implementation
  web_scraper: async (config: any): Promise<any[]> => {
    console.log(`[AIGNE] Running web scraper with config:`, config)

    // In a real implementation, this would use the AIGNE framework's web_scraper tool
    // For now, return mock data based on the URL

    const mockData: Record<string, any[]> = {
      "sedo.com": [
        {
          portfolioHolders: "Premium Domains Ltd",
          domainCount: "650+ domains",
          contactInfo: "Contact: sales@premiumdomains.example | Website: https://premiumdomains.example",
          domainCategories: "business, tech, finance",
        },
        {
          portfolioHolders: "Domain Investor Pro",
          domainCount: "320+ domains",
          contactInfo: "Website: https://domaininvestor.example",
          domainCategories: "general, premium",
        },
      ],
      "opensea.io": [
        {
          sellers: "CryptoDomainsNFT",
          domainNames: "web3domain.eth",
          prices: "0.5 ETH",
        },
        {
          sellers: "CryptoDomainsNFT",
          domainNames: "metaverse.eth",
          prices: "2.0 ETH",
        },
        {
          sellers: "CryptoDomainsNFT",
          domainNames: "blockchain.eth",
          prices: "1.5 ETH",
        },
        {
          sellers: "Web3Investor",
          domainNames: "defi.eth",
          prices: "3.0 ETH",
        },
      ],
      "godaddy.com": [
        {
          sellers: "DomainPortfolioSales",
          domainLists: "business.com, tech.io, finance.net, invest.org, capital.co",
          auctionInfo: "Bulk sale - 5 premium domains",
        },
      ],
    }

    // Find matching data based on URL
    for (const [urlPart, data] of Object.entries(mockData)) {
      if (config.urls.some((url) => url.includes(urlPart))) {
        return data
      }
    }

    return []
  },

  // Python interpreter tool implementation
  python_interpreter: async (config: any, input: any): Promise<any> => {
    console.log(`[AIGNE] Running Python interpreter with input:`, input)

    // In a real implementation, this would use the AIGNE framework's python_interpreter tool
    // For now, return mock processed data

    // Simple mock processing logic
    const results = input.map((item) => {
      // Extract portfolio size
      let portfolioSize = "Unknown"
      if (item.domainCount) {
        const match = item.domainCount.match(/(\d+)/)
        if (match) {
          portfolioSize = `${match[1]}+`
        }
      } else if (item.domainLists) {
        const domains = item.domainLists.split(/[,\n\r]/)
        portfolioSize = `${domains.length}+`
      } else if (item.domainNames) {
        // Count unique sellers
        portfolioSize = "3+" // Mock value
      }

      // Extract contact info
      const contactInfo: Record<string, string> = {}
      if (item.contactInfo) {
        const emailMatch = item.contactInfo.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)
        if (emailMatch) {
          contactInfo.email = emailMatch[0]
        }

        const websiteMatch = item.contactInfo.match(/https?:\/\/[^\s]+/)
        if (websiteMatch) {
          contactInfo.website = websiteMatch[0]
        }
      }

      // Extract domain categories
      let domainCategories: string[] = []
      if (item.domainCategories) {
        domainCategories = item.domainCategories.split(/[,;]/).map((cat) => cat.trim())
      } else if (item.sellers && item.sellers.toLowerCase().includes("crypto")) {
        domainCategories = ["crypto", "web3", "nft"]
      } else if (item.domainLists && item.domainLists.toLowerCase().includes("tech")) {
        domainCategories = ["tech", "business"]
      }

      // Calculate score (simple mock logic)
      let score = 50 // Base score

      // Portfolio size bonus
      const sizeMatch = portfolioSize.match(/(\d+)/)
      if (sizeMatch) {
        const size = Number.parseInt(sizeMatch[1])
        if (size > 500) score += 30
        else if (size > 100) score += 20
        else score += 10
      }

      // Contact info bonus
      if (contactInfo.email) score += 5
      if (contactInfo.website) score += 5

      // Web3 domain category bonus
      if (domainCategories.some((cat) => ["crypto", "web3", "nft", "blockchain"].includes(cat.toLowerCase()))) {
        score += 10
      }

      // Create the lead object
      return {
        name: item.portfolioHolders || item.sellers || "Unknown Seller",
        source: item.source || "Web Scraper",
        portfolioSize,
        contactInfo,
        domainCategories,
        status: "New",
        score: Math.min(score, 100), // Cap at 100
        lastActivity: new Date().toISOString().split("T")[0],
      }
    })

    return results
  },
}

// Run a specific agent
export async function runAgent(agentName: string): Promise<AgentRunResult> {
  const agent = AIGNE_CONFIG.getAgent(agentName)

  if (!agent) {
    throw new Error(`Agent "${agentName}" not found`)
  }

  const timestamp = new Date().toISOString()

  try {
    console.log(`[AIGNE] Running agent: ${agentName}`)

    // Execute each tool in sequence
    let toolOutput: any = null

    for (const tool of agent.tools) {
      if (!tools[tool.name]) {
        throw new Error(`Tool "${tool.name}" not implemented`)
      }

      if (tool.name === "web_scraper") {
        toolOutput = await tools.web_scraper(tool.config)
      } else if (tool.name === "python_interpreter") {
        if (!toolOutput) {
          throw new Error("No input data for Python interpreter")
        }

        // Add source information to each item
        toolOutput = toolOutput.map((item) => ({
          ...item,
          source: getSourceFromAgent(agent),
        }))

        toolOutput = await tools.python_interpreter(tool.config, toolOutput)
      }
    }

    // Store the results in the database
    if (toolOutput && Array.isArray(toolOutput)) {
      for (const lead of toolOutput) {
        await LeadRepository.createLead(lead)
      }
    }

    // Update agent status
    const result: AgentRunResult = {
      agentName,
      success: true,
      leadsFound: toolOutput?.length || 0,
      timestamp,
    }

    agentStatuses[agentName] = {
      agentName,
      status: "active",
      lastRun: timestamp,
      lastRunResult: result,
    }

    return result
  } catch (error) {
    console.error(`[AIGNE] Error running agent ${agentName}:`, error)

    // Update agent status
    const result: AgentRunResult = {
      agentName,
      success: false,
      leadsFound: 0,
      error: error.message,
      timestamp,
    }

    agentStatuses[agentName] = {
      agentName,
      status: "error",
      lastRun: timestamp,
      lastRunResult: result,
    }

    return result
  }
}

// Run all enabled agents
export async function runAllAgents(): Promise<AgentRunResult[]> {
  const results: AgentRunResult[] = []

  for (const agent of AIGNE_CONFIG.getAgents()) {
    if (agent.enabled) {
      try {
        const result = await runAgent(agent.name)
        results.push(result)
      } catch (error) {
        console.error(`[AIGNE] Error running agent ${agent.name}:`, error)
        results.push({
          agentName: agent.name,
          success: false,
          leadsFound: 0,
          error: error.message,
          timestamp: new Date().toISOString(),
        })
      }
    }
  }

  return results
}

// Get the status of all agents
export function getAgentStatuses(): AgentStatus[] {
  return Object.values(agentStatuses)
}

// Get the status of a specific agent
export function getAgentStatus(agentName: string): AgentStatus | null {
  return agentStatuses[agentName] || null
}

// Toggle agent status (active/paused)
export function toggleAgentStatus(agentName: string): AgentStatus | null {
  const agent = AIGNE_CONFIG.getAgent(agentName)
  const status = agentStatuses[agentName]

  if (!agent || !status) {
    return null
  }

  // Toggle status
  const newStatus = status.status === "active" ? "paused" : "active"

  // Update agent config
  agent.enabled = newStatus === "active"

  // Update status
  agentStatuses[agentName] = {
    ...status,
    status: newStatus,
  }

  return agentStatuses[agentName]
}

// Helper function to extract source name from agent
function getSourceFromAgent(agent: AgentConfig): string {
  if (agent.name.includes("sedo")) {
    return "Sedo"
  } else if (agent.name.includes("opensea")) {
    return "OpenSea"
  } else if (agent.name.includes("godaddy")) {
    return "GoDaddy Auctions"
  } else {
    return "Web Scraper"
  }
}

