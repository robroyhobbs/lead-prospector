"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"

export default function UpdateStatusForm({
  leadId,
  currentStatus,
}: {
  leadId: string
  currentStatus: string
}) {
  const router = useRouter()
  const [status, setStatus] = useState(currentStatus)
  const [loading, setLoading] = useState(false)

  const handleStatusChange = async (newStatus) => {
    if (newStatus === currentStatus) return

    setStatus(newStatus)
    setLoading(true)

    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update status")
      }

      // Refresh the page data
      router.refresh()
    } catch (error) {
      console.error("Error updating status:", error)
      // Revert to previous status on error
      setStatus(currentStatus)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={status} onValueChange={handleStatusChange} disabled={loading}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Update Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="New">New</SelectItem>
          <SelectItem value="Contacted">Contacted</SelectItem>
          <SelectItem value="Interested">Interested</SelectItem>
          <SelectItem value="Not Interested">Not Interested</SelectItem>
          <SelectItem value="Converted">Converted</SelectItem>
        </SelectContent>
      </Select>

      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
    </div>
  )
}

