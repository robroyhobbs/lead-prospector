"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export default function RunAgentsButton() {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleRunAgents = async () => {
    setLoading(true)

    try {
      const response = await fetch("/api/agents", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to run agents")
      }

      const results = await response.json()

      toast({
        title: "Agents Started",
        description: `Started ${results.length} agents successfully.`,
      })

      // Refresh the page after a short delay
      setTimeout(() => {
        router.refresh()
      }, 1000)
    } catch (error) {
      console.error("Error running agents:", error)

      toast({
        title: "Error",
        description: "Failed to start agents. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleRunAgents} disabled={loading}>
      <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
      {loading ? "Running..." : "Run All Agents"}
    </Button>
  )
}

