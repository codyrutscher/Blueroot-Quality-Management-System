-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  file_type TEXT,
  file_size BIGINT,
  storage_path TEXT UNIQUE NOT NULL,
  document_type TEXT NOT NULL,
  destinations JSONB DEFAULT '[]'::jsonb,
  associations JSONB DEFAULT '{}'::jsonb,
  uploaded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create document_associations table for specific relationships
CREATE TABLE IF NOT EXISTS document_associations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  association_type TEXT NOT NULL, -- 'product', 'supplier', 'raw_material'
  association_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_documents_document_type ON documents(document_type);
CREATE INDEX IF NOT EXISTS idx_documents_destinations ON documents USING GIN(destinations);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_at ON documents(uploaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_document_associations_document_id ON document_associations(document_id);
CREATE INDEX IF NOT EXISTS idx_document_associations_type_id ON document_associations(association_type, association_id);

-- Create RLS policies
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_associations ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read documents
CREATE POLICY "Allow authenticated users to read documents" ON documents
  FOR SELECT TO authenticated USING (true);

-- Allow authenticated users to insert documents
CREATE POLICY "Allow authenticated users to insert documents" ON documents
  FOR INSERT TO authenticated WITH CHECK (true);

-- Allow authenticated users to update documents
CREATE POLICY "Allow authenticated users to update documents" ON documents
  FOR UPDATE TO authenticated USING (true);

-- Allow authenticated users to read document associations
CREATE POLICY "Allow authenticated users to read document_associations" ON document_associations
  FOR SELECT TO authenticated USING (true);

-- Allow authenticated users to insert document associations
CREATE POLICY "Allow authenticated users to insert document_associations" ON document_associations
  FOR INSERT TO authenticated WITH CHECK (true);

-- Allow authenticated users to update document associations
CREATE POLICY "Allow authenticated users to update document_associations" ON document_associations
  FOR UPDATE TO authenticated USING (true);