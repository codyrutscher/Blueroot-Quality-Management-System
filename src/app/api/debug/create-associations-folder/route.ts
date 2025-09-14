import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    console.log('📁 Creating associations folder...')
    
    // Create a test file in the associations folder to ensure it exists
    const testAssociation = {
      test: true,
      created_at: new Date().toISOString(),
      message: 'This is a test association file to create the folder'
    }
    
    const testPath = `associations/test_association_${Date.now()}.json`
    const testBuffer = Buffer.from(JSON.stringify(testAssociation, null, 2))
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(testPath, testBuffer, {
        contentType: 'text/plain',
        upsert: true
      })

    if (uploadError) {
      console.error('❌ Failed to create associations folder:', uploadError)
      return NextResponse.json({ 
        success: false, 
        error: uploadError.message 
      }, { status: 500 })
    }

    console.log('✅ Associations folder created with test file:', testPath)

    // Now try to list the associations folder
    const { data: files, error: listError } = await supabase.storage
      .from('documents')
      .list('associations')

    return NextResponse.json({
      success: true,
      message: 'Associations folder created successfully',
      testFilePath: testPath,
      filesInFolder: files || [],
      folderExists: !listError
    })

  } catch (error) {
    console.error('❌ Error creating associations folder:', error)
    return NextResponse.json({ 
      error: 'Failed to create associations folder', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}