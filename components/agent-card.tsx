"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Play, Pause, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface AgentCardProps {
  agent: {
    id: string
    name: string
    description: string
    status: "active" | "paused" | "error"
    lastRun: string
    leadsFound: number
    source: string
    schedule: string
  }
}

export default function AgentCard({ agent }: AgentCardProps) {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(agent.status)
  const { toast } = useToast()
  const router = useRouter()

  const handleRunAgent = async () => {
    setLoading(true)

    try {
      const response = await fetch(`/api/agents/${agent.id}`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to run agent")
      }

      const result = await response.json()

      toast({
        title: "Agent Started",
        description: `${agent.name} has been started successfully.`,
      })

      // Refresh the page after a short delay
      setTimeout(() => {
        router.refresh()
      }, 1000)
    } catch (error) {
      console.error("Error running agent:", error)

      toast({
        title: "Error",
        description: "Failed to start agent. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async () => {
    try {
      const response = await fetch(`/api/agents/${agent.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "toggle",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to toggle agent status")
      }

      const result = await response.json()

      // Update local state
      setStatus(result.status)

      toast({
        title: "Status Updated",
        description: `${agent.name} is now ${result.status}.`,
      })

      // Refresh the page
      router.refresh()
    } catch (error) {
      console.error("Error toggling agent status:", error)

      toast({
        title: "Error",
        description: "Failed to update agent status. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{agent.name}</CardTitle>
          <div
            className={`px-2 py-1 rounded-full text-xs ${
              status === "active"
                ? "bg-green-500 text-white"
                : status === "error"
                  ? "bg-red-500 text-white"
                  : "bg-gray-200 text-gray-700"
            }`}
          >
            {status}
          </div>
        </div>
        <CardDescription>{agent.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Source URL</p>
          <p className="text-sm truncate">{agent.source}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Last Run</p>
            <p>{agent.lastRun}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">Schedule</p>
            <p className="capitalize">{agent.schedule}</p>
          </div>
        </div>

        {agent.leadsFound > 0 && (
          <div>
            <p className="text-sm font-medium text-muted-foreground">Last Run Results</p>
            <p>{agent.leadsFound} leads found</p>
          </div>
        )}

        <div className="flex justify-between">
          <Button variant="outline" size="sm" onClick={handleToggleStatus}>
            {status === "active" ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Activate
              </>
            )}
          </Button>

          <Button variant="default" size="sm" onClick={handleRunAgent} disabled={loading || status === "paused"}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Running..." : "Run Now"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

