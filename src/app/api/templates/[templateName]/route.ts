import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ templateName: string }> }
) {
  try {
    const { templateName: rawTemplateName } = await params
    const templateName = decodeURIComponent(rawTemplateName)
    const templatesDir = join(process.cwd(), 'templates')
    const templatePath = join(templatesDir, templateName)
    
    try {
      const fileBuffer = await readFile(templatePath)
      
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename="${templateName}"`,
        },
      })
    } catch (fileError) {
      console.error('File not found:', templatePath)
      return NextResponse.json(
        { error: 'Template file not found' },
        { status: 404 }
      )
    }
  } catch (error) {
    console.error('Error serving template:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}