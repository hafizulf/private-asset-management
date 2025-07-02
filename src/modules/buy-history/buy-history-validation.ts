import { AppError, HttpCode } from "@/exceptions/app-error";
import { z } from "zod";
import { validateDateString } from "../common/validation/date-schema";
import { singleUUIDSchema, uuidV7RegexSchema } from "../common/validation/uuid-schema";
import { paginatedSchema } from "../common/validation/pagination-schema";

export const createBuyHistorySchema = z.object({
  commodityId: singleUUIDSchema,
  date: z.preprocess((val) => {
    if (!val || typeof val !== "string") return undefined;
    try {
      return validateDateString(val);
    } catch (error) {
      throw new AppError({
        statusCode: HttpCode.VALIDATION_ERROR,
        description: "Invalid date / format in 'date' field, should be DD/MM/YYYY",
      });
    }
  }, z.date()),
  qty: z.number().min(1),
  totalPrice: z.number().min(1),
  memo: z.string().optional(),
});

export const paginatedBuyHistorySchema = paginatedSchema.extend({
  orderBy: z.optional(
    z.string()
      .refine(value => ['commodityName', 'createdAt'].includes(value), "Order by must be commodityName or createdAt")
  )
})

export const findOneBuyHistorySchema = uuidV7RegexSchema;

export const findHistoryByCommoditySchema = z.object({
  commodityId: singleUUIDSchema,
})
