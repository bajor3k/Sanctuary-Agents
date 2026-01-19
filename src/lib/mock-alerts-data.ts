import { faker } from '@faker-js/faker';

export enum AlertCategory {
    SEC_VIOLATION = 'SEC Violation',
    TRADE_VIOLATION = 'Trade Violation',
    MARGIN_ERROR = 'Margin Error',
    CLOSE_TO_MARGIN = 'Close to Margin',
    LOW_CASH = 'Low Cash',
    EXCESSIVE_TRADING = 'Excessive Trading (Non-Managed)',
    LOW_TRADING = 'Not Trading Enough (Managed)',
    SUITABILITY_MISMATCH = 'Suitability Mismatch',
    CONCENTRATION_RISK = 'Concentration Risk',
}

export interface Alert {
    id: string;
    category: AlertCategory;
    severity: 'Critical' | 'High' | 'Medium' | 'Low';
    accountName: string;
    accountNumber: string;
    advisorName: string;
    description: string;
    timestamp: string;
    status: 'Open' | 'Investigating' | 'Resolved';
}

export const generateMockAlerts = (count: number = 20): Alert[] => {
    const alerts: Alert[] = [];

    for (let i = 0; i < count; i++) {
        const category = faker.helpers.enumValue(AlertCategory);
        let severity: Alert['severity'] = 'Medium';
        let description = '';

        switch (category) {
            case AlertCategory.SEC_VIOLATION:
                severity = 'Critical';
                description = 'Potential violation of SEC Rule 10b-5 detected based on trading pattern.';
                break;
            case AlertCategory.TRADE_VIOLATION:
                severity = 'High';
                description = 'Trade execution outside of approved window for this asset class.';
                break;
            case AlertCategory.MARGIN_ERROR:
                severity = 'Critical';
                description = 'Account margin requirement exceeded. Immediate action required.';
                break;
            case AlertCategory.CLOSE_TO_MARGIN:
                severity = 'High';
                description = 'Account is within 5% of margin call threshold.';
                break;
            case AlertCategory.LOW_CASH:
                severity = 'Medium';
                description = 'Cash balance fell below minimum maintenance requirement.';
                break;
            case AlertCategory.EXCESSIVE_TRADING:
                severity = 'High';
                description = 'High frequency trading detected in non-discretionary account.';
                break;
            case AlertCategory.LOW_TRADING:
                severity = 'Medium';
                description = 'Managed account has had zero activity for 90+ days.';
                break;
            case AlertCategory.SUITABILITY_MISMATCH:
                severity = 'High';
                description = 'Account marked "Conservative" holding high-risk assets (options, levered ETFs, crypto) > 10% of portfolio value.';
                break;
            case AlertCategory.CONCENTRATION_RISK:
                severity = 'High';
                description = 'Single position constitutes > 20% of the client\'s total liquid net worth (unless explicitly solicited).';
                break;
        }

        alerts.push({
            id: faker.string.uuid(),
            category,
            severity,
            accountName: faker.person.fullName(),
            accountNumber: faker.finance.accountNumber(8),
            advisorName: faker.person.fullName(),
            description,
            timestamp: faker.date.recent({ days: 7 }).toISOString(),
            status: 'Open',
        });
    }

    // Sort by severity (Critical first)
    const severityOrder = { Critical: 0, High: 1, Medium: 2, Low: 3 };
    return alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
};

export const alertsData = generateMockAlerts(25);
