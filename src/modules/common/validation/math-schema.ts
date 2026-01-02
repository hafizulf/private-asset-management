import { z } from "zod";

export const max2dp = (v: number) => Number(v.toFixed(2)) === v;

export const decimal2String = z.number()
  .gt(0)
  .refine(max2dp, { message: "Max 2 decimal places allowed" })
  .transform(v => v.toFixed(2));
