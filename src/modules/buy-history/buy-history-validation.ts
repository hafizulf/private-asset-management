import { z } from "zod";
import { singleUUIDSchema, uuidV7RegexSchema } from "../common/validation/uuid-schema";
import { paginatedSchema } from "../common/validation/pagination-schema";
import dayjs from "dayjs";

const format = "DD/MM/YYYY";

export const createBuyHistorySchema = z.object({
  commodityId: singleUUIDSchema,
  date: z
    .string()
    .refine((val) => {
      const parsed = dayjs(val, format, true);
      return parsed.isValid();
    }, {
      message: `Invalid date / format in 'date' field, should be ${format}`,
    })
    .transform((val) => {
      const parsed = dayjs(val, format, true);
      return parsed.tz("Asia/Jakarta").toDate();
    }),
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

export const updateBuyHistorySchema = z.object({
  id: singleUUIDSchema,
  commodityId: singleUUIDSchema,
  date: z
    .string()
    .refine((val) => {
      const parsed = dayjs(val, format, true);
      return parsed.isValid();
    }, {
      message: `Invalid date / format in 'date' field, should be ${format}`,
    })
    .transform((val) => {
      const parsed = dayjs(val, format, true);
      return parsed.tz("Asia/Jakarta").toDate();
    })
    .optional(),
  qty: z
  .number()
  .optional()
  .refine((val) => val === undefined || val >= 1, {
    message: 'Qty must be at least 1',
  }),
  totalPrice: z.number().optional(),
  memo: z.string().optional(),
});

export const deleteBuyHistorySchema = uuidV7RegexSchema;
