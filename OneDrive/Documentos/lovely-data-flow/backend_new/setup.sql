-- Crear tablas para el pipeline de ML (compatible con Supabase)
CREATE TABLE IF NOT EXISTS datasets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id),
    nombre_archivo TEXT NOT NULL,
    tipo_archivo TEXT,
    ruta_almacenamiento TEXT,
    estado_procesamiento TEXT DEFAULT 'SUBIDO'
);

CREATE TABLE IF NOT EXISTS modelos_entrenados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    dataset_id UUID REFERENCES datasets(id),
    datos_exportados JSONB,
    metricas_entrenamiento JSONB,
    fecha_entrenamiento TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla para métricas de calidad de datos
CREATE TABLE IF NOT EXISTS data_quality (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    dataset_id UUID REFERENCES datasets(id),
    completeness FLOAT,
    consistency FLOAT,
    accuracy FLOAT,
    null_values INTEGER,
    duplicates INTEGER,
    outliers INTEGER
);

-- Tabla para historial de entrenamiento
CREATE TABLE IF NOT EXISTS training_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    modelo_id UUID REFERENCES modelos_entrenados(id),
    epoch INTEGER,
    loss FLOAT,
    accuracy FLOAT,
    precision FLOAT,
    recall FLOAT,
    f1_score FLOAT
);
