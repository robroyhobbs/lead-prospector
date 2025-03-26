"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MoreHorizontal, Search, SlidersHorizontal } from "lucide-react"
import { Badge } from "@/components/ui/badge"

// Mock data - would be fetched from your database in production
const mockLeads = [
  {
    id: "1",
    name: "Domain Portfolio Co",
    source: "Sedo",
    score: 87,
    portfolioSize: "500+",
    status: "New",
    lastActivity: "2025-03-25",
  },
  {
    id: "2",
    name: "Web3 Domains Inc",
    source: "OpenSea",
    score: 92,
    portfolioSize: "1000+",
    status: "Contacted",
    lastActivity: "2025-03-24",
  },
  {
    id: "3",
    name: "Domain Reseller LLC",
    source: "Manual Entry",
    score: 65,
    portfolioSize: "100+",
    status: "Interested",
    status: "Interested",
    lastActivity: "2025-03-23",
  },
  {
    id: "4",
    name: "Crypto Domains Group",
    source: "Web Scraper",
    score: 78,
    portfolioSize: "300+",
    status: "New",
    lastActivity: "2025-03-26",
  },
  {
    id: "5",
    name: "Domain Marketplace XYZ",
    source: "GoDaddy Auctions",
    score: 81,
    portfolioSize: "750+",
    status: "Not Interested",
    lastActivity: "2025-03-22",
  },
]

export default function LeadTable() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredLeads = mockLeads.filter(
    (lead) =>
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.source.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "New":
        return "bg-blue-500"
      case "Contacted":
        return "bg-yellow-500"
      case "Interested":
        return "bg-green-500"
      case "Not Interested":
        return "bg-red-500"
      case "Converted":
        return "bg-purple-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search leads..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon">
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Portfolio Size</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Activity</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLeads.length > 0 ? (
              filteredLeads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium">{lead.name}</TableCell>
                  <TableCell>{lead.source}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-white text-xs ${lead.score >= 80 ? "bg-green-500" : lead.score >= 60 ? "bg-yellow-500" : "bg-red-500"}`}
                    >
                      {lead.score}
                    </span>
                  </TableCell>
                  <TableCell>{lead.portfolioSize}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`${getStatusColor(lead.status)} text-white`}>
                      {lead.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{lead.lastActivity}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Update Status</DropdownMenuItem>
                        <DropdownMenuItem>Add Activity</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  No leads found matching your search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

