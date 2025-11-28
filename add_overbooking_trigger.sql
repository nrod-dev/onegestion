-- Function to check for overbooking
CREATE OR REPLACE FUNCTION check_overbooking()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM reservas
    WHERE departamento_id = NEW.departamento_id
    AND id != NEW.id
    AND fecha_entrada < NEW.fecha_salida
    AND fecha_salida > NEW.fecha_entrada
  ) THEN
    RAISE EXCEPTION 'El departamento ya está reservado para estas fechas.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to run before insert or update
DROP TRIGGER IF EXISTS prevent_overbooking ON reservas;
CREATE TRIGGER prevent_overbooking
BEFORE INSERT OR UPDATE ON reservas
FOR EACH ROW EXECUTE FUNCTION check_overbooking();
