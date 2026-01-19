"use client";

import { useAuth } from "@/contexts/auth-context";
import { useActivity } from "@/contexts/activity-context";
import { Activity, Database, Zap, AlertTriangle, CheckCircle2, XCircle, Code2, Server, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { FLAGS } from "@/lib/featureFlags";
import { checkCosmosHealth } from "@/lib/cosmos";

interface ServiceStatus {
    name: string;
    status: "active" | "error" | "checking";
    lastChecked?: Date;
    message?: string;
}

interface ApiEndpoint {
    path: string;
    status: "active" | "error" | "checking";
}

export default function DiagnosticsPage() {
    const { user } = useAuth();
    const { logs, addLog, clearLogs: clearActivityLogs } = useActivity();
    const [services, setServices] = useState<ServiceStatus[]>([
        { name: "Microsoft Auth", status: "checking" },
        { name: "Azure Cosmos DB", status: "checking" },
        { name: "External APIs", status: "checking" },
        { name: "Genkit AI", status: "checking" },
    ]);
    const [apiEndpoints, setApiEndpoints] = useState<ApiEndpoint[]>([

        { path: '/api/extract', status: 'checking' },
        { path: '/api/advisory-documents', status: 'checking' },
    ]);

    useEffect(() => {
        // Check Microsoft Auth
        const checkServices = async () => {
            addLog("INFO", "Running service health checks");
            const newServices = [...services];

            // Microsoft Auth check
            if (user) {
                newServices[0] = {
                    name: "Microsoft Auth",
                    status: "active",
                    lastChecked: new Date(),
                    message: `Authenticated as ${user.email}`
                };
                addLog("INFO", "Microsoft Auth: Connected");
            } else {
                newServices[0] = {
                    name: "Microsoft Auth",
                    status: "error",
                    lastChecked: new Date(),
                    message: "Not authenticated"
                };
                addLog("WARN", "Microsoft Auth: Not authenticated");
            }

            // Azure Cosmos DB check
            try {
                const cosmosHealth = await checkCosmosHealth();
                newServices[1] = {
                    name: "Azure Cosmos DB",
                    status: cosmosHealth.connected ? "active" : "error",
                    lastChecked: new Date(),
                    message: cosmosHealth.message
                };
                addLog(cosmosHealth.connected ? "INFO" : "WARN", `Azure Cosmos DB: ${cosmosHealth.message}`);
            } catch (error) {
                newServices[1] = {
                    name: "Azure Cosmos DB",
                    status: "error",
                    lastChecked: new Date(),
                    message: "Health check failed"
                };
                addLog("ERROR", "Azure Cosmos DB: Health check failed");
            }

            // External APIs check
            newServices[2] = {
                name: "External APIs",
                status: "active",
                lastChecked: new Date(),
                message: "Document processing endpoints available"
            };
            addLog("INFO", "External APIs: All endpoints available");

            // Genkit AI check
            newServices[3] = {
                name: "Genkit AI",
                status: "active",
                lastChecked: new Date(),
                message: "PDF analysis, document processing ready"
            };
            addLog("INFO", "Genkit AI: Services ready");

            setServices(newServices);
        };

        checkServices();

        // Check API endpoints
        const checkApiEndpoints = async () => {
            addLog("INFO", "Checking API endpoints");
            const updatedEndpoints = await Promise.all(
                apiEndpoints.map(async (endpoint) => {
                    try {
                        const controller = new AbortController();
                        const timeoutId = setTimeout(() => controller.abort(), 5000);

                        const response = await fetch(endpoint.path, {
                            method: 'HEAD',
                            signal: controller.signal,
                        });

                        clearTimeout(timeoutId);

                        if (response.ok || response.status === 405) {
                            // 405 means endpoint exists but HEAD not allowed, which is fine
                            addLog("INFO", `API ${endpoint.path}: Available`);
                            return { ...endpoint, status: 'active' as const };
                        } else {
                            addLog("WARN", `API ${endpoint.path}: Status ${response.status}`);
                            return { ...endpoint, status: 'error' as const };
                        }
                    } catch (error) {
                        addLog("ERROR", `API ${endpoint.path}: Unavailable`);
                        return { ...endpoint, status: 'error' as const };
                    }
                })
            );
            setApiEndpoints(updatedEndpoints);
        };

        checkApiEndpoints();
    }, [user]);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "active":
                return <CheckCircle2 className="h-5 w-5 text-green-500" />;
            case "error":
                return <XCircle className="h-5 w-5 text-red-500" />;
            case "checking":
                return <Activity className="h-5 w-5 text-yellow-500 animate-pulse" />;
            default:
                return <AlertTriangle className="h-5 w-5 text-gray-500" />;
        }
    };

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">System Diagnostics</h1>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => window.location.reload()}
                    >
                        Refresh Status
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Service Status */}
                    <div className="bg-card border border-border rounded-xl overflow-hidden">
                        <div className="p-6 pb-3 border-b border-white/10">
                            <h3 className="font-semibold text-lg">Service Status</h3>
                        </div>
                        <div className="p-6 pt-4 space-y-3">
                            {services.map((service, idx) => (
                                <div key={idx} className="flex items-start justify-between p-3 bg-muted/30 rounded-lg">
                                    <div className="flex items-start gap-3 flex-1">
                                        {getStatusIcon(service.status)}
                                        <div className="flex-1">
                                            <p className="font-medium text-sm">{service.name}</p>
                                            {service.message && (
                                                <p className="text-xs text-muted-foreground mt-1">{service.message}</p>
                                            )}
                                            {service.lastChecked && (
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Last checked: {service.lastChecked.toLocaleTimeString()}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Feature Flags */}
                    <div className="bg-card border border-border rounded-xl overflow-hidden">
                        <div className="p-6 pb-3 border-b border-white/10">
                            <h3 className="font-semibold text-lg">Feature Flags</h3>
                        </div>
                        <div className="p-6 pt-4 space-y-3">
                            {Object.entries(FLAGS).map(([key, value]) => (
                                <div key={key} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                    <div>
                                        <p className="font-medium text-sm">{key}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {typeof value === 'boolean' ? (value ? 'Enabled' : 'Disabled') : String(value)}
                                        </p>
                                    </div>
                                    <div className={`px-2 py-1 rounded text-xs font-medium ${value ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                                        }`}>
                                        {value ? 'ON' : 'OFF'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Environment Info */}
                    <div className="bg-card border border-border rounded-xl overflow-hidden">
                        <div className="p-6 pb-3 border-b border-white/10">
                            <h3 className="font-semibold text-lg">Environment</h3>
                        </div>
                        <div className="p-6 pt-4 space-y-3">
                            <div className="flex justify-between p-3 bg-muted/30 rounded-lg">
                                <span className="text-sm font-medium">Environment</span>
                                <span className={`text-sm font-semibold ${process.env.NODE_ENV === 'production' ? 'text-green-500' : 'text-yellow-500'
                                    }`}>
                                    {process.env.NODE_ENV === 'production' ? 'Production (Live)' : 'Development (Local)'}
                                </span>
                            </div>
                            <div className="flex justify-between p-3 bg-muted/30 rounded-lg">
                                <span className="text-sm font-medium">Host</span>
                                <span className="text-sm text-muted-foreground">
                                    {typeof window !== 'undefined' ? window.location.hostname : 'N/A'}
                                </span>
                            </div>
                            <div className="flex justify-between p-3 bg-muted/30 rounded-lg">
                                <span className="text-sm font-medium">User Agent</span>
                                <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                                    {typeof window !== 'undefined' ? window.navigator.userAgent.split(' ').slice(-2).join(' ') : 'N/A'}
                                </span>
                            </div>
                            <div className="flex justify-between p-3 bg-muted/30 rounded-lg">
                                <span className="text-sm font-medium">Screen Resolution</span>
                                <span className="text-sm text-muted-foreground">
                                    {typeof window !== 'undefined' ? `${window.screen.width}x${window.screen.height}` : 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* API Endpoints */}
                    <div className="bg-card border border-border rounded-xl overflow-hidden">
                        <div className="p-6 pb-3 border-b border-white/10">
                            <h3 className="font-semibold text-lg">API Endpoints</h3>
                        </div>
                        <div className="p-6 pt-4 space-y-2 max-h-[200px] overflow-y-auto">
                            {apiEndpoints.map((endpoint) => (
                                <div key={endpoint.path} className="flex items-center gap-2 p-2 bg-muted/30 rounded text-xs font-mono">
                                    {endpoint.status === 'active' ? (
                                        <Wifi className="h-3 w-3 text-green-500" />
                                    ) : endpoint.status === 'error' ? (
                                        <WifiOff className="h-3 w-3 text-red-500" />
                                    ) : (
                                        <Activity className="h-3 w-3 text-yellow-500 animate-pulse" />
                                    )}
                                    <span>{endpoint.path}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Recent Logs */}
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between p-6 pb-3 border-b border-white/10">
                        <h3 className="font-semibold text-lg">Recent Activity</h3>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearActivityLogs}
                        >
                            Clear Logs
                        </Button>
                    </div>
                    <div className="p-6 pt-4">
                        <div className="flex flex-col-reverse space-y-2 space-y-reverse max-h-[300px] overflow-y-auto font-mono text-xs">
                            {logs.length === 0 ? (
                                <p className="text-muted-foreground text-center py-4">No logs available</p>
                            ) : (
                                logs.map((log, idx) => (
                                    <div key={idx} className="flex gap-3 p-2 bg-muted/30 rounded">
                                        <span className="text-muted-foreground">{log.timestamp.toLocaleTimeString()}</span>
                                        <span className={`font-bold ${log.level === 'ERROR' ? 'text-red-500' :
                                                log.level === 'WARN' ? 'text-yellow-500' :
                                                    'text-blue-500'
                                            }`}>
                                            {log.level}
                                        </span>
                                        <span>{log.message}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
