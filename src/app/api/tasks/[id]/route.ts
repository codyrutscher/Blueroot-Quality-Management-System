import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const taskId = params.id
    console.log('📋 Fetching task:', taskId)

    const { data: task, error } = await supabase
      .from('tasks')
      .select(`
        *,
        assigned_to_user:users!tasks_assigned_to_fkey(id, username, email, full_name),
        assigned_by_user:users!tasks_assigned_by_fkey(id, username, email, full_name),
        comments:task_comments(
          id,
          comment,
          created_at,
          user:users(id, username, full_name)
        )
      `)
      .eq('id', taskId)
      .single()

    if (error) {
      console.error('❌ Error fetching task:', error)
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    return NextResponse.json({ task })

  } catch (error) {
    console.error('❌ Get task error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const taskId = params.id
    const body = await request.json()
    const { status, description, due_date, priority, completed_date } = body

    console.log('📝 Updating task:', taskId, { status })

    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (status !== undefined) updateData.status = status
    if (description !== undefined) updateData.description = description?.trim() || null
    if (due_date !== undefined) updateData.due_date = due_date ? new Date(due_date).toISOString() : null
    if (priority !== undefined) updateData.priority = priority
    if (completed_date !== undefined) updateData.completed_date = completed_date ? new Date(completed_date).toISOString() : null

    // If marking as completed, set completed_date
    if (status === 'completed' && !completed_date) {
      updateData.completed_date = new Date().toISOString()
    }

    const { data: task, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', taskId)
      .select(`
        *,
        assigned_to_user:users!tasks_assigned_to_fkey(id, username, email, full_name),
        assigned_by_user:users!tasks_assigned_by_fkey(id, username, email, full_name)
      `)
      .single()

    if (error) {
      console.error('❌ Error updating task:', error)
      return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
    }

    console.log('✅ Task updated successfully:', taskId)

    return NextResponse.json({ 
      success: true,
      task
    })

  } catch (error) {
    console.error('❌ Update task error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const taskId = params.id
    console.log('🗑️ Deleting task:', taskId)

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)

    if (error) {
      console.error('❌ Error deleting task:', error)
      return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 })
    }

    console.log('✅ Task deleted successfully:', taskId)

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('❌ Delete task error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}