"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  Calendar, 
  Edit, 
  Trash2, 
  Loader2, 
  User, 
  Activity,
  Briefcase,
  CheckCircle,
  XCircle
} from "lucide-react";
import Link from "next/link";

const SOURCE_LABELS: Record<string, string> = {
  WEBSITE: "Web",
  REFERRAL: "Doporučení",
  SOCIAL: "Sociální sítě",
  DIRECT: "Přímý",
};

const STATUS_LABELS: Record<string, string> = {
  NEW: "Nový",
  CONTACTED: "Kontaktován",
  QUALIFIED: "Kvalifikován",
  NEGOTIATION: "Jednání",
  CLOSED: "Uzavřeno",
};

const STATUS_BADGE_CLASS: Record<string, string> = {
  NEW: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  CONTACTED: "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
  QUALIFIED: "bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300",
  NEGOTIATION: "bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
  CLOSED: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
};

const ACTIVITY_TYPE_LABELS: Record<string, string> = {
  CALL: "Hovor",
  EMAIL: "Email",
  MEETING: "Schůzka",
  VIEWING: "Prohlídka",
  NOTE: "Poznámka",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("cs-CZ", { 
    day: "numeric", 
    month: "short", 
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

type Activity = {
  id: string;
  type: string;
  description: string;
  outcome: string | null;
  scheduledAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type Deal = {
  id: string;
  status: string;
  price: number;
  commission: number;
  notes: string | null;
  documents: any;
  createdAt: string;
  updatedAt: string;
  checklist: Array<{
    id: string;
    task: string;
    completed: boolean;
    dueDate: string | null;
    completedAt: string | null;
  }>;
};

type Lead = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  source: string;
  status: string;
  budget: number | null;
  preferences: any;
  notes: string | null;
  assignedTo: {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
  } | null;
  activitiesCount: number;
  dealsCount: number;
  activities: Activity[];
  deals: Deal[];
  createdAt: string;
  updatedAt: string;
};

export default function LeadDetailPageClient({ leadId }: { leadId: string }) {
  const router = useRouter();

  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Form state for editing
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    source: "",
    status: "",
    budget: "",
    notes: "",
    assignedToId: "",
  });

  // Fetch lead details
  useEffect(() => {
    const fetchLead = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/leads/${leadId}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || "Nepodařilo se načíst lead");
        }

        if (data.success && data.data) {
          setLead(data.data);
          // Prefill edit form
          setEditForm({
            name: data.data.name,
            email: data.data.email || "",
            phone: data.data.phone || "",
            source: data.data.source,
            status: data.data.status,
            budget: data.data.budget?.toString() || "",
            notes: data.data.notes || "",
            assignedToId: data.data.assignedTo?.id || "",
          });
        } else {
          throw new Error("Neplatná odpověď API");
        }
      } catch (err: any) {
        console.error("Chyba při načítání leadu:", err);
        setError(err.message || "Došlo k chybě při načítání leadu");
      } finally {
        setLoading(false);
      }
    };

    if (leadId) {
      fetchLead();
    }
  }, [leadId]);

  // Handle edit form changes
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  // Save edited lead
  const handleSaveEdit = async () => {
    if (!lead) return;
    
    setEditLoading(true);
    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editForm.name,
          email: editForm.email || null,
          phone: editForm.phone || null,
          source: editForm.source,
          status: editForm.status,
          budget: editForm.budget ? parseInt(editForm.budget) : null,
          notes: editForm.notes || null,
          assignedToId: editForm.assignedToId || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Nepodařilo se aktualizovat lead");
      }

      // Update local state
      setLead(data.data);
      setEditMode(false);
    } catch (err: any) {
      console.error("Chyba při aktualizaci leadu:", err);
      setError(err.message || "Došlo k chybě při aktualizaci");
    } finally {
      setEditLoading(false);
    }
  };

  // Delete lead
  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Nepodařilo se smazat lead");
      }

      // Redirect to CRM list
      router.push("/crm");
      router.refresh();
    } catch (err: any) {
      console.error("Chyba při mazání leadu:", err);
      setError(err.message || "Došlo k chybě při mazání");
    } finally {
      setDeleteLoading(false);
      setDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-3 text-muted-foreground">Načítám lead...</span>
        </div>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="icon" asChild>
            <Link href="/crm">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Chyba</h1>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-destructive">{error || "Lead nenalezen"}</p>
            <Button variant="outline" className="mt-4" asChild>
              <Link href="/crm">Zpět na CRM</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/crm">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{lead.name}</h1>
              <Badge variant="outline" className={STATUS_BADGE_CLASS[lead.status]}>
                {STATUS_LABELS[lead.status] || lead.status}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-2">
              Lead vytvořen {formatDate(lead.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {editMode ? (
            <>
              <Button variant="outline" onClick={() => setEditMode(false)} disabled={editLoading}>
                Zrušit
              </Button>
              <Button onClick={handleSaveEdit} disabled={editLoading}>
                {editLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editLoading ? "Ukládání..." : "Uložit"}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setEditMode(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Editovat
              </Button>
              {deleteConfirm ? (
                <>
                  <Button variant="destructive" onClick={handleDelete} disabled={deleteLoading}>
                    {deleteLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {deleteLoading ? "Mažu..." : "Opravdu smazat?"}
                  </Button>
                  <Button variant="outline" onClick={() => setDeleteConfirm(false)}>
                    Zrušit
                  </Button>
                </>
              ) : (
                <Button variant="destructive" onClick={() => setDeleteConfirm(true)}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Smazat
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column - Lead Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Lead Details Card */}
          <Card>
            <CardHeader>
              <CardTitle>Detail leadu</CardTitle>
              <CardDescription>
                Základní informace a kontaktní údaje
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {editMode ? (
                // Edit form
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-name">Jméno *</Label>
                      <Input
                        id="edit-name"
                        name="name"
                        value={editForm.name}
                        onChange={handleEditChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-status">Status</Label>
                      <select
                        id="edit-status"
                        name="status"
                        aria-label="Status leadu"
                        title="Status leadu"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        value={editForm.status}
                        onChange={handleEditChange}
                      >
                        {Object.entries(STATUS_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-email">Email</Label>
                      <Input
                        id="edit-email"
                        name="email"
                        type="email"
                        value={editForm.email}
                        onChange={handleEditChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-phone">Telefon</Label>
                      <Input
                        id="edit-phone"
                        name="phone"
                        value={editForm.phone}
                        onChange={handleEditChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-source">Zdroj</Label>
                      <select
                        id="edit-source"
                        name="source"
                        aria-label="Zdroj leadu"
                        title="Zdroj leadu"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        value={editForm.source}
                        onChange={handleEditChange}
                      >
                        {Object.entries(SOURCE_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-budget">Rozpočet (Kč)</Label>
                      <Input
                        id="edit-budget"
                        name="budget"
                        type="number"
                        value={editForm.budget}
                        onChange={handleEditChange}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-assignedToId">ID přiřazeného uživatele</Label>
                    <Input
                      id="edit-assignedToId"
                      name="assignedToId"
                      value={editForm.assignedToId}
                      onChange={handleEditChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-notes">Poznámky</Label>
                    <Textarea
                      id="edit-notes"
                      name="notes"
                      rows={4}
                      value={editForm.notes}
                      onChange={handleEditChange}
                    />
                  </div>
                </div>
              ) : (
                // Display mode
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Contact info */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <User className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Jméno</p>
                          <p className="font-medium">{lead.name}</p>
                        </div>
                      </div>
                      {lead.email && (
                        <div className="flex items-center gap-3">
                          <Mail className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Email</p>
                            <p className="font-medium">{lead.email}</p>
                          </div>
                        </div>
                      )}
                      {lead.phone && (
                        <div className="flex items-center gap-3">
                          <Phone className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Telefon</p>
                            <p className="font-medium">{lead.phone}</p>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        <Briefcase className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Zdroj</p>
                          <p className="font-medium">{SOURCE_LABELS[lead.source] || lead.source}</p>
                        </div>
                      </div>
                    </div>

                    {/* Additional info */}
                    <div className="space-y-4">
                      {lead.budget && (
                        <div>
                          <p className="text-sm text-muted-foreground">Rozpočet</p>
                          <p className="font-medium">
                            {new Intl.NumberFormat("cs-CZ", { style: "currency", currency: "CZK" }).format(lead.budget)}
                          </p>
                        </div>
                      )}
                      {lead.assignedTo && (
                        <div>
                          <p className="text-sm text-muted-foreground">Přiřazeno</p>
                          <p className="font-medium">{lead.assignedTo.name} ({lead.assignedTo.email})</p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-muted-foreground">Vytvořeno</p>
                        <p className="font-medium">{formatDate(lead.createdAt)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Naposledy upraveno</p>
                        <p className="font-medium">{formatDate(lead.updatedAt)}</p>
                      </div>
                    </div>
                  </div>

                  {lead.notes && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Poznámky</p>
                      <div className="bg-muted/30 rounded-lg p-4 whitespace-pre-wrap">
                        {lead.notes}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Activities Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Aktivity</CardTitle>
                  <CardDescription>
                    Historie komunikace s leadem ({lead.activitiesCount})
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" disabled title="Akce bude dostupná v další verzi">
                  <Activity className="h-4 w-4 mr-2" />
                  Přidat aktivitu
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {lead.activities.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Žádné aktivity</p>
              ) : (
                <div className="space-y-4">
                  {lead.activities.map((activity) => (
                    <div key={activity.id} className="border-l-2 border-muted pl-4 py-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{ACTIVITY_TYPE_LABELS[activity.type] || activity.type}</span>
                            {activity.outcome && (
                              <Badge variant="outline" className="text-xs">
                                {activity.outcome}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm mt-1">{activity.description}</p>
                        </div>
                        <div className="text-sm text-muted-foreground text-right">
                          {activity.scheduledAt ? (
                            <p>Naplánováno: {formatDate(activity.scheduledAt)}</p>
                          ) : activity.completedAt ? (
                            <p>Dokončeno: {formatDate(activity.completedAt)}</p>
                          ) : (
                            <p>Vytvořeno: {formatDate(activity.createdAt)}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column - Deals & Stats */}
        <div className="space-y-8">
          {/* Deals Card */}
          <Card>
            <CardHeader>
              <CardTitle>Dealy</CardTitle>
              <CardDescription>
                Sjednané a probíhající dealy ({lead.dealsCount})
              </CardDescription>
            </CardHeader>
            <CardContent>
              {lead.deals.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Žádné dealy</p>
              ) : (
                <div className="space-y-4">
                  {lead.deals.map((deal) => (
                    <div key={deal.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium">
                            {new Intl.NumberFormat("cs-CZ", { style: "currency", currency: "CZK" }).format(deal.price)}
                          </p>
                          <p className="text-sm text-muted-foreground">Provize: {deal.commission}%</p>
                        </div>
                        <Badge variant={deal.status === "CLOSED" ? "default" : "outline"}>
                          {deal.status}
                        </Badge>
                      </div>
                      {deal.notes && (
                        <p className="text-sm mt-2">{deal.notes}</p>
                      )}
                      {deal.checklist.length > 0 && (
                        <div className="mt-3 space-y-1">
                          <p className="text-xs text-muted-foreground">Checklist:</p>
                          {deal.checklist.map((item) => (
                            <div key={item.id} className="flex items-center gap-2 text-sm">
                              {item.completed ? (
                                <CheckCircle className="h-3 w-3 text-green-500" />
                              ) : (
                                <XCircle className="h-3 w-3 text-muted-foreground" />
                              )}
                              <span className={item.completed ? "line-through text-muted-foreground" : ""}>
                                {item.task}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground mt-3">
                        Vytvořeno: {formatDate(deal.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle>Statistiky</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <p className="text-2xl font-bold">{lead.activitiesCount}</p>
                  <p className="text-xs text-muted-foreground">Aktivit</p>
                </div>
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <p className="text-2xl font-bold">{lead.dealsCount}</p>
                  <p className="text-xs text-muted-foreground">Dealů</p>
                </div>
              </div>
              <div className="pt-4 border-t">
                <p className="text-sm font-medium mb-2">Zdroj leadu</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-muted h-2 rounded-full overflow-hidden">
                    <div className="bg-primary h-full w-full" />
                  </div>
                  <span className="text-sm font-medium">{SOURCE_LABELS[lead.source] || lead.source}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle>Rychlé akce</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" size="sm" disabled title="Akce bude dostupná v další verzi">
                <Mail className="h-4 w-4 mr-2" />
                Poslat email
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm" disabled title="Akce bude dostupná v další verzi">
                <Phone className="h-4 w-4 mr-2" />
                Zavolat
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm" disabled title="Akce bude dostupná v další verzi">
                <Calendar className="h-4 w-4 mr-2" />
                Naplánovat schůzku
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm" disabled title="Akce bude dostupná v další verzi">
                <Briefcase className="h-4 w-4 mr-2" />
                Vytvořit deal
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}