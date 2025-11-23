import { Lead, LeadStatus, ProductType, Meeting } from '../types';

export const MOCK_LEADS: Lead[] = [
  {
    id: '1',
    name: 'Carlos Silva',
    phone: '+55 11 99999-1234',
    email: 'carlos.silva@example.com',
    status: LeadStatus.NEW,
    productInterest: ProductType.AUTO,
    budget: 50000,
    lastContact: '2023-10-25T10:00:00Z',
    nextAction: 'Initial Qualification Call',
    score: 85
  },
  {
    id: '2',
    name: 'Mariana Costa',
    phone: '+55 21 98888-5678',
    email: 'mariana.costa@example.com',
    status: LeadStatus.MEETING_SCHEDULED,
    productInterest: ProductType.REAL_ESTATE,
    budget: 450000,
    lastContact: '2023-10-24T14:30:00Z',
    nextAction: 'Product Presentation',
    score: 92
  },
  {
    id: '3',
    name: 'Roberto Santos',
    phone: '+55 31 97777-4321',
    email: 'roberto.santos@example.com',
    status: LeadStatus.PROPOSAL_SENT,
    productInterest: ProductType.HEAVY_MACHINERY,
    budget: 200000,
    lastContact: '2023-10-23T09:15:00Z',
    nextAction: 'Follow up on proposal',
    score: 78
  },
  {
    id: '4',
    name: 'Ana Oliveira',
    phone: '+55 41 96666-8765',
    email: 'ana.oliveira@example.com',
    status: LeadStatus.QUALIFIED,
    productInterest: ProductType.REAL_ESTATE,
    budget: 300000,
    lastContact: '2023-10-26T11:00:00Z',
    nextAction: 'Schedule Meeting',
    score: 65
  },
  {
    id: '5',
    name: 'Pedro Ferreira',
    phone: '+55 51 95555-0987',
    email: 'pedro.f@example.com',
    status: LeadStatus.CLOSED_LOST,
    productInterest: ProductType.AUTO,
    budget: 35000,
    lastContact: '2023-10-20T16:45:00Z',
    nextAction: 'Reactivation Call (30 days)',
    score: 20
  }
];

export const MOCK_MEETINGS: Meeting[] = [
  {
    id: 'm1',
    leadId: '2',
    leadName: 'Mariana Costa',
    title: 'Consortium Plan Presentation - Real Estate',
    startTime: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    duration: 45,
    status: 'confirmed'
  },
  {
    id: 'm2',
    leadId: '4',
    leadName: 'Ana Oliveira',
    title: 'Budget Assessment',
    startTime: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
    duration: 30,
    status: 'pending'
  }
];
