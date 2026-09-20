BEGIN;

ALTER TABLE IF EXISTS public.applicant_invitations
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_applicant_invitations_deleted_at
  ON public.applicant_invitations (landlord_id, deleted_at, created_at DESC);

COMMIT;
