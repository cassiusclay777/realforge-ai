// Prisma configuration for Prisma 7+
// This file replaces the deprecated datasource.url in schema.prisma

export default {
  adapter: 'pg',
  url: process.env.DATABASE_URL || 'postgresql://realforge:97868a241e26878c25834181@localhost:5432/realforge_ai',
}
