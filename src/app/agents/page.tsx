import Link from 'next/link';

export default function AgentsPage() {
    return (
        <div className="h-full w-full p-4">
            <div className="max-w-5xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">AI Agents</h1>
                    <p className="text-muted-foreground"> specialized autonomous agents to automate your workflow.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                    {/* Advisory Agent */}
                    <Link href="/orion/advisory" className="group block p-6 rounded-3xl border border-border bg-card hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all duration-300">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-4 group-hover:scale-110 transition-transform">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><path d="M16 13H8" /><path d="M16 17H8" /><path d="M10 9H8" /></svg>
                        </div>
                        <h2 className="text-xl font-semibold mb-2">Advisory Agent</h2>
                        <p className="text-sm text-muted-foreground">Automated PDF processing, fee extraction, and compliance checking.</p>
                    </Link>

                    {/* Reminders Agent */}
                    <Link href="/agents/reminders" className="group block p-6 rounded-3xl border border-border bg-card hover:border-blue-500/50 hover:bg-blue-500/5 transition-all duration-300">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-4 group-hover:scale-110 transition-transform">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v4" /><path d="M16 2v4" /><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M3 10h18" /><path d="M8 14h.01" /><path d="M12 14h.01" /><path d="M16 14h.01" /><path d="M8 18h.01" /><path d="M12 18h.01" /><path d="M16 18h.01" /></svg>
                        </div>
                        <h2 className="text-xl font-semibold mb-2">Reminders Agent</h2>
                        <p className="text-sm text-muted-foreground">Intelligent scheduling, client outreach, and task tracking.</p>
                    </Link>

                    {/* Margin Agent */}
                    <Link href="/advisor-services/margin" className="group block p-6 rounded-3xl border border-border bg-card hover:border-orange-500/50 hover:bg-orange-500/5 transition-all duration-300">
                        <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 mb-4 group-hover:scale-110 transition-transform">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7" /><polyline points="16 17 22 17 22 11" /></svg>
                        </div>
                        <h2 className="text-xl font-semibold mb-2">Margin Monitor</h2>
                        <p className="text-sm text-muted-foreground">Real-time margin call detection and autonomous cure strategies.</p>
                    </Link>


                    {/* Meeting Prep Agent */}
                    <Link href="/agents/morning-brief" className="group block p-6 rounded-3xl border border-border bg-card hover:border-amber-500/50 hover:bg-amber-500/5 transition-all duration-300">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 mb-4 group-hover:scale-110 transition-transform">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><path d="M12 1v2" /><path d="M12 21v2" /><path d="M4.22 4.22l1.42 1.42" /><path d="M18.36 18.36l1.42 1.42" /><path d="M1 12h2" /><path d="M21 12h2" /><path d="M4.22 19.78l1.42-1.42" /><path d="M18.36 5.64l1.42-1.42" /></svg>
                        </div>
                        <h2 className="text-xl font-semibold mb-2">Meeting Prep</h2>
                        <p className="text-sm text-muted-foreground">Daily digest of market updates, client news, and actionable insights.</p>
                    </Link>

                </div>
            </div>
        </div>

    );
}
