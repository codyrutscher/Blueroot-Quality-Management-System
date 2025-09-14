-- Check if users table exists and what columns it has
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Also show all tables that contain 'user' in the name
SELECT table_name 
FROM information_schema.tables 
WHERE table_name LIKE '%user%' 
AND table_schema = 'public';