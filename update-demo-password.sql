-- Update demo user password with correct bcrypt hash
UPDATE "User" 
SET password = '$2b$10$vHsNWUZpQq2SwqkD/2hN0eviqGsXihqEFe4oPZT1cSBTyznFwvn4.'
WHERE email = 'demo@realforge.ai';