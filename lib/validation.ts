import { z } from "zod"
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi"

extendZodWithOpenApi(z)

const jobStatusEnum = z.enum([
  'saved', 'applied', 'phone_screen', 'technical_interview',
  'final_round', 'offer', 'rejected'
])

const workModeEnum = z.enum(['remote', 'hybrid', 'onsite'])

export const createApplicationSchema = z.object({
  application: z.object({
    company: z.string().min(1, "Company name is required").max(200),
    role: z.string().min(1, "Role is required").max(200),
    status: jobStatusEnum.optional().default('saved'),
    salary_min: z.number().int().positive().optional().nullable(),
    salary_max: z.number().int().positive().optional().nullable(),
    location: z.string().max(200).optional().nullable(),
    work_mode: workModeEnum.optional().nullable(),
    tech_stack: z.array(z.string().max(50)).max(20).optional().nullable(),
    url: z.string().max(2000).optional().nullable(),
    notes: z.string().max(2000).optional().nullable(),
    date_applied: z.string().optional().nullable(),
    contact_person: z.string().max(200).optional().nullable(),
  }),
}).openapi('CreateJobApplicationBody')

export const updateApplicationSchema = z.object({
  application: z.object({
    id: z.string().uuid("Invalid application ID"),
    company: z.string().min(1).max(200).optional(),
    role: z.string().min(1).max(200).optional(),
    status: jobStatusEnum.optional(),
    salary_min: z.number().int().positive().optional().nullable(),
    salary_max: z.number().int().positive().optional().nullable(),
    location: z.string().max(200).optional().nullable(),
    work_mode: workModeEnum.optional().nullable(),
    tech_stack: z.array(z.string().max(50)).max(20).optional().nullable(),
    url: z.string().max(2000).optional().nullable(),
    notes: z.string().max(2000).optional().nullable(),
    date_applied: z.string().optional().nullable(),
    contact_person: z.string().max(200).optional().nullable(),
    position: z.number().int().optional(),
  }),
}).openapi('UpdateJobApplicationBody')

export const deleteApplicationSchema = z.object({
  id: z.string().uuid("Invalid application ID"),
}).openapi('DeleteJobApplicationParams')

export const JobApplicationSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string(),
  company: z.string(),
  role: z.string(),
  status: jobStatusEnum,
  salary_min: z.number().nullable(),
  salary_max: z.number().nullable(),
  location: z.string().nullable(),
  work_mode: workModeEnum.nullable(),
  tech_stack: z.array(z.string()).nullable(),
  url: z.string().nullable(),
  notes: z.string().nullable(),
  date_applied: z.string().nullable(),
  contact_person: z.string().nullable(),
  position: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
}).openapi('JobApplication')

export const JobApplicationListSchema = z.array(JobApplicationSchema).openapi('JobApplicationList')
