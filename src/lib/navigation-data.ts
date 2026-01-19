
import type { NavItem, ToolbarSection, ToolbarSectionKey } from '@/contexts/navigation-context';
import {
  Home as HomeIcon,
  Mail,
  Contact as ContactIcon,
  ListChecks,
  CalendarDays,
  Briefcase,
  Workflow,
  KanbanSquare,
  FileText, // <--- Used for OneDrive Procedures
  BarChart3,
  Users,
  TrendingUp,
  TrendingDown,
  Repeat,
  ShieldAlert,
  PieChart,
  Shapes,
  FlaskConical,
  LayoutGrid,
  LifeBuoy,
  Calculator,
  GraduationCap,
  Link as LinkIcon,
  Wallet,
  Banknote,
  Percent,
  BadgeDollarSign,
  FileStack,
  BookOpenText,
  Settings,
  Video,
  Terminal,
  TerminalSquare,
  Newspaper,
  Inbox,
  Send,
  Trash2,
  Archive,
  AlertOctagon,
  UploadCloud,
  Cloud,
  Globe, // <--- Used for External
  Brain,
  Bell,
  Bot,
  Megaphone,
  PlusCircle,
  Activity,
  MessageSquare,
  // Calendar is already imported as CalendarDays but let's check imports
  Phone,
  Sun,
  Mic,
  Building2,
  Snowflake,
} from "lucide-react";

export const toolbarSections: ToolbarSection[] = [];

export const navigationData: Record<'Agents' | 'Kanban' | 'Advisor Services' | 'Managed Accounts' | 'Asset Movement' | 'Principal Review' | 'Compliance' | 'Direct Business', NavItem[]> = {
  'Agents': [
    { name: 'Advisory', icon: FileText, href: '/agents/advisory' },
    { name: 'PDF Generator', icon: Bot, href: '/agents/pdf-generator' },
  ],
  'Kanban': [],
  'Advisor Services': [
    { name: 'Margin', icon: Percent, href: '/agents/margin' }
  ],
  'Managed Accounts': [
    { name: 'Advisory', icon: FileText, href: '/managed-accounts/advisory' },
    { name: 'Fee Review', icon: BadgeDollarSign, href: '/managed-accounts/fee-review' },
    { name: 'Frozen Report', icon: Snowflake, href: '/managed-accounts/frozen-report' }
  ],
  'Asset Movement': [
    { name: 'Overview', icon: TrendingUp, href: '/asset-movement/overview' }
  ],
  'Principal Review': [
    { name: 'Dashboard', icon: BarChart3, href: '/principal-review/dashboard' }
  ],
  'Compliance': [
    { name: 'Overview', icon: ShieldAlert, href: '/compliance/overview' }
  ],
  'Direct Business': [
    { name: 'Overview', icon: Building2, href: '/direct-business/overview' }
  ]
};
