-- Simple user insertion script (run this if the main tasks SQL doesn't work)

-- First, drop the existing users table if it has wrong structure
DROP TABLE IF EXISTS users CASCADE;

-- Create the users table with correct structure
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable RLS on users table to avoid permission issues
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

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
('whitney.palmerton', 'whitney.palmerton@company.com', 'Whitney Palmerton');

-- Verify the users were inserted
SELECT id, username, full_name FROM users ORDER BY full_name;