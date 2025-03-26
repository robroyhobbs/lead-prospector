import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import Link from "next/link"
import { getAgentStatuses } from "@/lib/aigne/runner"
import { AIGNE_CONFIG } from "@/lib/aigne/config"

export default async function AgentStatus() {
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
      status: status.status,
      lastRun: status.lastRun
        ? new Date(status.lastRun).toLocaleString(undefined, {
            hour: "numeric",
            minute: "numeric",
            hour12: true,
            day: "numeric",
            month: "short",
          })
        : "Never",
      leadsFound: status.lastRunResult?.leadsFound || 0,
    }
  })

  // Only show enabled agents on dashboard
  const activeAgents = agentData.filter((agent) => agent.status === "active" || agent.status === "error")

  return (
    <Card>
      <CardHeader>
        <CardTitle>AIGNE Agents</CardTitle>
        <CardDescription>Status of your data collection agents</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activeAgents.length > 0 ? (
            activeAgents.map((agent) => (
              <div key={agent.id} className="flex items-center justify-between p-2 border rounded-lg">
                <div>
                  <div className="font-medium flex items-center gap-2">
                    {agent.name}
                    <Badge variant={agent.status === "active" ? "default" : "destructive"}>{agent.status}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Last run: {agent.lastRun} • {agent.leadsFound} leads
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-2">
              No active agents. Visit the Agents page to activate.
            </p>
          )}

          <Button variant="outline" className="w-full" size="sm" asChild>
            <Link href="/agents">
              <RefreshCw className="h-4 w-4 mr-2" />
              Manage Agents
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

