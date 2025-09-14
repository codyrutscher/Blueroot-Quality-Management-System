'use client'

import { useState, useEffect } from 'react'
import { PlusIcon, CalendarIcon, UserIcon, ClockIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

interface User {
  id: string
  username: string
  email: string
  full_name: string
}

interface Task {
  id: string
  title: string
  description: string | null
  task_type: string
  status: string
  priority: string
  assigned_to: string
  assigned_by: string
  assigned_date: string
  due_date: string | null
  completed_date: string | null
  created_at: string
  assigned_to_user: User
  assigned_by_user: User
}

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  // Task form state
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    task_type: '',
    assigned_to: '',
    due_date: '',
    priority: 'medium'
  })

  const taskTypes = [
    'COA',
    'COC', 
    'Shelf-Life Program',
    'Finished Goods Spec',
    'Raw Material Spec',
    'Supplier Qualification',
    'Co-Man Qualification',
    'Label Testing',
    'CCR',
    'Other Documents',
    'PSF',
    'MMR',
    'Batch Record',
    'UPC'
  ]

  const statusOptions = [
    { value: 'all', label: 'All Tasks', color: 'gray' },
    { value: 'pending', label: 'Pending', color: 'yellow' },
    { value: 'in_progress', label: 'In Progress', color: 'blue' },
    { value: 'completed', label: 'Completed', color: 'green' },
    { value: 'overdue', label: 'Overdue', color: 'red' }
  ]

  const priorityColors = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-blue-100 text-blue-800', 
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800'
  }

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    overdue: 'bg-red-100 text-red-800'
  }

  useEffect(() => {
    fetchUsers()
    fetchTasks()
  }, [selectedStatus])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users')
      const data = await response.json()
      setUsers(data.users || [])
      
      // Set current user (for demo, using first user)
      if (data.users?.length > 0) {
        setCurrentUser(data.users[0])
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const fetchTasks = async () => {
    try {
      setLoading(true)
      let url = '/api/tasks'
      
      if (currentUser) {
        url += `?userId=${currentUser.id}`
      }
      
      if (selectedStatus !== 'all') {
        url += `${currentUser ? '&' : '?'}status=${selectedStatus}`
      }

      const response = await fetch(url)
      const data = await response.json()
      
      let fetchedTasks = data.tasks || []
      
      // Check for overdue tasks
      fetchedTasks = fetchedTasks.map((task: Task) => {
        if (task.status !== 'completed' && task.due_date) {
          const dueDate = new Date(task.due_date)
          const now = new Date()
          if (dueDate < now) {
            return { ...task, status: 'overdue' }
          }
        }
        return task
      })
      
      setTasks(fetchedTasks)
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newTask.title.trim() || !newTask.task_type || !newTask.assigned_to) {
      alert('Please fill in all required fields')
      return
    }

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newTask,
          assigned_by: currentUser?.id
        }),
      })

      if (response.ok) {
        setNewTask({
          title: '',
          description: '',
          task_type: '',
          assigned_to: '',
          due_date: '',
          priority: 'medium'
        })
        setShowCreateForm(false)
        fetchTasks()
      } else {
        alert('Failed to create task')
      }
    } catch (error) {
      console.error('Error creating task:', error)
      alert('Error creating task')
    }
  }

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        fetchTasks()
      } else {
        alert('Failed to update task status')
      }
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No due date'
    return new Date(dateString).toLocaleDateString()
  }

  const isOverdue = (task: Task) => {
    if (task.status === 'completed' || !task.due_date) return false
    return new Date(task.due_date) < new Date()
  }

  const filteredTasks = selectedStatus === 'all' 
    ? tasks 
    : tasks.filter(task => {
        if (selectedStatus === 'overdue') {
          return isOverdue(task)
        }
        return task.status === selectedStatus
      })

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-700 to-blue-900 p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Task Management</h1>
            <p className="text-slate-600">Assign and track tasks across your team</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <PlusIcon className="h-5 w-5" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Status Filter */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex flex-wrap gap-2">
          {statusOptions.map(status => (
            <button
              key={status.value}
              onClick={() => setSelectedStatus(status.value)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedStatus === status.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.label}
              {status.value === 'all' && ` (${tasks.length})`}
              {status.value !== 'all' && ` (${tasks.filter(t => 
                status.value === 'overdue' ? isOverdue(t) : t.status === status.value
              ).length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Create Task Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Create New Task</h2>
          <form onSubmit={handleCreateTask} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Task Title *
                </label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="Enter task title..."
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Task Type *
                </label>
                <select
                  value={newTask.task_type}
                  onChange={(e) => setNewTask({ ...newTask, task_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                  required
                >
                  <option value="">Select task type...</option>
                  {taskTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Assign To *
                </label>
                <select
                  value={newTask.assigned_to}
                  onChange={(e) => setNewTask({ ...newTask, assigned_to: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                  required
                >
                  <option value="">Select user...</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>{user.full_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  value={newTask.due_date}
                  onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Priority
                </label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Description
              </label>
              <textarea
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                rows={3}
                placeholder="Add task details..."
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Create Task
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tasks List */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-4">
          {selectedStatus === 'all' ? 'All Tasks' : statusOptions.find(s => s.value === selectedStatus)?.label}
        </h2>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-slate-600">Loading tasks...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-600">No tasks found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTasks.map(task => (
              <div
                key={task.id}
                className={`border rounded-lg p-4 ${
                  isOverdue(task) ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-slate-900">{task.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        statusColors[task.status as keyof typeof statusColors] || statusColors.pending
                      }`}>
                        {task.status.replace('_', ' ')}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        priorityColors[task.priority as keyof typeof priorityColors] || priorityColors.medium
                      }`}>
                        {task.priority}
                      </span>
                      {isOverdue(task) && (
                        <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                    
                    <p className="text-sm text-slate-600 mb-2">{task.task_type}</p>
                    
                    {task.description && (
                      <p className="text-sm text-slate-700 mb-3">{task.description}</p>
                    )}
                    
                    <div className="flex items-center space-x-4 text-sm text-slate-500">
                      <div className="flex items-center space-x-1">
                        <UserIcon className="h-4 w-4" />
                        <span>Assigned to: {task.assigned_to_user?.full_name}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <CalendarIcon className="h-4 w-4" />
                        <span>Due: {formatDate(task.due_date)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <ClockIcon className="h-4 w-4" />
                        <span>Created: {formatDate(task.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    {task.status !== 'completed' && (
                      <button
                        onClick={() => handleStatusChange(task.id, 'completed')}
                        className="flex items-center space-x-1 bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                      >
                        <CheckCircleIcon className="h-4 w-4" />
                        <span>Complete</span>
                      </button>
                    )}
                    
                    {task.status === 'pending' && (
                      <button
                        onClick={() => handleStatusChange(task.id, 'in_progress')}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                      >
                        Start
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}