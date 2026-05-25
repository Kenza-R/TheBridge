import { getEnv } from "../config/env.js";
import { logger } from "../lib/logger.js";

export type EhrWorkflowSignals = {
  physician_id: string;
  date: string;
  after_hours_minutes: number;
  note_events_count: number;
  encounter_sessions_count: number;
  login_events_count: number;
  /** No patient IDs, no PHI narratives */
  metadata_only: true;
};

/**
 * Epic FHIR R4 — physician workflow timing metadata only.
 * Production: Intersystems IRIS SDK + bulk Group/$export per hospital.
 * Scopes: system/AuditEvent.read, system/Practitioner.read, system/Encounter.read (metadata)
 */
export async function fetchEhrWorkflowSignals(params: {
  physicianId: string;
  epicAccessToken: string;
}): Promise<EhrWorkflowSignals> {
  const env = getEnv();
  if (!env.ENABLE_EPIC_SYNC || !env.EPIC_FHIR_BASE_URL) {
    logger.debug({ physicianId: params.physicianId }, "Epic sync disabled — returning stub signals");
    return {
      physician_id: params.physicianId,
      date: new Date().toISOString().slice(0, 10),
      after_hours_minutes: 0,
      note_events_count: 0,
      encounter_sessions_count: 0,
      login_events_count: 0,
      metadata_only: true,
    };
  }

  // TODO: IRIS SDK — AuditEvent, Encounter timing aggregation
  void params.epicAccessToken;
  throw new Error("Epic FHIR sync not implemented — enable after App Orchard registration");
}

export async function runHospitalEpicSync(hospitalId: string): Promise<void> {
  logger.info({ hospitalId }, "Epic FHIR bulk sync started");
  // Staggered per-hospital cron: parse login/note/encounter timestamps only
  logger.info({ hospitalId }, "Epic FHIR bulk sync completed (stub)");
}
