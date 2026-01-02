import Decimal from "decimal.js";

export const toDecimal = (v: string | number) => new Decimal(v ?? 0);
