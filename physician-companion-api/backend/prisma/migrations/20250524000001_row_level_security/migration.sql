-- Run after `prisma migrate dev` creates base tables from schema.prisma

ALTER TABLE distress_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE circle_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE peer_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE self_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE wellness_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION app_current_physician_id() RETURNS uuid AS $$
  SELECT NULLIF(current_setting('app.current_physician_id', true), '')::uuid;
$$ LANGUAGE sql STABLE;

CREATE POLICY distress_scores_physician_own ON distress_scores
  FOR ALL
  USING (physician_id = app_current_physician_id())
  WITH CHECK (physician_id = app_current_physician_id());

CREATE POLICY circle_members_participant ON circle_members
  FOR ALL
  USING (owner_id = app_current_physician_id() OR member_id = app_current_physician_id())
  WITH CHECK (owner_id = app_current_physician_id());

CREATE POLICY peer_messages_participant ON peer_messages
  FOR ALL
  USING (sender_id = app_current_physician_id() OR recipient_id = app_current_physician_id())
  WITH CHECK (sender_id = app_current_physician_id());

CREATE POLICY self_reports_own ON self_reports
  FOR ALL
  USING (physician_id = app_current_physician_id())
  WITH CHECK (physician_id = app_current_physician_id());

CREATE POLICY wellness_sessions_own ON wellness_sessions
  FOR ALL
  USING (physician_id = app_current_physician_id())
  WITH CHECK (physician_id = app_current_physician_id());

CREATE POLICY notifications_own ON notifications
  FOR ALL
  USING (physician_id = app_current_physician_id())
  WITH CHECK (physician_id = app_current_physician_id());
