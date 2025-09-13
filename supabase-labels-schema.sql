-- Create labels table
CREATE TABLE IF NOT EXISTS labels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  filename TEXT NOT NULL,
  company TEXT NOT NULL,
  product_sku TEXT,
  storage_path TEXT UNIQUE NOT NULL,
  file_size BIGINT,
  uploaded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_labels_company ON labels(company);
CREATE INDEX IF NOT EXISTS idx_labels_product_sku ON labels(product_sku);
CREATE INDEX IF NOT EXISTS idx_labels_uploaded_at ON labels(uploaded_at DESC);

-- Create RLS policies
ALTER TABLE labels ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read labels
CREATE POLICY "Allow authenticated users to read labels" ON labels
  FOR SELECT TO authenticated USING (true);

-- Allow authenticated users to insert labels
CREATE POLICY "Allow authenticated users to insert labels" ON labels
  FOR INSERT TO authenticated WITH CHECK (true);

-- Allow authenticated users to update labels
CREATE POLICY "Allow authenticated users to update labels" ON labels
  FOR UPDATE TO authenticated USING (true);

-- Create function to create labels table (for the upload script)
CREATE OR REPLACE FUNCTION create_labels_table()
RETURNS void AS $$
BEGIN
  -- This function is just a placeholder for the upload script
  -- The table creation is handled above
  RETURN;
END;
$$ LANGUAGE plpgsql;