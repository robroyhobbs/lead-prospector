// Core AIGNE framework configuration based on the official AIGNE framework
// https://github.com/AIGNE-io/aigne-framework

export interface AgentConfig {
  name: string
  description: string
  tools: ToolConfig[]
  output: {
    database: string
    collection: string
  }
  schedule?: string
  enabled: boolean
}

export interface ToolConfig {
  name: string
  config: Record<string, any>
}

// Main AIGNE configuration following the framework structure
export const AIGNE_CONFIG = {
  version: "0.1.0",
  projectName: "Domain Prospector",
  agents: [] as AgentConfig[],

  // Register an agent
  registerAgent(agent: AgentConfig) {
    this.agents.push(agent)
    return this
  },

  // Get all registered agents
  getAgents() {
    return this.agents
  },

  // Get a specific agent by name
  getAgent(name: string) {
    return this.agents.find((agent) => agent.name === name)
  },
}

// Initialize with our agents
import { sedoScraperConfig } from "./agents/sedo-scraper"
import { openSeaScraperConfig } from "./agents/opensea-scraper"
import { godaddyScraperConfig } from "./agents/godaddy-scraper"

// Register all agents
AIGNE_CONFIG.registerAgent(sedoScraperConfig).registerAgent(openSeaScraperConfig).registerAgent(godaddyScraperConfig)

