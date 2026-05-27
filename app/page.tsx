'use client'

import { useState, useEffect, useCallback, useMemo } from "react"
import { useAuth } from "@/components/providers"
import { useToast } from "@/hooks/use-toast"
import { Briefcase, Plus, Search, TrendingUp, Send, Phone, Award, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { KanbanBoard } from "../components/kanban-board"
import { ApplicationModal } from "../components/application-modal"
import { JOB_STATUSES, STATUS_DOT_COLORS, STATUS_LABELS } from "../types"
import type { JobApplication, JobStatus } from "../types"

const API_BASE = "/api/modules/job-tracker/applications"

export default function JobTrackerPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingApp, setEditingApp] = useState<JobApplication | null>(null)
  const [defaultStatus, setDefaultStatus] = useState<JobStatus>('saved')
  const [searchQuery, setSearchQuery] = useState('')

  const fetchApplications = useCallback(async () => {
    try {
      const res = await fetch(API_BASE)
      if (!res.ok) throw new Error("Failed to fetch")
      const data = await res.json()
      setApplications(data)
    } catch {
      toast({ title: "Error", description: "Failed to load applications", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchApplications()
  }, [fetchApplications])

  const filteredApplications = useMemo(() => {
    if (!searchQuery.trim()) return applications
    const q = searchQuery.toLowerCase()
    return applications.filter((a) =>
      a.company.toLowerCase().includes(q) ||
      a.role.toLowerCase().includes(q) ||
      a.location?.toLowerCase().includes(q) ||
      a.tech_stack?.some((t) => t.toLowerCase().includes(q)) ||
      a.work_mode?.toLowerCase().includes(q)
    )
  }, [applications, searchQuery])

  const stats = useMemo(() => {
    const total = applications.length
    const active = applications.filter((a) => !['rejected', 'saved'].includes(a.status)).length
    const interviews = applications.filter((a) =>
      ['phone_screen', 'technical_interview', 'final_round'].includes(a.status)
    ).length
    const offers = applications.filter((a) => a.status === 'offer').length
    const responseRate = total > 0
      ? Math.round((applications.filter((a) => a.status !== 'saved' && a.status !== 'applied').length / total) * 100)
      : 0

    return { total, active, interviews, offers, responseRate }
  }, [applications])

  const handleSave = async (data: Partial<JobApplication> & { company: string; role: string }) => {
    try {
      const isEditing = !!data.id
      const res = await fetch(API_BASE, {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ application: data }),
      })

      const result = await res.json()

      if (!res.ok) {
        const details = result.details?.map((d: any) => d.message || d).join(', ')
        throw new Error(details || result.error || result.message || "Failed to save")
      }

      if (isEditing) {
        setApplications((prev) => prev.map((a) => (a.id === result.id ? result : a)))
      } else {
        setApplications((prev) => [result, ...prev])
      }

      setModalOpen(false)
      setEditingApp(null)
      toast({ title: isEditing ? "Updated" : "Added", description: `${result.company} - ${result.role}` })
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to save application", variant: "destructive" })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}?id=${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete")

      setApplications((prev) => prev.filter((a) => a.id !== id))
      setModalOpen(false)
      setEditingApp(null)
      toast({ title: "Deleted", description: "Application removed" })
    } catch {
      toast({ title: "Error", description: "Failed to delete application", variant: "destructive" })
    }
  }

  const handleStatusChange = async (id: string, newStatus: JobStatus) => {
    setApplications((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
    )

    try {
      const res = await fetch(API_BASE, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ application: { id, status: newStatus } }),
      })
      if (!res.ok) throw new Error("Failed to update status")
    } catch {
      fetchApplications()
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" })
    }
  }

  const handleCardClick = (app: JobApplication) => {
    setEditingApp(app)
    setModalOpen(true)
  }

  const handleAddClick = (status: JobStatus) => {
    setEditingApp(null)
    setDefaultStatus(status)
    setModalOpen(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Briefcase className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Job Tracker</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {applications.length} application{applications.length !== 1 ? 's' : ''} in your pipeline
            </p>
          </div>
        </div>
        <Button onClick={() => handleAddClick('saved')}>
          <Plus className="w-4 h-4 mr-1" /> Add Application
        </Button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-1">
            <Send className="w-3.5 h-3.5" />
            Total Applied
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</div>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-1">
            <TrendingUp className="w-3.5 h-3.5" />
            Active
          </div>
          <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{stats.active}</div>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-1">
            <Phone className="w-3.5 h-3.5" />
            Interviews
          </div>
          <div className="text-xl font-bold text-purple-600 dark:text-purple-400">{stats.interviews}</div>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-1">
            <Award className="w-3.5 h-3.5" />
            Offers
          </div>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{stats.offers}</div>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-1">
            <TrendingUp className="w-3.5 h-3.5" />
            Response Rate
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-gray-100">{stats.responseRate}%</div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search by company, role, location, or tech stack..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 pr-9"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Kanban Board */}
      <KanbanBoard
        applications={filteredApplications}
        onStatusChange={handleStatusChange}
        onCardClick={handleCardClick}
        onAddClick={handleAddClick}
      />

      <ApplicationModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingApp(null) }}
        onSave={handleSave}
        onDelete={handleDelete}
        application={editingApp}
        defaultStatus={defaultStatus}
      />
    </div>
  )
}
