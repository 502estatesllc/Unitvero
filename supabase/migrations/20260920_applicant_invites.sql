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
  CONSTRAINT applicant_invitations_email_format CHECK (applicant_email ~* '^[A-Z0-9._%+\-]+@[A-Z0-9.-]+\.[A-Z]{2,}$')
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

CREATE OR REPLACE FUNCTION public.submit_applicant_invitation_application(
  p_invitation_id uuid,
  p_applicant_name text,
  p_applicant_email text,
  p_applicant_phone text,
  p_current_address text,
  p_current_city text,
  p_current_state text,
  p_current_zip text,
  p_desired_move_in_date date,
  p_employer_name text,
  p_job_title text,
  p_monthly_income numeric,
  p_current_landlord_name text,
  p_current_landlord_phone text,
  p_current_rent numeric,
  p_references_details text,
  p_previous_address text,
  p_additional_notes text,
  p_occupants_count integer,
  p_occupants_details text,
  p_has_pets boolean,
  p_pets_details text,
  p_vehicles_details text,
  p_applicant_consent boolean
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_invitation public.applicant_invitations%ROWTYPE;
  v_application_id uuid;
BEGIN
  IF p_applicant_consent IS DISTINCT FROM TRUE THEN
    RAISE EXCEPTION 'Applicant consent is required before submission.' USING ERRCODE = 'P0001';
  END IF;

  SELECT *
  INTO v_invitation
  FROM public.applicant_invitations
  WHERE id = p_invitation_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'This invitation is invalid.' USING ERRCODE = 'P0001';
  END IF;

  IF v_invitation.status <> 'pending' THEN
    RAISE EXCEPTION 'This invitation is no longer pending.' USING ERRCODE = 'P0001';
  END IF;

  IF v_invitation.used_at IS NOT NULL THEN
    RAISE EXCEPTION 'This invitation has already been used.' USING ERRCODE = 'P0001';
  END IF;

  IF v_invitation.revoked_at IS NOT NULL THEN
    RAISE EXCEPTION 'This invitation has been revoked.' USING ERRCODE = 'P0001';
  END IF;

  IF v_invitation.expires_at IS NULL OR v_invitation.expires_at <= NOW() THEN
    RAISE EXCEPTION 'This invitation has expired.' USING ERRCODE = 'P0001';
  END IF;

  INSERT INTO public.rental_applications (
    landlord_id,
    property_id,
    unit_id,
    applicant_invitation_id,
    applicant_name,
    applicant_email,
    applicant_phone,
    current_address,
    current_city,
    current_state,
    current_zip,
    desired_move_in_date,
    employer_name,
    job_title,
    monthly_income,
    current_landlord_name,
    current_landlord_phone,
    current_rent,
    references_details,
    previous_address,
    additional_notes,
    occupants_count,
    occupants_details,
    has_pets,
    pets_details,
    vehicles_details,
    applicant_consent,
    applicant_consent_at,
    application_status,
    screening_status
  )
  VALUES (
    v_invitation.landlord_id,
    v_invitation.property_id,
    v_invitation.unit_id,
    p_invitation_id,
    p_applicant_name,
    p_applicant_email,
    p_applicant_phone,
    p_current_address,
    p_current_city,
    p_current_state,
    p_current_zip,
    p_desired_move_in_date,
    p_employer_name,
    p_job_title,
    p_monthly_income,
    p_current_landlord_name,
    p_current_landlord_phone,
    p_current_rent,
    p_references_details,
    p_previous_address,
    p_additional_notes,
    p_occupants_count,
    p_occupants_details,
    p_has_pets,
    p_pets_details,
    p_vehicles_details,
    TRUE,
    NOW(),
    'new',
    'not_started'
  )
  RETURNING id INTO v_application_id;

  UPDATE public.applicant_invitations
  SET status = 'accepted',
      used_at = NOW()
  WHERE id = p_invitation_id
    AND status = 'pending'
    AND used_at IS NULL
    AND revoked_at IS NULL
    AND expires_at > NOW();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'This invitation changed state during submission.' USING ERRCODE = 'P0001';
  END IF;

  RETURN v_application_id;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_applicant_invitation_application(
  uuid,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  date,
  text,
  text,
  numeric,
  text,
  text,
  numeric,
  text,
  text,
  text,
  integer,
  text,
  boolean,
  text,
  text,
  boolean
) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.submit_applicant_invitation_application(
  uuid,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  date,
  text,
  text,
  numeric,
  text,
  text,
  numeric,
  text,
  text,
  text,
  integer,
  text,
  boolean,
  text,
  text,
  boolean
) FROM anon;
REVOKE ALL ON FUNCTION public.submit_applicant_invitation_application(
  uuid,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  date,
  text,
  text,
  numeric,
  text,
  text,
  numeric,
  text,
  text,
  text,
  integer,
  text,
  boolean,
  text,
  text,
  boolean
) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.submit_applicant_invitation_application(
  uuid,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  date,
  text,
  text,
  numeric,
  text,
  text,
  numeric,
  text,
  text,
  text,
  integer,
  text,
  boolean,
  text,
  text,
  boolean
) TO service_role;

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
