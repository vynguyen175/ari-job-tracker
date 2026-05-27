import { pgTable, pgPolicy, index, uuid, text, integer, date, timestamp } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const jobApplications = pgTable("job_applications", {
  id: uuid().defaultRandom().primaryKey().notNull(),
  userId: text("user_id").notNull(),
  company: text().notNull(),
  role: text().notNull(),
  status: text().notNull().default('saved'),
  salaryMin: integer("salary_min"),
  salaryMax: integer("salary_max"),
  location: text(),
  workMode: text("work_mode"),
  techStack: text("tech_stack").array(),
  url: text(),
  notes: text(),
  dateApplied: date("date_applied"),
  contactPerson: text("contact_person"),
  position: integer().notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
  index("job_applications_user_id_idx").using("btree", table.userId.asc().nullsLast()),
  index("job_applications_status_idx").using("btree", table.status.asc().nullsLast()),
  index("job_applications_created_at_idx").using("btree", table.createdAt.desc().nullsFirst()),
  pgPolicy("job_applications_rls_select", { as: "permissive", for: "select", to: ["public"], using: sql`(user_id = (select current_setting('app.current_user_id')))` }),
  pgPolicy("job_applications_rls_insert", { as: "permissive", for: "insert", to: ["public"], withCheck: sql`(user_id = (select current_setting('app.current_user_id')))` }),
  pgPolicy("job_applications_rls_update", { as: "permissive", for: "update", to: ["public"], using: sql`(user_id = (select current_setting('app.current_user_id')))` }),
  pgPolicy("job_applications_rls_delete", { as: "permissive", for: "delete", to: ["public"], using: sql`(user_id = (select current_setting('app.current_user_id')))` }),
])
