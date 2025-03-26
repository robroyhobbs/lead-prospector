"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw, AlertCircle, CheckCircle } from "lucide-react"

interface AgentRun {
  agentName: string
  success: boolean
  leadsFound: number
  error?: string
  timestamp: string
}

export default function RecentAgentRuns() {
  const [runs, setRuns] = useState<AgentRun[]>([])
  const [loading, setLoading] = useState(true)

  const fetchRecentRuns = async () => {
    setLoading(true)

    try {
      // This would fetch from an API endpoint in production
      // For now, we'll use mock data

      const mockRuns: AgentRun[] = [
        {
          agentName: "sedo_portfolio_scraper",
          success: true,
          leadsFound: 5,
          timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        },
        {
          agentName: "opensea_domain_scanner",
          success: true,
          leadsFound: 3,
          timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        },
        {
          agentName: "godaddy_auctions_scanner",
          success: false,
          leadsFound: 0,
          error: "Connection timeout",
          timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        },
      ]

      setRuns(mockRuns)
    } catch (error) {
      console.error("Error fetching recent runs:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecentRuns()
  }, [])

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) {
      return `${diffMins} min${diffMins !== 1 ? "s" : ""} ago`
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`
    } else {
      return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`
    }
  }

  const formatAgentName = (name: string) => {
    return name
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Recent Agent Runs</CardTitle>
            <CardDescription>Latest data collection activities</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={fetchRecentRuns} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-4">
            <RefreshCw className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : runs.length > 0 ? (
          <div className="space-y-4">
            {runs.map((run, index) => (
              <div key={index} className="flex items-start gap-3 pb-3 border-b last:border-0">
                {run.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{formatAgentName(run.agentName)}</p>
                    <span className="text-xs text-muted-foreground">{formatTimestamp(run.timestamp)}</span>
                  </div>
                  {run.success ? (
                    <p className="text-sm text-muted-foreground">
                      Found {run.leadsFound} new lead{run.leadsFound !== 1 ? "s" : ""}
                    </p>
                  ) : (
                    <p className="text-sm text-red-500">Failed: {run.error || "Unknown error"}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-4">No recent agent runs found.</p>
        )}
      </CardContent>
    </Card>
  )
}

