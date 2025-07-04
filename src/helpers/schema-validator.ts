import { z, ZodError } from 'zod';
import { AppError } from '@/exceptions/app-error';

/**
 * Validates data against a given Zod schema and throws an AppError if validation fails.
 *
 * @param schema - The Zod schema to validate against
 * @param data - The data to validate
 * @param description - A custom description for the validation error (default: "Validation error")
 * @returns The validated data
 * @throws AppError if validation fails
 */
export function validateSchema<S extends z.ZodTypeAny>(
  schema: S,
  data: unknown,
  description = 'Validation error'
): z.output<S> {
  const validationResult = schema.safeParse(data);

  if (!validationResult.success) {
    const error = validationResult.error as ZodError;

    throw AppError.fromZodError(error, description);
  }

  return validationResult.data;
}
