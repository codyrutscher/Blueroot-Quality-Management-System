import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const taskId = params.id
    const body = await request.json()
    const { comment, user_id } = body

    console.log('💬 Adding comment to task:', taskId)

    const commentData = {
      task_id: taskId,
      user_id,
      comment: comment.trim()
    }

    const { data: newComment, error } = await supabase
      .from('task_comments')
      .insert(commentData)
      .select(`
        *,
        user:task_users(id, username, full_name)
      `)
      .single()

    if (error) {
      console.error('❌ Error adding comment:', error)
      return NextResponse.json({ error: 'Failed to add comment' }, { status: 500 })
    }

    console.log('✅ Comment added successfully')

    return NextResponse.json({ 
      success: true,
      comment: newComment
    })

  } catch (error) {
    console.error('❌ Add comment error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}