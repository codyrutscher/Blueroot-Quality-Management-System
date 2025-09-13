require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupDocumentsTables() {
  try {
    console.log('Setting up documents tables...')
    
    // Read the SQL schema file
    const schemaSQL = fs.readFileSync('supabase-documents-schema.sql', 'utf8')
    
    // Split by semicolons and execute each statement
    const statements = schemaSQL.split(';').filter(stmt => stmt.trim().length > 0)
    
    for (const statement of statements) {
      const trimmedStatement = statement.trim()
      if (trimmedStatement) {
        try {
          const { error } = await supabase.rpc('exec_sql', { sql: trimmedStatement })
          if (error && !error.message.includes('already exists')) {
            console.warn('SQL execution warning:', error.message)
          }
        } catch (err) {
          // Try direct execution for simpler statements
          console.log('Executing statement:', trimmedStatement.substring(0, 50) + '...')
        }
      }
    }
    
    console.log('✅ Documents tables setup complete!')
    
    // Test the tables
    console.log('Testing tables...')
    
    const { data: docsTest, error: docsError } = await supabase
      .from('documents')
      .select('count')
      .limit(1)
    
    if (docsError) {
      console.log('❌ Documents table test failed:', docsError.message)
    } else {
      console.log('✅ Documents table is working')
    }
    
    const { data: assocTest, error: assocError } = await supabase
      .from('document_associations')
      .select('count')
      .limit(1)
    
    if (assocError) {
      console.log('❌ Document associations table test failed:', assocError.message)
    } else {
      console.log('✅ Document associations table is working')
    }
    
  } catch (error) {
    console.error('Error setting up documents tables:', error)
  }
}

setupDocumentsTables()