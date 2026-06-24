import {
  BarChart3,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  Clock3,
  Code2,
  FilePenLine,
  FileText,
  Globe2,
  HelpCircle,
  LayoutDashboard,
  MessageCircle,
  Mic,
  RotateCw,
  Search,
  ShieldCheck,
  Ticket,
  Upload,
  UserPlus,
  Users,
  Workflow,
  type LucideIcon,
} from 'lucide-react';

export type Tone = 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'cyan' | 'slate' | 'pink';

export const navGroups = [
  {
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, active: true },
      { label: 'Claim Dashboard', icon: ShieldCheck },
      { label: 'Patients', icon: Users },
      { label: 'Appointments', icon: CalendarDays },
      { label: 'Chats', icon: MessageCircle, badge: 3 },
    ],
  },
  {
    heading: 'Claims',
    items: [
      { label: 'Report & Analytics', icon: BarChart3 },
      { label: 'Claim List', icon: FileText, badge: 12 },
    ],
  },
  {
    heading: 'Documentation',
    items: [
      { label: 'Scribe Documents', icon: FilePenLine },
      { label: 'Templates', icon: Workflow },
      { label: 'Smart Notes', icon: ClipboardList },
    ],
  },
  {
    heading: 'Support',
    items: [
      { label: 'Support Tickets', icon: Ticket, badge: 5 },
      { label: 'Help Center', icon: HelpCircle },
      { label: 'Feedback', icon: MessageCircle },
    ],
  },
];

export const kpis = [
  { title: 'Total Schedule', value: '24', icon: CalendarDays, tone: 'green' as Tone },
  { title: 'Pending Dictation', value: '8', icon: Mic, tone: 'orange' as Tone },
  { title: 'Review Pending', value: '5', icon: FilePenLine, tone: 'red' as Tone },
  { title: 'Pending Tasks', value: '12', icon: ClipboardCheck, tone: 'purple' as Tone },
  { title: 'Average Turnaround Time', value: '2h 18m', icon: Clock3, tone: 'blue' as Tone },
];

export const appointments = [
  {
    id: 1,
    appointmentId: 'APT-2045',
    appointmentDate: '2026-04-28',
    appointmentTime: '9:00 AM',
    patientName: 'Robert Johnson',
    visitType: 'Office Visit',
    age: 52,
    gender: 'M',
    status: 'Provider Review Completed',
    lastUpdated: '09:45 AM',
    suggestedCodes: true,
    snippets: [],
  },

  {
    id: 2,
    appointmentId: 'APT-2046',
    appointmentDate: '2026-04-28',
    appointmentTime: '9:45 AM',
    patientName: 'Maria Garcia',
    visitType: 'Follow Up',
    age: 45,
    gender: 'F',
    status: 'Provider Review Completed',
    lastUpdated: '10:30 AM',
    suggestedCodes: true,
    snippets: [],
  },

  {
    id: 3,
    appointmentId: 'APT-2047',
    appointmentDate: '2026-04-28',
    appointmentTime: '10:30 AM',
    patientName: 'James Lee',
    visitType: 'New Patient',
    age: 60,
    gender: 'M',
    status: 'Pending',
    lastUpdated: '10:32 AM',
    suggestedCodes: false,
    snippets: [],
  },

  {
    id: 4,
    appointmentId: 'APT-2048',
    appointmentDate: '2026-04-28',
    appointmentTime: '11:15 AM',
    patientName: 'Linda Brown',
    visitType: 'Consultation',
    age: 38,
    gender: 'F',
    status: 'Pending',
    lastUpdated: '11:20 AM',
    suggestedCodes: false,
    snippets: [],
  },

  {
    id: 5,
    appointmentId: 'APT-2049',
    appointmentDate: '2026-04-28',
    appointmentTime: '12:00 PM',
    patientName: 'Michael Davis',
    visitType: 'Follow Up',
    age: 47,
    gender: 'M',
    status: 'Recording Ready for Scribe',
    lastUpdated: '12:15 PM',
    suggestedCodes: false,
    snippets: [
      {
        id: 1,
        name: 'Recording 1',
        duration: '00:01:35',
      },
    ],
  },

  {
    id: 6,
    appointmentId: 'APT-2050',
    appointmentDate: '2026-04-28',
    appointmentTime: '12:45 PM',
    patientName: 'Sarah Wilson',
    visitType: 'Telehealth',
    age: 34,
    gender: 'F',
    status: 'Provider Review Pending',
    lastUpdated: '01:05 PM',
    suggestedCodes: false,
    snippets: [],
  },

  {
    id: 7,
    appointmentId: 'APT-2051',
    appointmentDate: '2026-04-28',
    appointmentTime: '1:30 PM',
    patientName: 'David Martinez',
    visitType: 'Office Visit',
    age: 50,
    gender: 'M',
    status: 'Ready for EHR',
    lastUpdated: '02:10 PM',
    suggestedCodes: false,
    snippets: [],
  },

  {
    id: 8,
    appointmentId: 'APT-2052',
    appointmentDate: '2026-04-28',
    appointmentTime: '2:15 PM',
    patientName: 'Emily Taylor',
    visitType: 'Follow Up',
    age: 29,
    gender: 'F',
    status: 'Ready for EHR',
    lastUpdated: '03:00 PM',
    suggestedCodes: false,
    snippets: [],
  },

  {
    id: 8,
    appointmentId: 'APT-2052',
    appointmentDate: '2026-04-28',
    appointmentTime: '2:15 PM',
    patientName: 'Emily Taylor',
    visitType: 'Follow Up',
    age: 29,
    gender: 'F',
    status: 'Ready for EHR',
    lastUpdated: '03:00 PM',
    suggestedCodes: false,
    snippets: [],
  },

  {
    id: 8,
    appointmentId: 'APT-2052',
    appointmentDate: '2026-04-28',
    appointmentTime: '2:15 PM',
    patientName: 'Emily Taylor',
    visitType: 'Follow Up',
    age: 29,
    gender: 'F',
    status: 'Ready for EHR',
    lastUpdated: '03:00 PM',
    suggestedCodes: false,
    snippets: [],
  },

  {
    id: 8,
    appointmentId: 'APT-2052',
    appointmentDate: '2026-04-28',
    appointmentTime: '2:15 PM',
    patientName: 'Emily Taylor',
    visitType: 'Follow Up',
    age: 29,
    gender: 'F',
    status: 'Ready for EHR',
    lastUpdated: '03:00 PM',
    suggestedCodes: false,
    snippets: [],
  },

  {
    id: 8,
    appointmentId: 'APT-2052',
    appointmentDate: '2026-04-28',
    appointmentTime: '2:15 PM',
    patientName: 'Emily Taylor',
    visitType: 'Follow Up',
    age: 29,
    gender: 'F',
    status: 'Ready for EHR',
    lastUpdated: '03:00 PM',
    suggestedCodes: false,
    snippets: [],
  },
];


export const workflowStages = [
  { label: 'Encounter', count: 120, icon: Users, tone: 'green' as Tone },
  { label: 'Recording Pending', count: 85, icon: FilePenLine, tone: 'orange' as Tone },
  { label: 'Review Pending', count: 52, icon: Search, tone: 'blue' as Tone },
  { label: 'Ready for EHR integration', count: 31, icon: Upload, tone: 'purple' as Tone },
  { label: 'Ready for EHR Sign-off', count: 12, icon: ClipboardCheck, tone: 'cyan' as Tone },
  { label: 'ReCoding', count: 240, icon: Code2, tone: 'blue' as Tone },
];

export const workflowStats = [
  { label: 'Total Patients', value: '540', icon: Users, tone: 'blue' as Tone },
  { label: 'Completed %', value: '44.4%', icon: BarChart3, tone: 'green' as Tone },
  { label: 'In Progress %', value: '47.4%', icon: Clock3, tone: 'orange' as Tone },
  { label: 'Pending %', value: '8.2%', icon: Clock3, tone: 'purple' as Tone },
];

export const encounterStages = [
  { label: 'Encounter', state: 'Completed', date: 'Apr 30, 2026', time: '09:15 AM', complete: true, icon: ClipboardList },
  { label: 'Recording Pending', state: 'Completed', date: 'May 01, 2026', time: '10:30 AM', complete: true, icon: FilePenLine },
  { label: 'Review Pending', state: 'Completed', date: 'May 01, 2026', time: '03:45 PM', complete: true, icon: FileText },
  { label: 'Ready for EHR Integration', state: 'Pending', date: '-', time: '-', complete: false, icon: Upload },
  { label: 'Ready for EHR Sign-Off', state: 'Pending', date: '-', time: '-', complete: false, icon: ClipboardCheck },
  { label: 'Ready for Coding', state: 'Pending', date: '-', time: '-', complete: false, icon: ShieldCheck },
];

export const quickActions: { label: string; icon: LucideIcon; tone: Tone }[] = [
  { label: 'Walk-in Patient', icon: UserPlus, tone: 'blue' },
  { label: 'Batch Dictation', icon: Mic, tone: 'slate' },
  { label: 'Upload Document', icon: Upload, tone: 'blue' },
  { label: 'Global Template', icon: Globe2, tone: 'green' },
  { label: 'My template', icon: FilePenLine, tone: 'pink' },
  { label: 'Smart Notes', icon: ClipboardList, tone: 'blue' },
  { label: 'Macro', icon: FileText, tone: 'purple' },
  { label: 'Ana Playbook', icon: BookOpen, tone: 'blue' },
  { label: 'Transfer', icon: RotateCw, tone: 'orange' },
];

export const trendData = [
  { day: 'Mon', documents: 38, hours: 34 },
  { day: 'Tue', documents: 22, hours: 18 },
  { day: 'Wed', documents: 35, hours: 25 },
  { day: 'Thu', documents: 44, hours: 28 },
  { day: 'Fri', documents: 62, hours: 52 },
  { day: 'Sat', documents: 33, hours: 29 },
  { day: 'Sun', documents: 45, hours: 49 },
];

export const statusData = [
  { name: 'In Progress', value: 7, color: '#2563EB' },
  { name: 'Pending Review', value: 8, color: '#EF4444' },
  { name: 'Completed', value: 46, color: '#22C55E' },
  { name: 'On Hold', value: 2, color: '#F59E0B' },
];

export const tasks = [
  {
    task: 'Review & Sign - New Patient Note',
    patient: 'James Lee',
    due: 'Today, 11:30 AM',
    priority: 'High',
    status: 'In Review',
    icon: FileText,
    tone: 'blue' as Tone,
  },
  {
    task: 'Complete Documentation',
    patient: 'Linda Brown',
    due: 'Today, 12:00 PM',
    priority: 'Medium',
    status: 'In Progress',
    icon: FileText,
    tone: 'green' as Tone,
  },
  {
    task: 'Review QA Feedback',
    patient: 'Robert Johnson',
    due: 'Tomorrow, 9:00 AM',
    priority: 'Medium',
    status: 'Pending',
    icon: MessageCircle,
    tone: 'purple' as Tone,
  },
  {
    task: 'Sign Completed Note',
    patient: 'Maria Garcia',
    due: 'Tomorrow, 11:00 AM',
    priority: 'Low',
    status: 'Pending',
    icon: CheckCircle2,
    tone: 'green' as Tone,
  },
];

export const toneClasses: Record<Tone, { soft: string; text: string; border: string; solid: string; badge: string }> = {
  blue: { soft: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', solid: 'bg-[#2563EB]', badge: 'bg-blue-50 text-blue-600' },
  green: { soft: 'bg-green-50', text: 'text-green-600', border: 'border-green-200', solid: 'bg-[#22C55E]', badge: 'bg-green-50 text-green-600' },
  orange: { soft: 'bg-orange-50', text: 'text-orange-500', border: 'border-orange-200', solid: 'bg-[#F59E0B]', badge: 'bg-orange-50 text-orange-600' },
  red: { soft: 'bg-red-50', text: 'text-red-500', border: 'border-red-200', solid: 'bg-[#EF4444]', badge: 'bg-red-50 text-red-600' },
  purple: { soft: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200', solid: 'bg-[#8B5CF6]', badge: 'bg-purple-50 text-purple-600' },
  cyan: { soft: 'bg-cyan-50', text: 'text-cyan-600', border: 'border-cyan-200', solid: 'bg-cyan-500', badge: 'bg-cyan-50 text-cyan-600' },
  slate: { soft: 'bg-slate-50', text: 'text-slate-500', border: 'border-slate-200', solid: 'bg-slate-400', badge: 'bg-slate-50 text-slate-500' },
  pink: { soft: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-200', solid: 'bg-pink-500', badge: 'bg-pink-50 text-pink-600' },
};

export const statusColors: Record<string, Tone> = {
  Pending: 'slate',

  'Recording In Progress': 'orange',

  'Recording Ready for Scribe': 'blue',

  'Provider Review Pending': 'purple',

  'Provider Review Completed': 'green',

  'Ready for EHR': 'cyan',
};

export const appointmentStatuses = [
  'All Status ',
  'Pending',
  'Recording In Progress',
  'Recording Ready for Scribe',
  'Provider Review Pending',
  'Provider Review Completed',
  'Ready for EHR',
];