import "express-async-errors";
import { Response } from "express";
import { exitHandler } from "@/libs/exit-handler";
import { AppError, HttpCode } from "./app-error";

class ErrorHandler {
  public handleError(error: Error | AppError, response?: Response): void {
    if (this.isTrustedError(error) && response) {
      this.handleTrustedError(error as AppError, response);
    } else {
      this.handleUntrustedError(error, response);
    }
  }

  public isTrustedError(error: Error): boolean {
    if (error instanceof AppError) {
      return error.isOperational;
    } else if (error instanceof SyntaxError) {
      return true;
    }

    return false;
  }

  private handleTrustedError(error: AppError, response: Response): void {
    response.status(error.statusCode).json({
      statusCode: error.statusCode,
      message: error.message,
      errors: error.errors,
      e: error.error,
    });
  }

  private handleUntrustedError(
    error: Error | AppError,
    response?: Response
  ): void {
    if (response) {
      response
        .status(HttpCode.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal server error" });
    }

    console.log("Application encountered an untrusted error.");
    console.log(error);
    exitHandler.handleExit(1);
  }
}

export const errorHandler = new ErrorHandler();
