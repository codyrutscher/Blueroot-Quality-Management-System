-- Create user accounts with username format firstname.lastname and password firstname.lastname.randomnumber

INSERT INTO users (id, email, name, password, role, department, "createdAt", "updatedAt") VALUES
  ('user_john_troup', 'john.troup@company.com', 'John Troup', '$2a$10$hashedpassword_john.troup.4872', 'USER', null, NOW(), NOW()),
  ('user_matt_white', 'matt.white@company.com', 'Matt White', '$2a$10$hashedpassword_matt.white.9153', 'USER', null, NOW(), NOW()),
  ('user_nick_hafften', 'nick.hafften@company.com', 'Nick Hafften', '$2a$10$hashedpassword_nick.hafften.7284', 'USER', null, NOW(), NOW()),
  ('user_steve_nelson', 'steve.nelson@company.com', 'Steve Nelson', '$2a$10$hashedpassword_steve.nelson.3967', 'USER', null, NOW(), NOW()),
  ('user_nick_deloia', 'nick.deloia@company.com', 'Nick Deloia', '$2a$10$hashedpassword_nick.deloia.8541', 'USER', null, NOW(), NOW()),
  ('user_jenn_doucette', 'jenn.doucette@company.com', 'Jenn Doucette', '$2a$10$hashedpassword_jenn.doucette.2096', 'USER', null, NOW(), NOW()),
  ('user_dana_rutscher', 'dana.rutscher@company.com', 'Dana Rutscher', '$2a$10$hashedpassword_dana.rutscher.6413', 'USER', null, NOW(), NOW()),
  ('user_shefali_pandey', 'shefali.pandey@company.com', 'Shefali Pandey', '$2a$10$hashedpassword_shefali.pandey.9750', 'USER', null, NOW(), NOW()),
  ('user_whitney_palmerton', 'whitney.palmerton@company.com', 'Whitney Palmerton', '$2a$10$hashedpassword_whitney.palmerton.1638', 'USER', null, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;