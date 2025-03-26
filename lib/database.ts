// Simple database abstraction layer that can work with Replit DB initially
// and be extended to other databases later

export interface Lead {
  id: string
  name: string
  source: string
  portfolioSize: string
  contactInfo?: {
    email?: string
    website?: string
    phone?: string
  }
  domainCategories?: string[]
  score: number
  status: "New" | "Contacted" | "Interested" | "Not Interested" | "Converted"
  lastActivity: string
  activities: {
    date: string
    type: string
    notes: string
  }[]
  createdAt: string
  updatedAt: string
}

// Mock implementation using in-memory storage for development
// This would be replaced with Replit DB in production
const leads: Record<string, Lead> = {}

export const LeadRepository = {
  // Create a new lead
  async createLead(leadData: Omit<Lead, "id" | "createdAt" | "updatedAt" | "activities">): Promise<Lead> {
    const now = new Date().toISOString()
    const id = `lead-${Date.now()}`

    const lead: Lead = {
      id,
      ...leadData,
      activities: [],
      createdAt: now,
      updatedAt: now,
    }

    leads[id] = lead
    return lead
  },

  // Get all leads
  async getLeads(): Promise<Lead[]> {
    return Object.values(leads)
  },

  // Get a single lead by ID
  async getLeadById(id: string): Promise<Lead | null> {
    return leads[id] || null
  },

  // Update a lead
  async updateLead(id: string, updates: Partial<Lead>): Promise<Lead | null> {
    const lead = leads[id]
    if (!lead) return null

    const updatedLead = {
      ...lead,
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    leads[id] = updatedLead
    return updatedLead
  },

  // Add an activity to a lead
  async addActivity(id: string, activity: { type: string; notes: string }): Promise<Lead | null> {
    const lead = leads[id]
    if (!lead) return null

    const now = new Date().toISOString()
    const newActivity = {
      date: now.split("T")[0],
      ...activity,
    }

    const updatedLead = {
      ...lead,
      activities: [...lead.activities, newActivity],
      lastActivity: now.split("T")[0],
      updatedAt: now,
    }

    leads[id] = updatedLead
    return updatedLead
  },

  // Delete a lead
  async deleteLead(id: string): Promise<boolean> {
    if (!leads[id]) return false

    delete leads[id]
    return true
  },

  // Search leads
  async searchLeads(query: string): Promise<Lead[]> {
    const searchTerm = query.toLowerCase()
    return Object.values(leads).filter(
      (lead) =>
        lead.name.toLowerCase().includes(searchTerm) ||
        lead.source.toLowerCase().includes(searchTerm) ||
        lead.domainCategories?.some((cat) => cat.toLowerCase().includes(searchTerm)),
    )
  },

  // Filter leads by status
  async filterLeadsByStatus(status: Lead["status"]): Promise<Lead[]> {
    return Object.values(leads).filter((lead) => lead.status === status)
  },

  // Get high-value leads (score >= 80)
  async getHighValueLeads(): Promise<Lead[]> {
    return Object.values(leads).filter((lead) => lead.score >= 80)
  },
}

// Initialize with some sample data for development
export async function seedSampleLeads() {
  if (Object.keys(leads).length > 0) return // Only seed if empty

  const sampleLeads = [
    {
      name: "Domain Portfolio Co",
      source: "Sedo",
      portfolioSize: "500+",
      contactInfo: {
        email: "contact@domainportfolio.co",
        website: "https://domainportfolio.co",
      },
      domainCategories: ["business", "tech", "finance"],
      score: 87,
      status: "New" as const,
      lastActivity: "2025-03-25",
    },
    {
      name: "Web3 Domains Inc",
      source: "OpenSea",
      portfolioSize: "1000+",
      contactInfo: {
        email: "info@web3domains.inc",
        website: "https://web3domains.inc",
        phone: "+1 (555) 234-5678",
      },
      domainCategories: ["crypto", "web3", "nft"],
      score: 92,
      status: "Contacted" as const,
      lastActivity: "2025-03-24",
    },
    {
      name: "Domain Reseller LLC",
      source: "Manual Entry",
      portfolioSize: "100+",
      contactInfo: {
        website: "https://domainreseller.com",
      },
      domainCategories: ["business", "general"],
      score: 65,
      status: "Interested" as const,
      lastActivity: "2025-03-23",
    },
    {
      name: "Crypto Domains Group",
      source: "Web Scraper",
      portfolioSize: "300+",
      contactInfo: {
        email: "sales@cryptodomains.group",
      },
      domainCategories: ["crypto", "blockchain"],
      score: 78,
      status: "New" as const,
      lastActivity: "2025-03-26",
    },
    {
      name: "Domain Marketplace XYZ",
      source: "GoDaddy Auctions",
      portfolioSize: "750+",
      contactInfo: {
        email: "support@domainmarketplace.xyz",
        phone: "+1 (555) 987-6543",
      },
      domainCategories: ["premium", "business"],
      score: 81,
      status: "Not Interested" as const,
      lastActivity: "2025-03-22",
    },
  ]

  for (const leadData of sampleLeads) {
    await LeadRepository.createLead(leadData)
  }
}

