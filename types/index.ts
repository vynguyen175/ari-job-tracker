export const JOB_STATUSES = [
  'saved',
  'applied',
  'phone_screen',
  'technical_interview',
  'final_round',
  'offer',
  'rejected',
] as const

export type JobStatus = typeof JOB_STATUSES[number]

export const STATUS_LABELS: Record<JobStatus, string> = {
  saved: 'Saved',
  applied: 'Applied',
  phone_screen: 'Phone Screen',
  technical_interview: 'Technical Interview',
  final_round: 'Final Round',
  offer: 'Offer',
  rejected: 'Rejected',
}

export const STATUS_COLORS: Record<JobStatus, string> = {
  saved: 'bg-gray-100 dark:bg-gray-800',
  applied: 'bg-blue-50 dark:bg-blue-950',
  phone_screen: 'bg-amber-50 dark:bg-amber-950',
  technical_interview: 'bg-purple-50 dark:bg-purple-950',
  final_round: 'bg-orange-50 dark:bg-orange-950',
  offer: 'bg-emerald-50 dark:bg-emerald-950',
  rejected: 'bg-red-50 dark:bg-red-950',
}

export const STATUS_HEADER_COLORS: Record<JobStatus, string> = {
  saved: 'bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600',
  applied: 'bg-blue-100 dark:bg-blue-900 border-blue-200 dark:border-blue-800',
  phone_screen: 'bg-amber-100 dark:bg-amber-900 border-amber-200 dark:border-amber-800',
  technical_interview: 'bg-purple-100 dark:bg-purple-900 border-purple-200 dark:border-purple-800',
  final_round: 'bg-orange-100 dark:bg-orange-900 border-orange-200 dark:border-orange-800',
  offer: 'bg-emerald-100 dark:bg-emerald-900 border-emerald-200 dark:border-emerald-800',
  rejected: 'bg-red-100 dark:bg-red-900 border-red-200 dark:border-red-800',
}

export const STATUS_DOT_COLORS: Record<JobStatus, string> = {
  saved: 'bg-gray-400',
  applied: 'bg-blue-500',
  phone_screen: 'bg-amber-500',
  technical_interview: 'bg-purple-500',
  final_round: 'bg-orange-500',
  offer: 'bg-emerald-500',
  rejected: 'bg-red-500',
}

export type WorkMode = 'remote' | 'hybrid' | 'onsite'

export interface JobApplication {
  id: string
  user_id: string
  company: string
  role: string
  status: JobStatus
  salary_min: number | null
  salary_max: number | null
  location: string | null
  work_mode: WorkMode | null
  tech_stack: string[] | null
  url: string | null
  notes: string | null
  date_applied: string | null
  contact_person: string | null
  position: number
  created_at: string
  updated_at: string
}
