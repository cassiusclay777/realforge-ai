-- Create a test user with bcrypt hashed password 'test123'
INSERT INTO "User" (id, email, name, password, role, "createdAt", "updatedAt") 
VALUES (
  'test123456',
  'testuser@example.com', 
  'Test User', 
  -- bcrypt hash for 'test123' with salt rounds 12
  '$2a$12$L7vL.wv.Kh5p8j6p6p6p6e6p6p6p6p6p6p6p6p6p6p6p6p6p6p6p6',
  'USER', 
  NOW(), 
  NOW()
) ON CONFLICT (email) DO NOTHING;