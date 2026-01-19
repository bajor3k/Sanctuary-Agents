// components/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown, ChevronUp, FileStack,
  Sparkles, KanbanSquare, ChevronLeft, ChevronRight, Briefcase, Wallet, Settings, TrendingUp, BarChart3, ShieldAlert, Bot, Building2,
  Snowflake,
  LayoutGrid, Brain, Repeat,
} from "lucide-react";
import { navigationData } from "@/lib/navigation-data";
import { type NavItem } from "@/contexts/navigation-context";
import { cn } from "@/lib/utils";

// Keep Dashboard in SectionKey for state if needed, but we might not need it in the Section component list anymore
export type SectionKey = "dashboard" | "orion" | "kanban" | "advisor-services" | "managed-accounts" | "asset-movement" | "principal-review" | "compliance" | "direct-business" | "transitions";

const dashboardItems: NavItem[] = navigationData['Dashboard'];

const orionItems: NavItem[] = navigationData['Orion'];
const kanbanItems: NavItem[] = navigationData['Kanban'];
const advisorServicesItems: NavItem[] = navigationData['Advisor Services'];
const managedAccountsItems: NavItem[] = navigationData['Managed Accounts'];
const assetMovementItems: NavItem[] = navigationData['Asset Movement'];
const principalReviewItems: NavItem[] = navigationData['Principal Review'];
const complianceItems: NavItem[] = navigationData['Compliance'];
const directBusinessItems: NavItem[] = navigationData['Direct Business'];
const transitionsItems: NavItem[] = navigationData['Transitions'];



function Row({ item, active, hiddenLabel, iconClassName }: { item: NavItem; active: boolean; hiddenLabel: boolean, iconClassName?: string }) {
  const Icon = item.icon ?? FileStack;
  return (
    <Link
      href={item.href}
      title={item.name}
      data-active={active}
      className={`nav-item flex items-center gap-3 rounded-xl py-2 text-sm transition w-full
        ${hiddenLabel ? 'justify-center px-0' : 'px-3'}
        ${active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"}`}
    >
      <Icon className={cn("h-5 w-5 shrink-0", iconClassName)} />
      {!hiddenLabel && <span className="truncate">{item.name}</span>}
    </Link>
  );
}

export default function Sidebar({
  collapsed,
  onExpandRequest,
  forceOpen,
  onForceOpenHandled,
  onToggleCollapsed,
}: {
  collapsed: boolean;
  onExpandRequest: (section: SectionKey) => void;
  forceOpen?: SectionKey | null;
  onForceOpenHandled?: () => void;
  onToggleCollapsed?: () => void;
}) {
  const pathname = usePathname();

  const isReports = useMemo(() => pathname?.startsWith("/reports"), [pathname]);
  const isCRM = useMemo(() => pathname?.startsWith("/crm"), [pathname]);
  const isMail = useMemo(() => pathname?.startsWith("/mail") || pathname === "/calendar", [pathname]);

  const isAnalytics = useMemo(() => [
    "/analytics/asset", "/analytics/client", "/analytics/financial",
    "/analytics/conversion", "/analytics/compliance", "/analytics/contribution"
  ].some(p => pathname.startsWith(p)), [pathname]);

  const isResources = useMemo(() => pathname?.startsWith("/resources"), [pathname]);

  const isDashboard = useMemo(() => pathname === "/dashboard", [pathname]);

  const isAlerts = useMemo(() => pathname === "/alerts", [pathname]);

  const isTickets = useMemo(() => pathname?.startsWith("/tickets"), [pathname]);
  const isTeams = useMemo(() => pathname?.startsWith("/teams"), [pathname]);
  const isWallStreet = useMemo(() => pathname === "/wall-street", [pathname]);
  const isAgents = useMemo(() => pathname?.startsWith("/agents"), [pathname]);
  const isKanban = useMemo(() => pathname?.startsWith("/kanban"), [pathname]);



  // Sections
  const [openDashboard, setOpenDashboard] = useState(false);
  const [openOrion, setOpenOrion] = useState(false);
  const [openKanban, setOpenKanban] = useState(false);
  const [openAdvisorServices, setOpenAdvisorServices] = useState(false);
  const [openManagedAccounts, setOpenManagedAccounts] = useState(false);
  const [openAssetMovement, setOpenAssetMovement] = useState(false);
  const [openPrincipalReview, setOpenPrincipalReview] = useState(false);
  const [openCompliance, setOpenCompliance] = useState(false);
  const [openDirectBusiness, setOpenDirectBusiness] = useState(false);
  const [openTransitions, setOpenTransitions] = useState(false);

  // When parent asks to open a specific section (after expanding)
  useEffect(() => {
    if (!forceOpen) return;
    setOpenDashboard(forceOpen === "dashboard");
    setOpenOrion(forceOpen === "orion");
    setOpenKanban(forceOpen === "kanban");
    setOpenAdvisorServices(forceOpen === "advisor-services");
    setOpenManagedAccounts(forceOpen === "managed-accounts");
    setOpenAssetMovement(forceOpen === "asset-movement");
    setOpenPrincipalReview(forceOpen === "principal-review");
    setOpenCompliance(forceOpen === "compliance");
    setOpenDirectBusiness(forceOpen === "direct-business");
    setOpenTransitions(forceOpen === "transitions");
    onForceOpenHandled?.();
  }, [forceOpen, onForceOpenHandled]);


  const Section = ({
    keyName,
    title,
    icon: Icon,
    open,
    setOpen,
    items,
    href,
    iconClassName
  }: {
    keyName: SectionKey | "dashboard"; // Simplified type
    title: string; icon: any; open: boolean; setOpen: (v: boolean) => void; items: NavItem[]; href?: string; iconClassName?: string;
  }) => {
    if (!items) return null; // Guard against null/undefined items

    const onHeaderClick = () => {
      if (collapsed) {
        onExpandRequest(keyName as SectionKey);
      } else {
        setOpen(!open);
      }
    };

    // Determine if the header should act as a link or a button
    const HeaderComponent = href && !items.length ? Link : 'button';
    const headerProps: any = href && !items.length ? { href } : { onClick: onHeaderClick };

    return (
      <div className="mb-1">
        <HeaderComponent
          {...headerProps}
          aria-expanded={items.length > 0 ? open : undefined}
          className={`flex w-full items-center rounded-xl py-2 text-left font-medium text-sidebar-foreground/70
         hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${collapsed ? 'px-0 justify-center' : 'px-3 justify-between'}`}
        >
          <span className="flex items-center gap-3">
            <Icon className={cn("h-5 w-5 shrink-0", iconClassName)} />
            {!collapsed && title}
          </span>

          {!collapsed && (items.length > 0) && (open ? <ChevronUp className="h-4 w-4 shrink-0" /> : <ChevronDown className="h-4 w-4 shrink-0" />)}
        </HeaderComponent>
        {items.length > 0 && (
          <div className={`overflow-hidden transition-[max-height] duration-200 ease-in-out ${open && !collapsed ? "max-h-[500px]" : "max-h-0"}`}>
            <div className="mt-1 space-y-1 pl-2 pr-1">
              {items.map((it) => (
                <Row key={it.href} item={it} active={pathname === it.href} hiddenLabel={!!collapsed} />
              ))}
            </div>
          </div>
        )}
      </div>
    )
  };

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex-1 overflow-y-auto p-3 pt-2">
        { /* Command Center - Direct Link */}
        <Link
          href="/dashboard"
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors mb-1",
            pathname === "/dashboard"
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          )}
        >
          <LayoutGrid className="h-5 w-5 text-[hsl(var(--icon-color-1))]" />
          {!collapsed && <span>Dashboard</span>}
        </Link>

        {/* Separator / Margin */}
        <div className="my-2" />

        <Section
          keyName="orion"
          title="Orion"
          icon={Sparkles}
          open={openOrion}
          setOpen={setOpenOrion}
          items={orionItems}
          iconClassName="text-[hsl(var(--icon-color-5))]"
        />

        <Section
          keyName="advisor-services"
          title="Advisor Services"
          icon={Briefcase}
          open={openAdvisorServices}
          setOpen={setOpenAdvisorServices}
          items={advisorServicesItems}
          iconClassName="text-[hsl(var(--icon-color-2))]"
        />

        <Section
          keyName="managed-accounts"
          title="Managed Accounts"
          icon={Wallet}
          open={openManagedAccounts}
          setOpen={setOpenManagedAccounts}
          items={managedAccountsItems}
          iconClassName="text-[hsl(var(--icon-color-3))]"
        />

        <Section
          keyName="asset-movement"
          title="Asset Movement"
          icon={TrendingUp}
          open={openAssetMovement}
          setOpen={setOpenAssetMovement}
          items={assetMovementItems}
          iconClassName="text-[hsl(var(--icon-color-4))]"
        />

        <Section
          keyName="principal-review"
          title="Principal Review"
          icon={BarChart3}
          open={openPrincipalReview}
          setOpen={setOpenPrincipalReview}
          items={principalReviewItems}
          iconClassName="text-[hsl(var(--icon-color-6))]"
        />

        <Section
          keyName="compliance"
          title="Compliance"
          icon={ShieldAlert}
          open={openCompliance}
          setOpen={setOpenCompliance}
          items={complianceItems}
          iconClassName="text-[hsl(var(--icon-color-7))]"
        />

        <Section
          keyName="direct-business"
          title="Direct Business"
          icon={Building2}
          open={openDirectBusiness}
          setOpen={setOpenDirectBusiness}
          items={directBusinessItems}
          iconClassName="text-[hsl(var(--icon-color-1))]"
        />

        <Section
          keyName="transitions"
          title="Transitions"
          icon={Repeat}
          open={openTransitions}
          setOpen={setOpenTransitions}
          items={transitionsItems}
          iconClassName="text-[hsl(var(--icon-color-2))]"
        />

        <Section
          keyName="kanban"
          title="Kanban"
          icon={KanbanSquare}
          open={openKanban}
          setOpen={setOpenKanban}
          items={kanbanItems}
          href="/kanban"
          iconClassName="text-[hsl(var(--icon-color-5))]"
        />
      </div>

      {/* Diagnostics at bottom */}
      <div className="p-3 pt-0 mt-auto border-t border-sidebar-border">
        <Link
          href="/settings"
          className={`nav-item flex items-center gap-3 rounded-xl py-2 text-sm transition w-full
            ${collapsed ? 'justify-center px-0' : 'px-3'}
            ${pathname === '/settings' ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"}`}
        >
          <Settings className={cn("h-5 w-5 shrink-0", "text-[#67bed9]")} />
          {!collapsed && <span className="truncate">Diagnostics</span>}
        </Link>
      </div>
    </div>
  );
}
