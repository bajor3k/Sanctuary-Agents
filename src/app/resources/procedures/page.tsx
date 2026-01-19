"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FileText, FileSpreadsheet, File, Search, FolderOpen, Star } from "lucide-react";
import { cn } from "@/lib/utils";

// Helper to generate IDs
const slugify = (str: string) => str.toLowerCase().replace(/[^a-z0-9]+/g, '-');

// Defines the data for all teams
// Removed hardcoded "Favorites" team.
// Added IDs to files for better state management.
const teamProceduresRaw = [
  {
    team: "Advisor Services",
    files: [
      { name: "New Account Opening Guide", type: "pdf", date: "2024-01-15" },
      { name: "Client Onboarding Checklist", type: "word", date: "2023-12-10" },
    ],
  },
  {
    team: "Principal Review Desk",
    files: [
      { name: "Trade Review Guidelines", type: "pdf", date: "2024-02-01" },
      { name: "Daily Trade Blotter Review", type: "excel", date: "2024-02-02" },
    ],
  },
  {
    team: "Compliance",
    files: [
      { name: "Annual Compliance Meeting Presentation", type: "pptx", date: "2024-01-10" },
      { name: "Gift & Gratuity Log", type: "excel", date: "2024-01-01" },
    ],
  },
  {
    team: "Direct Business",
    files: [
      { name: "Direct Application Processing", type: "pdf", date: "2023-09-15" },
      { name: "Direct Business Check Log", type: "excel", date: "2023-09-20" },
    ],
  },
  {
    team: "Alternative Investments",
    files: [
      { name: "Subscription Agreement Guide", type: "pdf", date: "2024-02-20" },
      { name: "Sponsor Review Checklist", type: "word", date: "2024-01-30" },
    ],
  },
  {
    team: "Asset Movement",
    files: [
      { name: "Wire Transfer Request Form", type: "pdf", date: "2023-11-20" },
      { name: "ACAT Transfer Procedures", type: "word", date: "2023-10-05" },
    ],
  },
];

// Mock Data for Recent Activity
const recentActivityRaw = [
  { name: "Direct Application Processing", type: "pdf", date: "Today, 10:23 AM" },
  { name: "Trade Review Guidelines", type: "pdf", date: "Yesterday, 4:45 PM" },
  { name: "Gift & Gratuity Log", type: "excel", date: "Oct 24, 2023" },
];

// Mock Data for Recently Added
const recentlyAddedRaw = [
  { name: "ESG Investment Guidelines", type: "pdf", date: "2024-03-18" },
  { name: "Cybersecurity Best Practices", type: "word", date: "2024-03-15" },
  { name: "Quarterly Reporting Checklist", type: "excel", date: "2024-03-12" },
];

// Enrich data with IDs
const teamProcedures = teamProceduresRaw.map(team => ({
  ...team,
  files: team.files.map(file => ({
    ...file,
    id: `${slugify(team.team)}-${slugify(file.name)}`
  }))
}));

const getFileIcon = (type: string) => {
  switch (type) {
    case "excel": return <FileSpreadsheet className="h-5 w-5 text-emerald-500" />;
    case "pdf": return <FileText className="h-5 w-5 text-red-500" />;
    case "word": return <FileText className="h-5 w-5 text-blue-500" />;
    case "pptx": return <FileText className="h-5 w-5 text-orange-500" />; // Added pptx color
    default: return <File className="h-5 w-5 text-gray-500" />;
  }
};

export default function ProceduresPage() {
  const [searchTerm, setSearchTerm] = useState("");

  // Initial favorites based on previous hardcoded list or empty
  const [favoriteIds, setFavoriteIds] = useState<string[]>([
    "advisor-services-new-account-opening-guide",
    "asset-movement-wire-transfer-request-form",
    "principal-review-desk-trade-review-guidelines"
  ]);

  const handleOpenExplorer = async (teamName: string) => {
    // Map team names to local folder paths
    // For now, only "Advisor Services" is strictly defined by user, but we can add placeholders or logic for others.
    const folderMap: Record<string, string> = {
      "Advisor Services": "C:\\Users\\JoshuaBajorek\\Desktop\\Advisor Services",
      "Principal Review Desk": "C:\\Users\\JoshuaBajorek\\Desktop\\Principal Review Desk",
      "Compliance": "C:\\Users\\JoshuaBajorek\\Desktop\\Compliance",
      "Direct Business": "C:\\Users\\JoshuaBajorek\\Desktop\\Direct Business",
      "Alternative Investments": "C:\\Users\\JoshuaBajorek\\Desktop\\Alternative Investments",
      "Asset Movement": "C:\\Users\\JoshuaBajorek\\Desktop\\Asset Movement",
    };

    const path = folderMap[teamName];
    if (!path) {
      console.warn(`No folder path defined for team: ${teamName}`);
      return;
    }

    try {
      await fetch("http://127.0.0.1:8000/open-folder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ path }),
      });
    } catch (error) {
      console.error("Failed to open folder:", error);
    }
  };

  const toggleFavorite = (fileId: string) => {
    setFavoriteIds(prev =>
      prev.includes(fileId)
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const filterTeams = (teams: typeof teamProcedures) => {
    return teams.map((team) => {
      // If the team name matches, show all files
      if (team.team.toLowerCase().includes(searchTerm.toLowerCase())) {
        return team;
      }
      // Otherwise filter files within the team
      const matchingFiles = team.files.filter((file) =>
        file.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      // Return the team only if it has matching files
      return matchingFiles.length > 0 ? { ...team, files: matchingFiles } : null;
    }).filter((team): team is typeof teamProcedures[0] => team !== null);
  };

  // Derive Favorites List
  const allFiles = teamProcedures.flatMap(t => t.files);
  const favoriteFiles = allFiles.filter(f => favoriteIds.includes(f.id));

  // Construct a virtual "Favorites" team object for display
  const favoritesTeam = {
    team: "Favorites",
    files: favoriteFiles
  };

  // Recent Activity Team Object (Mock)
  const recentActivityTeam = {
    team: "Recent Activity",
    files: recentActivityRaw.map(f => ({
      ...f,
      id: `recent-${slugify(f.name)}`
    }))
  };

  // Recently Added Team Object (Mock)
  const recentlyAddedTeam = {
    team: "Recently Added",
    files: recentlyAddedRaw.map(f => ({
      ...f,
      id: `added-${slugify(f.name)}`
    }))
  };

  // Specific order logic
  const desiredOrder = [
    "Advisor Services",
    "Principal Review Desk",
    "Compliance",
    "Direct Business",
    "Alternative Investments",
    "Asset Movement"
  ];

  const mainTeams = desiredOrder.map(name =>
    teamProcedures.find(t => t.team === name)
  ).filter((t): t is typeof teamProcedures[0] => t !== undefined);

  const filteredMainTeams = filterTeams(mainTeams);

  // Filter favorites specially to allow searching within favorites sidebar too
  // We apply the same search filter to favoritesTeam.files
  const filteredFavoritesFiles = favoritesTeam.files.filter(f =>
    searchTerm === "" || f.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredFavoritesTeam = { ...favoritesTeam, files: filteredFavoritesFiles };


  const renderTeamCard = (team: { team: string, files: typeof teamProcedures[0]['files'] }, isFavoritesCard = false) => (
    <Card key={team.team} className={cn("group hover:shadow-md transition-all duration-200 border-border/60 h-full")}>
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <button
            type="button"
            className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors group/header text-left bg-transparent border-0 p-0 focus:outline-none"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenExplorer(team.team);
            }}
            title={`Open ${team.team} in File Explorer`}
          >
            <FolderOpen className={cn("h-5 w-5 text-muted-foreground group-hover/header:text-foreground transition-colors")} />
            <h3 className="font-semibold text-lg text-foreground tracking-tight group-hover/header:text-foreground transition-colors">{team.team}</h3>
          </button>
          <span className="text-xs font-medium text-muted-foreground bg-secondary/50 px-2.5 py-1 rounded-full">
            {team.files.length} {team.files.length === 1 ? 'doc' : 'docs'}
          </span>
        </div>

        <div className="space-y-2 pt-2">
          {team.files.map((file) => {
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
                <div className="min-w-0 flex-1 cursor-pointer">
                  <p className="font-medium text-foreground truncate">{file.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{file.type}</span>
                    <span className="text-[10px] text-muted-foreground/60">•</span>
                    <span className="text-[10px] text-muted-foreground">{file.date}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );

  return (
    <div className="p-6 space-y-8 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Procedures</h1>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search teams or documents..."
            className="pl-9 bg-background/50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
        {/* Main Content - Left Column */}
        <div className="xl:col-span-3">
          {filteredMainTeams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredMainTeams.map(t => renderTeamCard(t, false))}
            </div>
          ) : (
            null
          )}
        </div>

        {/* Sidebar - Right Column */}
        <div className="xl:col-span-1">
          {/* Always show Favorites card if there are favorites */}
          {(filteredFavoritesTeam.files.length > 0 || favoritesTeam.files.length > 0) && (
            <div className="sticky top-6 space-y-6">
              {renderTeamCard(filteredFavoritesTeam, true)}
              {renderTeamCard(recentActivityTeam, true)}
              {renderTeamCard(recentlyAddedTeam, true)}
            </div>
          )}
        </div>
      </div>

      {filteredMainTeams.length === 0 && filteredFavoritesTeam.files.length === 0 && (
        <div className="py-12 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
            <Search className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground">No procedures found</h3>
          <p className="text-muted-foreground mt-1">Try adjusting your search terms</p>
        </div>
      )}
    </div>
  );
}
