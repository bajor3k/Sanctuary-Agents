import { MarginAccount } from './types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';

interface AccountDetailsProps {
    account: MarginAccount;
}

export function AccountDetails({ account }: AccountDetailsProps) {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
        }).format(value);
    };

    const formatPercentage = (value: number) => {
        return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
    };

    return (
        <div className="bg-muted/10 p-6 border-b border-border/40">
            <Tabs defaultValue="positions" className="w-full">
                <TabsList className="bg-muted/50 mb-6">
                    <TabsTrigger value="positions">Positions</TabsTrigger>
                    <TabsTrigger value="activity">Activity</TabsTrigger>
                    <TabsTrigger value="balance">Balance Details</TabsTrigger>
                </TabsList>

                {/* --- POSITIONS TAB --- */}
                <TabsContent value="positions">
                    <div className="rounded-md border bg-card">
                        <Table>
                            <TableHeader className="bg-muted/30">
                                <TableRow>
                                    <TableHead className="uppercase tracking-wide text-xs">Symbol</TableHead>
                                    <TableHead className="text-right uppercase tracking-wide text-xs">Quantity</TableHead>
                                    <TableHead className="text-right uppercase tracking-wide text-xs">Price</TableHead>
                                    <TableHead className="text-right uppercase tracking-wide text-xs">Value</TableHead>
                                    <TableHead className="text-right uppercase tracking-wide text-xs">YTD Performance</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {account.positions.map((pos) => (
                                    <TableRow key={pos.symbol}>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-bold">{pos.symbol}</span>
                                                <span className="text-xs text-muted-foreground">{pos.description}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right font-mono">{pos.quantity.toLocaleString()}</TableCell>
                                        <TableCell className="text-right font-mono">{formatCurrency(pos.price)}</TableCell>
                                        <TableCell className="text-right font-mono font-medium">{formatCurrency(pos.value)}</TableCell>
                                        <TableCell className={cn("text-right font-mono font-medium", pos.ytdPerformance >= 0 ? "text-emerald-600 dark:text-emerald-500" : "text-destructive")}>
                                            {formatPercentage(pos.ytdPerformance)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>

                {/* --- ACTIVITY TAB --- */}
                <TabsContent value="activity">
                    <div className="rounded-md border bg-card">
                        <Table>
                            <TableHeader className="bg-muted/30">
                                <TableRow>
                                    <TableHead className="uppercase tracking-wide text-xs">Date</TableHead>
                                    <TableHead className="uppercase tracking-wide text-xs">Description</TableHead>
                                    <TableHead className="uppercase tracking-wide text-xs">Type</TableHead>
                                    <TableHead className="text-right uppercase tracking-wide text-xs">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {account.activity.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                            No recent activity
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    account.activity.map((act) => (
                                        <TableRow key={act.id}>
                                            <TableCell className="font-mono text-sm">{act.date}</TableCell>
                                            <TableCell>{act.description}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="font-normal text-xs uppercase tracking-wider">{act.type}</Badge>
                                            </TableCell>
                                            <TableCell className={cn("text-right font-mono font-medium", act.amount > 0 ? "text-emerald-600 dark:text-emerald-500" : "")}>
                                                {act.amount > 0 ? '+' : ''}{formatCurrency(act.amount)}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>

                {/* --- BALANCE DETAILS TAB --- */}
                <TabsContent value="balance">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        {/* Card 1: Account Equity & Value */}
                        <Card className="shadow-none">
                            <CardHeader className="bg-muted/30 py-3 border-b">
                                <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Account Equity & Value</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-3">
                                <div className="flex justify-between items-baseline">
                                    <span className="text-sm text-muted-foreground">Total Equity</span>
                                    <span className="font-mono font-medium">{formatCurrency(account.balance.equity)}</span>
                                </div>
                                <div className="flex justify-between items-baseline">
                                    <span className="text-sm text-muted-foreground">Security Value</span>
                                    <span className="font-mono">{formatCurrency(account.balance.securityValue)}</span>
                                </div>
                                <div className="pt-2 mt-2 border-t flex justify-between items-baseline">
                                    <span className="text-sm font-medium">Net Value</span>
                                    <span className="font-mono font-bold">{formatCurrency(account.balance.equity)}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Card 2: Margin Requirements */}
                        <Card className="shadow-none">
                            <CardHeader className="bg-muted/30 py-3 border-b">
                                <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Margin Requirements</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-3">
                                <div className="flex justify-between items-baseline">
                                    <span className="text-sm text-muted-foreground">Margin Requirement</span>
                                    <span className="font-mono">{formatCurrency(account.balance.marginRequirement)}</span>
                                </div>
                                <div className="flex justify-between items-baseline">
                                    <span className="text-sm text-muted-foreground">House Surplus</span>
                                    <span className={cn("font-mono font-medium", account.balance.houseSurplus < 0 ? "text-destructive" : "text-emerald-600 dark:text-emerald-500")}>
                                        {formatCurrency(account.balance.houseSurplus)}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Card 3: Funds Availability */}
                        <Card className="shadow-none">
                            <CardHeader className="bg-muted/30 py-3 border-b">
                                <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Funds Availability</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-3">
                                <div className="flex justify-between items-baseline">
                                    <span className="text-sm text-muted-foreground">Funds Available</span>
                                    <span className={cn("font-mono font-medium", account.balance.fundsAvailable < 0 ? "text-destructive" : "")}>
                                        {formatCurrency(account.balance.fundsAvailable)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-baseline">
                                    <span className="text-sm text-muted-foreground">Day Trade BP</span>
                                    <span className="font-mono">{formatCurrency(account.balance.dayTradeBuyingPower)}</span>
                                </div>
                                <div className="flex justify-between items-baseline">
                                    <span className="text-sm text-muted-foreground">SMA</span>
                                    <span className="font-mono">{formatCurrency(account.balance.sma)}</span>
                                </div>
                            </CardContent>
                        </Card>

                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
