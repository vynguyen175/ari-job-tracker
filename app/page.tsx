'use client'

import { useState, useEffect, useCallback, useMemo } from "react"
import { useAuth } from "@/components/providers"
import { useToast } from "@/hooks/use-toast"
import { Briefcase, Plus, Search, TrendingUp, Send, Phone, Award, X, Zap } from "lucide-react"
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

  const DEMO_DATA = [
    { company: 'Google', role: 'Software Engineer L4', status: 'technical_interview', salary_min: 150000, salary_max: 220000, location: 'Mountain View, CA', work_mode: 'hybrid', tech_stack: ['Go', 'Python', 'Kubernetes'], url: 'https://careers.google.com', contact_person: 'Sarah Chen (recruiter)', date_applied: '2026-05-10', notes: 'Passed phone screen. System design round next week.' },
    { company: 'Shopify', role: 'Senior Frontend Developer', status: 'phone_screen', salary_min: 130000, salary_max: 170000, location: 'Toronto, ON', work_mode: 'remote', tech_stack: ['React', 'TypeScript', 'GraphQL'], url: 'https://shopify.com/careers', contact_person: 'Mike Ross (hiring manager)', date_applied: '2026-05-15', notes: 'Referral from a friend. Phone screen scheduled for Friday.' },
    { company: 'Stripe', role: 'Full-Stack Engineer', status: 'applied', salary_min: 160000, salary_max: 200000, location: 'San Francisco, CA', work_mode: 'hybrid', tech_stack: ['Ruby', 'React', 'PostgreSQL'], url: 'https://stripe.com/jobs', date_applied: '2026-05-20' },
    { company: 'Vercel', role: 'Software Engineer', status: 'offer', salary_min: 140000, salary_max: 180000, location: 'Remote', work_mode: 'remote', tech_stack: ['Next.js', 'TypeScript', 'Node.js'], contact_person: 'Lisa Park (recruiter)', date_applied: '2026-04-28', notes: 'Offer received! $165k base + equity. Decision deadline June 5.' },
    { company: 'Netflix', role: 'UI Engineer', status: 'final_round', salary_min: 180000, salary_max: 250000, location: 'Los Gatos, CA', work_mode: 'onsite', tech_stack: ['React', 'Node.js', 'Java'], url: 'https://jobs.netflix.com', date_applied: '2026-05-05', notes: 'Final round with VP of Engineering on Monday.' },
    { company: 'Coinbase', role: 'Backend Engineer', status: 'rejected', salary_min: 140000, salary_max: 190000, location: 'Remote', work_mode: 'remote', tech_stack: ['Go', 'PostgreSQL', 'AWS'], date_applied: '2026-05-01', notes: 'Rejected after technical interview. Feedback: needed more distributed systems experience.' },
    { company: 'Figma', role: 'Product Engineer', status: 'applied', salary_min: 150000, salary_max: 200000, location: 'San Francisco, CA', work_mode: 'hybrid', tech_stack: ['TypeScript', 'C++', 'WebGL'], url: 'https://figma.com/careers', date_applied: '2026-05-22' },
    { company: 'Datadog', role: 'Software Engineer', status: 'saved', salary_min: 130000, salary_max: 175000, location: 'New York, NY', work_mode: 'hybrid', tech_stack: ['Go', 'Python', 'Kafka'], url: 'https://careers.datadoghq.com' },
    { company: 'Notion', role: 'Frontend Engineer', status: 'saved', salary_min: 140000, salary_max: 190000, location: 'San Francisco, CA', work_mode: 'hybrid', tech_stack: ['React', 'TypeScript', 'Rust'], url: 'https://notion.so/careers' },
    { company: 'Wealthsimple', role: 'Full-Stack Developer', status: 'phone_screen', salary_min: 120000, salary_max: 155000, location: 'Toronto, ON', work_mode: 'remote', tech_stack: ['Ruby on Rails', 'React', 'PostgreSQL'], contact_person: 'James Liu (talent)', date_applied: '2026-05-18', notes: 'Great culture fit. Phone screen went well, waiting for next steps.' },
  ]

  const handleLoadDemoData = async () => {
    if (applications.length > 0) {
      const confirmed = window.confirm('This will add demo data alongside your existing applications. Continue?')
      if (!confirmed) return
    }

    let added = 0
    for (const app of DEMO_DATA) {
      try {
        const res = await fetch(API_BASE, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ application: app }),
        })
        if (res.ok) added++
      } catch {}
    }

    await fetchApplications()
    toast({ title: "Demo data loaded", description: `Added ${added} sample applications` })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full p-4 overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <Briefcase className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Job Tracker</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {applications.length} application{applications.length !== 1 ? 's' : ''} in your pipeline
            </p>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          {applications.length === 0 && (
            <Button variant="outline" onClick={handleLoadDemoData}>
              <Zap className="w-4 h-4 mr-1" /> Load Demo Data
            </Button>
          )}
          <Button onClick={() => handleAddClick('saved')}>
            <Plus className="w-4 h-4 mr-1" /> Add
          </Button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-3">
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
