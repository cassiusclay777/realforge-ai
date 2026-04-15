import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "Neautorizováno" },
        { status: 401 }
      );
    }

    const leadId = (await params).id;

    // Find lead with all relations
    const lead = await prisma.cRMLead.findUnique({
      where: { id: leadId },
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
          include: {
            lead: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        deals: {
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            lead: {
              select: {
                id: true,
                name: true,
              },
            },
            checklist: {
              orderBy: {
                dueDate: 'asc',
              },
            },
          },
        },
        _count: {
          select: {
            activities: true,
            deals: true,
          },
        },
      },
    });

    if (!lead) {
      return NextResponse.json(
        { error: "Lead nenalezen" },
        { status: 404 }
      );
    }

    // Transform data for frontend
    const transformedLead = {
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
      activities: lead.activities.map(activity => ({
        id: activity.id,
        type: activity.type,
        description: activity.description,
        outcome: activity.outcome,
        scheduledAt: activity.scheduledAt?.toISOString(),
        completedAt: activity.completedAt?.toISOString(),
        createdAt: activity.createdAt.toISOString(),
        updatedAt: activity.updatedAt.toISOString(),
      })),
      deals: lead.deals.map(deal => ({
        id: deal.id,
        status: deal.status,
        price: deal.price,
        commission: deal.commission,
        notes: deal.notes,
        documents: deal.documents,
        createdAt: deal.createdAt.toISOString(),
        updatedAt: deal.updatedAt.toISOString(),
        checklist: deal.checklist.map(item => ({
          id: item.id,
          task: item.task,
          completed: item.completed,
          dueDate: item.dueDate?.toISOString(),
          completedAt: item.completedAt?.toISOString(),
        })),
      })),
      createdAt: lead.createdAt.toISOString(),
      updatedAt: lead.updatedAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: transformedLead,
    });
  } catch (error) {
    console.error("Chyba při načítání leadu:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Interní chyba serveru",
        message: "Nepodařilo se načíst detail leadu"
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "Neautorizováno" },
        { status: 401 }
      );
    }

    const leadId = (await params).id;
    const body = await request.json();
    
    // Check if lead exists
    const existingLead = await prisma.cRMLead.findUnique({
      where: { id: leadId },
    });

    if (!existingLead) {
      return NextResponse.json(
        { error: "Lead nenalezen" },
        { status: 404 }
      );
    }

    // Extract allowed fields
    const { 
      name, 
      email, 
      phone, 
      source, 
      status, 
      budget, 
      preferences, 
      notes, 
      assignedToId 
    } = body;

    let parsedBudget = existingLead.budget;
    if (budget !== undefined) {
      if (budget === null || budget === "") {
        parsedBudget = null;
      } else {
        const asNumber = Number.parseInt(String(budget), 10);
        if (Number.isNaN(asNumber) || asNumber < 0) {
          return NextResponse.json(
            { error: "Neplatná hodnota budget" },
            { status: 400 }
          );
        }
        parsedBudget = asNumber;
      }
    }

    // Update lead
    const updatedLead = await prisma.cRMLead.update({
      where: { id: leadId },
      data: {
        name: name ?? existingLead.name,
        email: email ?? existingLead.email,
        phone: phone ?? existingLead.phone,
        source: source ?? existingLead.source,
        status: status ?? existingLead.status,
        budget: parsedBudget,
        preferences: preferences ?? existingLead.preferences,
        notes: notes ?? existingLead.notes,
        assignedToId: assignedToId ?? existingLead.assignedToId,
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
      data: updatedLead,
      message: "Lead úspěšně aktualizován",
    });
  } catch (error) {
    console.error("Chyba při aktualizaci leadu:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Interní chyba serveru",
        message: "Nepodařilo se aktualizovat lead"
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "Neautorizováno" },
        { status: 401 }
      );
    }

    const leadId = (await params).id;

    // Check if lead exists
    const existingLead = await prisma.cRMLead.findUnique({
      where: { id: leadId },
    });

    if (!existingLead) {
      return NextResponse.json(
        { error: "Lead nenalezen" },
        { status: 404 }
      );
    }

    // Delete lead (hard delete for now)
    // Note: This will cascade delete activities and deals due to onDelete: Cascade in schema
    await prisma.cRMLead.delete({
      where: { id: leadId },
    });

    return NextResponse.json({
      success: true,
      message: "Lead úspěšně smazán",
    });
  } catch (error) {
    console.error("Chyba při mazání leadu:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Interní chyba serveru",
        message: "Nepodařilo se smazat lead"
      },
      { status: 500 }
    );
  }
}