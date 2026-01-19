"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

type KanbanColumn = {
    id: string;
    title: string;
    color: string;
};

type KanbanTask = {
    id: string;
    columnId: string;
    title: string;
    assignee?: string;
    tag?: string;
    team: string;
};

const columns: KanbanColumn[] = [
    { id: "error", title: "Error", color: "bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400" },
    { id: "planning", title: "Planning", color: "bg-yellow-500/10 border-yellow-500/30 text-yellow-600 dark:text-yellow-400" },
    { id: "in_progress", title: "In progress", color: "bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400" },
    { id: "completed", title: "Completed", color: "bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400" },
];

const teams = ["Orion", "Advisor Services", "Asset Movement", "Principal Review", "Compliance", "Direct Business"];

const initialTasks: KanbanTask[] = [
    { id: "1", columnId: "planning", title: "Orion Feature Planning", assignee: "JB", tag: "Design", team: "Orion" },
    { id: "2", columnId: "in_progress", title: "Orion Agent Logic", assignee: "AI", tag: "Backend", team: "Orion" },
    { id: "3", columnId: "error", title: "Advisor Portal Sync Issue", assignee: "JB", tag: "Bug", team: "Advisor Services" },
    { id: "4", columnId: "completed", title: "Advisor Dashboard Mockups", assignee: "JB", tag: "Design", team: "Advisor Services" },
    { id: "5", columnId: "planning", title: "Asset Transfer API", assignee: "SK", tag: "Integration", team: "Asset Movement" },
    { id: "6", columnId: "in_progress", title: "Transaction History View", assignee: "MK", tag: "Frontend", team: "Asset Movement" },
    { id: "7", columnId: "planning", title: "Review Dashboard Charts", assignee: "LM", tag: "Data", team: "Principal Review" },
    { id: "8", columnId: "in_progress", title: "Export to PDF", assignee: "RP", tag: "Feature", team: "Principal Review" },
    { id: "9", columnId: "planning", title: "Compliance Audit Logs", assignee: "TW", tag: "Security", team: "Compliance" },
    { id: "10", columnId: "completed", title: "Regulatory Reporting", assignee: "JD", tag: "Legal", team: "Compliance" },
    { id: "11", columnId: "planning", title: "Carrier Integration", assignee: "JB", tag: "API", team: "Direct Business" },
    { id: "12", columnId: "in_progress", title: "Application Forms", assignee: "AI", tag: "Forms", team: "Direct Business" },
];

export default function KanbanPage() {
    const { userProfile } = useAuth();
    const [tasks, setTasks] = useState<KanbanTask[]>(initialTasks);
    const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
    const [selectedTeam, setSelectedTeam] = useState<string>("Orion");
    const [isTeamDropdownOpen, setIsTeamDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const filteredTasks = tasks.filter(task => task.team === selectedTeam);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsTeamDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleCreateTask = () => {
        const newTask: KanbanTask = {
            id: Math.random().toString(36).substr(2, 9),
            columnId: "planning",
            title: "New Task",
            assignee: userProfile?.initials || "??",
            tag: "General",
            team: selectedTeam
        };
        setTasks([...tasks, newTask]);
    };

    const handleDragStart = (e: React.DragEvent, taskId: string) => {
        setDraggedTaskId(taskId);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const handleDrop = (e: React.DragEvent, columnId: string) => {
        e.preventDefault();

        if (!draggedTaskId) return;

        setTasks((prev) =>
            prev.map((task) =>
                task.id === draggedTaskId ? { ...task, columnId } : task
            )
        );
        setDraggedTaskId(null);
    };

    return (
        <div className="h-[calc(100vh-7rem)] w-full p-6 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-6 shrink-0">
                {/* Team Selector */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setIsTeamDropdownOpen(!isTeamDropdownOpen)}
                        className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg hover:bg-accent transition-colors font-medium text-sm"
                    >
                        <span className="text-foreground">{selectedTeam}</span>
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </button>

                    {isTeamDropdownOpen && (
                        <div className="absolute top-full mt-2 left-0 bg-card border border-border rounded-lg shadow-lg z-10 min-w-[150px]">
                            {teams.map((team) => (
                                <button
                                    key={team}
                                    onClick={() => {
                                        setSelectedTeam(team);
                                        setIsTeamDropdownOpen(false);
                                    }}
                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-accent transition-colors first:rounded-t-lg last:rounded-b-lg ${selectedTeam === team ? "bg-accent text-accent-foreground font-medium" : "text-foreground"
                                        }`}
                                >
                                    {team}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <button
                    onClick={handleCreateTask}
                    className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors font-medium text-sm border border-border"
                >
                    <Plus className="h-4 w-4" />
                    New Task
                </button>
            </div>

            {/* Board Container - Scrollable Horizontally */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden pb-6">
                <div className="flex h-full gap-4 w-max px-2">
                    {columns.map((col) => (
                        <div
                            key={col.id}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, col.id)}
                            className={`w-[400px] shrink-0 flex flex-col h-full rounded-xl bg-card border border-border transition-colors ${draggedTaskId ? 'hover:bg-accent/50' : ''}`}
                        >
                            {/* Column Header */}
                            <div className={`p-3 border-b border-border flex items-center justify-between rounded-t-xl ${col.color}`}>
                                <span className="font-semibold text-sm">{col.title}</span>
                                <span className="text-xs opacity-70 bg-black/20 px-2 py-0.5 rounded-full">
                                    {filteredTasks.filter(t => t.columnId === col.id).length}
                                </span>
                            </div>

                            {/* Tasks Area */}
                            <div className="flex-1 p-2 space-y-2 overflow-y-auto">
                                {filteredTasks.filter(t => t.columnId === col.id).map(task => (
                                    <div
                                        key={task.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, task.id)}
                                        className="p-3 bg-background border border-border rounded-lg hover:border-accent hover:shadow-md transition-all cursor-grab active:cursor-grabbing group"
                                    >
                                        <div className="text-sm font-medium text-foreground mb-2">{task.title}</div>
                                        <div className="flex items-center justify-between mt-2">
                                            {task.tag && <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{task.tag}</span>}
                                            {task.assignee && (
                                                <div className="h-6 w-6 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] text-white font-bold">
                                                    {task.assignee}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
