import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  clampLimit,
  DEFAULT_LIMIT,
  parseNonNegativeInt,
  parsePositiveInt,
} from "@/lib/validation/numbers";

export async function GET(request: NextRequest) {
  try {
    // GET is public so visitors can browse listings; POST is protected below.

    // Zpracování query parametrů
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const parsedLimit =
      parsePositiveInt(searchParams.get("limit"), DEFAULT_LIMIT) ?? DEFAULT_LIMIT;
    const limit = clampLimit(parsedLimit);
    const offset =
      Math.max(
        0,
        parseNonNegativeInt(searchParams.get("offset"), 0) ?? 0
      );

    // Build where clause for filtering
    const where: any = {};
    
    if (status) {
      where.status = status;
    }
    
    if (type) {
      where.type = type;
    }

    // Get listings with media count
    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        include: {
          media: {
            select: {
              id: true,
              url: true,
              category: true,
              isFeatured: true,
              aiDescription: true,
              aiCaption: true,
            },
            orderBy: {
              sortOrder: 'asc'
            },
            take: 5 // Limit media per listing for the list view
          },
          _count: {
            select: {
              media: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: offset,
        take: limit,
      }),
      prisma.listing.count({ where })
    ]);

    // Transform data for frontend
    const transformedListings = listings.map(listing => ({
      id: listing.id,
      title: listing.title,
      description: listing.description || '',
      price: listing.price,
      currency: "CZK",
      location: listing.address,
      status: listing.status,
      createdAt: listing.createdAt.toISOString(),
      updatedAt: listing.updatedAt.toISOString(),
      images: listing.media.map(media => media.url),
      category: listing.type?.toLowerCase() || 'other',
      area: listing.area,
      rooms: listing.rooms,
      mediaCount: listing._count.media,
      media: listing.media,
      aiStatus: listing._count.media > 0 ? 'HOTOVO' : 'ČEKÁ'
    }));

    // Get statistics
    const stats = {
      total: await prisma.listing.count(),
      active: await prisma.listing.count({ where: { status: 'ACTIVE' } }),
      pending: await prisma.listing.count({ where: { status: 'NEW' } }),
      sold: await prisma.listing.count({ where: { status: 'SOLD' } }),
      totalValue: (await prisma.listing.aggregate({
        _sum: { price: true },
        where: { status: { not: 'SOLD' } }
      }))._sum.price || 0,
      byCategory: {
        apartment: await prisma.listing.count({ where: { type: 'APARTMENT' } }),
        house: await prisma.listing.count({ where: { type: 'HOUSE' } }),
        land: await prisma.listing.count({ where: { type: 'LAND' } }),
      }
    };

    const pages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: transformedListings,
      pagination: {
        total,
        limit,
        offset,
        pages,
        currentPage: Math.floor(offset / limit) + 1,
        hasNext: offset + limit < total,
        hasPrev: offset > 0,
      },
      stats,
      filters: {
        status,
        type,
      }
    });
  } catch (error) {
    console.error("Chyba při načítání listingů:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Interní chyba serveru",
        message: "Nepodařilo se načíst seznam nemovitostí"
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "Neautorizováno" },
        { status: 401 }
      );
    }
    const role = (session.user as { role?: string }).role;
    if (role !== "AGENT" && role !== "ADMIN") {
      return NextResponse.json(
        { error: "Nedostatečná oprávnění" },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    // Validace vstupních dat
    const requiredFields = ["title", "address", "price", "type"];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          success: false,
          error: "Chybějící povinná pole",
          missingFields 
        },
        { status: 400 }
      );
    }

    const price = parsePositiveInt(body.price);
    if (price === null || price <= 0) {
      return NextResponse.json(
        { success: false, error: "Neplatná cena (musí být kladné číslo)" },
        { status: 400 }
      );
    }
    const area = parsePositiveInt(body.area);
    const rooms = parsePositiveInt(body.rooms);

    // Vytvoření nového listingu v databázi
    const newListing = await prisma.listing.create({
      data: {
        title: body.title,
        address: body.address,
        type: body.type,
        price,
        area: area ?? null,
        rooms: rooms ?? null,
        description: body.description || '',
        status: 'NEW',
      }
    });

    return NextResponse.json({
      success: true,
      message: "Nemovitost byla úspěšně vytvořena",
      data: newListing
    }, { status: 201 });
  } catch (error) {
    console.error("Chyba při vytváření listingu:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Interní chyba serveru",
        message: "Nepodařilo se vytvořit nemovitost"
      },
      { status: 500 }
    );
  }
}
