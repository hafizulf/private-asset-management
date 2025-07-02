import { z } from "zod";

export const createCommoditySchema = z.object({
  name: z.string(),
  unit: z.string(),
  isActive: z.boolean(),
});
