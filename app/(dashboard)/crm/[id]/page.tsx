import LeadDetailPageClient from "./LeadDetailPageClient";

export default async function CrmLeadDetailPage({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const { id } = await params;
  return <LeadDetailPageClient leadId={id} />;
}
