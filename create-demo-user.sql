-- Create demo user with password 'demo' (bcrypt hash)
INSERT INTO "User" (id, email, name, password, role, "createdAt", "updatedAt", "emailVerified") 
VALUES (
  'demo123456',
  'demo@realforge.ai', 
  'Demo User', 
  -- bcrypt hash for 'demo' with salt rounds 10
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  'USER', 
  NOW(), 
  NOW(),
  NOW()
) ON CONFLICT (email) DO UPDATE SET 
  password = EXCLUDED.password,
  name = EXCLUDED.name,
  "emailVerified" = EXCLUDED."emailVerified";