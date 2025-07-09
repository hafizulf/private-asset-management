import { Request, Response, NextFunction } from "express";
import { inject, injectable } from "inversify";
import TYPES from "@/types";
import { AppError, HttpCode } from "@/exceptions/app-error";
import { JWT_SECRET_KEY } from "@/config/env";
import { IAuthRequest } from "./auth-interface";
import { WebAuthService } from "@/modules/authentications/web-auth-service";
import { WebAuthDomain } from "@/modules/authentications/web-auth-domain";
import jwt, { JsonWebTokenError, JwtPayload, TokenExpiredError } from "jsonwebtoken";
import { TokenErrMessage } from "@/exceptions/error-message-constants";
import { UserService } from "@/modules/users/user-service";

@injectable()
export class AuthMiddleware {
  constructor(
    @inject(TYPES.WebAuthService) private _webAuthService: WebAuthService,
    @inject(TYPES.UserService) private _userService: UserService,
  ) {}

  authenticate = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
      return next(new AppError({
        description: TokenErrMessage.MISSING,
        statusCode: HttpCode.UNAUTHORIZED
      }));
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET_KEY) as JwtPayload;
      if (!decoded.id || !decoded.exp || typeof decoded.tokenVersion !== 'number') {
        return next(new AppError({
          statusCode: HttpCode.UNAUTHORIZED,
          description: TokenErrMessage.INVALID_PAYLOAD,
        }));
      }

      const newReq = req as IAuthRequest;
      const authUser = await this._webAuthService.getMe(token, JWT_SECRET_KEY); // verify signature and get user
      if (!authUser?.user?.id) {
        return next(new AppError({
          statusCode: HttpCode.UNAUTHORIZED,
          description: 'Failed to resolve authenticated user',
        }));
      }

      if(decoded.tokenVersion !== authUser.user.tokenVersion) {
        return next(new AppError({
          statusCode: HttpCode.UNAUTHORIZED,
          description: TokenErrMessage.REVOKED,
        }));
      }
      
      newReq.authUser = WebAuthDomain.create(authUser, JWT_SECRET_KEY);

      return next();
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        return next(new AppError({
          statusCode: HttpCode.UNAUTHORIZED,
          description: TokenErrMessage.EXPIRED,
        }));
      } else if (error instanceof JsonWebTokenError) {
        return next(new AppError({
          statusCode: HttpCode.UNAUTHORIZED,
          description: TokenErrMessage.INVALID,
        }));
      } else {
        console.error(error);

        return next(new AppError({
          statusCode: HttpCode.INTERNAL_SERVER_ERROR,
          description: "Failed to authenticate user",
          error: error,
        }));
      }
    }
  }

  roleAuthorize = (allowedRoles: string[]) => {
    return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
      const authUser = (req as IAuthRequest).authUser;
      const userId = authUser.user.id;
      const userData = await this._userService.findWithRoleByUserId(userId);
      
      if (!allowedRoles.includes(userData.role!.name)) {
        return next(new AppError({
          statusCode: HttpCode.FORBIDDEN,
          description: 'Forbidden',
        }));
      }

      return next();
    }
  }
}
