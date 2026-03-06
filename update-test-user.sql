-- Update test user with correct bcrypt hash for 'test123'
UPDATE "User" 
SET password = '$2b$12$Ib/YsreIpemlhfbgXUVjh.AwdLXtshXb7yJ8kSowAnk1fHRYlI8Ze'
WHERE email = 'testuser@example.com';