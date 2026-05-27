'use client'

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ClipboardPaste, Sparkles, Loader2 } from "lucide-react"
import { parseJobDescription } from "../lib/parse-job-description"
import type { JobApplication } from "../types"

interface PasteModalProps {
  open: boolean
  onClose: () => void
  onParsed: (data: Partial<JobApplication> & { company: string; role: string }) => void
}

export function PasteModal({ open, onClose, onParsed }: PasteModalProps) {
  const [text, setText] = useState('')
  const [parsing, setParsing] = useState(false)

  const handleParse = () => {
    if (!text.trim()) return
    setParsing(true)

    setTimeout(() => {
      const parsed = parseJobDescription(text)

      onParsed({
        company: parsed.company || '',
        role: parsed.role || '',
        location: parsed.location,
        work_mode: parsed.work_mode,
        salary_min: parsed.salary_min,
        salary_max: parsed.salary_max,
        tech_stack: parsed.tech_stack.length > 0 ? parsed.tech_stack : null,
        status: 'saved',
      })

      setText('')
      setParsing(false)
    }, 600)
  }

  const handlePasteFromClipboard = async () => {
    try {
      const clipText = await navigator.clipboard.readText()
      if (clipText) setText(clipText)
    } catch {}
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Paste Job Description</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-gray-500 dark:text-gray-400">
          Paste a job posting and we will extract the company, role, location, salary, work mode, and tech stack automatically.
        </p>

        <div className="space-y-3">
          <div className="flex justify-end">
            <Button variant="ghost" size="sm" onClick={handlePasteFromClipboard}>
              <ClipboardPaste className="w-3.5 h-3.5 mr-1" /> Paste from clipboard
            </Button>
          </div>

          <Textarea
            rows={10}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste the full job description here..."
            className="text-sm"
          />

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleParse} disabled={!text.trim() || parsing}>
              {parsing ? (
                <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Analyzing...</>
              ) : (
                <><Sparkles className="w-4 h-4 mr-1" /> Extract Fields</>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
