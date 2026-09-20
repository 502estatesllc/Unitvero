BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.applicant_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  landlord_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  unit_id uuid REFERENCES public.units(id) ON DELETE SET NULL,
  applicant_name text NOT NULL,
  applicant_email text NOT NULL,
  applicant_phone text,
  token_hash text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'revoked', 'expired')),
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  revoked_at timestamptz,
  CONSTRAINT applicant_invitations_email_format CHECK (applicant_email ~* '^[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\\.[A-Z]{2,}$')
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_applicant_invitations_token_hash
  ON public.applicant_invitations (token_hash);

CREATE INDEX IF NOT EXISTS idx_applicant_invitations_landlord_property
  ON public.applicant_invitations (landlord_id, property_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_applicant_invitations_landlord_unit
  ON public.applicant_invitations (landlord_id, unit_id, status, expires_at);

CREATE INDEX IF NOT EXISTS idx_applicant_invitations_email_status
  ON public.applicant_invitations (applicant_email, status, expires_at);

ALTER TABLE IF EXISTS public.rental_applications
  ADD COLUMN IF NOT EXISTS desired_move_in_date date,
  ADD COLUMN IF NOT EXISTS references_details text,
  ADD COLUMN IF NOT EXISTS additional_notes text,
  ADD COLUMN IF NOT EXISTS applicant_consent boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS applicant_consent_at timestamptz,
  ADD COLUMN IF NOT EXISTS applicant_invitation_id uuid;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'rental_applications_applicant_invitation_id_unique'
  ) THEN
    ALTER TABLE public.rental_applications
      ADD CONSTRAINT rental_applications_applicant_invitation_id_unique UNIQUE (applicant_invitation_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'rental_applications_applicant_invitation_id_fkey'
  ) THEN
    ALTER TABLE public.rental_applications
      ADD CONSTRAINT rental_applications_applicant_invitation_id_fkey
      FOREIGN KEY (applicant_invitation_id)
      REFERENCES public.applicant_invitations(id)
      ON DELETE SET NULL;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_rental_applications_applicant_invitation_id
  ON public.rental_applications (applicant_invitation_id)
  WHERE applicant_invitation_id IS NOT NULL;

ALTER TABLE public.applicant_invitations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS applicant_invitations_landlord_own_records ON public.applicant_invitations;
CREATE POLICY applicant_invitations_landlord_own_records
ON public.applicant_invitations
FOR ALL
TO authenticated
USING (landlord_id = auth.uid())
WITH CHECK (
  landlord_id = auth.uid()
  AND EXISTS (
    SELECT 1
    FROM public.properties p
    WHERE p.id = applicant_invitations.property_id
      AND p.landlord_id = auth.uid()
  )
  AND (
    applicant_invitations.unit_id IS NULL
    OR EXISTS (
      SELECT 1
      FROM public.units u
      WHERE u.id = applicant_invitations.unit_id
        AND u.landlord_id = auth.uid()
        AND u.property_id = applicant_invitations.property_id
    )
  )
);

DROP POLICY IF EXISTS applicant_invitations_no_anon_access ON public.applicant_invitations;
CREATE POLICY applicant_invitations_no_anon_access
ON public.applicant_invitations
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

DROP POLICY IF EXISTS applicant_invitations_no_public_access ON public.applicant_invitations;
CREATE POLICY applicant_invitations_no_public_access
ON public.applicant_invitations
FOR ALL
TO public
USING (false)
WITH CHECK (false);

COMMIT;
