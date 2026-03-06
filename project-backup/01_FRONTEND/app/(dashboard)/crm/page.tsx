// MVP: simulace CRM stránky
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, Phone, Mail, Calendar, Search, Filter, Plus, 
  X, User, Building, Globe, Clock, MessageSquare 
} from "lucide-react";

export default function CRMPage() {
  const [selectedLead, setSelectedLead] = useState<string | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  const mockLeads = [
    {
      id: "1",
      name: "Jan Novák",
      email: "jan.novak@email.cz",
      phone: "+420 777 123 456",
      listingTitle: "Byt 2+1, Praha 4",
      source: "SREALITY",
      status: "NEW",
      lastContact: "2026-02-08T14:30:00Z",
      notes: "Zájem o prohlídku příští týden",
    },
    {
      id: "2",
      name: "Petra Svobodová",
      email: "petra.svobodova@email.cz",
      phone: "+420 602 987 654",
      listingTitle: "Rodinný dům, Brno",
      source: "WEB",
      status: "INITIAL_CONTACT",
      lastContact: "2026-02-08T11:15:00Z",
      notes: "Čeká na financování",
    },
    {
      id: "3",
      name: "Martin Dvořák",
      email: "martin.dvorak@email.cz",
      phone: "+420 603 456 789",
      listingTitle: "Pozemek, Ostrava",
      source: "REFERRAL",
      status: "PROSPECT",
      lastContact: "2026-02-07T16:45:00Z",
      notes: "Vážný zájemce, žádá o dokumenty",
    },
    {
      id: "4",
      name: "Eva Černá",
      email: "eva.cerna@email.cz",
      phone: "+420 777 888 999",
      listingTitle: "Byt 2+1, Praha 4",
      source: "FACEBOOK",
      status: "RESERVATION",
      lastContact: "2026-02-06T09:20:00Z",
      notes: "Rezervace podepsána",
    },
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("cs-CZ");
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case "SREALITY": return "Sreality";
      case "BEZREALITKY": return "Bezrealitky";
      case "FACEBOOK": return "Facebook";
      case "INSTAGRAM": return "Instagram";
      case "WEB": return "Web";
      case "REFERRAL": return "Doporučení";
      case "PERSONAL": return "Osobně";
      default: return source;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "NEW":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700">NOVÝ</Badge>;
      case "INITIAL_CONTACT":
        return <Badge variant="outline" className="bg-purple-50 text-purple-700">KONTAKT</Badge>;
      case "PROSPECT":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700">PROSPEKT</Badge>;
      case "RESERVATION":
        return <Badge variant="outline" className="bg-orange-50 text-orange-700">REZERVACE</Badge>;
      case "SOLD":
        return <Badge variant="outline" className="bg-green-50 text-green-700">PRODÁNO</Badge>;
      case "LOST":
        return <Badge variant="outline" className="bg-red-50 text-red-700">ZTRACEN</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleContact = (leadId: string) => {
    setSelectedLead(leadId);
    setShowContactModal(true);
  };

  const handleDetail = (leadId: string) => {
    setSelectedLead(leadId);
    setShowDetailModal(true);
  };

  const handleNewLead = () => {
    alert("Otevření formuláře pro nový lead");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">CRM</h1>
          <p className="text-muted-foreground mt-2">
            Spravujte své leady a komunikaci s klienty
          </p>
        </div>
        <Button 
          className="mt-4 md:mt-0 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          onClick={handleNewLead}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nový Lead
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Celkem leadů</p>
                <p className="text-2xl font-bold">24</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Nové tento měsíc</p>
                <p className="text-2xl font-bold">8</p>
              </div>
              <Badge variant="outline" className="bg-blue-50 text-blue-700">+3</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Konverzní rate</p>
                <p className="text-2xl font-bold">42%</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-green-600 font-bold">↑</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Průměrná doba</p>
                <p className="text-2xl font-bold">14 dní</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Hledat leady..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filtry
              </Button>
              <Button variant="outline">Všechny statusy</Button>
              <Button variant="outline">Všechny zdroje</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <CardTitle>Aktivní leady</CardTitle>
          <CardDescription>
            Přehled všech vašich leadů a jejich aktuálního stavu
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Jméno</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Kontakt</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Listing</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Zdroj</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Poslední kontakt</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Akce</th>
                </tr>
              </thead>
              <tbody>
                {mockLeads.map((lead) => (
                  <tr key={lead.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4">
                      <div className="font-medium">{lead.name}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-3 w-3" />
                          {lead.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-3 w-3" />
                          {lead.phone}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm">{lead.listingTitle}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm">{getSourceLabel(lead.source)}</div>
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(lead.status)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm">{formatDate(lead.lastContact)}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleContact(lead.id)}
                        >
                          Kontakt
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDetail(lead.id)}
                        >
                          Detail
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Empty State */}
      {mockLeads.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Žádné leady</h3>
            <p className="text-muted-foreground mb-6">
              Začněte přidáním svého prvního leada
            </p>
            <Button 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              onClick={handleNewLead}
            >
              <Plus className="h-4 w-4 mr-2" />
              Přidat první lead
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedLead && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Detail leada</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowDetailModal(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              {(() => {
                const lead = mockLeads.find(l => l.id === selectedLead);
                if (!lead) return null;
                
                return (
                  <div className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">Jméno:</span>
                        </div>
                        <p className="text-lg font-semibold">{lead.name}</p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">Listing:</span>
                        </div>
                        <p className="text-lg">{lead.listingTitle}</p>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Mail className="h-5 w-5" />
                        Kontaktní informace
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="font-medium">{lead.email}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Telefon</p>
                          <p className="font-medium">{lead.phone}</p>
                        </div>
                      </div>
                    </div>

                    {/* Source & Status */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
                          <Globe className="h-5 w-5" />
                          Zdroj
                        </h3>
                        <div className="text-lg">{getSourceLabel(lead.source)}</div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
                          <Clock className="h-5 w-5" />
                          Status
                        </h3>
                        <div className="text-lg">{getStatusBadge(lead.status)}</div>
                      </div>
                    </div>

                    {/* Last Contact */}
                    <div>
                      <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
                        <Calendar className="h-5 w-5" />
                        Poslední kontakt
                      </h3>
                      <p className="text-lg">{formatDate(lead.lastContact)}</p>
                    </div>

                    {/* Notes */}
                    <div>
                      <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
                        <MessageSquare className="h-5 w-5" />
                        Poznámky
                      </h3>
                      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <p className="text-gray-700 dark:text-gray-300">{lead.notes}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-6 border-t">
                      <Button 
                        className="flex-1"
                        onClick={() => {
                          setShowDetailModal(false);
                          setShowContactModal(true);
                        }}
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        Kontaktovat
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => setShowDetailModal(false)}
                      >
                        Zavřít
                      </Button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {showContactModal && selectedLead && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Kontaktovat leada</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowContactModal(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              {(() => {
                const lead = mockLeads.find(l => l.id === selectedLead);
                if (!lead) return null;
                
                return (
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User className="h-8 w-8 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-semibold">{lead.name}</h3>
                      <p className="text-gray-500">{lead.listingTitle}</p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Mail className="h-5 w-5 text-gray-500" />
                          <span>Email</span>
                        </div>
                        <span className="font-medium">{lead.email}</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Phone className="h-5 w-5 text-gray-500" />
                          <span>Telefon</span>
                        </div>
                        <span className="font-medium">{lead.phone}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold">Způsob kontaktu:</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <Button variant="outline" className="flex-col h-auto py-3">
                          <Phone className="h-5 w-5 mb-2" />
                          <span>Volat</span>
                        </Button>
                        <Button variant="outline" className="flex-col h-auto py-3">
                          <Mail className="h-5 w-5 mb-2" />
                          <span>Email</span>
                        </Button>
                        <Button variant="outline" className="flex-col h-auto py-3">
                          <MessageSquare className="h-5 w-5 mb-2" />
                          <span>SMS</span>
                        </Button>
                        <Button variant="outline" className="flex-col h-auto py-3">
                          <Calendar className="h-5 w-5 mb-2" />
                          <span>Schůzka</span>
                        </Button>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button 
                        className="flex-1"
                        onClick={() => {
                          alert(`Kontaktován: ${lead.name}\nTelefon: ${lead.phone}`);
                          setShowContactModal(false);
                        }}
                      >
                        Potvrdit kontakt
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => setShowContactModal(false)}
                      >
                        Zrušit
                      </Button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
