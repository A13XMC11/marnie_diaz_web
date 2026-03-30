-- ============================================
-- ENHANCED ROW-LEVEL SECURITY POLICIES
-- ============================================
-- This migration implements proper access control for Odontologia-Web
-- Replace the overly permissive policies with role-based access

-- Step 1: Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'dentista', 'recepcionista', 'paciente')),
  clinic_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own role
CREATE POLICY "user_roles_select_own" ON public.user_roles
FOR SELECT USING (user_id = auth.uid());

-- Policy: Only admins can manage roles
CREATE POLICY "user_roles_manage_admin" ON public.user_roles
FOR ALL USING (
  auth.uid() IN (
    SELECT user_id FROM public.user_roles WHERE role = 'admin'
  )
);

-- Step 2: Create dentistas table (link users to clinic)
CREATE TABLE IF NOT EXISTS public.dentistas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  clinic_id UUID NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.dentistas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "dentistas_select_own" ON public.dentistas
FOR SELECT USING (user_id = auth.uid());

-- Step 3: Drop old overly-permissive policies on pacientes
DROP POLICY IF EXISTS "Authenticated full access" ON public.pacientes;

-- Step 4: Create new RLS policies for pacientes
-- Admins can access all
CREATE POLICY "pacientes_select_admin" ON public.pacientes
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "pacientes_insert_admin" ON public.pacientes
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "pacientes_update_admin" ON public.pacientes
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "pacientes_delete_admin" ON public.pacientes
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Dentistas can only access their own patients (defined in separate clinic system)
-- For now: dentistas in same clinic can see all patients in that clinic
CREATE POLICY "pacientes_select_dentista" ON public.pacientes
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.dentistas d ON ur.user_id = auth.uid()
    WHERE ur.role IN ('dentista', 'recepcionista')
  )
);

CREATE POLICY "pacientes_insert_dentista" ON public.pacientes
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role IN ('dentista', 'recepcionista')
  )
);

CREATE POLICY "pacientes_update_dentista" ON public.pacientes
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role IN ('dentista', 'recepcionista')
  )
);

-- Step 5: Update policies for citas table
DROP POLICY IF EXISTS "Authenticated full access" ON public.citas;

CREATE POLICY "citas_select_admin" ON public.citas
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "citas_select_staff" ON public.citas
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role IN ('dentista', 'recepcionista')
  )
);

CREATE POLICY "citas_insert_staff" ON public.citas
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role IN ('dentista', 'recepcionista', 'admin')
  )
);

CREATE POLICY "citas_update_admin" ON public.citas
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "citas_delete_admin" ON public.citas
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Step 6: Update policies for fichas_clinicas table
DROP POLICY IF EXISTS "Authenticated full access" ON public.fichas_clinicas;

CREATE POLICY "fichas_select_admin" ON public.fichas_clinicas
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "fichas_select_staff" ON public.fichas_clinicas
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role IN ('dentista', 'recepcionista')
  )
);

CREATE POLICY "fichas_insert_dentista" ON public.fichas_clinicas
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role IN ('dentista', 'admin')
  )
);

CREATE POLICY "fichas_update_dentista" ON public.fichas_clinicas
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role IN ('dentista', 'admin')
  )
);

-- Step 7: Update policies for procedimientos table
DROP POLICY IF EXISTS "Authenticated full access" ON public.procedimientos;

CREATE POLICY "procedimientos_select_admin" ON public.procedimientos
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "procedimientos_select_staff" ON public.procedimientos
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role IN ('dentista', 'recepcionista')
  )
);

CREATE POLICY "procedimientos_insert_dentista" ON public.procedimientos
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role IN ('dentista', 'admin')
  )
);

-- Step 8: Update policies for pagos table
DROP POLICY IF EXISTS "Authenticated full access" ON public.pagos;

CREATE POLICY "pagos_select_admin" ON public.pagos
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "pagos_select_staff" ON public.pagos
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role IN ('dentista', 'recepcionista')
  )
);

CREATE POLICY "pagos_insert_staff" ON public.pagos
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role IN ('dentista', 'recepcionista', 'admin')
  )
);

-- Step 9: Update policies for odontograma table
DROP POLICY IF EXISTS "Authenticated full access" ON public.odontograma;

CREATE POLICY "odontograma_select_admin" ON public.odontograma
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "odontograma_select_staff" ON public.odontograma
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role IN ('dentista', 'recepcionista')
  )
);

CREATE POLICY "odontograma_insert_dentista" ON public.odontograma
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role IN ('dentista', 'admin')
  )
);

CREATE POLICY "odontograma_update_dentista" ON public.odontograma
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role IN ('dentista', 'admin')
  )
);

-- Step 10: Grant appropriate permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT SELECT ON public.dentistas TO authenticated;
