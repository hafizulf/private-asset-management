import { z } from "zod";
import { paginatedSchema } from "../common/validation/pagination-schema";
import { uuidV7RegexSchema } from "../common/validation/uuid-schema";

export const createCommoditySchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long"),
  unit: z.string().min(1, "Unit must be at least 1 characters long"),
  isActive: z.boolean(),
});

export const findOneCommoditySchema = uuidV7RegexSchema;

export const paginatedCommoditySchema = paginatedSchema.extend({
  orderBy: z.optional(
    z.string()
      .refine(value => ['name', 'createdAt'].includes(value), "Order by must be name or createdAt")
  )
})

export const updateCommoditySchema = findOneCommoditySchema.merge(createCommoditySchema);

export const deleteCommoditySchema = findOneCommoditySchema;
