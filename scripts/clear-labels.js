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

async function clearLabels() {
  try {
    console.log('Clearing labels table...')
    
    // Delete all records from labels table
    const { error: deleteError } = await supabase
      .from('labels')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all records (using a condition that matches all)

    if (deleteError) {
      console.error('Error clearing labels table:', deleteError)
      return
    }

    console.log('✅ Labels table cleared successfully')

    // Optionally clear the storage bucket as well
    console.log('Clearing labels from storage...')
    
    try {
      // List all files in the labels folder
      const { data: files, error: listError } = await supabase.storage
        .from('documents')
        .list('labels', {
          limit: 1000,
          offset: 0
        })

      if (listError) {
        console.log('No labels folder found in storage or error listing:', listError.message)
      } else if (files && files.length > 0) {
        // Delete all files in the labels folder
        const filePaths = files.map(file => `labels/${file.name}`)
        
        const { error: removeError } = await supabase.storage
          .from('documents')
          .remove(filePaths)

        if (removeError) {
          console.error('Error removing files from storage:', removeError)
        } else {
          console.log(`✅ Removed ${files.length} files from storage`)
        }
      } else {
        console.log('No files found in labels storage folder')
      }
    } catch (storageError) {
      console.log('Storage cleanup skipped:', storageError.message)
    }

    console.log('\n🎉 Labels cleanup complete! Ready for fresh start.')
    
  } catch (error) {
    console.error('Error during cleanup:', error)
  }
}

clearLabels()