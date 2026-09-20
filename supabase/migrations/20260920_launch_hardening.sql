-- Safe, additive migration for the current production schema.
-- This migration does not drop or rewrite existing data and intentionally leaves the
-- existing live messaging and maintenance_expenses RLS in place.

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE IF EXISTS public.maintenance_expenses
  ADD COLUMN IF NOT EXISTS receipt_content_type text,
  ADD COLUMN IF NOT EXISTS receipt_size_bytes bigint,
  ADD COLUMN IF NOT EXISTS receipt_uploaded_at timestamptz;

CREATE TABLE IF NOT EXISTS public.automated_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  landlord_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  property_id uuid REFERENCES public.properties(id) ON DELETE SET NULL,
  tenancy_id uuid REFERENCES public.tenancies(id) ON DELETE SET NULL,
  reminder_type text NOT NULL CHECK (reminder_type IN ('lease_renewal', 'inspection')),
  title text NOT NULL,
  due_date timestamptz NOT NULL,
  lead_days integer NOT NULL DEFAULT 0,
  schedule_offset_days integer NOT NULL DEFAULT 0,
  reminder_status text NOT NULL DEFAULT 'pending' CHECK (reminder_status IN ('pending', 'sent', 'completed', 'cancelled', 'skipped')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.vacancy_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  landlord_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  property_id uuid REFERENCES public.properties(id) ON DELETE SET NULL,
  unit_id uuid REFERENCES public.units(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  rent numeric(12,2) NOT NULL DEFAULT 0,
  deposit numeric(12,2) NOT NULL DEFAULT 0,
  bedrooms integer NOT NULL DEFAULT 0,
  bathrooms numeric(4,2) NOT NULL DEFAULT 0,
  availability_date date,
  listing_status text NOT NULL DEFAULT 'draft' CHECK (listing_status IN ('draft', 'active', 'paused', 'leased', 'archived')),
  syndication_status text NOT NULL DEFAULT 'not_requested' CHECK (syndication_status IN ('not_requested', 'queued', 'syncing', 'synced', 'failed', 'disabled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.listing_syndications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  landlord_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  listing_id uuid REFERENCES public.vacancy_listings(id) ON DELETE CASCADE,
  provider text NOT NULL,
  external_listing_id text,
  external_listing_url text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'queued', 'active', 'failed', 'disabled')),
  last_synced_at timestamptz,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.rent_credit_reporting_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenancy_id uuid NOT NULL REFERENCES public.tenancies(id) ON DELETE CASCADE,
  tenant_user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  landlord_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  consent_status text NOT NULL DEFAULT 'not_requested' CHECK (consent_status IN ('not_requested', 'pending', 'granted', 'revoked', 'expired')),
  consented_at timestamptz,
  reporting_provider text,
  enrollment_status text NOT NULL DEFAULT 'inactive' CHECK (enrollment_status IN ('inactive', 'pending', 'active', 'paused', 'closed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.rent_credit_reporting_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id uuid REFERENCES public.rent_credit_reporting_enrollments(id) ON DELETE CASCADE,
  tenancy_id uuid REFERENCES public.tenancies(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN ('payment_eligible', 'reported', 'correction', 'dispute', 'reversal')),
  payment_id uuid,
  event_date timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'rejected', 'corrected')),
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.property_inspections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  landlord_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  property_id uuid REFERENCES public.properties(id) ON DELETE SET NULL,
  tenancy_id uuid REFERENCES public.tenancies(id) ON DELETE SET NULL,
  unit_id uuid REFERENCES public.units(id) ON DELETE SET NULL,
  inspection_type text NOT NULL CHECK (inspection_type IN ('move_in', 'move_out', 'periodic')),
  scheduled_date timestamptz,
  completed_date timestamptz,
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'requires_attention')),
  landlord_acknowledged_at timestamptz,
  tenant_acknowledged_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.inspection_checklist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id uuid NOT NULL REFERENCES public.property_inspections(id) ON DELETE CASCADE,
  room_or_area text,
  item_name text NOT NULL,
  condition text,
  notes text,
  required_flag boolean NOT NULL DEFAULT false,
  required_photo_count integer NOT NULL DEFAULT 0,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.inspection_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id uuid NOT NULL REFERENCES public.property_inspections(id) ON DELETE CASCADE,
  checklist_item_id uuid REFERENCES public.inspection_checklist_items(id) ON DELETE CASCADE,
  file_name text,
  file_path text NOT NULL,
  content_type text,
  file_size bigint,
  uploaded_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_automated_reminders_landlord_due
  ON public.automated_reminders (landlord_id, due_date, reminder_status, status);
CREATE INDEX IF NOT EXISTS idx_vacancy_listings_landlord_status
  ON public.vacancy_listings (landlord_id, listing_status, availability_date);
CREATE INDEX IF NOT EXISTS idx_listing_syndications_listing_provider
  ON public.listing_syndications (listing_id, provider, status);
CREATE INDEX IF NOT EXISTS idx_rent_credit_reporting_enrollments_landlord
  ON public.rent_credit_reporting_enrollments (landlord_id, tenancy_id, consent_status);
CREATE INDEX IF NOT EXISTS idx_rent_credit_reporting_events_enrollment
  ON public.rent_credit_reporting_events (enrollment_id, event_date, status);
CREATE INDEX IF NOT EXISTS idx_property_inspections_landlord_property
  ON public.property_inspections (landlord_id, property_id, tenancy_id, status);
CREATE INDEX IF NOT EXISTS idx_inspection_checklist_items_inspection_order
  ON public.inspection_checklist_items (inspection_id, required_flag, sort_order);
CREATE INDEX IF NOT EXISTS idx_inspection_photos_inspection_item
  ON public.inspection_photos (inspection_id, checklist_item_id, created_at);

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS automated_reminders_touch_updated_at ON public.automated_reminders;
CREATE TRIGGER automated_reminders_touch_updated_at
BEFORE UPDATE ON public.automated_reminders
FOR EACH ROW
EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS vacancy_listings_touch_updated_at ON public.vacancy_listings;
CREATE TRIGGER vacancy_listings_touch_updated_at
BEFORE UPDATE ON public.vacancy_listings
FOR EACH ROW
EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS listing_syndications_touch_updated_at ON public.listing_syndications;
CREATE TRIGGER listing_syndications_touch_updated_at
BEFORE UPDATE ON public.listing_syndications
FOR EACH ROW
EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS rent_credit_reporting_enrollments_touch_updated_at ON public.rent_credit_reporting_enrollments;
CREATE TRIGGER rent_credit_reporting_enrollments_touch_updated_at
BEFORE UPDATE ON public.rent_credit_reporting_enrollments
FOR EACH ROW
EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS rent_credit_reporting_events_touch_updated_at ON public.rent_credit_reporting_events;
CREATE TRIGGER rent_credit_reporting_events_touch_updated_at
BEFORE UPDATE ON public.rent_credit_reporting_events
FOR EACH ROW
EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS property_inspections_touch_updated_at ON public.property_inspections;
CREATE TRIGGER property_inspections_touch_updated_at
BEFORE UPDATE ON public.property_inspections
FOR EACH ROW
EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS inspection_checklist_items_touch_updated_at ON public.inspection_checklist_items;
CREATE TRIGGER inspection_checklist_items_touch_updated_at
BEFORE UPDATE ON public.inspection_checklist_items
FOR EACH ROW
EXECUTE FUNCTION public.touch_updated_at();

ALTER TABLE IF EXISTS public.automated_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.vacancy_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.listing_syndications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.rent_credit_reporting_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.rent_credit_reporting_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.property_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.inspection_checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.inspection_photos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS automated_reminders_landlord_access ON public.automated_reminders;
CREATE POLICY automated_reminders_landlord_access
ON public.automated_reminders
FOR ALL
TO authenticated
USING (landlord_id = auth.uid())
WITH CHECK (landlord_id = auth.uid());

DROP POLICY IF EXISTS vacancy_listings_landlord_access ON public.vacancy_listings;
CREATE POLICY vacancy_listings_landlord_access
ON public.vacancy_listings
FOR ALL
TO authenticated
USING (landlord_id = auth.uid())
WITH CHECK (landlord_id = auth.uid());

DROP POLICY IF EXISTS listing_syndications_landlord_access ON public.listing_syndications;
CREATE POLICY listing_syndications_landlord_access
ON public.listing_syndications
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.vacancy_listings vl
    WHERE vl.id = listing_syndications.listing_id
      AND vl.landlord_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.vacancy_listings vl
    WHERE vl.id = listing_syndications.listing_id
      AND vl.landlord_id = auth.uid()
  )
);

DROP POLICY IF EXISTS rent_credit_reporting_enrollments_landlord_access ON public.rent_credit_reporting_enrollments;
CREATE POLICY rent_credit_reporting_enrollments_landlord_access
ON public.rent_credit_reporting_enrollments
FOR ALL
TO authenticated
USING (landlord_id = auth.uid())
WITH CHECK (landlord_id = auth.uid());

DROP POLICY IF EXISTS rent_credit_reporting_enrollments_tenant_access ON public.rent_credit_reporting_enrollments;
CREATE POLICY rent_credit_reporting_enrollments_tenant_access
ON public.rent_credit_reporting_enrollments
FOR SELECT
TO authenticated
USING (tenant_user_id = auth.uid());

DROP POLICY IF EXISTS rent_credit_reporting_events_landlord_access ON public.rent_credit_reporting_events;
CREATE POLICY rent_credit_reporting_events_landlord_access
ON public.rent_credit_reporting_events
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.rent_credit_reporting_enrollments e
    WHERE e.id = rent_credit_reporting_events.enrollment_id
      AND e.landlord_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.rent_credit_reporting_enrollments e
    WHERE e.id = rent_credit_reporting_events.enrollment_id
      AND e.landlord_id = auth.uid()
  )
);

DROP POLICY IF EXISTS rent_credit_reporting_events_tenant_access ON public.rent_credit_reporting_events;
CREATE POLICY rent_credit_reporting_events_tenant_access
ON public.rent_credit_reporting_events
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.rent_credit_reporting_enrollments e
    WHERE e.id = rent_credit_reporting_events.enrollment_id
      AND e.tenant_user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS property_inspections_landlord_access ON public.property_inspections;
CREATE POLICY property_inspections_landlord_access
ON public.property_inspections
FOR ALL
TO authenticated
USING (landlord_id = auth.uid())
WITH CHECK (landlord_id = auth.uid());

DROP POLICY IF EXISTS property_inspections_tenant_access ON public.property_inspections;
CREATE POLICY property_inspections_tenant_access
ON public.property_inspections
FOR SELECT
TO authenticated
USING (
  tenancy_id IS NOT NULL
  AND EXISTS (
    SELECT 1
    FROM public.tenancies t
    JOIN public.properties p ON p.id = t.property_id
    WHERE t.id = property_inspections.tenancy_id
      AND t.tenant_id = auth.uid()
      AND p.landlord_id = property_inspections.landlord_id
  )
);

DROP POLICY IF EXISTS inspection_checklist_items_landlord_access ON public.inspection_checklist_items;
CREATE POLICY inspection_checklist_items_landlord_access
ON public.inspection_checklist_items
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.property_inspections pi
    WHERE pi.id = inspection_checklist_items.inspection_id
      AND pi.landlord_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.property_inspections pi
    WHERE pi.id = inspection_checklist_items.inspection_id
      AND pi.landlord_id = auth.uid()
  )
);

DROP POLICY IF EXISTS inspection_checklist_items_tenant_access ON public.inspection_checklist_items;
CREATE POLICY inspection_checklist_items_tenant_access
ON public.inspection_checklist_items
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.property_inspections pi
    JOIN public.tenancies t ON t.id = pi.tenancy_id
    JOIN public.properties p ON p.id = t.property_id
    WHERE pi.id = inspection_checklist_items.inspection_id
      AND t.tenant_id = auth.uid()
      AND p.landlord_id = pi.landlord_id
  )
);

DROP POLICY IF EXISTS inspection_photos_landlord_access ON public.inspection_photos;
CREATE POLICY inspection_photos_landlord_access
ON public.inspection_photos
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.property_inspections pi
    WHERE pi.id = inspection_photos.inspection_id
      AND pi.landlord_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.property_inspections pi
    WHERE pi.id = inspection_photos.inspection_id
      AND pi.landlord_id = auth.uid()
  )
);

DROP POLICY IF EXISTS inspection_photos_tenant_access ON public.inspection_photos;
CREATE POLICY inspection_photos_tenant_access
ON public.inspection_photos
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.property_inspections pi
    JOIN public.tenancies t ON t.id = pi.tenancy_id
    JOIN public.properties p ON p.id = t.property_id
    WHERE pi.id = inspection_photos.inspection_id
      AND t.tenant_id = auth.uid()
      AND p.landlord_id = pi.landlord_id
  )
);

COMMIT;

COMMIT;
