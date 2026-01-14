-- Add currency column to reservas table
-- Allows tracking whether a reservation is in ARS (Argentine Pesos) or USD (US Dollars)
-- Default is 'ARS' for new reservations
-- Note: Existing data migration will be handled separately

ALTER TABLE public.reservas 
ADD COLUMN IF NOT EXISTS moneda text DEFAULT 'ARS' CHECK (moneda IN ('ARS', 'USD'));

-- Verify the column was added
-- SELECT column_name, data_type, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'reservas' AND column_name = 'moneda';
