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

async function createDocumentsTables() {
  try {
    console.log('Creating documents tables...')
    
    // First, let's check if documents table already exists
    const { data: existingDocs, error: checkError } = await supabase
      .from('documents')
      .select('id')
      .limit(1)
    
    if (!checkError) {
      console.log('✅ Documents table already exists')
    } else {
      console.log('Creating documents table...')
      // Table doesn't exist, we'll create it via direct SQL execution
      // For now, let's just log what needs to be done
      console.log('Please run this SQL in your Supabase SQL editor:')
      console.log(`
CREATE TABLE documents (
  id TEXT DEFAULT gen_random_uuid()::text PRIMARY KEY,
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
      `)
    }
    
    // Check document_associations table
    const { data: existingAssoc, error: assocCheckError } = await supabase
      .from('document_associations')
      .select('id')
      .limit(1)
    
    if (!assocCheckError) {
      console.log('✅ Document associations table already exists')
    } else {
      console.log('Please also run this SQL in your Supabase SQL editor:')
      console.log(`
CREATE TABLE document_associations (
  id TEXT DEFAULT gen_random_uuid()::text PRIMARY KEY,
  document_id TEXT REFERENCES documents(id) ON DELETE CASCADE,
  association_type TEXT NOT NULL,
  association_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_documents_document_type ON documents(document_type);
CREATE INDEX IF NOT EXISTS idx_documents_destinations ON documents USING GIN(destinations);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_at ON documents(uploaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_document_associations_document_id ON document_associations(document_id);
CREATE INDEX IF NOT EXISTS idx_document_associations_type_id ON document_associations(association_type, association_id);

-- Enable RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_associations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow authenticated users to read documents" ON documents FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to insert documents" ON documents FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update documents" ON documents FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to read document_associations" ON document_associations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to insert document_associations" ON document_associations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update document_associations" ON document_associations FOR UPDATE TO authenticated USING (true);
      `)
    }
    
    console.log('\n🎯 Next steps:')
    console.log('1. Run the SQL commands above in your Supabase SQL editor')
    console.log('2. Test the upload system')
    console.log('3. Check that documents appear in product detail pages')
    
  } catch (error) {
    console.error('Error:', error)
  }
}

createDocumentsTables()