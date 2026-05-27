'use client'

import { useState } from "react"
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { useDroppable } from "@dnd-kit/core"
import { Plus } from "lucide-react"
import { ApplicationCard } from "./application-card"
import { JOB_STATUSES, STATUS_LABELS, STATUS_HEADER_COLORS, STATUS_DOT_COLORS } from "../types"
import type { JobApplication, JobStatus } from "../types"

interface KanbanColumnProps {
  status: JobStatus
  applications: JobApplication[]
  onCardClick: (app: JobApplication) => void
  onAddClick: (status: JobStatus) => void
}

function KanbanColumn({ status, applications, onCardClick, onAddClick }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status })

  return (
    <div className="flex flex-col flex-1 min-w-0">
      <div className={`rounded-t-lg px-3 py-2 border ${STATUS_HEADER_COLORS[status]}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${STATUS_DOT_COLORS[status]}`} />
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {STATUS_LABELS[status]}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400 bg-white/50 dark:bg-black/20 rounded-full px-2 py-0.5">
              {applications.length}
            </span>
            <button
              onClick={() => onAddClick(status)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={setNodeRef}
        className={`flex-1 rounded-b-lg border-x border-b border-gray-200 dark:border-gray-700 p-2 space-y-2 min-h-[200px] transition-colors ${
          isOver ? 'bg-blue-50/50 dark:bg-blue-950/30' : 'bg-gray-50/50 dark:bg-gray-900/50'
        }`}
      >
        <SortableContext items={applications.map((a) => a.id)} strategy={verticalListSortingStrategy}>
          {applications.map((app) => (
            <ApplicationCard key={app.id} application={app} onClick={onCardClick} />
          ))}
        </SortableContext>
      </div>
    </div>
  )
}

interface KanbanBoardProps {
  applications: JobApplication[]
  onStatusChange: (id: string, newStatus: JobStatus) => void
  onCardClick: (app: JobApplication) => void
  onAddClick: (status: JobStatus) => void
}

export function KanbanBoard({ applications, onStatusChange, onCardClick, onAddClick }: KanbanBoardProps) {
  const [activeApp, setActiveApp] = useState<JobApplication | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  )

  const getAppsByStatus = (status: JobStatus) =>
    applications.filter((a) => a.status === status)

  const handleDragStart = (event: DragStartEvent) => {
    const app = applications.find((a) => a.id === event.active.id)
    if (app) setActiveApp(app)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveApp(null)
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    const isOverColumn = (JOB_STATUSES as readonly string[]).includes(overId)
    const targetStatus = isOverColumn
      ? (overId as JobStatus)
      : applications.find((a) => a.id === overId)?.status

    if (!targetStatus) return

    const draggedApp = applications.find((a) => a.id === activeId)
    if (draggedApp && draggedApp.status !== targetStatus) {
      onStatusChange(activeId, targetStatus)
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-2 pb-4 h-full min-w-0 w-full">
        {JOB_STATUSES.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            applications={getAppsByStatus(status)}
            onCardClick={onCardClick}
            onAddClick={onAddClick}
          />
        ))}
      </div>

      <DragOverlay>
        {activeApp && (
          <div className="rotate-2 opacity-90">
            <ApplicationCard application={activeApp} onClick={() => {}} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
