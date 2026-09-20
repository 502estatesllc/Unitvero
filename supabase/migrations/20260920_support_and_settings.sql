BEGIN;

CREATE TABLE IF NOT EXISTS public.user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  privacy_mode boolean NOT NULL DEFAULT false,
  preferred_language text NOT NULL DEFAULT 'en',
  notifications_enabled boolean NOT NULL DEFAULT true,
  support_email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  email text,
  subject text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  description text NOT NULL,
  reference_number text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'waiting_on_user', 'resolved', 'closed')),
  priority text NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  source text NOT NULL DEFAULT 'support-page' CHECK (source IN ('dashboard', 'support-page', 'tenant-portal')),
  ai_context jsonb,
  assigned_to uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.support_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  sender_role text NOT NULL CHECK (sender_role IN ('user', 'ai', 'staff')),
  sender_user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  sender_email text,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.support_staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'support' CHECK (role IN ('support', 'admin')),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON public.user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON public.support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(status, priority, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_tickets_reference_number ON public.support_tickets(reference_number);
CREATE INDEX IF NOT EXISTS idx_support_messages_ticket_id ON public.support_messages(ticket_id, created_at);
CREATE INDEX IF NOT EXISTS idx_support_staff_user_id ON public.support_staff(user_id, active);

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS user_settings_touch_updated_at ON public.user_settings;
CREATE TRIGGER user_settings_touch_updated_at
BEFORE UPDATE ON public.user_settings
FOR EACH ROW
EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS support_tickets_touch_updated_at ON public.support_tickets;
CREATE TRIGGER support_tickets_touch_updated_at
BEFORE UPDATE ON public.support_tickets
FOR EACH ROW
EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS support_staff_touch_updated_at ON public.support_staff;
CREATE TRIGGER support_staff_touch_updated_at
BEFORE UPDATE ON public.support_staff
FOR EACH ROW
EXECUTE FUNCTION public.touch_updated_at();

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_staff ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS user_settings_own_access ON public.user_settings;
CREATE POLICY user_settings_own_access
ON public.user_settings
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY user_settings_own_insert
ON public.user_settings
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY user_settings_own_update
ON public.user_settings
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY user_settings_no_delete
ON public.user_settings
FOR DELETE
TO authenticated
USING (false);

DROP POLICY IF EXISTS support_tickets_select_own_or_staff ON public.support_tickets;
CREATE POLICY support_tickets_select_own_or_staff
ON public.support_tickets
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.support_staff ss
    WHERE ss.user_id = auth.uid() AND ss.active = true
  )
);

CREATE POLICY support_tickets_client_insert_restricted
ON public.support_tickets
FOR INSERT
TO authenticated
WITH CHECK (false);

CREATE POLICY support_tickets_client_update_restricted
ON public.support_tickets
FOR UPDATE
TO authenticated
USING (false)
WITH CHECK (false);

CREATE POLICY support_tickets_client_delete_restricted
ON public.support_tickets
FOR DELETE
TO authenticated
USING (false);

DROP POLICY IF EXISTS support_messages_select_own_or_staff ON public.support_messages;
CREATE POLICY support_messages_select_own_or_staff
ON public.support_messages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.support_tickets st
    WHERE st.id = support_messages.ticket_id
      AND (
        st.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.support_staff ss
          WHERE ss.user_id = auth.uid() AND ss.active = true
        )
      )
  )
);

CREATE POLICY support_messages_user_insert
ON public.support_messages
FOR INSERT
TO authenticated
WITH CHECK (
  sender_role = 'user'
  AND sender_user_id = auth.uid()
  AND EXISTS (
    SELECT 1
    FROM public.support_tickets st
    WHERE st.id = ticket_id
      AND st.user_id = auth.uid()
  )
);

CREATE POLICY support_messages_staff_insert
ON public.support_messages
FOR INSERT
TO authenticated
WITH CHECK (
  sender_role = 'staff'
  AND sender_user_id = auth.uid()
  AND EXISTS (
    SELECT 1
    FROM public.support_staff ss
    WHERE ss.user_id = auth.uid() AND ss.active = true
  )
  AND EXISTS (
    SELECT 1
    FROM public.support_tickets st
    WHERE st.id = ticket_id
  )
);

CREATE POLICY support_messages_update_restricted
ON public.support_messages
FOR UPDATE
TO authenticated
USING (false)
WITH CHECK (false);

CREATE POLICY support_messages_delete_restricted
ON public.support_messages
FOR DELETE
TO authenticated
USING (false);

DROP POLICY IF EXISTS support_staff_select_own ON public.support_staff;
CREATE POLICY support_staff_select_own
ON public.support_staff
FOR SELECT
TO authenticated
USING (user_id = auth.uid() AND active = true);

CREATE POLICY support_staff_no_client_insert
ON public.support_staff
FOR INSERT
TO authenticated
WITH CHECK (false);

CREATE POLICY support_staff_no_client_update
ON public.support_staff
FOR UPDATE
TO authenticated
USING (false)
WITH CHECK (false);

CREATE POLICY support_staff_no_client_delete
ON public.support_staff
FOR DELETE
TO authenticated
USING (false);

COMMIT;
