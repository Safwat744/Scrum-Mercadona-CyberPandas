-- ============================================================
-- MIGRACIÓN 006: Añadir constraints UNIQUE para idempotencia del seed
-- ============================================================

-- Evita productos duplicados por nombre
ALTER TABLE productos_hacendado
    ADD CONSTRAINT uq_productos_nombre UNIQUE (nombre);

-- Evita recetas duplicadas por nombre
ALTER TABLE recetas
    ADD CONSTRAINT uq_recetas_nombre UNIQUE (nombre);
