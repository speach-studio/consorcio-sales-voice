export enum View {
  DASHBOARD = 'DASHBOARD',
  LEADS = 'LEADS',
  SIMULATOR = 'SIMULATOR',
  SCHEDULER = 'SCHEDULER',
  PROPOSALS = 'PROPOSALS',
  SETTINGS = 'SETTINGS',
  SCRIPTS = 'SCRIPTS'
}

export enum LeadStatus {
  NEW = 'New Lead',
  QUALIFIED = 'Qualified',
  MEETING_SCHEDULED = 'Meeting Scheduled',
  PROPOSAL_SENT = 'Proposal Sent',
  NEGOTIATION = 'Negotiation',
  CLOSED_WON = 'Closed Won',
  CLOSED_LOST = 'Closed Lost'
}

export enum ProductType {
  AUTO = 'Automobile',
  REAL_ESTATE = 'Real Estate',
  SERVICES = 'Services',
  HEAVY_MACHINERY = 'Heavy Machinery'
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: LeadStatus;
  productInterest: ProductType;
  budget: number;
  lastContact: string;
  nextAction: string;
  score: number; // 0-100
}

export interface CallLog {
  id: string;
  leadId: string;
  duration: number; // seconds
  timestamp: string;
  outcome: string;
  recordingUrl?: string;
  transcriptSummary?: string;
}

export interface Meeting {
  id: string;
  leadId: string;
  leadName: string;
  title: string;
  startTime: string; // ISO string
  duration: number; // minutes
  status: 'confirmed' | 'pending' | 'completed';
}

export interface ScriptRule {
  id: string;
  condition: string;
  instruction: string;
}

export interface ScriptConfig {
  basePersona: string;
  rules: ScriptRule[];
}