"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FileText, FileSpreadsheet, File, Search, FolderOpen, Star, MoreVertical, LifeBuoy, AlertCircle, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// Helper to generate IDs
const slugify = (str: string) => str.toLowerCase().replace(/[^a-z0-9]+/g, '-');

// General Support category removed and moved to sidebar
const documentCategoriesRaw = [
    {
        category: "Discretionary Forms",
        files: [
            { name: "Discretionary Wrap Form", type: "pdf", date: "2024-02-15" },
            { name: "Discretionary Non-WRAP Form", type: "pdf", date: "2024-02-15" },
            { name: "Non-Discretionary WRAP Form", type: "pdf", date: "2024-02-15" },
            { name: "Non-Discretionary Non-WRAP Form", type: "pdf", date: "2024-02-15" },
        ],
    },
    {
        category: "Non-Custodial Forms",
        files: [
            { name: "Non-Custodial Discretionary Wrap Form", type: "pdf", date: "2024-01-20" },
            { name: "Non-Custodial Discretionary Non-WRAP Form", type: "pdf", date: "2024-01-20" },
            { name: "Non-Custodial Non-Discretionary WRAP Form", type: "pdf", date: "2024-01-20" },
            { name: "Non-Custodial Non-Discretionary Non WRAP Form", type: "pdf", date: "2024-01-20" },
        ],
    },
    {
        category: "Client Onboarding",
        files: [
            { name: "Retirement Plan Advisory Agreement", type: "pdf", date: "2024-03-05" },
            { name: "New Advisory Client Form", type: "pdf", date: "2024-03-10" },
            { name: "New Advisory Client-Entity Form", type: "pdf", date: "2024-03-10" },
            { name: "New Advisory Client-Trust/Estate Form", type: "pdf", date: "2024-03-10" },
            { name: "New Client Profile Form - Qualified Plans", type: "pdf", date: "2024-02-28" },
            { name: "Sanctuary Advisors Consulting Services Agreement", type: "pdf", date: "2024-01-15" },
        ],
    },
    {
        category: "Operational",
        files: [
            { name: "Trade Correction Forms", type: "pdf", date: "2024-02-05" },
            { name: "Medallion Signature Request Form", type: "pdf", date: "2024-02-01" },
        ],
    },
];

// Mock Data for Recent Activity
const recentActivityRaw = [
    { name: "New Advisory Client Form", type: "pdf", date: "Today, 10:23 AM" },
    { name: "Trade Correction Forms", type: "pdf", date: "Yesterday, 4:45 PM" },
    { name: "Discretionary Wrap Form", type: "pdf", date: "Last Week" },
];

// Mock Data for Recently Added
const recentlyAddedRaw = [
    { name: "Client Privacy Policy 2024", type: "pdf", date: "2024-03-15" },
    { name: "AML Compliance Procedures", type: "word", date: "2024-03-12" },
    { name: "Investment Policy Statement Template", type: "pdf", date: "2024-03-10" },
];

// Flatten the structure for individual cards, but keep category info
const allDocuments = documentCategoriesRaw.flatMap(cat =>
    cat.files.map(file => ({
        ...file,
        category: cat.category,
        id: `${slugify(cat.category)}-${slugify(file.name)}`
    }))
);

const getFileIcon = (type: string) => {
    switch (type) {
        case "excel": return <FileSpreadsheet className="h-6 w-6 text-emerald-500" />;
        case "pdf": return <FileText className="h-6 w-6 text-red-500" />;
        case "word": return <FileText className="h-6 w-6 text-blue-500" />;
        case "form": return <FileText className="h-6 w-6 text-purple-500" />;
        default: return <File className="h-6 w-6 text-gray-500" />;
    }
};

export default function DocumentsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

    const toggleFavorite = (fileId: string) => {
        setFavoriteIds(prev =>
            prev.includes(fileId)
                ? prev.filter(id => id !== fileId)
                : [...prev, fileId]
        );
    };

    const handleOpenFile = (fileName: string) => {
        alert(`Opening ${fileName}...`);
    };

    // Filter Documents
    const filteredDocuments = allDocuments.filter(doc =>
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sidebar Data
    const favoriteFiles = allDocuments.filter(doc => favoriteIds.includes(doc.id));
    const recentActivityFiles = recentActivityRaw.map(f => ({
        ...f,
        id: `recent-${slugify(f.name)}`,
        category: "Recent Activity"
    }));
    const recentlyAddedFiles = recentlyAddedRaw.map(f => ({
        ...f,
        id: `added-${slugify(f.name)}`,
        category: "Recently Added"
    }));


    // Helper for Sidebar List Items (Compact View)
    const renderSidebarItem = (file: { name: string, type: string, date: string, id: string }) => {
        const isFav = favoriteIds.includes(file.id);
        return (
            <div
                key={file.id}
                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-secondary/40 transition-colors group/item text-sm"
            >
                <div
                    className="cursor-pointer text-muted-foreground hover:text-yellow-500 transition-colors"
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(file.id);
                    }}
                    title={isFav ? "Remove from favorites" : "Add to favorites"}
                >
                    <Star className={cn("h-4 w-4", isFav && "fill-yellow-500 text-yellow-500")} />
                </div>

                <div className="flex-shrink-0 mt-0.5">
                    {getFileIcon(file.type)}
                </div>
                <div
                    className="min-w-0 flex-1 cursor-pointer"
                    onClick={() => handleOpenFile(file.name)}
                >
                    <p className="font-medium text-foreground truncate">{file.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{file.type}</span>
                        <span className="text-[10px] text-muted-foreground/60">•</span>
                        <span className="text-[10px] text-muted-foreground">{file.date}</span>
                    </div>
                </div>
            </div>
        );
    };


    return (
        <div className="p-6 space-y-8 max-w-[1600px] mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Documents</h1>
                </div>
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search documents..."
                        className="pl-9 bg-background/50"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
                {/* Main Content - Grid of Individual Cards */}
                <div className="xl:col-span-3">
                    {filteredDocuments.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredDocuments.map((doc) => {
                                const isFav = favoriteIds.includes(doc.id);
                                return (
                                    <Card key={doc.id} className="group relative hover:shadow-md transition-all duration-200 border-border/60 overflow-hidden">
                                        <div className="p-5 flex items-start gap-4 h-full">
                                            <div className="flex-shrink-0 text-muted-foreground group-hover:text-primary transition-colors mt-1">
                                                {getFileIcon(doc.type)}
                                            </div>

                                            <div className="flex-1 min-w-0 space-y-1">
                                                <h3
                                                    className="font-medium text-base hover:text-primary transition-colors cursor-pointer truncate"
                                                    onClick={() => handleOpenFile(doc.name)}
                                                    title={doc.name}
                                                >
                                                    {doc.name}
                                                </h3>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <span className="uppercase font-medium">{doc.type}</span>
                                                    <span>&bull;</span>
                                                    <span>Last updated: {doc.date}</span>
                                                </div>
                                            </div>

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleFavorite(doc.id);
                                                }}
                                                className="flex-shrink-0 text-muted-foreground hover:text-yellow-500 transition-colors focus:outline-none"
                                            >
                                                <Star className={cn("h-4 w-4", isFav && "fill-yellow-500 text-yellow-500")} />
                                            </button>
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="py-12 text-center col-span-full">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
                                <Search className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-medium text-foreground">No documents found</h3>
                            <p className="text-muted-foreground mt-1">Try adjusting your search terms</p>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="xl:col-span-1 space-y-6">
                    {/* Support Card - MOVED HERE */}
                    <Card className="group hover:shadow-md transition-all duration-200 border-border/60">
                        <div className="p-6 space-y-4">
                            <div className="flex items-center gap-2">
                                <LifeBuoy className="h-5 w-5 text-muted-foreground" />
                                <h3 className="font-semibold text-lg text-foreground tracking-tight">Support</h3>
                            </div>
                            <div className="space-y-3 pt-2">
                                <Button
                                    variant="outline"
                                    className="w-full justify-start gap-3 h-auto py-3 border-dashed hover:border-solid hover:bg-background hover:text-primary transition-all group/btn"
                                    onClick={() => alert("Requesting missing resource...")}
                                >
                                    <div className="p-1.5 rounded-full bg-secondary/80 group-hover/btn:bg-primary/10 transition-colors">
                                        <HelpCircle className="h-4 w-4 text-muted-foreground group-hover/btn:text-primary" />
                                    </div>
                                    <div className="flex flex-col items-start text-sm">
                                        <span className="font-medium text-foreground">Request Resource</span>
                                        <span className="text-xs text-muted-foreground font-normal">Don't see what you need?</span>
                                    </div>
                                </Button>

                                <Button
                                    variant="outline"
                                    className="w-full justify-start gap-3 h-auto py-3 border-dashed hover:border-solid hover:bg-background hover:text-destructive transition-all group/btn"
                                    onClick={() => alert("Reporting broken link...")}
                                >
                                    <div className="p-1.5 rounded-full bg-secondary/80 group-hover/btn:bg-destructive/10 transition-colors">
                                        <AlertCircle className="h-4 w-4 text-muted-foreground group-hover/btn:text-destructive" />
                                    </div>
                                    <div className="flex flex-col items-start text-sm">
                                        <span className="font-medium text-foreground">Report Broken Link</span>
                                        <span className="text-xs text-muted-foreground font-normal">Let us know about issues</span>
                                    </div>
                                </Button>
                            </div>
                        </div>
                    </Card>

                    {/* Favorites Card */}
                    {favoriteFiles.length > 0 && (
                        <Card className="group hover:shadow-md transition-all duration-200 border-border/60">
                            <div className="p-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                                        <h3 className="font-semibold text-lg text-foreground tracking-tight">Favorites</h3>
                                    </div>
                                    <span className="text-xs font-medium text-muted-foreground bg-secondary/50 px-2.5 py-1 rounded-full">
                                        {favoriteFiles.length} {favoriteFiles.length === 1 ? 'doc' : 'docs'}
                                    </span>
                                </div>
                                <div className="space-y-2 pt-2">
                                    {favoriteFiles.map(file => renderSidebarItem({ ...file, date: file.date }))}
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* Recent Activity Card */}
                    <Card className="group hover:shadow-md transition-all duration-200 border-border/60">
                        <div className="p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <FolderOpen className="h-5 w-5 text-muted-foreground" />
                                    <h3 className="font-semibold text-lg text-foreground tracking-tight">Recent Activity</h3>
                                </div>
                            </div>
                            <div className="space-y-2 pt-2">
                                {recentActivityFiles.map(file => renderSidebarItem({ ...file, date: file.date }))}
                            </div>
                        </div>
                    </Card>

                    {/* Recently Added Card */}
                    <Card className="group hover:shadow-md transition-all duration-200 border-border/60">
                        <div className="p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <FolderOpen className="h-5 w-5 text-primary" />
                                    <h3 className="font-semibold text-lg text-foreground tracking-tight">Recently Added</h3>
                                </div>
                                <span className="text-xs font-medium text-muted-foreground bg-secondary/50 px-2.5 py-1 rounded-full">
                                    {recentlyAddedFiles.length} new
                                </span>
                            </div>
                            <div className="space-y-2 pt-2">
                                {recentlyAddedFiles.map(file => renderSidebarItem({ ...file, date: file.date }))}
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
