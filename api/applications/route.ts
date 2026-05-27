import { NextRequest, NextResponse } from "next/server"
import { eq, desc } from "drizzle-orm"
import { getAuthenticatedUser } from "@/lib/auth-helpers"
import { validateRequestBody, createErrorResponse, toSnakeCase } from "@/lib/api-helpers"
import { jobApplications } from "@/modules/job-tracker/database/schema"
import {
  createApplicationSchema,
  updateApplicationSchema,
  deleteApplicationSchema,
  JobApplicationSchema,
  JobApplicationListSchema,
} from "@/modules/job-tracker/lib/validation"
import { registry } from "@/lib/openapi/registry"

registry.registerPath({
  method: "get",
  path: "/api/modules/job-tracker/applications",
  summary: "List all job applications",
  tags: ["Job Tracker"],
  responses: {
    200: { description: "List of job applications", content: { "application/json": { schema: JobApplicationListSchema } } },
    401: { description: "Unauthorized" },
  },
})

export async function GET() {
  try {
    const { user, withRLS } = await getAuthenticatedUser()
    if (!user || !withRLS) {
      return createErrorResponse("Authentication required", 401)
    }

    const data = await withRLS((db: any) =>
      db.select().from(jobApplications)
        .where(eq(jobApplications.userId, user.id))
        .orderBy(desc(jobApplications.createdAt))
    )

    return NextResponse.json(toSnakeCase(data))
  } catch (error: any) {
    console.error("Error fetching applications:", error)
    return createErrorResponse(error?.message || "Failed to fetch applications", 500)
  }
}

registry.registerPath({
  method: "post",
  path: "/api/modules/job-tracker/applications",
  summary: "Create a job application",
  tags: ["Job Tracker"],
  request: { body: { content: { "application/json": { schema: createApplicationSchema } } } },
  responses: {
    200: { description: "Created application", content: { "application/json": { schema: JobApplicationSchema } } },
    401: { description: "Unauthorized" },
  },
})

export async function POST(request: NextRequest) {
  try {
    const { user, withRLS } = await getAuthenticatedUser()
    if (!user || !withRLS) {
      return createErrorResponse("Authentication required", 401)
    }

    const result = await validateRequestBody(request, createApplicationSchema)
    if (!result.success) return result.response

    const { application } = result.data

    const data = await withRLS((db: any) =>
      db.insert(jobApplications)
        .values({
          userId: user.id,
          company: application.company,
          role: application.role,
          status: application.status || 'saved',
          salaryMin: application.salary_min ?? null,
          salaryMax: application.salary_max ?? null,
          location: application.location ?? null,
          workMode: application.work_mode ?? null,
          techStack: application.tech_stack ?? null,
          url: application.url || null,
          notes: application.notes ?? null,
          dateApplied: application.date_applied ?? null,
          contactPerson: application.contact_person ?? null,
        })
        .returning()
    )

    return NextResponse.json(toSnakeCase(data[0]))
  } catch (error: any) {
    console.error("Error creating application:", error)
    return createErrorResponse(error?.message || "Failed to create application", 500)
  }
}

registry.registerPath({
  method: "put",
  path: "/api/modules/job-tracker/applications",
  summary: "Update a job application",
  tags: ["Job Tracker"],
  request: { body: { content: { "application/json": { schema: updateApplicationSchema } } } },
  responses: {
    200: { description: "Updated application", content: { "application/json": { schema: JobApplicationSchema } } },
    401: { description: "Unauthorized" },
  },
})

export async function PUT(request: NextRequest) {
  try {
    const { user, withRLS } = await getAuthenticatedUser()
    if (!user || !withRLS) {
      return createErrorResponse("Authentication required", 401)
    }

    const result = await validateRequestBody(request, updateApplicationSchema)
    if (!result.success) return result.response

    const { application } = result.data
    const { id, ...updates } = application

    const updateValues: Record<string, any> = { updatedAt: new Date().toISOString() }
    if (updates.company !== undefined) updateValues.company = updates.company
    if (updates.role !== undefined) updateValues.role = updates.role
    if (updates.status !== undefined) updateValues.status = updates.status
    if (updates.salary_min !== undefined) updateValues.salaryMin = updates.salary_min
    if (updates.salary_max !== undefined) updateValues.salaryMax = updates.salary_max
    if (updates.location !== undefined) updateValues.location = updates.location
    if (updates.work_mode !== undefined) updateValues.workMode = updates.work_mode
    if (updates.tech_stack !== undefined) updateValues.techStack = updates.tech_stack
    if (updates.url !== undefined) updateValues.url = updates.url || null
    if (updates.notes !== undefined) updateValues.notes = updates.notes
    if (updates.date_applied !== undefined) updateValues.dateApplied = updates.date_applied
    if (updates.contact_person !== undefined) updateValues.contactPerson = updates.contact_person
    if (updates.position !== undefined) updateValues.position = updates.position

    const data = await withRLS((db: any) =>
      db.update(jobApplications)
        .set(updateValues)
        .where(eq(jobApplications.id, id))
        .returning()
    )

    if (!data.length) {
      return createErrorResponse("Application not found", 404)
    }

    return NextResponse.json(toSnakeCase(data[0]))
  } catch (error: any) {
    console.error("Error updating application:", error)
    return createErrorResponse(error?.message || "Failed to update application", 500)
  }
}

registry.registerPath({
  method: "delete",
  path: "/api/modules/job-tracker/applications",
  summary: "Delete a job application",
  tags: ["Job Tracker"],
  responses: {
    200: { description: "Deleted successfully" },
    401: { description: "Unauthorized" },
  },
})

export async function DELETE(request: NextRequest) {
  try {
    const { user, withRLS } = await getAuthenticatedUser()
    if (!user || !withRLS) {
      return createErrorResponse("Authentication required", 401)
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) {
      return createErrorResponse("Missing application ID", 400)
    }

    const parsed = deleteApplicationSchema.safeParse({ id })
    if (!parsed.success) {
      return createErrorResponse("Invalid application ID", 400)
    }

    await withRLS((db: any) =>
      db.delete(jobApplications)
        .where(eq(jobApplications.id, id))
    )

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error deleting application:", error)
    return createErrorResponse(error?.message || "Failed to delete application", 500)
  }
}
