-- Drop and recreate document_associations table to ensure proper structure
DROP TABLE IF EXISTS document_associations;

CREATE TABLE document_associations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id TEXT NOT NULL,
  document_filename TEXT NOT NULL,
  document_title TEXT NOT NULL,
  document_path TEXT NOT NULL,
  document_type TEXT NOT NULL,
  association_type TEXT NOT NULL, -- 'supplier', 'product', 'raw_material'
  association_id TEXT NOT NULL, -- The ID of the associated item
  file_size INTEGER,
  file_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_document_associations_type_id 
ON document_associations(association_type, association_id);

CREATE INDEX IF NOT EXISTS idx_document_associations_document_id 
ON document_associations(document_id);

-- Enable RLS (Row Level Security)
ALTER TABLE document_associations ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (adjust as needed for your security requirements)
CREATE POLICY "Allow all operations on document_associations" ON document_associations
FOR ALL USING (true) WITH CHECK (true);