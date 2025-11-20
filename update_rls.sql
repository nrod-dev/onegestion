-- Enable RLS on all tables
ALTER TABLE public.departamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.huespedes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservas ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to ensure a clean slate
DROP POLICY IF EXISTS "Allow all access to departamentos" ON public.departamentos;
DROP POLICY IF EXISTS "Allow all access to huespedes" ON public.huespedes;
DROP POLICY IF EXISTS "Allow all access to reservas" ON public.reservas;
DROP POLICY IF EXISTS "Enable full access for authenticated users" ON public.departamentos;
DROP POLICY IF EXISTS "Enable full access for authenticated users" ON public.huespedes;
DROP POLICY IF EXISTS "Enable full access for authenticated users" ON public.reservas;

-- Create comprehensive policies for authenticated users (Admin access)
-- These policies allow SELECT, INSERT, UPDATE, DELETE for any logged-in user

-- Policies for 'departamentos'
CREATE POLICY "Enable full access for authenticated users" ON public.departamentos
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Policies for 'huespedes'
CREATE POLICY "Enable full access for authenticated users" ON public.huespedes
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Policies for 'reservas'
CREATE POLICY "Enable full access for authenticated users" ON public.reservas
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Grant necessary permissions to the authenticated role
GRANT ALL ON TABLE public.departamentos TO authenticated;
GRANT ALL ON TABLE public.huespedes TO authenticated;
GRANT ALL ON TABLE public.reservas TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
