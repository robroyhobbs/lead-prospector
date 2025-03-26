"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"

export default function AddActivityForm({ leadId }: { leadId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [activityType, setActivityType] = useState("")
  const [notes, setNotes] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!activityType || !notes) return

    setLoading(true)

    try {
      const response = await fetch(`/api/leads/${leadId}/activities`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: activityType,
          notes,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to add activity")
      }

      // Reset form
      setActivityType("")
      setNotes("")

      // Refresh the page data
      router.refresh()
    } catch (error) {
      console.error("Error adding activity:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1">
          <Select value={activityType} onValueChange={setActivityType}>
            <SelectTrigger>
              <SelectValue placeholder="Activity Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Email">Email</SelectItem>
              <SelectItem value="Call">Call</SelectItem>
              <SelectItem value="Meeting">Meeting</SelectItem>
              <SelectItem value="Demo">Demo</SelectItem>
              <SelectItem value="Follow-up">Follow-up</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-2">
          <div className="flex gap-2">
            <Textarea
              placeholder="Activity notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={loading || !activityType || !notes}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}

