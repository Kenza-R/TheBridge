import type { FastifyPluginAsync } from "fastify";
import { fetchEhrWorkflowSignals } from "../services/epic-fhir-sync.js";
import type { PhysicianClaims } from "../types/auth.js";

export const fhirRoutes: FastifyPluginAsync = async (app) => {
  const pre = { preHandler: [app.requirePhysician] };

  app.get(`${app.config.apiPrefix}/fhir/ehr-signals`, pre, async (request) => {
    const auth = request.auth as PhysicianClaims;
    const epicToken = request.headers["x-epic-access-token"] as string | undefined;

    if (!epicToken) {
      throw app.httpErrors.badRequest("Epic OAuth token required (x-epic-access-token)");
    }

    const signals = await fetchEhrWorkflowSignals({
      physicianId: auth.physicianId,
      epicAccessToken: epicToken,
    });

    return signals;
  });
};
