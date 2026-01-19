"use client";

import { useState } from 'react';
import { mockMarginAccounts } from './data';
import { AccountRow } from './AccountRow';
import { AccountDetails } from './AccountDetails';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionItem, AccordionContent } from '@/components/ui/accordion'; // Note: AccountRow handles AccordionTrigger
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RiskStatus } from './types';

export function MarginDashboard() {
    const [filter, setFilter] = useState<'All' | 'At Risk' | 'In Call'>('All');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredAccounts = mockMarginAccounts.filter(account => {
        // 1. Filter by Status
        let statusMatch = true;
        if (filter === 'At Risk') {
            statusMatch = account.status === 'Warning'; // "At Risk" maps to Warning? Guide says "At Risk: Highlights in Yellow", Warning is Yellow.
        } else if (filter === 'In Call') {
            statusMatch = account.status === 'Call' || account.status === 'House Call';
        }

        // 2. Filter by Search
        const searchLower = searchQuery.toLowerCase();
        const searchMatch =
            account.accountNumber.toLowerCase().includes(searchLower) ||
            account.ownerName.toLowerCase().includes(searchLower);

        return statusMatch && searchMatch;
    });

    return (
        <div className="w-full max-w-[1800px] mx-auto p-8 space-y-6">

            {/* Title / Breadcrumb area could go here if needed, but Card acts as main container */}

            <Card className="w-full border shadow-sm bg-card">
                <CardHeader className="flex flex-row items-center justify-between py-6 px-8 border-b border-border/40 dark:border-white/5">
                    <div className="flex items-center gap-6">
                        <CardTitle className="text-2xl font-bold tracking-tight">Account Status</CardTitle>

                        {/* Filter Group */}
                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setFilter('All')}
                                className={cn(
                                    "h-8 px-4 rounded-md text-sm font-medium transition-all",
                                    filter === 'All' ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                )}
                            >
                                All
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setFilter('At Risk')}
                                className={cn(
                                    "h-8 px-4 rounded-md text-sm font-medium transition-all",
                                    filter === 'At Risk' ? "bg-yellow-500/10 text-yellow-600" : "text-muted-foreground hover:text-yellow-600/80 hover:bg-yellow-500/5"
                                )}
                            >
                                At Risk
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setFilter('In Call')}
                                className={cn(
                                    "h-8 px-4 rounded-md text-sm font-medium transition-all",
                                    filter === 'In Call' ? "bg-red-500/10 text-red-600" : "text-muted-foreground hover:text-red-600/80 hover:bg-red-500/5"
                                )}
                            >
                                In Call
                            </Button>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="relative w-[300px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search accounts..."
                            className="pl-9 bg-background/50"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    <Accordion type="single" collapsible className="w-full">
                        {filteredAccounts.length > 0 ? (
                            filteredAccounts.map(account => (
                                <AccordionItem value={account.id} key={account.id} className="border-b-0">
                                    <AccountRow account={account} />
                                    <AccordionContent className="p-0">
                                        <AccountDetails account={account} />
                                    </AccordionContent>
                                </AccordionItem>
                            ))
                        ) : (
                            <div className="p-12 text-center text-muted-foreground">
                                No accounts found matching your filters.
                            </div>
                        )}

                    </Accordion>
                </CardContent>
            </Card>
        </div>
    );
}
