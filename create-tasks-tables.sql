-- Create users table for task assignment
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  task_type TEXT NOT NULL, -- COA, COC, Shelf-Life Program, etc.
  status TEXT DEFAULT 'pending', -- pending, in_progress, completed, overdue
  priority TEXT DEFAULT 'medium', -- low, medium, high, urgent
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
  assigned_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  due_date TIMESTAMP WITH TIME ZONE,
  completed_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create task comments table for additional details/updates
CREATE TABLE IF NOT EXISTS task_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert the users
INSERT INTO users (username, email, full_name) VALUES
('john.troup', 'john.troup@company.com', 'John Troup'),
('matt.white', 'matt.white@company.com', 'Matt White'),
('nick.hafften', 'nick.hafften@company.com', 'Nick Hafften'),
('steve.nelson', 'steve.nelson@company.com', 'Steve Nelson'),
('nick.deloia', 'nick.deloia@company.com', 'Nick Deloia'),
('jenn.doucette', 'jenn.doucette@company.com', 'Jenn Doucette'),
('dana.rutscher', 'dana.rutscher@company.com', 'Dana Rutscher'),
('shefali.pandey', 'shefali.pandey@company.com', 'Shefali Pandey'),
('whitney.palmerton', 'whitney.palmerton@company.com', 'Whitney Palmerton')
ON CONFLICT (username) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_task_comments_task_id ON task_comments(task_id);

-- Enable RLS (Row Level Security) - but not for users table initially
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;

-- Create policies for tasks (users can only see tasks assigned to them or created by them)
CREATE POLICY "Users can view their own tasks" ON tasks
FOR SELECT USING (assigned_to = auth.uid() OR assigned_by = auth.uid());

CREATE POLICY "Users can create tasks" ON tasks
FOR INSERT WITH CHECK (assigned_by = auth.uid());

CREATE POLICY "Users can update their own tasks" ON tasks
FOR UPDATE USING (assigned_to = auth.uid() OR assigned_by = auth.uid());

-- Create policies for task comments
CREATE POLICY "Users can view comments on their tasks" ON task_comments
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM tasks 
    WHERE tasks.id = task_comments.task_id 
    AND (tasks.assigned_to = auth.uid() OR tasks.assigned_by = auth.uid())
  )
);

CREATE POLICY "Users can create comments on their tasks" ON task_comments
FOR INSERT WITH CHECK (
  user_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM tasks 
    WHERE tasks.id = task_comments.task_id 
    AND (tasks.assigned_to = auth.uid() OR tasks.assigned_by = auth.uid())
  )
);

-- Users table policies (commented out since RLS is disabled for users)
-- CREATE POLICY "Allow reading users for task assignment" ON users
-- FOR SELECT USING (true);