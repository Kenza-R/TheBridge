import { prisma } from "../lib/prisma.js";
import { logger } from "../lib/logger.js";

export async function purgeExpiredMessages(): Promise<number> {
  const result = await prisma.peerMessage.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });

  if (result.count > 0) {
    await prisma.$executeRawUnsafe("VACUUM ANALYZE peer_messages");
    logger.info({ deleted: result.count }, "Expired peer messages purged");
  }

  return result.count;
}
