import { z } from "zod";
import { paginatedSchema } from "../common/validation/pagination-schema";

export const paginatedAuditLogsSchema = paginatedSchema.extend({
  orderBy: z.optional(
    z.string()
      .refine(
        value => ['user', 'action', 'type', 'createdAt'].includes(value), 
        "Order by must be user, action, type or createdAt"
      )
  )
})
