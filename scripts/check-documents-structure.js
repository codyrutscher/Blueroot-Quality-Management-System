require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkDocumentsStructure() {
  try {
    console.log('Checking documents table structure...')
    
    // Try to get a sample record to see the structure
    const { data: sampleDoc, error: sampleError } = await supabase
      .from('documents')
      .select('*')
      .limit(1)
    
    if (sampleError) {
      console.error('Error checking documents table:', sampleError)
      return
    }
    
    if (sampleDoc && sampleDoc.length > 0) {
      console.log('Current documents table columns:')
      console.log(Object.keys(sampleDoc[0]))
    } else {
      console.log('Documents table exists but is empty')
    }
    
    // Check what columns we need to add
    const requiredColumns = [
      'document_type',
      'destinations', 
      'associations',
      'original_filename',
      'file_type',
      'file_size',
      'storage_path',
      'uploaded_at'
    ]
    
    console.log('\nSQL to add missing columns to documents table:')
    console.log('-- Run these ALTER TABLE statements one by one:')
    
    requiredColumns.forEach(column => {
      let columnDef = ''
      switch(column) {
        case 'document_type':
          columnDef = 'ALTER TABLE documents ADD COLUMN IF NOT EXISTS document_type TEXT;'
          break
        case 'destinations':
          columnDef = "ALTER TABLE documents ADD COLUMN IF NOT EXISTS destinations JSONB DEFAULT '[]'::jsonb;"
          break
        case 'associations':
          columnDef = "ALTER TABLE documents ADD COLUMN IF NOT EXISTS associations JSONB DEFAULT '{}'::jsonb;"
          break
        case 'original_filename':
          columnDef = 'ALTER TABLE documents ADD COLUMN IF NOT EXISTS original_filename TEXT;'
          break
        case 'file_type':
          columnDef = 'ALTER TABLE documents ADD COLUMN IF NOT EXISTS file_type TEXT;'
          break
        case 'file_size':
          columnDef = 'ALTER TABLE documents ADD COLUMN IF NOT EXISTS file_size BIGINT;'
          break
        case 'storage_path':
          columnDef = 'ALTER TABLE documents ADD COLUMN IF NOT EXISTS storage_path TEXT;'
          break
        case 'uploaded_at':
          columnDef = 'ALTER TABLE documents ADD COLUMN IF NOT EXISTS uploaded_at TIMESTAMP WITH TIME ZONE;'
          break
      }
      console.log(columnDef)
    })
    
    console.log('\n-- Then create the document_associations table:')
    console.log(`
CREATE TABLE IF NOT EXISTS document_associations (
  id TEXT DEFAULT gen_random_uuid()::text PRIMARY KEY,
  document_id TEXT REFERENCES documents(id) ON DELETE CASCADE,
  association_type TEXT NOT NULL,
  association_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`)

    console.log('\n-- Create indexes (run after adding columns):')
    console.log(`
CREATE INDEX IF NOT EXISTS idx_documents_document_type ON documents(document_type);
CREATE INDEX IF NOT EXISTS idx_documents_destinations ON documents USING GIN(destinations);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_at ON documents(uploaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_document_associations_document_id ON document_associations(document_id);
CREATE INDEX IF NOT EXISTS idx_document_associations_type_id ON document_associations(association_type, association_id);`)

    console.log('\n-- Enable RLS and create policies:')
    console.log(`
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_associations ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Allow authenticated users to read documents" ON documents FOR SELECT TO authenticated USING (true);
CREATE POLICY IF NOT EXISTS "Allow authenticated users to insert documents" ON documents FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Allow authenticated users to update documents" ON documents FOR UPDATE TO authenticated USING (true);
CREATE POLICY IF NOT EXISTS "Allow authenticated users to read document_associations" ON document_associations FOR SELECT TO authenticated USING (true);
CREATE POLICY IF NOT EXISTS "Allow authenticated users to insert document_associations" ON document_associations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Allow authenticated users to update document_associations" ON document_associations FOR UPDATE TO authenticated USING (true);`)
    
  } catch (error) {
    console.error('Error:', error)
  }
}

checkDocumentsStructure()