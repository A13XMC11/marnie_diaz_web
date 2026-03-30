-- ============================================
-- AUDIT LOGGING AND TRACKING
-- ============================================
-- This migration creates audit trails for sensitive operations

-- Step 1: Create audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT')),
  table_name TEXT,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for fast queries
CREATE INDEX IF NOT EXISTS audit_logs_user_id_idx ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS audit_logs_table_name_idx ON public.audit_logs(table_name);
CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS audit_logs_record_id_idx ON public.audit_logs(record_id);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can view audit logs
CREATE POLICY "audit_logs_select_admin" ON public.audit_logs
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Policy: Only system can insert (via triggers)
CREATE POLICY "audit_logs_insert_system" ON public.audit_logs
FOR INSERT WITH CHECK (user_id IS NOT NULL);

-- Step 2: Create audit log function
CREATE OR REPLACE FUNCTION public.log_audit_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    action,
    table_name,
    record_id,
    old_data,
    new_data
  ) VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    to_jsonb(OLD),
    to_jsonb(NEW)
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Create triggers for audit logging on sensitive tables

-- Pacientes audit trigger
DROP TRIGGER IF EXISTS audit_pacientes_changes ON public.pacientes;
CREATE TRIGGER audit_pacientes_changes
AFTER INSERT OR UPDATE OR DELETE ON public.pacientes
FOR EACH ROW
EXECUTE FUNCTION public.log_audit_changes();

-- Fichas clínicas audit trigger
DROP TRIGGER IF EXISTS audit_fichas_clinicas_changes ON public.fichas_clinicas;
CREATE TRIGGER audit_fichas_clinicas_changes
AFTER INSERT OR UPDATE OR DELETE ON public.fichas_clinicas
FOR EACH ROW
EXECUTE FUNCTION public.log_audit_changes();

-- Pagos audit trigger
DROP TRIGGER IF EXISTS audit_pagos_changes ON public.pagos;
CREATE TRIGGER audit_pagos_changes
AFTER INSERT OR UPDATE OR DELETE ON public.pagos
FOR EACH ROW
EXECUTE FUNCTION public.log_audit_changes();

-- User roles audit trigger
DROP TRIGGER IF EXISTS audit_user_roles_changes ON public.user_roles;
CREATE TRIGGER audit_user_roles_changes
AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.log_audit_changes();

-- Procedimientos audit trigger
DROP TRIGGER IF EXISTS audit_procedimientos_changes ON public.procedimientos;
CREATE TRIGGER audit_procedimientos_changes
AFTER INSERT OR UPDATE OR DELETE ON public.procedimientos
FOR EACH ROW
EXECUTE FUNCTION public.log_audit_changes();

-- Step 4: Create login audit log function
CREATE OR REPLACE FUNCTION public.log_login_event()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.instance_id IS NOT NULL THEN
    INSERT INTO public.audit_logs (
      user_id,
      action,
      table_name,
      created_at
    ) VALUES (
      NEW.id,
      'LOGIN',
      'auth.users',
      NOW()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: Login trigger requires JWT-based implementation
-- See documentation for integrating with auth webhooks

-- Step 5: Cleanup old audit logs (optional - runs monthly)
-- Delete logs older than 90 days
CREATE OR REPLACE FUNCTION public.cleanup_old_audit_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM public.audit_logs
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT SELECT ON public.audit_logs TO authenticated;
GRANT USAGE ON FUNCTION public.log_audit_changes() TO authenticated;
GRANT USAGE ON FUNCTION public.cleanup_old_audit_logs() TO authenticated;
