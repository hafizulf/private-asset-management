import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

const format = "DD/MM/YYYY";

export const validateDateString = (dateString: string): Date => {
  // First, strictly parse the string
  const parsedLocal = dayjs(dateString, format, true); // ✅ strict = true

  if (!parsedLocal.isValid()) {
    throw new Error(`Invalid date format: ${dateString}. Expected format: ${format}`);
  }

  // Then apply the timezone
  const zoned = parsedLocal.tz("Asia/Jakarta"); // convert to Asia/Jakarta time zone

  return zoned.toDate(); // return as JS Date object
};
