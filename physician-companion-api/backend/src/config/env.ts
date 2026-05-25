import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(3000),
  LOG_LEVEL: z.string().default("info"),
  API_PREFIX: z.string().default("/api/v1"),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  AUTH0_DOMAIN: z.string().optional(),
  AUTH0_AUDIENCE: z.string().optional(),
  AUTH0_ISSUER: z.string().url().optional(),
  AUTH0_JWKS_URI: z.string().url().optional(),
  AUTH0_ADMIN_AUDIENCE: z.string().optional(),
  EPIC_FHIR_BASE_URL: z.string().url().optional(),
  EPIC_CLIENT_ID: z.string().optional(),
  EPIC_CLIENT_SECRET: z.string().optional(),
  EXPO_ACCESS_TOKEN: z.string().optional(),
  ENABLE_EPIC_SYNC: z
    .string()
    .optional()
    .transform((v) => v === "true"),
  ENABLE_SCORE_CRON: z
    .string()
    .optional()
    .transform((v) => v === "true"),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | null = null;

export function getEnv(): Env {
  if (!cached) {
    const parsed = envSchema.safeParse(process.env);
    if (!parsed.success) {
      console.error(parsed.error.flatten().fieldErrors);
      throw new Error("Invalid environment configuration");
    }
    cached = parsed.data;
  }
  return cached;
}
