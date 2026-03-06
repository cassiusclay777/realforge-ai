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
    const session = await getServerSession(authOptions);
    // GET is public? For now, require authentication
    if (!session) {
      return NextResponse.json(
        { error: "Neautorizováno" },
        { status: 401 }
      );
    }

    // Process query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const source = searchParams.get("source");
    const assignedTo = searchParams.get("assignedTo");
    const search = searchParams.get("search");
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
    
    if (source) {
      where.source = source;
    }

    if (assignedTo) {
      where.assignedToId = assignedTo;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get leads with assignedTo relation
    const [leads, total] = await Promise.all([
      prisma.cRMLead.findMany({
        where,
        include: {
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          activities: {
            orderBy: {
              createdAt: 'desc',
            },
            take: 3, // recent activities
          },
          deals: {
            select: {
              id: true,
              status: true,
              price: true,
            },
          },
          _count: {
            select: {
              activities: true,
              deals: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: offset,
        take: limit,
      }),
      prisma.cRMLead.count({ where }),
    ]);

    // Transform data for frontend
    const transformedLeads = leads.map(lead => ({
      id: lead.id,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      source: lead.source,
      status: lead.status,
      budget: lead.budget,
      preferences: lead.preferences,
      notes: lead.notes,
      assignedTo: lead.assignedTo ? {
        id: lead.assignedTo.id,
        name: lead.assignedTo.name,
        email: lead.assignedTo.email,
        role: lead.assignedTo.role,
      } : null,
      activitiesCount: lead._count.activities,
      dealsCount: lead._count.deals,
      recentActivities: lead.activities.map(activity => ({
        id: activity.id,
        type: activity.type,
        description: activity.description,
        outcome: activity.outcome,
        scheduledAt: activity.scheduledAt?.toISOString(),
        completedAt: activity.completedAt?.toISOString(),
      })),
      deals: lead.deals.map(deal => ({
        id: deal.id,
        status: deal.status,
        price: deal.price,
      })),
      createdAt: lead.createdAt.toISOString(),
      updatedAt: lead.updatedAt.toISOString(),
    }));

    // Get statistics
    const stats = {
      total: await prisma.cRMLead.count(),
      new: await prisma.cRMLead.count({ where: { status: 'NEW' } }),
      contacted: await prisma.cRMLead.count({ where: { status: 'CONTACTED' } }),
      qualified: await prisma.cRMLead.count({ where: { status: 'QUALIFIED' } }),
      negotiation: await prisma.cRMLead.count({ where: { status: 'NEGOTIATION' } }),
      closed: await prisma.cRMLead.count({ where: { status: 'CLOSED' } }),
      bySource: {
        website: await prisma.cRMLead.count({ where: { source: 'WEBSITE' } }),
        referral: await prisma.cRMLead.count({ where: { source: 'REFERRAL' } }),
        social: await prisma.cRMLead.count({ where: { source: 'SOCIAL' } }),
        direct: await prisma.cRMLead.count({ where: { source: 'DIRECT' } }),
      },
    };

    const pages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: transformedLeads,
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
        source,
        assignedTo,
        search,
      },
    });
  } catch (error) {
    console.error("Chyba při načítání leadů:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Interní chyba serveru",
        message: "Nepodařilo se načíst seznam leadů"
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
    const { name, email, phone, source, status, budget, preferences, notes, assignedToId } = body;

    // Basic validation
    if (!name) {
      return NextResponse.json(
        { error: "Jméno je povinné" },
        { status: 400 }
      );
    }

    // Create lead
    const lead = await prisma.cRMLead.create({
      data: {
        name,
        email,
        phone,
        source: source || "WEBSITE",
        status: status || "NEW",
        budget: budget ? parseInt(budget) : null,
        preferences: preferences || null,
        notes: notes || null,
        assignedToId: assignedToId || null,
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: lead,
      message: "Lead úspěšně vytvořen",
    }, { status: 201 });
  } catch (error) {
    console.error("Chyba při vytváření leadu:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Interní chyba serveru",
        message: "Nepodařilo se vytvořit lead"
      },
      { status: 500 }
    );
  }
}