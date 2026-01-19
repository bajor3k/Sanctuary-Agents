
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

export const navigationData: Record<'Dashboard' | 'Orion' | 'Kanban' | 'Advisor Services' | 'Managed Accounts' | 'Asset Movement' | 'Principal Review' | 'Compliance' | 'Direct Business' | 'Transitions', NavItem[]> = {
  'Dashboard': [
    { name: 'Overview', icon: LayoutGrid, href: '/dashboard' }
  ],
  'Orion': [
    { name: 'Advisory', icon: FileText, href: '/orion/advisory' }
  ],
  'Kanban': [],
  'Advisor Services': [
    { name: 'Margin', icon: Percent, href: '/advisor-services/margin' }
  ],
  'Managed Accounts': [
    { name: 'Advisory', icon: FileText, href: '/managed-accounts/advisory' }
  ],
  'Asset Movement': [
    { name: 'Home', icon: TrendingUp, href: '/asset-movement' }
  ],
  'Principal Review': [
    { name: 'Home', icon: BarChart3, href: '/principal-review' }
  ],
  'Compliance': [
    { name: 'Home', icon: ShieldAlert, href: '/compliance' }
  ],
  'Direct Business': [
    { name: 'Home', icon: Building2, href: '/direct-business' }
  ],
  'Transitions': [
    { name: 'Home', icon: Repeat, href: '/transitions' }
  ]
};
