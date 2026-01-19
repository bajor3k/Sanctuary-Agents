"use client";

import { useAuth } from "@/contexts/auth-context";

export default function FrozenReportPage() {
    const { userProfile } = useAuth();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-foreground">Frozen Report</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        View current frozen accounts and status.
                    </p>
                </div>
            </div>

            <div className="p-12 text-center border-2 border-dashed border-border rounded-xl">
                <p className="text-muted-foreground">Frozen Report content coming soon.</p>
            </div>
        </div>
    );
}
