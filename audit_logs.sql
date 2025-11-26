-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    table_name TEXT NOT NULL,
    record_id TEXT NOT NULL,
    action TEXT NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
    old_data JSONB,
    new_data JSONB,
    changed_by UUID REFERENCES auth.users(id),
    user_email TEXT, -- Added column for user email
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can view all logs
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON audit_logs;
CREATE POLICY "Enable read access for authenticated users" ON audit_logs
    FOR SELECT
    TO authenticated
    USING (true);

-- Function to log changes
CREATE OR REPLACE FUNCTION log_changes()
RETURNS TRIGGER AS $$
DECLARE
    current_user_email TEXT;
BEGIN
    -- Try to get email from auth.users (requires security definer to access auth schema)
    SELECT email INTO current_user_email FROM auth.users WHERE id = auth.uid();

    IF (TG_OP = 'INSERT') THEN
        INSERT INTO audit_logs (table_name, record_id, action, new_data, changed_by, user_email)
        VALUES (TG_TABLE_NAME, NEW.id::TEXT, 'INSERT', row_to_json(NEW), auth.uid(), current_user_email);
        RETURN NEW;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO audit_logs (table_name, record_id, action, old_data, new_data, changed_by, user_email)
        VALUES (TG_TABLE_NAME, NEW.id::TEXT, 'UPDATE', row_to_json(OLD), row_to_json(NEW), auth.uid(), current_user_email);
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        INSERT INTO audit_logs (table_name, record_id, action, old_data, changed_by, user_email)
        VALUES (TG_TABLE_NAME, OLD.id::TEXT, 'DELETE', row_to_json(OLD), auth.uid(), current_user_email);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; -- SECURITY DEFINER needed to access auth.users

-- Triggers for relevant tables
DROP TRIGGER IF EXISTS audit_reservas_changes ON reservas;
CREATE TRIGGER audit_reservas_changes
AFTER INSERT OR UPDATE OR DELETE ON reservas
FOR EACH ROW EXECUTE FUNCTION log_changes();

DROP TRIGGER IF EXISTS audit_huespedes_changes ON huespedes;
CREATE TRIGGER audit_huespedes_changes
AFTER INSERT OR UPDATE OR DELETE ON huespedes
FOR EACH ROW EXECUTE FUNCTION log_changes();

DROP TRIGGER IF EXISTS audit_departamentos_changes ON departamentos;
CREATE TRIGGER audit_departamentos_changes
AFTER INSERT OR UPDATE OR DELETE ON departamentos
FOR EACH ROW EXECUTE FUNCTION log_changes();

-- Function to cleanup old logs (older than 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_logs()
RETURNS void AS $$
BEGIN
    DELETE FROM audit_logs
    WHERE changed_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;
