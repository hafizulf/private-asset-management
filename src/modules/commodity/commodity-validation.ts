import { z } from "zod";
import { paginatedSchema } from "../common/validation/pagination-schema";
import { uuidV7RegexSchema } from "../common/validation/uuid-schema";

export const createCommoditySchema = z.object({
  name: z.string(),
  unit: z.string(),
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
