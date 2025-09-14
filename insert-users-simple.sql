-- Simple user insertion script (run this if the main tasks SQL doesn't work)

-- First, make sure the users table exists without RLS
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable RLS on users table to avoid permission issues
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Insert the users (with ON CONFLICT to avoid duplicates)
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
ON CONFLICT (username) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  updated_at = NOW();

-- Verify the users were inserted
SELECT id, username, full_name FROM users ORDER BY full_name;