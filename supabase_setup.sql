
-- Crear tabla de presupuestos si no existe
CREATE TABLE IF NOT EXISTS public.presupuestos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    sucursal_id TEXT,
    sucursal_nombre TEXT,
    cliente_nombre TEXT,
    cliente_contacto TEXT,
    vendedor TEXT,
    categoria_nombre TEXT,
    material_nombre TEXT,
    tratamiento_nombre TEXT,
    costo_armazon NUMERIC,
    detalle_armazon TEXT,
    descuento_valor NUMERIC,
    descuento_tipo TEXT,
    descuento_condicion TEXT,
    precio_final NUMERIC,
    receta JSONB
);

-- Habilitar acceso público (ajustar según necesidad de seguridad)
ALTER TABLE public.presupuestos ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserción pública
CREATE POLICY "Permitir inserción pública" ON public.presupuestos
    FOR INSERT WITH CHECK (true);

-- Política para permitir lectura pública
CREATE POLICY "Permitir lectura pública" ON public.presupuestos
    FOR SELECT USING (true);

-- Política para permitir eliminación pública (opcional, para el botón de borrar)
CREATE POLICY "Permitir eliminación pública" ON public.presupuestos
    FOR DELETE USING (true);
