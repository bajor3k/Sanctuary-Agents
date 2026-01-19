export interface Contact {
    id: string;
    name: string;
    phone: string;
    email: string;
    tags: string[];
    lastCallStatus?: 'Completed' | 'Failed' | 'None';
    notes?: string;
}

export const TAGS = [
    "VIP",
    "Prospect",
    "Client",
    "Lead",
    "Referral",
    "Family",
    "Business",
    "Transition",
    "RMD",
    "Annual Meeting",
    "Investor",
    "Employee"
];

export const getTagColor = (tag: string) => {
    switch (tag) {
        case "VIP": return "border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400";
        case "Prospect": return "border-yellow-200 bg-yellow-100 text-yellow-700 dark:border-yellow-500/20 dark:bg-yellow-500/10 dark:text-yellow-400";
        case "Client": return "border-teal-200 bg-teal-100 text-teal-700 dark:border-teal-500/20 dark:bg-teal-500/10 dark:text-teal-400";
        case "Lead": return "border-blue-200 bg-blue-100 text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400";
        case "Referral": return "border-purple-200 bg-purple-100 text-purple-700 dark:border-purple-500/20 dark:bg-purple-500/10 dark:text-purple-400";
        case "Family": return "border-pink-200 bg-pink-100 text-pink-700 dark:border-pink-500/20 dark:bg-pink-500/10 dark:text-pink-400";
        case "Business": return "border-indigo-200 bg-indigo-100 text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-400";
        case "Transition": return "border-orange-200 bg-orange-100 text-orange-700 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-400";
        case "RMD": return "border-red-200 bg-red-100 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400";
        case "Annual Meeting": return "border-cyan-200 bg-cyan-100 text-cyan-700 dark:border-cyan-500/20 dark:bg-cyan-500/10 dark:text-cyan-400";
        case "Investor": return "border-violet-200 bg-violet-100 text-violet-700 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-400";
        case "Employee": return "border-rose-200 bg-rose-100 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400";
        default: return "border-zinc-200 bg-zinc-100 text-zinc-600 dark:border-white/10 dark:bg-zinc-800 dark:text-zinc-400";
    }
};

export const contacts: Contact[] = [
    { id: "1", name: "Alice Johnson", phone: "555-0101", email: "alice.johnson@example.com", tags: ["VIP", "Prospect"] },
    { id: "2", name: "Bob Smith", phone: "555-0102", email: "bob.smith@example.com", tags: ["Client"] },
    { id: "3", name: "Charlie Brown", phone: "555-0103", email: "charlie.brown@example.com", tags: ["Lead"] },
    { id: "4", name: "Diana Prince", phone: "555-0104", email: "diana.prince@example.com", tags: ["VIP"] },
    { id: "5", name: "Evan Wright", phone: "555-0105", email: "evan.wright@example.com", tags: ["Client", "Referral"] },
    { id: "6", name: "Fiona Gallagher", phone: "555-0106", email: "fiona.gallagher@example.com", tags: ["Prospect"] },
    { id: "7", name: "George Martin", phone: "555-0107", email: "george.martin@example.com", tags: ["Lead"] },
    { id: "8", name: "Hannah Abbott", phone: "555-0108", email: "hannah.abbott@example.com", tags: ["Client"] },
    { id: "9", name: "Ian Malcolm", phone: "555-0109", email: "ian.malcolm@example.com", tags: ["VIP"] },
    { id: "10", name: "Julia Styles", phone: "555-0110", email: "julia.styles@example.com", tags: ["Prospect"] },
    { id: "11", name: "Joshua Bajorek", phone: "512-965-3737", email: "bajor3k@gmail.com", tags: ["Prospect"] },
];
