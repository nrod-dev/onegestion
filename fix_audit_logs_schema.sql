-- Add user_email column to audit_logs table if it doesn't exist
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS user_email TEXT;

-- Verify the column was added (optional, just for confirmation)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'user_email') THEN
        RAISE EXCEPTION 'Column user_email was not added successfully';
    END IF;
END $$;
