'use client'

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Building2, MapPin, ExternalLink, DollarSign } from "lucide-react"
import type { JobApplication } from "../types"

interface ApplicationCardProps {
  application: JobApplication
  onClick: (app: JobApplication) => void
}

export function ApplicationCard({ application, onClick }: ApplicationCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: application.id, data: { application } })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const formatSalary = (min: number | null, max: number | null) => {
    if (!min && !max) return null
    const fmt = (n: number) => `$${(n / 1000).toFixed(0)}k`
    if (min && max) return `${fmt(min)} - ${fmt(max)}`
    if (min) return `${fmt(min)}+`
    return `Up to ${fmt(max!)}`
  }

  const salary = formatSalary(application.salary_min, application.salary_max)

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick(application)}
      className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 cursor-grab active:cursor-grabbing hover:border-gray-300 dark:hover:border-gray-600 shadow-sm hover:shadow transition-shadow"
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
          {application.role}
        </h3>
        {application.url && (
          <a
            href={application.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-gray-400 hover:text-blue-500 shrink-0"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-2">
        <Building2 className="w-3 h-3" />
        <span className="truncate">{application.company}</span>
      </div>

      <div className="flex flex-wrap gap-1">
        {application.location && (
          <span className="inline-flex items-center gap-0.5 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded px-1.5 py-0.5">
            <MapPin className="w-3 h-3" />
            {application.location}
          </span>
        )}
        {application.work_mode && (
          <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded px-1.5 py-0.5 capitalize">
            {application.work_mode}
          </span>
        )}
        {salary && (
          <span className="inline-flex items-center gap-0.5 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950 rounded px-1.5 py-0.5">
            <DollarSign className="w-3 h-3" />
            {salary}
          </span>
        )}
      </div>

      {application.tech_stack && application.tech_stack.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {application.tech_stack.slice(0, 3).map((tech) => (
            <span
              key={tech}
              className="text-xs bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded px-1.5 py-0.5"
            >
              {tech}
            </span>
          ))}
          {application.tech_stack.length > 3 && (
            <span className="text-xs text-gray-400">
              +{application.tech_stack.length - 3}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
