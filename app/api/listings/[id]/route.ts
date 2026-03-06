import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { parsePositiveInt } from "@/lib/validation/numbers";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Neautorizováno" }, { status: 401 });
    }
    const { id } = await params;
    const body = await request.json();
    const {
      title,
      address,
      type,
      price,
      area,
      rooms,
      status,
      description,
    } = body;

    const data: {
      title?: string;
      address?: string;
      type?: string;
      price?: number;
      area?: number | null;
      rooms?: number | null;
      status?: string;
      description?: string | null;
    } = {};
    if (typeof title === "string" && title.trim()) data.title = title.trim();
    if (typeof address === "string") data.address = address.trim();
    if (typeof type === "string" && type.trim()) data.type = type.trim();
    const parsedPrice = parsePositiveInt(price);
    if (parsedPrice !== null) data.price = parsedPrice;
    if (area !== undefined) data.area = parsePositiveInt(area) ?? null;
    if (rooms !== undefined) data.rooms = parsePositiveInt(rooms) ?? null;
    if (typeof status === "string" && status.trim()) data.status = status.trim();
    if (description !== undefined) data.description = description === "" || description == null ? null : String(description);

    const updated = await prisma.listing.update({
      where: { id },
      data,
    });
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("PATCH listing error:", error);
    return NextResponse.json(
      { error: "Nepodařilo se aktualizovat listing" },
      { status: 500 }
    );
  }
}
