import { Prisma, PrismaClient } from "@prisma/client";
import { logger } from "./logger.js";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? [{ emit: "event", level: "query" }]
        : ["warn", "error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

/**
 * Sets session variable for PostgreSQL RLS policies on physician-scoped tables.
 */
export async function withPhysicianContext<T>(
  physicianId: string,
  fn: (tx: PrismaClient) => Promise<T>,
): Promise<T> {
  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.$executeRawUnsafe(
      `SELECT set_config('app.current_physician_id', $1, true)`,
      physicianId,
    );
    return fn(tx as unknown as PrismaClient);
  });
}

export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect();
  logger.info("Prisma disconnected");
}
