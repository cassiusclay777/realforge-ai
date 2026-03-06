export interface CRMLead {
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
  recentActivities: Array<{
    id: string;
    type: string;
    description: string;
    outcome: string | null;
    scheduledAt: string | null;
    completedAt: string | null;
  }>;
  deals: Array<{
    id: string;
    status: string;
    price: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface LeadResponse {
  success: boolean;
  data: CRMLead[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    pages: number;
    currentPage: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  stats: any;
  filters: any;
}