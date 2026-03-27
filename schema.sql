-- ============================================================
-- SCHEMA: Marnie Díaz Odontología & Estética
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================================

-- PACIENTES (con campos MSP Ecuador requeridos)
CREATE TABLE IF NOT EXISTS public.pacientes (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre                TEXT NOT NULL,
  apellido              TEXT NOT NULL,
  cedula                TEXT UNIQUE,
  fecha_nacimiento      DATE,
  sexo                  TEXT CHECK (sexo IN ('masculino','femenino','otro')),
  grupo_sanguineo       TEXT,
  ocupacion             TEXT,
  telefono              TEXT,
  email                 TEXT,
  direccion             TEXT,
  alergias              TEXT,
  antecedentes          TEXT,
  created_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now()
);

-- CITAS
CREATE TABLE IF NOT EXISTS public.citas (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id           UUID REFERENCES public.pacientes(id) ON DELETE CASCADE,
  fecha                 TIMESTAMPTZ NOT NULL,
  hora                  TIME NOT NULL,
  motivo                TEXT,
  estado                TEXT DEFAULT 'programada' CHECK (estado IN ('programada','confirmada','completada','cancelada','inasistencia')),
  notas                 TEXT,
  created_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now()
);

-- PROCEDIMIENTOS
CREATE TABLE IF NOT EXISTS public.procedimientos (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id           UUID REFERENCES public.pacientes(id) ON DELETE CASCADE,
  cita_id               UUID REFERENCES public.citas(id) ON DELETE SET NULL,
  tipo                  TEXT NOT NULL,
  descripcion           TEXT,
  costo                 NUMERIC(10,2) DEFAULT 0,
  fecha                 TIMESTAMPTZ NOT NULL DEFAULT now(),
  estado                TEXT DEFAULT 'realizado' CHECK (estado IN ('planificado','realizado','cancelado')),
  created_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now()
);

-- PAGOS (con referencia a cita)
CREATE TABLE IF NOT EXISTS public.pagos (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id           UUID REFERENCES public.pacientes(id) ON DELETE CASCADE,
  cita_id               UUID REFERENCES public.citas(id) ON DELETE SET NULL,
  monto                 NUMERIC(10,2) NOT NULL,
  fecha                 TIMESTAMPTZ NOT NULL DEFAULT now(),
  metodo_pago           TEXT DEFAULT 'efectivo' CHECK (metodo_pago IN ('efectivo','transferencia','tarjeta','cheque','otro')),
  estado                TEXT DEFAULT 'pagado' CHECK (estado IN ('pagado','pendiente','parcial')),
  notas                 TEXT,
  created_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now()
);

-- ODONTOGRAMA
CREATE TABLE IF NOT EXISTS public.odontograma (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id           UUID REFERENCES public.pacientes(id) ON DELETE CASCADE,
  diente_numero         INTEGER NOT NULL CHECK (diente_numero BETWEEN 11 AND 48),
  estado                TEXT DEFAULT 'sano' CHECK (estado IN ('sano','caries','obturado','extraccion','corona','puente','implante','fractura','protesis_removible','protesis_total','otro')),
  notas                 TEXT,
  fecha                 DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now(),
  UNIQUE(paciente_id, diente_numero)
);

-- FICHAS CLÍNICAS (historiales de consultas)
CREATE TABLE IF NOT EXISTS public.fichas_clinicas (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id           UUID REFERENCES public.pacientes(id) ON DELETE CASCADE,
  cita_id               UUID REFERENCES public.citas(id) ON DELETE SET NULL,
  fecha                 DATE NOT NULL DEFAULT CURRENT_DATE,
  motivo_consulta       TEXT,
  signos_vitales        JSONB,
  indicadores_salud     JSONB,
  diagnostico           TEXT,
  plan_tratamiento_texto TEXT,
  instrucciones_paciente TEXT,
  pronostico            TEXT CHECK (pronostico IN ('favorable','reservado','desfavorable')),
  observaciones         TEXT,
  created_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- ÍNDICES para mejor performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_citas_paciente_id ON public.citas(paciente_id);
CREATE INDEX IF NOT EXISTS idx_citas_fecha ON public.citas(fecha);
CREATE INDEX IF NOT EXISTS idx_citas_estado ON public.citas(estado);
CREATE INDEX IF NOT EXISTS idx_procedimientos_paciente_id ON public.procedimientos(paciente_id);
CREATE INDEX IF NOT EXISTS idx_procedimientos_fecha ON public.procedimientos(fecha);
CREATE INDEX IF NOT EXISTS idx_pagos_paciente_id ON public.pagos(paciente_id);
CREATE INDEX IF NOT EXISTS idx_pagos_fecha ON public.pagos(fecha);
CREATE INDEX IF NOT EXISTS idx_pagos_estado ON public.pagos(estado);
CREATE INDEX IF NOT EXISTS idx_fichas_paciente_id ON public.fichas_clinicas(paciente_id);
CREATE INDEX IF NOT EXISTS idx_fichas_fecha ON public.fichas_clinicas(fecha);
CREATE INDEX IF NOT EXISTS idx_odontograma_paciente_id ON public.odontograma(paciente_id);

-- ============================================================
-- ROW LEVEL SECURITY — solo el usuario autenticado (admin) puede acceder
-- ============================================================
ALTER TABLE public.pacientes      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.citas          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procedimientos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagos          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.odontograma    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fichas_clinicas ENABLE ROW LEVEL SECURITY;

-- Políticas: solo usuarios autenticados
CREATE POLICY "Authenticated full access" ON public.pacientes      FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated full access" ON public.citas          FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated full access" ON public.procedimientos FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated full access" ON public.pagos          FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated full access" ON public.odontograma    FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated full access" ON public.fichas_clinicas FOR ALL USING (auth.role() = 'authenticated');
