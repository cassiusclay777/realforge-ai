"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
// Database client - using simple PostgreSQL Pool for compatibility
const pg_1 = require("pg");
console.log('=== PRISMA CLIENT LOADED (Simple Pool) ===');
const pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});
async function query(text, params) {
    const client = await pool.connect();
    try {
        const result = await client.query(text, params);
        return result;
    }
    finally {
        client.release();
    }
}
function generateId() {
    return crypto.randomUUID();
}
const prisma = {
    listing: {
        findUnique: async (data) => {
            const { where, include } = data;
            if (!where.id)
                return null;
            const listingResult = await query('SELECT * FROM "Listing" WHERE id = $1', [where.id]);
            if (listingResult.rows.length === 0)
                return null;
            const listing = listingResult.rows[0];
            if (include?.media) {
                const mediaResult = await query('SELECT * FROM "ListingMedia" WHERE "listingId" = $1 ORDER BY "sortOrder" ASC', [where.id]);
                listing.media = mediaResult.rows;
            }
            if (include?.aiResults) {
                const aiResult = await query('SELECT * FROM "AIResult" WHERE "listingId" = $1', [where.id]);
                listing.aiResults = aiResult.rows[0] || null;
            }
            return listing;
        },
        update: async (data) => {
            const { where, data: updateData } = data;
            const { id } = where;
            if (!id)
                throw new Error('No valid where clause provided for update');
            const fields = Object.keys(updateData);
            if (fields.length === 0)
                throw new Error('No data provided for update');
            const setClause = fields.map((field, index) => '"' + field + '" = $' + (index + 1)).join(', ');
            const values = Object.values(updateData);
            const queryStr = 'UPDATE "Listing" SET ' + setClause + ', "updatedAt" = NOW() WHERE id = $' + (fields.length + 1) + ' RETURNING *';
            const params = [...values, id];
            const result = await query(queryStr, params);
            return result.rows[0] || null;
        },
        create: async (data) => {
            const { title, address, type, price, status, userId, agentId, area, rooms, floor, yearBuilt } = data.data;
            const id = data.data.id || generateId();
            const result = await query('INSERT INTO "Listing" (id, title, address, type, price, status, "user_id", "agentId", area, rooms, floor, "yearBuilt", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW()) RETURNING *', [id, title, address, type, price, status, userId, agentId, area, rooms, floor, yearBuilt]);
            return result.rows[0];
        },
    },
    aIResult: {
        findUnique: async (data) => {
            const { where } = data;
            if (!where.listingId)
                return null;
            const result = await query('SELECT * FROM "AIResult" WHERE "listingId" = $1', [where.listingId]);
            return result.rows[0] || null;
        },
        create: async (data) => {
            const { listingId, headline, shortDesc } = data.data;
            const result = await query('INSERT INTO "AIResult" (id, "listingId", headline, "shortDesc", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING *', [generateId(), listingId, headline, shortDesc]);
            return result.rows[0];
        },
    },
    listingMedia: {
        create: async (data) => {
            const { listingId, url, thumbnailUrl, originalName, category, isFeatured, isHidden, sortOrder, aiTags, aiSaliencyScore, processingStatus } = data.data;
            const id = generateId();
            const result = await query('INSERT INTO "ListingMedia" (id, "listingId", url, "thumbnailUrl", "originalName", category, "isFeatured", "isHidden", "sortOrder", "aiTags", "aiSaliencyScore", "processingStatus", "processedAt", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW(), NOW()) RETURNING *', [id, listingId, url, thumbnailUrl, originalName, category, isFeatured || false, isHidden || false, sortOrder || 0, JSON.stringify(aiTags || []), aiSaliencyScore || null, processingStatus || 'QUEUED']);
            return result.rows[0];
        },
        findMany: async (data) => {
            const { where, orderBy } = data;
            let queryStr = 'SELECT * FROM "ListingMedia" WHERE 1=1';
            const params = [];
            let paramIndex = 1;
            if (where?.listingId) {
                queryStr += ' AND "listingId" = $' + paramIndex;
                params.push(where.listingId);
                paramIndex++;
            }
            if (where?.category) {
                queryStr += ' AND category = $' + paramIndex;
                params.push(where.category);
                paramIndex++;
            }
            queryStr += ' ORDER BY "sortOrder" ASC';
            const result = await query(queryStr, params);
            return result.rows;
        },
    },
    $connect: async () => {
        await query('SELECT 1');
        console.log('✅ Database connected successfully');
    },
    $disconnect: async () => {
        await pool.end();
    },
};
exports.prisma = prisma;
// Voláme connect, ale ne await - uděláme to později
prisma.$connect().catch(err => {
    console.error('Failed to connect to database:', err instanceof Error ? err.message : String(err));
});
