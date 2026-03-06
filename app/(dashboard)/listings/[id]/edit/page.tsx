import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ListingEditForm } from "./ListingEditForm";

export default async function ListingEditPage({
  params,
}: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;
  const listing = await prisma.listing.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      address: true,
      type: true,
      price: true,
      area: true,
      rooms: true,
      status: true,
      description: true,
    },
  });
  if (!listing) notFound();

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-6 flex items-center gap-4">
        <Link href={`/listings/${id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Úprava listingu</h1>
      </div>
      <ListingEditForm listing={listing} />
    </div>
  );
}
