import { z } from "zod";
import { paginatedSchema } from "../common/validation/pagination-schema";
import { singleUUIDSchema } from "../common/validation/uuid-schema";

export const paginatedStockAssetSchema = paginatedSchema.extend({
  orderBy: z.optional(
    z.string()
      .refine(
        value => ['commodityName', 'qty', 'createdAt'].includes(value), 
      "Order by must be commodityName, qty or createdAt"
      )
  )
});

export const findByCommoditySchema = z.object({
  commodityId: singleUUIDSchema,
});
