"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
// Database client - using simple PostgreSQL Pool for compatibility
var pg_1 = require("pg");
console.log('=== PRISMA CLIENT LOADED (Simple Pool) ===');
var pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});
function query(text, params) {
    return __awaiter(this, void 0, void 0, function () {
        var client, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, pool.connect()];
                case 1:
                    client = _a.sent();
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, , 4, 5]);
                    return [4 /*yield*/, client.query(text, params)];
                case 3:
                    result = _a.sent();
                    return [2 /*return*/, result];
                case 4:
                    client.release();
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function generateId() {
    return crypto.randomUUID();
}
var prisma = {
    listing: {
        findUnique: function (data) { return __awaiter(void 0, void 0, void 0, function () {
            var where, include, listingResult, listing, mediaResult, aiResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        where = data.where, include = data.include;
                        if (!where.id)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, query('SELECT * FROM "Listing" WHERE id = $1', [where.id])];
                    case 1:
                        listingResult = _a.sent();
                        if (listingResult.rows.length === 0)
                            return [2 /*return*/, null];
                        listing = listingResult.rows[0];
                        if (!(include === null || include === void 0 ? void 0 : include.media)) return [3 /*break*/, 3];
                        return [4 /*yield*/, query('SELECT * FROM "ListingMedia" WHERE "listingId" = $1 ORDER BY "sortOrder" ASC', [where.id])];
                    case 2:
                        mediaResult = _a.sent();
                        listing.media = mediaResult.rows;
                        _a.label = 3;
                    case 3:
                        if (!(include === null || include === void 0 ? void 0 : include.aiResults)) return [3 /*break*/, 5];
                        return [4 /*yield*/, query('SELECT * FROM "AIResult" WHERE "listingId" = $1', [where.id])];
                    case 4:
                        aiResult = _a.sent();
                        listing.aiResults = aiResult.rows[0] || null;
                        _a.label = 5;
                    case 5: return [2 /*return*/, listing];
                }
            });
        }); },
        update: function (data) { return __awaiter(void 0, void 0, void 0, function () {
            var where, updateData, id, fields, setClause, values, queryStr, params, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        where = data.where, updateData = data.data;
                        id = where.id;
                        if (!id)
                            throw new Error('No valid where clause provided for update');
                        fields = Object.keys(updateData);
                        if (fields.length === 0)
                            throw new Error('No data provided for update');
                        setClause = fields.map(function (field, index) { return '"' + field + '" = $' + (index + 1); }).join(', ');
                        values = Object.values(updateData);
                        queryStr = 'UPDATE "Listing" SET ' + setClause + ', "updatedAt" = NOW() WHERE id = $' + (fields.length + 1) + ' RETURNING *';
                        params = __spreadArray(__spreadArray([], values, true), [id], false);
                        return [4 /*yield*/, query(queryStr, params)];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.rows[0] || null];
                }
            });
        }); },
        create: function (data) { return __awaiter(void 0, void 0, void 0, function () {
            var _a, title, address, type, price, status, userId, agentId, area, rooms, floor, yearBuilt, id, result;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = data.data, title = _a.title, address = _a.address, type = _a.type, price = _a.price, status = _a.status, userId = _a.userId, agentId = _a.agentId, area = _a.area, rooms = _a.rooms, floor = _a.floor, yearBuilt = _a.yearBuilt;
                        id = data.data.id || generateId();
                        return [4 /*yield*/, query('INSERT INTO "Listing" (id, title, address, type, price, status, "user_id", "agentId", area, rooms, floor, "yearBuilt", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW()) RETURNING *', [id, title, address, type, price, status, userId, agentId, area, rooms, floor, yearBuilt])];
                    case 1:
                        result = _b.sent();
                        return [2 /*return*/, result.rows[0]];
                }
            });
        }); },
    },
    aIResult: {
        findUnique: function (data) { return __awaiter(void 0, void 0, void 0, function () {
            var where, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        where = data.where;
                        if (!where.listingId)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, query('SELECT * FROM "AIResult" WHERE "listingId" = $1', [where.listingId])];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.rows[0] || null];
                }
            });
        }); },
        create: function (data) { return __awaiter(void 0, void 0, void 0, function () {
            var _a, listingId, headline, shortDesc, result;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = data.data, listingId = _a.listingId, headline = _a.headline, shortDesc = _a.shortDesc;
                        return [4 /*yield*/, query('INSERT INTO "AIResult" (id, "listingId", headline, "shortDesc", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING *', [generateId(), listingId, headline, shortDesc])];
                    case 1:
                        result = _b.sent();
                        return [2 /*return*/, result.rows[0]];
                }
            });
        }); },
    },
    listingMedia: {
        create: function (data) { return __awaiter(void 0, void 0, void 0, function () {
            var _a, listingId, url, thumbnailUrl, originalName, category, isFeatured, isHidden, sortOrder, aiTags, aiSaliencyScore, processingStatus, id, result;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = data.data, listingId = _a.listingId, url = _a.url, thumbnailUrl = _a.thumbnailUrl, originalName = _a.originalName, category = _a.category, isFeatured = _a.isFeatured, isHidden = _a.isHidden, sortOrder = _a.sortOrder, aiTags = _a.aiTags, aiSaliencyScore = _a.aiSaliencyScore, processingStatus = _a.processingStatus;
                        id = generateId();
                        return [4 /*yield*/, query('INSERT INTO "ListingMedia" (id, "listingId", url, "thumbnailUrl", "originalName", category, "isFeatured", "isHidden", "sortOrder", "aiTags", "aiSaliencyScore", "processingStatus", "processedAt", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW(), NOW()) RETURNING *', [id, listingId, url, thumbnailUrl, originalName, category, isFeatured || false, isHidden || false, sortOrder || 0, JSON.stringify(aiTags || []), aiSaliencyScore || null, processingStatus || 'QUEUED'])];
                    case 1:
                        result = _b.sent();
                        return [2 /*return*/, result.rows[0]];
                }
            });
        }); },
        findMany: function (data) { return __awaiter(void 0, void 0, void 0, function () {
            var where, orderBy, queryStr, params, paramIndex, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        where = data.where, orderBy = data.orderBy;
                        queryStr = 'SELECT * FROM "ListingMedia" WHERE 1=1';
                        params = [];
                        paramIndex = 1;
                        if (where === null || where === void 0 ? void 0 : where.listingId) {
                            queryStr += ' AND "listingId" = $' + paramIndex;
                            params.push(where.listingId);
                            paramIndex++;
                        }
                        if (where === null || where === void 0 ? void 0 : where.category) {
                            queryStr += ' AND category = $' + paramIndex;
                            params.push(where.category);
                            paramIndex++;
                        }
                        queryStr += ' ORDER BY "sortOrder" ASC';
                        return [4 /*yield*/, query(queryStr, params)];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.rows];
                }
            });
        }); },
    },
    $connect: function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, query('SELECT 1')];
                case 1:
                    _a.sent();
                    console.log('✅ Database connected successfully');
                    return [2 /*return*/];
            }
        });
    }); },
    $disconnect: function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, pool.end()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); },
};
exports.prisma = prisma;
// Voláme connect, ale ne await - uděláme to později
prisma.$connect().catch(function (err) {
    console.error('Failed to connect to database:', err instanceof Error ? err.message : String(err));
});
