-- Alternative: Use Supabase's auth.users table or create a custom users table

-- Option 1: If you want to use a custom users table (recommended for tasks)
-- First check what users table exists
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY table_name, ordinal_position;

-- Create our custom users table for task management
CREATE TABLE IF NOT EXISTS task_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable RLS to avoid permission issues
ALTER TABLE task_users DISABLE ROW LEVEL SECURITY;

-- Insert the users into task_users table
INSERT INTO task_users (username, email, full_name) VALUES
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

-- Show the inserted users
SELECT id, username, full_name FROM task_users ORDER BY full_name;