"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Ticket, Team } from '@/types/ticket';

// Mock Data
export const MOCK_TICKETS: Ticket[] = [
    // --- OPERATIONS (Your primary team) ---
    {
        id: "OPS-1001",
        title: "Urgent Wire Transfer Review",
        clientName: "John & Jane Smith",
        accountNumber: "8829-1029",

        creator: "Sarah Advisor",
        owner: "You",
        status: "Open",
        assignedTeam: "Operations",
        priority: "High",
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        description: "Client requested same-day wire of $500k. Signature verified, needs final release.",
        transferHistory: [],
        activityLog: [
            { id: "a1", author: "Sarah Advisor", message: "Created ticket", timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), type: "status_change" },
            { id: "a2", author: "You", message: "Self-assigned for review", timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), type: "transfer" }
        ]
    },
    {
        id: "OPS-1002",
        title: "Account Closure - Deceased",
        clientName: "Robert Paulson",
        accountNumber: "1102-3948",
        household: "Paulson Estate",
        creator: "Mike Advisor",
        owner: "You",
        status: "Awaiting Input",
        assignedTeam: "Operations",
        priority: "Medium",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
        description: "Waiting for death certificate upload from advisor.",
        transferHistory: [],
        activityLog: [
            { id: "a3", author: "You", message: "Requested death cert from Mike", timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), type: "reply" }
        ]
    },
    {
        id: "OPS-1003",
        title: "Beneficiary Update Error",
        clientName: "Marla Singer",
        accountNumber: "9938-1122",
        household: "Singer Individual",
        creator: "System",
        owner: "N/A",
        status: "Open",
        assignedTeam: "Operations",
        priority: "Low",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        description: "System flagged an error during auto-processing of beneficiary form.",
        transferHistory: [],
        activityLog: []
    },
    {
        id: "OPS-1004",
        title: "Check Deposit > $50k",
        clientName: "Tyler Durden",
        accountNumber: "7733-1001",
        household: "Paper St. Soap Co",
        creator: "ATM System",
        owner: "N/A",
        status: "Open",
        assignedTeam: "Operations",
        priority: "Medium",
        createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        description: "Large check deposit requires manual clearing.",
        transferHistory: [],
        activityLog: []
    },

    // --- ADVISOR SERVICES (Default selection) ---
    {
        id: "ASH-2001",
        title: "Platform Access Issue",
        clientName: "New Assoc. User",
        accountNumber: "N/A",
        household: "N/A",
        creator: "Bob Manager",
        owner: "You",
        status: "Open",
        assignedTeam: "Advisor Services",
        priority: "High",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        description: "New associate cannot access trading platform. Error code 403.",
        transferHistory: [],
        activityLog: [
            { id: "a4", author: "Bob Manager", message: "Ticket created", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), type: "status_change" },
            { id: "a5", author: "You", message: "Investigating permissions", timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), type: "note" }
        ]
    },
    {
        id: "ASH-2002",
        title: "Fee Billing Inquiry",
        clientName: "Multiple Clients",
        accountNumber: "N/A",
        household: "Acme Wealth",
        creator: "Alice Advisor",
        owner: "You",
        status: "Awaiting Input",
        assignedTeam: "Advisor Services",
        priority: "Medium",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
        description: "Q4 billing looks incorrect for household group B.",
        transferHistory: [],
        activityLog: []
    },
    {
        id: "ASH-2003",
        title: "New Rep Onboarding",
        clientName: "David Davidson",
        accountNumber: "N/A",
        household: "Davidson Financial",
        creator: "Ops Manager",
        owner: "N/A",
        status: "Open",
        assignedTeam: "Advisor Services",
        priority: "Medium",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        description: "Setup credentials and entitlements for new joiner.",
        transferHistory: [],
        activityLog: []
    },
    {
        id: "ASH-2004",
        title: "Report Configuration",
        clientName: "N/A",
        accountNumber: "N/A",
        household: "Zenith Capital",
        creator: "Tom User",
        owner: "N/A",
        status: "Open",
        assignedTeam: "Advisor Services",
        priority: "Low",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
        description: "Need help customizing the monthly performance report template.",
        transferHistory: [],
        activityLog: []
    },
    {
        id: "ASH-2005",
        title: "System Latency Report",
        clientName: "N/A",
        accountNumber: "N/A",
        household: "Global Advisors",
        creator: "System Monitor",
        owner: "N/A",
        status: "Closed",
        assignedTeam: "Advisor Services",
        priority: "High",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
        description: "Reports of slow loading times on trade blotter.",
        transferHistory: [],
        activityLog: [
            { id: "a6", author: "System", message: "Resolved by network team", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 80).toISOString(), type: "status_change" }
        ]
    },

    // --- COMPLIANCE ---
    {
        id: "CMP-3001",
        title: "AML Alert: Rapid Movement",
        clientName: "Crypto King LLC",
        accountNumber: "4401-2299",
        household: "Crypto King Corp",
        creator: "AML System",
        owner: "N/A",
        status: "Open",
        assignedTeam: "Compliance",
        priority: "High",
        createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        description: "$1.2M moved in and out within 24 hours. Pattern matching flagged.",
        transferHistory: [],
        activityLog: []
    },
    {
        id: "CMP-3002",
        title: "Senior Protection Review",
        clientName: "Edith Elder",
        accountNumber: "1192-3301",
        household: "Elder Trust",
        creator: "Sarah Advisor",
        owner: "N/A",
        status: "Open",
        assignedTeam: "Compliance",
        priority: "High",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
        description: "Concern about cognitive decline and new power of attorney request.",
        transferHistory: [],
        activityLog: []
    },
    {
        id: "CMP-3003",
        title: "Marketing Material Approval",
        clientName: "N/A",
        accountNumber: "N/A",
        household: "N/A",
        creator: "Marketing Dept",
        owner: "You",
        status: "Action Required",
        assignedTeam: "Compliance",
        priority: "Low",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        description: "Review new Q1 slide deck for regulatory compliance.",
        transferHistory: [],
        activityLog: []
    },

    // --- PRINCIPAL REVIEW DESK ---
    {
        id: "PRD-4001",
        title: "Option Level 3 Approval",
        clientName: "Risk Taker Inc",
        accountNumber: "5501-2200",
        household: "Risk Taker Inc",
        creator: "Tom Trader",
        owner: "N/A",
        status: "Open",
        assignedTeam: "Principal Review Desk",
        priority: "High",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
        description: "Application for uncovered calls. Suitability check required.",
        transferHistory: [],
        activityLog: []
    },
    {
        id: "PRD-4002",
        title: "Trade Error Correction",
        clientName: "Oopsie Daisy",
        accountNumber: "1234-5678",
        household: "Daisy Family",
        creator: "Mike Advisor",
        owner: "N/A",
        status: "Open",
        assignedTeam: "Principal Review Desk",
        priority: "Medium",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        description: "Bought 1000 shares instead of 100. Requesting bust/adjust.",
        transferHistory: [],
        activityLog: []
    },

    // --- ASSET MOVEMENT ---
    {
        id: "AM-5001",
        title: "ACAT Transfer In",
        clientName: "New Client X",
        accountNumber: "9901-2233",
        household: "Client X Household",
        creator: "System",
        owner: "N/A",
        status: "Open",
        assignedTeam: "Asset Movement",
        priority: "Medium",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        description: "Full account transfer from Fidelity. Assets pending delivery.",
        transferHistory: [],
        activityLog: []
    },
    {
        id: "AM-5002",
        title: "Journal Request > $100k",
        clientName: "Richie Rich",
        accountNumber: "1000-0001",
        household: "Rich Family",
        creator: "Sarah Advisor",
        owner: "You",
        status: "Open",
        assignedTeam: "Asset Movement",
        priority: "Medium",
        createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
        description: "Internal journal to spouse's account.",
        transferHistory: [],
        activityLog: [
            { id: "a7", author: "You", message: "Reviewing relationship", timestamp: new Date(Date.now() - 1000 * 60).toISOString(), type: "note" }
        ]
    },

    // --- DIRECT BUSINESS ---
    {
        id: "DB-6001",
        title: "Annuity Application",
        clientName: "Retiree Rob",
        accountNumber: "N/A",
        household: "Rob Retirement",
        creator: "Paperwork Scan",
        owner: "N/A",
        status: "Open",
        assignedTeam: "Direct Business",
        priority: "Low",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
        description: "Physical app received for Jackson National annuity.",
        transferHistory: [],
        activityLog: []
    },

    // --- ALTERNATIVE INVESTMENTS ---
    {
        id: "AI-7001",
        title: "Private Equity Sub Doc",
        clientName: "High Net Worth Individual",
        accountNumber: "8888-9999",
        household: "HNW Trust",
        creator: "Advisor",
        owner: "N/A",
        status: "Open",
        assignedTeam: "Alternative Investments",
        priority: "High",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
        description: "Subscription document for Blackstone BREIT. Needs accreditation check.",
        transferHistory: [],
        activityLog: []
    }
];

interface TicketContextType {
    tickets: Ticket[];
    setTickets: React.Dispatch<React.SetStateAction<Ticket[]>>;
    addTicket: (ticket: Ticket) => void;
    updateTicket: (ticket: Ticket) => void;
}

const TicketContext = createContext<TicketContextType | undefined>(undefined);

export function TicketProvider({ children }: { children: React.ReactNode }) {
    const [tickets, setTickets] = useState<Ticket[]>(MOCK_TICKETS);

    // Migration effect to fix stale state (Pending -> Open)
    useEffect(() => {
        setTickets(prev => prev.map(t => {
            let updated = { ...t };
            let changed = false;
            // @ts-ignore - Handle legacy 'Pending' status if present in state
            if (t.status === 'Pending') {
                updated.status = 'Open';
                changed = true;
            }
            if (t.owner === 'Pending') {
                updated.owner = 'N/A';
                changed = true;
            }
            return changed ? updated : t;
        }));
    }, []);

    const addTicket = (ticket: Ticket) => {
        setTickets(prev => [ticket, ...prev]);
    };

    const updateTicket = (ticket: Ticket) => {
        setTickets(prev => prev.map(t => t.id === ticket.id ? ticket : t));
    };

    return (
        <TicketContext.Provider value={{ tickets, setTickets, addTicket, updateTicket }}>
            {children}
        </TicketContext.Provider>
    );
}

export function useTicket() {
    const context = useContext(TicketContext);
    if (context === undefined) {
        throw new Error('useTicket must be used within a TicketProvider');
    }
    return context;
}
