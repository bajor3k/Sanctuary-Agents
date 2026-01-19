import { MarginAccount } from './types';

export const mockMarginAccounts: MarginAccount[] = [
    {
        id: '1',
        accountNumber: '738492',
        ownerName: 'Apex Capital Holdings',
        totalEquity: 1250000.00,
        moneyMarketFunds: 150000.00,
        securityValue: 850000.00, // Cash = 1.25M - (850k + 150k) = 250k
        excessLiquidity: 45000.00,
        status: 'Safe',
        positions: [
            {
                symbol: 'AAPL',
                description: 'Apple Inc.',
                quantity: 500,
                price: 185.50,
                value: 92750.00,
                ytdPerformance: 12.4
            },
            {
                symbol: 'NVDA',
                description: 'NVIDIA Corporation',
                quantity: 200,
                price: 850.00,
                value: 170000.00,
                ytdPerformance: 45.2
            },
            {
                symbol: 'TSLA',
                description: 'Tesla, Inc.',
                quantity: 1000,
                price: 175.20,
                value: 175200.00,
                ytdPerformance: -15.3
            }
        ],
        activity: [
            { id: 'a1', date: '2024-05-15', description: 'Sold 100 AAPL', amount: 18500.00, type: 'Sell' },
            { id: 'a2', date: '2024-05-14', description: 'Dividend Payment', amount: 450.00, type: 'Div' },
        ],
        balance: {
            equity: 1250000.00,
            securityValue: 850000.00,
            marginRequirement: 350000.00,
            fundsAvailable: 250000.00,
            dayTradeBuyingPower: 1000000.00,
            houseSurplus: 15000.00,
            sma: 85000.00
        }
    },
    {
        id: '2',
        accountNumber: '892103',
        ownerName: 'High Octane Fund',
        totalEquity: 450000.00,
        moneyMarketFunds: 10000.00,
        securityValue: 550000.00, // Cash = 450k - (550k + 10k) = -110k (Red)
        excessLiquidity: -15000.00, // Red + CASH DUE
        status: 'House Call',
        positions: [
            {
                symbol: 'AMD',
                description: 'Advanced Micro Devices',
                quantity: 3000,
                price: 150.00,
                value: 450000.00,
                ytdPerformance: 8.5
            },
            {
                symbol: 'PLTR',
                description: 'Palantir Technologies',
                quantity: 5000,
                price: 24.50,
                value: 122500.00,
                ytdPerformance: 22.1
            }
        ],
        activity: [
            { id: 'b1', date: '2024-05-15', description: 'Bought 500 AMD', amount: -75000.00, type: 'Buy' },
        ],
        balance: {
            equity: 450000.00,
            securityValue: 550000.00,
            marginRequirement: 465000.00,
            fundsAvailable: -15000.00,
            dayTradeBuyingPower: 0.00,
            houseSurplus: -5000.00,
            sma: -2000.00
        }
    },
    {
        id: '3',
        accountNumber: '445982',
        ownerName: 'Conservative Growth Trust',
        totalEquity: 2100000.00,
        moneyMarketFunds: 1500000.00,
        securityValue: 600000.00, // Cash = 2.1M - (600k + 1.5M) = 0
        excessLiquidity: 1500000.00,
        status: 'Safe',
        positions: [
            {
                symbol: 'VTI',
                description: 'Vanguard Total Stock Market',
                quantity: 2500,
                price: 240.00,
                value: 600000.00,
                ytdPerformance: 5.4
            }
        ],
        activity: [
            { id: 'c1', date: '2024-05-10', description: 'Deposit', amount: 50000.00, type: 'Transfer' },
        ],
        balance: {
            equity: 2100000.00,
            securityValue: 600000.00,
            marginRequirement: 150000.00,
            fundsAvailable: 1500000.00,
            dayTradeBuyingPower: 5000000.00,
            houseSurplus: 1500000.00,
            sma: 1500000.00
        }
    },
    {
        id: '4',
        accountNumber: '112233',
        ownerName: 'Speculative Ventures',
        totalEquity: 85000.00,
        moneyMarketFunds: 0.00,
        securityValue: 120000.00, // Cash = 85k - 120k = -35k
        excessLiquidity: 5000.00, // Positive excess liq, but negative cash, warning?
        status: 'Warning',
        positions: [
            {
                symbol: 'GME',
                description: 'GameStop Corp.',
                quantity: 4000,
                price: 30.00,
                value: 120000.00,
                ytdPerformance: -45.0
            }
        ],
        activity: [],
        balance: {
            equity: 85000.00,
            securityValue: 120000.00,
            marginRequirement: 80000.00,
            fundsAvailable: 5000.00,
            dayTradeBuyingPower: 10000.00,
            houseSurplus: 2000.00,
            sma: 0
        }
    }
];
