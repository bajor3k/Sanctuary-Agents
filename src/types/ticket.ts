export type Team =
    | "Operations" // You
    | "Advisor Services"
    | "Compliance"
    | "Principal Review Desk"
    | "Direct Business"
    | "Alternative Investments"
    | "Asset Movement"
    | "Unassigned";

export interface Ticket {
    id: string;
    title: string;
    clientName: string;
    household?: string;
    creator: string;
    owner?: string; // Defaults to "Pending" if undefined? Or explicitly set.
    accountNumber?: string;
    status: "Open" | "Closed" | "Completed" | "Awaiting Input" | "Action Required";
    assignedTeam: Team;
    attachments?: string[]; // URLs or file names

    createdAt: string; // ISO string for easier serialization/mocking
    description?: string;
    priority?: "Low" | "Medium" | "High";
    transferHistory: {
        from: Team;
        to: Team;
        timestamp: string; // ISO string
        reason: string;
    }[];
    activityLog?: {
        id: string;
        author: string;
        message: string;
        timestamp: string; // ISO string
        type: "note" | "transfer" | "status_change" | "reply";
    }[];
}
