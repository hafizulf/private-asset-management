import { z } from "zod";
import { singleUUIDSchema } from "../common/validation/uuid-schema";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

export const generateAccessTokenSchema = z.object({
  refreshToken: z.string(),
})

export const revokeRefreshTokenSchema = z.object({
  userId: singleUUIDSchema,
})

export const logoutSchema = generateAccessTokenSchema;
