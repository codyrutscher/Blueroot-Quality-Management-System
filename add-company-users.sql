-- Add all company users to Supabase
-- Run this in Supabase SQL Editor

INSERT INTO "users" ("id", "email", "name", "role", "department", "createdAt", "updatedAt") VALUES
('demo-user-id', 'demo@company.com', 'Demo User', 'USER', 'Manufacturing', NOW(), NOW()),
('admin-user-id', 'admin@company.com', 'Admin User', 'ADMIN', 'Quality Assurance', NOW(), NOW()),
('manager-user-id', 'manager@company.com', 'Manager User', 'MANAGER', 'Management', NOW(), NOW()),
('user-john-troup', 'john.troup@company.com', 'John Troup', 'USER', 'Manufacturing', NOW(), NOW()),
('user-matt-white', 'matt.white@company.com', 'Matt White', 'USER', 'Manufacturing', NOW(), NOW()),
('user-nick-hafften', 'nick.hafften@company.com', 'Nick Hafften', 'USER', 'Manufacturing', NOW(), NOW()),
('user-steve-nelson', 'steve.nelson@company.com', 'Steve Nelson', 'USER', 'Manufacturing', NOW(), NOW()),
('user-nick-deloia', 'nick.deloia@company.com', 'Nick Deloia', 'USER', 'Manufacturing', NOW(), NOW()),
('user-jenn-doucette', 'jenn.doucette@company.com', 'Jenn Doucette', 'USER', 'Manufacturing', NOW(), NOW()),
('user-dana-rutscher', 'dana.rutscher@company.com', 'Dana Rutscher', 'USER', 'Manufacturing', NOW(), NOW()),
('user-shefali-pandey', 'shefali.pandey@company.com', 'Shefali Pandey', 'USER', 'Manufacturing', NOW(), NOW()),
('user-whitney-palmerton', 'whitney.palmerton@company.com', 'Whitney Palmerton', 'USER', 'Manufacturing', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET 
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  department = EXCLUDED.department;