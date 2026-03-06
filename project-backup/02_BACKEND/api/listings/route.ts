import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

// Mock data pro testování - v produkci by se načítalo z databáze přes Prisma
const mockListings = [
  {
    id: "1",
    title: "Moderní byt 2+kk v centru Prahy",
    description: "Nově zrekonstruovaný byt v klidné lokalitě s výhledem na park.",
    price: 4500000,
    currency: "CZK",
    location: "Praha 1",
    status: "active",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-20T14:45:00Z",
    images: ["/uploads/listing1-1.jpg", "/uploads/listing1-2.jpg"],
    category: "apartment",
    area: 65,
    rooms: 2,
  },
  {
    id: "2",
    title: "Rodinný dům se zahradou, Brno",
    description: "Komfortní rodinný dům s velkou zahradou a garáží.",
    price: 8500000,
    currency: "CZK",
    location: "Brno",
    status: "active",
    createdAt: "2024-01-10T09:15:00Z",
    updatedAt: "2024-01-18T11:20:00Z",
    images: ["/uploads/listing2-1.jpg"],
    category: "house",
    area: 120,
    rooms: 4,
  },
  {
    id: "3",
    title: "Kancelářské prostory, Ostrava",
    description: "Moderní kancelářské prostory v obchodním centru.",
    price: 12000000,
    currency: "CZK",
    location: "Ostrava",
    status: "pending",
    createdAt: "2024-01-05T14:20:00Z",
    updatedAt: "2024-01-12T16:30:00Z",
    images: ["/uploads/listing3-1.jpg", "/uploads/listing3-2.jpg", "/uploads/listing3-3.jpg"],
    category: "commercial",
    area: 200,
    rooms: 6,
  },
  {
    id: "4",
    title: "Chata v Krkonoších",
    description: "Dřevěná chata ideální pro víkendové pobyty.",
    price: 2800000,
    currency: "CZK",
    location: "Krkonoše",
    status: "active",
    createdAt: "2023-12-20T11:45:00Z",
    updatedAt: "2024-01-08T13:15:00Z",
    images: ["/uploads/listing4-1.jpg"],
    category: "cottage",
    area: 45,
    rooms: 2,
  },
  {
    id: "5",
    title: "Luxusní penthouse s výhledem",
    description: "Exkluzivní penthouse s panoramatickým výhledem na město.",
    price: 25000000,
    currency: "CZK",
    location: "Praha 5",
    status: "sold",
    createdAt: "2023-12-10T08:30:00Z",
    updatedAt: "2024-01-02T10:45:00Z",
    images: ["/uploads/listing5-1.jpg", "/uploads/listing5-2.jpg", "/uploads/listing5-3.jpg", "/uploads/listing5-4.jpg"],
    category: "luxury",
    area: 180,
    rooms: 3,
  },
];

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "Neautorizováno" },
        { status: 401 }
      );
    }

    // Zpracování query parametrů
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Filtrování listingů
    let filteredListings = [...mockListings];

    if (status) {
      filteredListings = filteredListings.filter(listing => listing.status === status);
    }

    if (category) {
      filteredListings = filteredListings.filter(listing => listing.category === category);
    }

    // Stránkování
    const paginatedListings = filteredListings.slice(offset, offset + limit);
    const total = filteredListings.length;
    const pages = Math.ceil(total / limit);

    // Statistika
    const stats = {
      total: mockListings.length,
      active: mockListings.filter(l => l.status === "active").length,
      pending: mockListings.filter(l => l.status === "pending").length,
      sold: mockListings.filter(l => l.status === "sold").length,
      totalValue: mockListings.reduce((sum, listing) => sum + listing.price, 0),
      byCategory: {
        apartment: mockListings.filter(l => l.category === "apartment").length,
        house: mockListings.filter(l => l.category === "house").length,
        commercial: mockListings.filter(l => l.category === "commercial").length,
        cottage: mockListings.filter(l => l.category === "cottage").length,
        luxury: mockListings.filter(l => l.category === "luxury").length,
      }
    };

    return NextResponse.json({
      success: true,
      data: paginatedListings,
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
        category,
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

    const body = await request.json();
    
    // Validace vstupních dat
    const requiredFields = ["title", "description", "price", "location", "category"];
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

    // Vytvoření nového listingu
    const newListing = {
      id: (mockListings.length + 1).toString(),
      title: body.title,
      description: body.description,
      price: parseFloat(body.price),
      currency: body.currency || "CZK",
      location: body.location,
      status: body.status || "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      images: body.images || [],
      category: body.category,
      area: body.area ? parseFloat(body.area) : null,
      rooms: body.rooms ? parseInt(body.rooms) : null,
      // Další pole podle potřeby
      ...body.extraFields
    };

    // V produkci by se zde ukládalo do databáze
    mockListings.unshift(newListing);

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