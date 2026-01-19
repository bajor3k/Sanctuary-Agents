import { MarginAccount } from './types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AccordionTrigger } from '@/components/ui/accordion';

interface AccountRowProps {
    account: MarginAccount;
}

export function AccountRow({ account }: AccountRowProps) {
    const cash = account.totalEquity - (account.securityValue + account.moneyMarketFunds);
    const isNegativeCash = cash < 0;
    const isNegativeExcess = account.excessLiquidity < 0;

    // Force rebuild 1
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
        }).format(value);
    };

    const statusColor = {
        Safe: 'bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-200',
        Warning: 'bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20 border-yellow-200',
        Call: 'bg-red-500/10 text-red-600 hover:bg-red-500/20 border-red-200',
        'House Call': 'bg-red-500/10 text-red-600 hover:bg-red-500/20 border-red-200',
    };

    return (
        <AccordionTrigger className="hover:no-underline px-6 py-4 border-b border-border/40 dark:border-white/5 hover:bg-muted/5 transition-colors group">
            <div className="grid grid-cols-[1.2fr_1.5fr_1.5fr_1.5fr_1.5fr_1.5fr_0.8fr_1fr] gap-4 w-full items-center text-left">

                {/* Account */}
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Account</span>
                    <span className="font-mono text-sm font-medium">{account.accountNumber}</span>
                </div>

                {/* Market Value */}
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Security Value</span>
                    <span className="font-mono text-sm">{formatCurrency(account.securityValue)}</span>
                </div>

                {/* Money Market Funds */}
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Money Market</span>
                    <span className="font-mono text-sm text-emerald-600 dark:text-emerald-500 font-medium">
                        {formatCurrency(account.moneyMarketFunds)}
                    </span>
                </div>

                {/* Cash */}
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Cash Balance</span>
                    <span className={cn(
                        "font-mono text-sm font-medium",
                        isNegativeCash ? "text-destructive font-bold" : "text-foreground"
                    )}>
                        {formatCurrency(cash)}
                    </span>
                </div>

                {/* Total Value */}
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Total Equity</span>
                    <span className="font-mono text-sm font-bold">{formatCurrency(account.totalEquity)}</span>
                </div>

                {/* Excess Liquidity */}
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Excess Liq</span>
                    <div className="flex items-center gap-2">
                        <span className={cn(
                            "font-mono text-sm font-medium",
                            isNegativeExcess ? "text-destructive" : "text-emerald-600 dark:text-emerald-500"
                        )}>
                            {account.excessLiquidity > 0 ? '+' : ''}{formatCurrency(account.excessLiquidity)}
                        </span>
                        {isNegativeExcess && (
                            <span className="text-[9px] px-1 py-0.5 bg-destructive/10 text-destructive rounded font-bold whitespace-nowrap">
                                CASH DUE
                            </span>
                        )}
                    </div>
                </div>

                {/* Status */}
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Status</span>
                    <Badge variant="outline" className={cn("w-fit font-medium border", statusColor[account.status])}>
                        {account.status}
                    </Badge>
                </div>

                {/* Suggestion */}
                <div className="flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
                    <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs text-muted-foreground hover:text-primary dark:hover:text-white gap-2 cursor-pointer"
                    >
                        <div role="button">
                            <Bot className="h-3.5 w-3.5" />
                            Ask Maven
                        </div>
                    </Button>
                </div>

            </div>
        </AccordionTrigger>
    );
}
