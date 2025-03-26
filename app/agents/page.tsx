import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import RunAgentsButton from "@/components/run-agents-button"
import AgentCard from "@/components/agent-card"
import { getAgentStatuses } from "@/lib/aigne/runner"
import { AIGNE_CONFIG } from "@/lib/aigne/config"

export default async function AgentsPage() {
  // Get agent configurations and statuses
  const agents = AIGNE_CONFIG.getAgents()
  const statuses = getAgentStatuses()

  // Combine configuration and status data
  const agentData = agents.map((agent) => {
    const status = statuses.find((s) => s.agentName === agent.name) || {
      agentName: agent.name,
      status: agent.enabled ? "active" : "paused",
      lastRun: null,
      lastRunResult: null,
    }

    return {
      id: agent.name,
      name: agent.name
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
      description: agent.description,
      status: status.status,
      lastRun: status.lastRun ? new Date(status.lastRun).toLocaleString() : "Never",
      leadsFound: status.lastRunResult?.leadsFound || 0,
      source: agent.tools.find((tool) => tool.name === "web_scraper")?.config.urls[0] || "",
      schedule: agent.schedule || "manual",
    }
  })

  return (
    <main className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">AIGNE Agents</h1>
        </div>

        <RunAgentsButton />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {agentData.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>
    </main>
  )
}

