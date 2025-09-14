import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const status = searchParams.get('status')
    
    console.log('📋 Fetching tasks for user:', userId)
    
    let query = supabase
      .from('tasks')
      .select(`
        *,
        assigned_to_user:task_users!tasks_assigned_to_fkey(id, username, email, full_name),
        assigned_by_user:task_users!tasks_assigned_by_fkey(id, username, email, full_name)
      `)
      .order('created_at', { ascending: false })

    // Filter by user if provided
    if (userId) {
      query = query.or(`assigned_to.eq.${userId},assigned_by.eq.${userId}`)
    }

    // Filter by status if provided
    if (status) {
      query = query.eq('status', status)
    }

    const { data: tasks, error } = await query

    if (error) {
      console.error('❌ Error fetching tasks:', error)
      return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
    }

    console.log('📄 Found tasks:', tasks?.length || 0)

    return NextResponse.json({ 
      tasks: tasks || [],
      count: tasks?.length || 0
    })

  } catch (error) {
    console.error('❌ Tasks API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, task_type, assigned_to, assigned_by, due_date, priority } = body

    console.log('📝 Creating new task:', { title, task_type, assigned_to })

    const taskData = {
      title: title.trim(),
      description: description?.trim() || null,
      task_type,
      assigned_to,
      assigned_by,
      due_date: due_date ? new Date(due_date).toISOString() : null,
      priority: priority || 'medium',
      status: 'pending'
    }

    const { data: task, error } = await supabase
      .from('tasks')
      .insert(taskData)
      .select(`
        *,
        assigned_to_user:task_users!tasks_assigned_to_fkey(id, username, email, full_name),
        assigned_by_user:task_users!tasks_assigned_by_fkey(id, username, email, full_name)
      `)
      .single()

    if (error) {
      console.error('❌ Error creating task:', error)
      return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
    }

    console.log('✅ Task created successfully:', task.id)

    return NextResponse.json({ 
      success: true,
      task
    })

  } catch (error) {
    console.error('❌ Create task error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}