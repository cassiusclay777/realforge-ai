"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { 
  MessageSquare, 
  Phone, 
  Mail, 
  Calendar,
  CheckCircle,
  Clock,
  User,
  Send,
  MoreVertical,
  DollarSign,
  FileText,
  Users
} from "lucide-react";
import { useState } from "react";

interface ChatMessage {
  id: string;
  sender: 'user' | 'lead';
  name: string;
  avatar?: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface CRMLead {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'NEGOTIATION' | 'CLOSED';
  lastContact: string;
  budget: number;
  source: string;
}

interface CRMChatProps {
  leads?: CRMLead[];
  messages?: ChatMessage[];
}

export default function CRMChat({ leads, messages }: CRMChatProps) {
  const [selectedLead, setSelectedLead] = useState<string>("1");
  const [newMessage, setNewMessage] = useState("");

  const defaultLeads: CRMLead[] = [
    {
      id: "1",
      name: "Jan Novák",
      email: "jan.novak@email.cz",
      phone: "+420 777 123 456",
      status: "QUALIFIED",
      lastContact: "2 hodiny",
      budget: 8500000,
      source: "Web"
    },
    {
      id: "2",
      name: "Petra Svobodová",
      email: "petra.s@email.cz",
      phone: "+420 602 987 654",
      status: "NEGOTIATION",
      lastContact: "1 den",
      budget: 12500000,
      source: "Sreality"
    },
    {
      id: "3",
      name: "Martin Dvořák",
      email: "martin.dvorak@firma.cz",
      phone: "+420 603 456 789",
      status: "CONTACTED",
      lastContact: "3 dny",
      budget: 21000000,
      source: "Referral"
    },
    {
      id: "4",
      name: "Eva Králová",
      email: "eva.kralova@email.cz",
      phone: "+420 777 888 999",
      status: "NEW",
      lastContact: "5 minut",
      budget: 3200000,
      source: "Facebook"
    }
  ];

  const defaultMessages: ChatMessage[] = [
    {
      id: "1",
      sender: 'lead',
      name: 'Jan Novák',
      avatar: '/avatars/jan.jpg',
      message: 'Dobrý den, zajímá mě ten byt v Praze 1. Je možné se na něj podívat tento týden?',
      timestamp: '10:30',
      read: true
    },
    {
      id: "2",
      sender: 'user',
      name: 'Vy',
      avatar: '/avatars/agent.jpg',
      message: 'Dobrý den, samozřejmě. Máme volný termín ve čtvrtek od 14:00. Vyhovuje Vám?',
      timestamp: '10:32',
      read: true
    },
    {
      id: "3",
      sender: 'lead',
      name: 'Jan Novák',
      avatar: '/avatars/jan.jpg',
      message: 'Ano, perfektní. Pošlete mi prosím adresu a kontaktní údaje.',
      timestamp: '10:35',
      read: true
    },
    {
      id: "4",
      sender: 'user',
      name: 'Vy',
      avatar: '/avatars/agent.jpg',
      message: 'Posílám Vám detaily na email. Těším se na setkání!',
      timestamp: '10:40',
      read: true
    },
    {
      id: "5",
      sender: 'lead',
      name: 'Jan Novák',
      avatar: '/avatars/jan.jpg',
      message: 'Děkuji, email jsem obdržel. Ve čtvrtek se uvidíme.',
      timestamp: '10:45',
      read: false
    }
  ];

  const leadsData = leads || defaultLeads;
  const messagesData = messages || defaultMessages;
  const currentLead = leadsData.find(lead => lead.id === selectedLead);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'CONTACTED': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'QUALIFIED': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'NEGOTIATION': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'CLOSED': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'NEW': return 'Nový';
      case 'CONTACTED': return 'Kontaktován';
      case 'QUALIFIED': return 'Kvalifikován';
      case 'NEGOTIATION': return 'Jednání';
      case 'CLOSED': return 'Uzavřeno';
      default: return status;
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    // Here you would typically send the message to your backend
    console.log('Sending message:', newMessage);
    setNewMessage("");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Leads List */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Aktivní zájemci
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {leadsData.map((lead) => (
              <div
                key={lead.id}
                className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                  selectedLead === lead.id 
                    ? 'bg-primary/5 border-primary' 
                    : 'hover:bg-accent/5'
                }`}
                onClick={() => setSelectedLead(lead.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {lead.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground">{lead.name}</p>
                      <p className="text-sm text-muted-foreground">{lead.email}</p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(lead.status)}>
                    {getStatusText(lead.status)}
                  </Badge>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    <span>{lead.phone}</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{lead.lastContact}</span>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {lead.budget.toLocaleString()} Kč
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {lead.source}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chat Section */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>
                  {currentLead?.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="flex items-center gap-2">
                  {currentLead?.name}
                  <Badge className={getStatusColor(currentLead?.status || 'NEW')}>
                    {getStatusText(currentLead?.status || 'NEW')}
                  </Badge>
                </CardTitle>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {currentLead?.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {currentLead?.phone}
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    {currentLead?.budget.toLocaleString()} Kč
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline">
                <Phone className="h-4 w-4 mr-2" />
                Zavolat
              </Button>
              <Button size="sm" variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Schůzka
              </Button>
              <Button size="sm" variant="ghost">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Chat Messages */}
          <div className="h-96 overflow-y-auto space-y-4 mb-4 p-2">
            {messagesData.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {msg.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className={`max-w-[70%] ${msg.sender === 'user' ? 'text-right' : ''}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">{msg.name}</span>
                    <span className="text-xs text-muted-foreground">{msg.timestamp}</span>
                    {!msg.read && msg.sender === 'lead' && (
                      <Badge variant="outline" className="text-xs">Nové</Badge>
                    )}
                  </div>
                  <div className={`rounded-lg p-3 ${
                    msg.sender === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted'
                  }`}>
                    <p className="text-sm">{msg.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="flex gap-2">
            <Input
              placeholder="Napište zprávu..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1"
            />
            <Button onClick={handleSendMessage}>
              <Send className="h-4 w-4 mr-2" />
              Odeslat
            </Button>
          </div>

          {/* Quick Actions */}
          <div className="mt-4 flex flex-wrap gap-2">
            <Button size="sm" variant="outline">
              <CheckCircle className="h-3 w-3 mr-2" />
              Poslat nabídku
            </Button>
            <Button size="sm" variant="outline">
              <FileText className="h-3 w-3 mr-2" />
              Přiložit dokument
            </Button>
            <Button size="sm" variant="outline">
              <Calendar className="h-3 w-3 mr-2" />
              Navrhnout schůzku
            </Button>
            <Button size="sm" variant="outline">
              <DollarSign className="h-3 w-3 mr-2" />
              Ceník
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
