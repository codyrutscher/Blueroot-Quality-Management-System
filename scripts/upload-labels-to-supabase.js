require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function uploadLabelsToSupabase() {
  try {
    const labelsDir = path.join(process.cwd(), 'templates', 'LABEL PRINTER PROOFS')
    
    if (!fs.existsSync(labelsDir)) {
      console.log('Labels directory not found')
      return
    }

    console.log('Starting label upload to Supabase...')
    
    // Read all company directories
    const companies = fs.readdirSync(labelsDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name)

    let totalUploaded = 0

    for (const company of companies) {
      console.log(`Processing company: ${company}`)
      const companyDir = path.join(labelsDir, company)
      
      try {
        const files = fs.readdirSync(companyDir)
          .filter(file => file.toLowerCase().endsWith('.pdf'))
        
        for (const file of files) {
          const filePath = path.join(companyDir, file)
          const fileBuffer = fs.readFileSync(filePath)
          const stats = fs.statSync(filePath)
          
          // Extract SKU from filename
          const skuMatch = file.match(/^([A-Z0-9.]+)/)
          const productSku = skuMatch ? skuMatch[1] : null
          
          // Upload to Supabase storage
          const storagePath = `labels/${company}/${file}`
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('documents')
            .upload(storagePath, fileBuffer, {
              contentType: 'application/pdf',
              upsert: true
            })

          if (uploadError) {
            console.error(`Error uploading ${file}:`, uploadError)
            continue
          }

          // Insert label record into database
          const { error: dbError } = await supabase
            .from('labels')
            .upsert({
              filename: file,
              company: company,
              product_sku: productSku,
              storage_path: storagePath,
              file_size: stats.size,
              uploaded_at: stats.mtime.toISOString(),
              created_at: new Date().toISOString()
            }, {
              onConflict: 'storage_path'
            })

          if (dbError) {
            console.error(`Error inserting label record for ${file}:`, dbError)
          } else {
            console.log(`✓ Uploaded: ${file}`)
            totalUploaded++
          }
        }
      } catch (error) {
        console.error(`Error processing company directory ${company}:`, error)
      }
    }

    console.log(`\nUpload complete! Total labels uploaded: ${totalUploaded}`)
  } catch (error) {
    console.error('Error uploading labels:', error)
  }
}

// Create labels table if it doesn't exist
async function createLabelsTable() {
  const { error } = await supabase.rpc('create_labels_table')
  if (error && !error.message.includes('already exists')) {
    console.error('Error creating labels table:', error)
  }
}

async function main() {
  await createLabelsTable()
  await uploadLabelsToSupabase()
}

main()