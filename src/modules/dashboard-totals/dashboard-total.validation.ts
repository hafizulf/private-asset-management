import { z } from "zod";
import { ENUM_FILTER_DASHBOARD } from "./dashboard-total.dto";
import { indoDateToIso } from "../common/validation/date-schema";
import { singleUUIDSchema } from "../common/validation/uuid-schema";

const basicDashboardSchema = z.object({
    filter: z.nativeEnum(ENUM_FILTER_DASHBOARD),
    from: indoDateToIso.optional(),
    to: indoDateToIso.optional(),
  })
  .superRefine((val, ctx) => {
    if (val.filter === ENUM_FILTER_DASHBOARD.DATE_RANGE) {
      if (!val.from) ctx.addIssue({ code: "custom", path: ["from"], message: "`from` wajib" });
      if (!val.to) ctx.addIssue({ code: "custom", path: ["to"], message: "`to` wajib" });

      if (val.from && val.to && val.from > val.to) {
        ctx.addIssue({ code: "custom", path: ["from"], message: "`from` tidak boleh > `to`" });
      }
    } else {
      if (val.from || val.to) {
        ctx.addIssue({
          code: "custom",
          path: ["from"],
          message: "`from/to` hanya boleh saat filter = date_range",
        });
      }
    }
  });

export const getProfitLossSchema = basicDashboardSchema;

export const getStockAssetsSchema = z.object({
  commodity: singleUUIDSchema.optional(),
});

export const getBuyTransactionsSchema = basicDashboardSchema;

export const getSellTransactionsSchema = basicDashboardSchema;
