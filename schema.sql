-- ============================================================
-- SCHEMA: Marnie Díaz Odontología & Estética
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================================

-- PACIENTES
CREATE TABLE IF NOT EXISTS public.pacientes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre        TEXT NOT NULL,
  apellido      TEXT NOT NULL,
  cedula        TEXT UNIQUE,
  fecha_nacimiento DATE,
  telefono      TEXT,
  email         TEXT,
  direccion     TEXT,
  alergias      TEXT,
  antecedentes  TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- CITAS
CREATE TABLE IF NOT EXISTS public.citas (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id UUID REFERENCES public.pacientes(id) ON DELETE CASCADE,
  fecha       DATE NOT NULL,
  hora        TIME NOT NULL,
  motivo      TEXT,
  estado      TEXT DEFAULT 'programada' CHECK (estado IN ('programada','confirmada','completada','cancelada')),
  notas       TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- PROCEDIMIENTOS
CREATE TABLE IF NOT EXISTS public.procedimientos (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id UUID REFERENCES public.pacientes(id) ON DELETE CASCADE,
  cita_id     UUID REFERENCES public.citas(id) ON DELETE SET NULL,
  tipo        TEXT NOT NULL,
  descripcion TEXT,
  costo       NUMERIC(10,2) DEFAULT 0,
  fecha       DATE NOT NULL DEFAULT CURRENT_DATE,
  estado      TEXT DEFAULT 'realizado' CHECK (estado IN ('planificado','realizado','cancelado')),
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- PAGOS
CREATE TABLE IF NOT EXISTS public.pagos (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id UUID REFERENCES public.pacientes(id) ON DELETE CASCADE,
  monto       NUMERIC(10,2) NOT NULL,
  fecha       DATE NOT NULL DEFAULT CURRENT_DATE,
  metodo_pago TEXT DEFAULT 'efectivo' CHECK (metodo_pago IN ('efectivo','transferencia','tarjeta','cheque','otro')),
  estado      TEXT DEFAULT 'pagado' CHECK (estado IN ('pagado','pendiente','parcial')),
  notas       TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ODONTOGRAMA
CREATE TABLE IF NOT EXISTS public.odontograma (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id  UUID REFERENCES public.pacientes(id) ON DELETE CASCADE,
  diente_numero INTEGER NOT NULL CHECK (diente_numero BETWEEN 11 AND 48),
  estado       TEXT DEFAULT 'sano' CHECK (estado IN ('sano','caries','obturado','extraccion','corona','puente','implante','fractura','otro')),
  notas        TEXT,
  fecha        DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at   TIMESTAMPTZ DEFAULT now(),
  UNIQUE(paciente_id, diente_numero)
);

-- ============================================================
-- ROW LEVEL SECURITY — solo el usuario autenticado (admin) puede acceder
-- ============================================================
ALTER TABLE public.pacientes      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.citas          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procedimientos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagos          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.odontograma    ENABLE ROW LEVEL SECURITY;

-- Políticas: solo usuarios autenticados
CREATE POLICY "Authenticated full access" ON public.pacientes      FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated full access" ON public.citas          FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated full access" ON public.procedimientos FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated full access" ON public.pagos          FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated full access" ON public.odontograma    FOR ALL USING (auth.role() = 'authenticated');
