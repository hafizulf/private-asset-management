import { APP_ENV } from "@/config/env";
import { ZodError } from 'zod';

export enum HttpCode {
  BAD_REQUEST = 400,
  CONFLICT = 409,
  FORBIDDEN = 403,
  INTERNAL_SERVER_ERROR = 500,
  NO_CONTENT = 100,
  NOT_FOUND = 404,
  OK = 200,
  RESOURCE_CREATED = 201,
  UNAUTHORIZED = 401,
  VALIDATION_ERROR = 422,
}

interface AppErrorArgs {
  statusCode: HttpCode;
  description: string;
  name?: string;
  errors?: any;
  error?: any;
  isOperational?: boolean;
}

export class AppError extends Error {
  public readonly name: string;
  public readonly statusCode: HttpCode;
  public readonly isOperational: boolean = true;
  public readonly errors?: any;
  public readonly error?: any;

  constructor(args: AppErrorArgs) {
    super(args.description);

    Object.setPrototypeOf(this, new.target.prototype);

    this.name = args.name || "Error";
    this.statusCode = args.statusCode;
    this.errors = args.errors;
    this.error = APP_ENV !== "production" ? args.error : "";
    if (args.isOperational !== undefined) {
      this.isOperational = args.isOperational;
    }

    Error.captureStackTrace(this);
  }

  public static fromZodError(
    error: ZodError,
    description: string = 'Validation error'
  ): AppError {
    const detailedErrors = error.errors.reduce(
      (
        acc: Record<string, string[]>,
        err: { path: (string | number)[]; message: string }
      ) => {
        const path = err.path.join('.');
        const message = err.message;

        if (acc[path]) {
          acc[path].push(message);
        } else {
          acc[path] = [message];
        }

        return acc;
      },
      {}
    );

    return new AppError({
      statusCode: HttpCode.VALIDATION_ERROR,
      description,
      errors: detailedErrors,
      isOperational: true,
    });
  }
}
