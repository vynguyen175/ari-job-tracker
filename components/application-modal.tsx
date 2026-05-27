'use client'

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, X } from "lucide-react"
import { JOB_STATUSES, STATUS_LABELS } from "../types"
import type { JobApplication, JobStatus, WorkMode } from "../types"

interface ApplicationModalProps {
  open: boolean
  onClose: () => void
  onSave: (data: Partial<JobApplication> & { company: string; role: string }) => void
  onDelete?: (id: string) => void
  application?: JobApplication | null
  defaultStatus?: JobStatus
}

export function ApplicationModal({
  open,
  onClose,
  onSave,
  onDelete,
  application,
  defaultStatus = 'saved',
}: ApplicationModalProps) {
  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [status, setStatus] = useState<JobStatus>(defaultStatus)
  const [salaryMin, setSalaryMin] = useState('')
  const [salaryMax, setSalaryMax] = useState('')
  const [location, setLocation] = useState('')
  const [workMode, setWorkMode] = useState<WorkMode | ''>('')
  const [techStackInput, setTechStackInput] = useState('')
  const [techStack, setTechStack] = useState<string[]>([])
  const [url, setUrl] = useState('')
  const [notes, setNotes] = useState('')
  const [dateApplied, setDateApplied] = useState('')
  const [contactPerson, setContactPerson] = useState('')

  useEffect(() => {
    if (application) {
      setCompany(application.company)
      setRole(application.role)
      setStatus(application.status)
      setSalaryMin(application.salary_min?.toString() || '')
      setSalaryMax(application.salary_max?.toString() || '')
      setLocation(application.location || '')
      setWorkMode((application.work_mode as WorkMode) || '')
      setTechStack(application.tech_stack || [])
      setUrl(application.url || '')
      setNotes(application.notes || '')
      setDateApplied(application.date_applied || '')
      setContactPerson(application.contact_person || '')
    } else {
      setCompany('')
      setRole('')
      setStatus(defaultStatus)
      setSalaryMin('')
      setSalaryMax('')
      setLocation('')
      setWorkMode('')
      setTechStack([])
      setTechStackInput('')
      setUrl('')
      setNotes('')
      setDateApplied('')
      setContactPerson('')
    }
  }, [application, defaultStatus, open])

  const handleAddTech = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && techStackInput.trim()) {
      e.preventDefault()
      if (!techStack.includes(techStackInput.trim())) {
        setTechStack([...techStack, techStackInput.trim()])
      }
      setTechStackInput('')
    }
  }

  const handleRemoveTech = (tech: string) => {
    setTechStack(techStack.filter((t) => t !== tech))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...(application?.id ? { id: application.id } : {}),
      company,
      role,
      status,
      salary_min: salaryMin ? parseInt(salaryMin) : null,
      salary_max: salaryMax ? parseInt(salaryMax) : null,
      location: location || null,
      work_mode: workMode || null,
      tech_stack: techStack.length > 0 ? techStack : null,
      url: url || null,
      notes: notes || null,
      date_applied: dateApplied || null,
      contact_person: contactPerson || null,
    })
  }

  const isEditing = !!application

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Application' : 'Add Application'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="company">Company *</Label>
              <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="role">Role *</Label>
              <Input id="role" value={role} onChange={(e) => setRole(e.target.value)} required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as JobStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {JOB_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="workMode">Work Mode</Label>
              <Select value={workMode} onValueChange={(v) => setWorkMode(v as WorkMode)}>
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="remote">Remote</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                  <SelectItem value="onsite">Onsite</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="salaryMin">Salary Min</Label>
              <Input id="salaryMin" type="number" placeholder="e.g. 80000" value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="salaryMax">Salary Max</Label>
              <Input id="salaryMax" type="number" placeholder="e.g. 120000" value={salaryMax} onChange={(e) => setSalaryMax(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="location">Location</Label>
              <Input id="location" placeholder="e.g. Toronto" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="dateApplied">Date Applied</Label>
              <Input id="dateApplied" type="date" value={dateApplied} onChange={(e) => setDateApplied(e.target.value)} />
            </div>
          </div>

          <div>
            <Label htmlFor="url">Job Posting URL</Label>
            <Input id="url" type="url" placeholder="https://..." value={url} onChange={(e) => setUrl(e.target.value)} />
          </div>

          <div>
            <Label htmlFor="contactPerson">Contact Person</Label>
            <Input id="contactPerson" placeholder="e.g. Jane Smith (recruiter)" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} />
          </div>

          <div>
            <Label htmlFor="techStack">Tech Stack (press Enter to add)</Label>
            <Input
              id="techStack"
              value={techStackInput}
              onChange={(e) => setTechStackInput(e.target.value)}
              onKeyDown={handleAddTech}
              placeholder="e.g. React"
            />
            {techStack.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {techStack.map((tech) => (
                  <span
                    key={tech}
                    className="inline-flex items-center gap-1 text-xs bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded px-2 py-1"
                  >
                    {tech}
                    <button type="button" onClick={() => handleRemoveTech(tech)} className="hover:text-red-500">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any additional notes..." />
          </div>

          <div className="flex justify-between pt-2">
            {isEditing && onDelete ? (
              <Button type="button" variant="destructive" size="sm" onClick={() => onDelete(application!.id)}>
                <Trash2 className="w-4 h-4 mr-1" /> Delete
              </Button>
            ) : (
              <div />
            )}
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit">{isEditing ? 'Save Changes' : 'Add Application'}</Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
