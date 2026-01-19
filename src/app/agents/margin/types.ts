export type RiskStatus = 'Safe' | 'Warning' | 'Call' | 'House Call';

export interface Position {
    symbol: string;
    description: string;
    quantity: number;
    price: number;
    value: number;
    ytdPerformance: number; // Percentage, e.g., 12.5 for 12.5%
}

export interface Activity {
    id: string;
    date: string;
    description: string;
    amount: number;
    type: string;
}

export interface BalanceDetails {
    equity: number;
    securityValue: number;
    marginRequirement: number;
    fundsAvailable: number;
    dayTradeBuyingPower: number;
    houseSurplus: number;
    sma: number; // Special Memorandum Account
}

export interface MarginAccount {
    id: string;
    accountNumber: string;
    ownerName: string; // "Client Name" mentioned in history
    totalEquity: number;
    moneyMarketFunds: number;
    // Cash is calculated: TotalEquity - (SecurityValue + MoneyMarket)
    // But we can store a base value if needed, or calculate it on the fly as requested.
    // The request says: "Calculated Fields: The "Cash" column... is calculated on the fly: Total Equity - (Security Value + Money Market)."
    // So we will compute it in the component, but we need SecurityValue here or in BalanceDetails.
    // Let's assume this structure supports the calculation.
    securityValue: number;

    excessLiquidity: number;
    status: RiskStatus;

    positions: Position[];
    activity: Activity[];
    balance: BalanceDetails;
}
