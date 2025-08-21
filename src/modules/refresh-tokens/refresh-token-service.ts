import TYPES from "@/types";
import { injectable, inject } from "inversify";
import jwt from "jsonwebtoken";
import { JWT_REFRESH_SECRET_KEY } from "@/config/env";
import { TokenExpiredError } from "jsonwebtoken";
import { IRefreshTokenRepository } from "./refresh-token-repository-interface";
import { IUserRepository } from "../users/user-repository-interface";

@injectable()
export class RefreshTokenService {
  constructor(
    @inject(TYPES.IRefreshTokenRepository) private _refreshTokenRepository: IRefreshTokenRepository,
    @inject(TYPES.IUserRepository) private _userRepository: IUserRepository,
  ) {}

  public async deleteExpiredTokens(): Promise<void> {
    const tokens = await this._refreshTokenRepository.findAll();

    if (tokens.length > 0) {
      for (const el of tokens) {
        try {
          jwt.verify(el.token, JWT_REFRESH_SECRET_KEY);
        } catch (error) {
          if (error instanceof TokenExpiredError) {
            await this._refreshTokenRepository.delete(el.token);
          } else {
            console.error("An error occurred while verifying the token:", error);
          }
        }
      }
    }
  }

  public async revokeRefreshToken(userId: string): Promise<void> {
    const revoked = await this._refreshTokenRepository.revoke(userId);
    if(revoked.isRevoked) {
      await this._userRepository.incrementTokenVersion(userId);
    }
  }
}
