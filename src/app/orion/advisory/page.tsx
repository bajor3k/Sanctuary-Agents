'use client';

import { useCallback, useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, History, FileText, CheckCircle2, XCircle, Pencil, ChevronDown, ArrowUpFromLine, RefreshCw, FileCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

interface HistoryItem {
    id: string;
    fileName: string;
    timestamp: Date;
    status: 'success' | 'error';
    message: string;
    // Excel data fields
    discretion: string;
    wrap: string;
    clientsName: string;
    effectiveDate: string;
    clientSignaturePage11: string;
    clientDatePage11: string;
    accountNumber: string;
    feeType: string;
    feeAmount: string;
    advReceivedDate: string;
    clientSignaturePage14: string;
    clientDatePage14: string;
}

interface ExtractedData {
    // Page 1 (checkboxes at top + fields)
    discretionary: string;
    wrap: string;
    advisorName: string;
    repCode: string;
    clientName: string;
    effectiveDate: string;
    accountHolders: number;

    // Page 10
    advReceivedDate: string;

    // Page 11 - Client 1
    clientSignedP11: string;
    clientNameP11: string;
    clientDateP11: string;
    // Page 11 - Client 2 (optional)
    client2SignedP11?: string;
    client2NameP11?: string;
    client2DateP11?: string;
    // Page 11 - Advisor
    advisorSignedP11: string;
    advisorNameP11: string;
    advisorDateP11: string;

    // Page 12
    accountNumber: string;

    // Page 13
    feeType: string;
    feeAmount: string;

    // Page 14 - Client 1
    clientSignedP14: string;
    clientNameP14: string;
    clientDateP14: string;
    // Page 14 - Client 2 (optional)
    client2SignedP14?: string;
    client2NameP14?: string;
    client2DateP14?: string;
    // Page 14 - Advisor
    advisorSignedP14: string;
    advisorNameP14: string;
    advisorDateP14: string;
}

const dropdownOptions: Record<string, string[]> = {
    'discretionary': ['Discretionary', 'Non-Discretionary', 'Missing', 'Error'],
    'wrap': ['WRAP', 'Non-WRAP', 'Missing', 'Error'],
    'feeType': ['Flat', 'Tiered', 'Missing', 'Error'],
    'clientSignedP11': ['Yes', 'No', 'Missing', 'Error'],
    'advisorSignedP11': ['Yes', 'No', 'Missing', 'Error'],
    'clientSignedP14': ['Yes', 'No', 'Missing', 'Error'],
    'advisorSignedP14': ['Yes', 'No', 'Missing', 'Error']
};

interface DetectedDocument {
    id: string;
    filename: string;
    path: string;
    size: number;
    createdAt: string;
    modifiedAt: string;
    extension: string;
}

export default function AdvisoryAgentsPage() {
    const { accessToken } = useAuth();
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [advisoryReviewSearchQuery, setAdvisoryReviewSearchQuery] = useState('');
    const [historyFilter, setHistoryFilter] = useState<'all' | 'igo' | 'nigo'>('all');
    const [advisoryReviewFilter, setAdvisoryReviewFilter] = useState<'all' | 'igo' | 'nigo'>('all');
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

    // Document detection state
    const [detectedDocuments, setDetectedDocuments] = useState<DetectedDocument[]>([]);
    const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
    const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);
    const [documentError, setDocumentError] = useState<string | null>(null);
    // Local overrides for detected documents (to allow editing without persisting to file yet)
    const [detectedDocumentOverrides, setDetectedDocumentOverrides] = useState<Record<string, Partial<Account>>>({});

    // Fetch detected documents from API
    const fetchDetectedDocuments = useCallback(async () => {
        setIsLoadingDocuments(true);
        setDocumentError(null);

        try {
            console.log('[Advisory Page] Fetching documents from API...');
            const response = await fetch('/api/advisory-documents', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            console.log('[Advisory Page] Response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('[Advisory Page] HTTP error:', response.status, errorText);
                setDocumentError(`HTTP ${response.status}: ${errorText}`);
                return;
            }

            const data = await response.json();
            console.log('[Advisory Page] Response data:', data);

            if (data.success) {
                setDetectedDocuments(data.documents || []);
                setLastRefreshTime(new Date());
                console.log('[Advisory Page] Successfully loaded', data.documents?.length || 0, 'documents');
            } else {
                const errorMsg = data.error || 'Failed to fetch documents';
                console.error('[Advisory Page] API returned error:', errorMsg);
                setDocumentError(errorMsg);
            }
        } catch (error) {
            console.error('[Advisory Page] Fetch error:', error);
            const errorMsg = error instanceof Error ? error.message : 'Unable to connect to document service';
            setDocumentError(errorMsg);
        } finally {
            setIsLoadingDocuments(false);
        }
    }, []);

    // Auto-refresh detected documents (disabled to avoid timeout during long AI processing)
    useEffect(() => {
        // Initial fetch
        fetchDetectedDocuments();

        // Disabled auto-polling - use manual refresh button instead
        // const intervalId = setInterval(fetchDetectedDocuments, 5000);
        // return () => clearInterval(intervalId);
    }, [fetchDetectedDocuments]);

    // Helper function to check if a history item is NIGO
    const isHistoryItemNigo = (item: HistoryItem): boolean => {
        const nigoValues = ['Missing', 'Error', 'Not Found'];
        const signatureDateFields = ['clientSignaturePage11', 'clientDatePage11', 'clientSignaturePage14', 'clientDatePage14'];

        // Check all fields
        const fields: (keyof HistoryItem)[] = [
            'discretion', 'wrap', 'clientsName', 'effectiveDate',
            'clientSignaturePage11', 'clientDatePage11', 'accountNumber',
            'feeType', 'feeAmount', 'advReceivedDate',
            'clientSignaturePage14', 'clientDatePage14'
        ];

        return fields.some(field => {
            const value = item[field] as string;
            // For signature/date fields, only "Yes" is valid
            if (signatureDateFields.includes(field as string)) {
                return value !== 'Yes';
            }
            // For other fields, check if it's a NIGO value
            return nigoValues.includes(value);
        });
    };

    const filteredHistory = history
        .filter(item => {
            // Filter by search query
            const matchesSearch = item.fileName.toLowerCase().includes(searchQuery.toLowerCase());

            // Filter by IGO/NIGO status
            if (historyFilter === 'igo') {
                return matchesSearch && !isHistoryItemNigo(item);
            } else if (historyFilter === 'nigo') {
                return matchesSearch && isHistoryItemNigo(item);
            }

            return matchesSearch;
        });

    // Helper to check if a value is valid
    const isValidValue = (key: string, value: string) => {
        // General invalid values
        if (!value || value === 'Not Found' || value === 'Missing' || value === 'Error') return false;

        // Signature fields - must be "Yes" (or "N/A" for optional client2)
        const signatureFields = [
            'clientSignedP11', 'advisorSignedP11',
            'clientSignedP14', 'advisorSignedP14',
            'client2SignedP11', 'client2SignedP14'
        ];
        if (signatureFields.includes(key)) {
            return value === 'Yes' || value === 'N/A';
        }

        // Optional client2 fields - N/A or value is OK
        const optionalFields = ['client2NameP11', 'client2DateP11', 'client2NameP14', 'client2DateP14'];
        if (optionalFields.includes(key)) {
            return value !== 'Missing' && value !== 'Error' && value !== '';
        }

        // accountHolders - numeric validation
        if (key === 'accountHolders') {
            const num = Number(value);
            return num === 1 || num === 2;
        }

        // For other fields, as long as it's not in the general invalid list, it's valid
        // (Discretionary, Wrap, Fee Type, Fee Amount etc.)
        return true;
    };

    // Dummy data for Advisory Agreement Review
    interface Account extends ExtractedData {
        id: string;
        status: 'igo' | 'nigo';
        pdfPath?: string; // Optional path to PDF file
    }

    // accounts state - empty initially, will be populated by detected documents
    const [accounts, setAccounts] = useState<Account[]>([]);

    // Convert detected documents to Account objects using AI-extracted data
    // Defined here so it's available for selection logic below
    const detectedDocumentAccounts: Account[] = detectedDocuments.map(doc => {
        const id = `detected-${doc.id}`;
        const overrides = detectedDocumentOverrides[id] || {};

        // Use AI-extracted values from the API, with overrides taking precedence
        const account = {
            id,
            // Page 1
            discretionary: (doc as any).discretionary || 'Missing',
            wrap: (doc as any).wrap || 'Missing',
            advisorName: (doc as any).advisorName || 'Missing',
            repCode: (doc as any).repCode || 'Missing',
            clientName: (doc as any).clientName || 'Missing',
            effectiveDate: (doc as any).effectiveDate || 'Missing',
            accountHolders: (doc as any).accountHolders || 1,

            // Page 10
            advReceivedDate: (doc as any).advReceivedDate || 'Missing',

            // Page 11 - Client 1
            clientSignedP11: (doc as any).clientSignedP11 || 'Missing',
            clientNameP11: (doc as any).clientNameP11 || 'Missing',
            clientDateP11: (doc as any).clientDateP11 || 'Missing',
            // Page 11 - Client 2 (optional)
            client2SignedP11: (doc as any).client2SignedP11,
            client2NameP11: (doc as any).client2NameP11,
            client2DateP11: (doc as any).client2DateP11,
            // Page 11 - Advisor
            advisorSignedP11: (doc as any).advisorSignedP11 || 'Missing',
            advisorNameP11: (doc as any).advisorNameP11 || 'Missing',
            advisorDateP11: (doc as any).advisorDateP11 || 'Missing',

            // Page 12
            accountNumber: (doc as any).accountNumber || doc.filename,

            // Page 13
            feeType: (doc as any).feeType || 'Missing',
            feeAmount: (doc as any).feeAmount || 'Missing',

            // Page 14 - Client 1
            clientSignedP14: (doc as any).clientSignedP14 || 'Missing',
            clientNameP14: (doc as any).clientNameP14 || 'Missing',
            clientDateP14: (doc as any).clientDateP14 || 'Missing',
            // Page 14 - Client 2 (optional)
            client2SignedP14: (doc as any).client2SignedP14,
            client2NameP14: (doc as any).client2NameP14,
            client2DateP14: (doc as any).client2DateP14,
            // Page 14 - Advisor
            advisorSignedP14: (doc as any).advisorSignedP14 || 'Missing',
            advisorNameP14: (doc as any).advisorNameP14 || 'Missing',
            advisorDateP14: (doc as any).advisorDateP14 || 'Missing',

            status: 'nigo' as const,
            pdfPath: doc.path,
            ...overrides // Apply any local edits
        };

        // Recalculate status for detected document if overrides exist
        const dataKeys = [
            'discretionary', 'wrap', 'advisorName', 'repCode', 'clientName', 'effectiveDate',
            'advReceivedDate',
            'clientSignedP11', 'clientNameP11', 'clientDateP11', 'advisorSignedP11', 'advisorNameP11', 'advisorDateP11',
            'accountNumber',
            'feeType', 'feeAmount',
            'clientSignedP14', 'clientNameP14', 'clientDateP14', 'advisorSignedP14', 'advisorNameP14', 'advisorDateP14'
        ];
        // For status calc, we check if all required keys satisfy isValidValue
        const isIgo = dataKeys.every(key => isValidValue(key, account[key as keyof typeof account] as string));
        account.status = isIgo ? 'igo' : 'nigo';

        return account;
    });

    // Merge detected documents with existing accounts (detected docs appear first)
    const allAccounts = [...detectedDocumentAccounts, ...accounts];

    const [editingAccount, setEditingAccount] = useState<{ id: string, field: string } | null>(null);
    const [editAccountValue, setEditAccountValue] = useState('');
    const [showTierEditor, setShowTierEditor] = useState(false);
    const [tierEditorValue, setTierEditorValue] = useState('');
    const [tierEditorAccount, setTierEditorAccount] = useState<{ id: string, field: string } | null>(null);

    const handleAccountEditStart = (accountId: string, fieldKey: string, currentValue: string) => {
        // Check if editing tiered fee amount
        const account = allAccounts.find(a => a.id === accountId);
        if (fieldKey === 'feeAmount' && account?.feeType === 'Tiered') {
            // Show tier editor modal instead of inline edit
            setTierEditorAccount({ id: accountId, field: fieldKey });
            setTierEditorValue(currentValue || '$0 To $500,000: 1.00%\n$500,000 To $1,000,000: 0.85%\n$1,000,000 To $2,000,000: 0.75%\n$2,000,000 To $5,000,000: 0.50%');
            setShowTierEditor(true);
            return;
        }

        // Standard edit flow
        setEditingAccount({ id: accountId, field: fieldKey });
        const options = dropdownOptions[fieldKey];
        if (options && (currentValue === 'Not Found' || currentValue === 'Missing' || !currentValue)) {
            setEditAccountValue(options[0]);
        } else {
            setEditAccountValue(currentValue === 'Not Found' ? '' : currentValue);
        }
    };

    const handleAccountEditSave = () => {
        if (!editingAccount) return;

        // Check if editing a detected document
        if (editingAccount.id.startsWith('detected-')) {
            setDetectedDocumentOverrides(prev => {
                const existingOverrides = prev[editingAccount.id] || {};
                return {
                    ...prev,
                    [editingAccount.id]: {
                        ...existingOverrides,
                        [editingAccount.field]: editAccountValue
                    }
                };
            });
            setEditingAccount(null);
            setEditAccountValue('');
            return;
        }

        setAccounts(prev => prev.map(acc => {
            if (acc.id === editingAccount.id) {
                const updatedAccount = { ...acc, [editingAccount.field]: editAccountValue };

                // Recalculate status
                const dataKeys = [
                    'discretionary', 'wrap', 'clientName', 'effectiveDate',
                    'clientSignedP11', 'clientDatedP11', 'accountNumber',
                    'feeType', 'feeAmount', 'advReceivedDate',
                    'clientSignedP14', 'clientDatedP14'
                ];

                const isIgo = dataKeys.every(key => isValidValue(key, updatedAccount[key as keyof typeof updatedAccount] as string));
                updatedAccount.status = isIgo ? 'igo' : 'nigo';

                return updatedAccount;
            }
            return acc;
        }));
        setEditingAccount(null);
        setEditAccountValue('');
    };

    const handleAccountEditCancel = () => {
        setEditingAccount(null);
        setEditAccountValue('');
    };

    const handleTierEditorSave = () => {
        if (!tierEditorAccount) return;

        // Check if editing a detected document
        if (tierEditorAccount.id.startsWith('detected-')) {
            setDetectedDocumentOverrides(prev => {
                const existingOverrides = prev[tierEditorAccount.id] || {};
                return {
                    ...prev,
                    [tierEditorAccount.id]: {
                        ...existingOverrides,
                        [tierEditorAccount.field]: tierEditorValue
                    }
                };
            });
        } else {
            // Update regular account
            setAccounts(prev => prev.map(acc => {
                if (acc.id === tierEditorAccount.id) {
                    return { ...acc, [tierEditorAccount.field]: tierEditorValue };
                }
                return acc;
            }));
        }

        setShowTierEditor(false);
        setTierEditorAccount(null);
        setTierEditorValue('');
    };

    const handleTierEditorCancel = () => {
        setShowTierEditor(false);
        setTierEditorAccount(null);
        setTierEditorValue('');
    };

    const [isPushModalOpen, setIsPushModalOpen] = useState(false);
    const [selectedAccounts, setSelectedAccounts] = useState<Set<string>>(new Set());

    const toggleAccountSelection = (id: string, event: React.SyntheticEvent) => {
        event.stopPropagation();
        setSelectedAccounts(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const handleFilterChange = (newFilter: 'all' | 'igo' | 'nigo') => {
        const targetIds = allAccounts.filter(account => {
            const matchesSearch = account.accountNumber.toLowerCase().includes(advisoryReviewSearchQuery.toLowerCase()) ||
                account.clientName.toLowerCase().includes(advisoryReviewSearchQuery.toLowerCase());
            if (newFilter === 'igo') return matchesSearch && account.status === 'igo';
            if (newFilter === 'nigo') return matchesSearch && account.status === 'nigo';
            return matchesSearch;
        }).map(a => a.id);

        if (newFilter === advisoryReviewFilter) {
            const isAllSelected = targetIds.length > 0 && targetIds.every(id => selectedAccounts.has(id));
            if (isAllSelected) {
                setSelectedAccounts(new Set());
            } else {
                setSelectedAccounts(new Set(targetIds));
            }
        } else {
            setAdvisoryReviewFilter(newFilter);
            setSelectedAccounts(new Set(targetIds));
        }
    };

    // Derived state for the message to avoid synchronization issues
    const getPushMessage = () => {
        if (selectedAccounts.size > 0) {
            const selectedItems = allAccounts.filter(a => selectedAccounts.has(a.id));
            const allNigo = selectedItems.length > 0 && selectedItems.every(a => a.status === 'nigo');

            if (allNigo) {
                return `You are getting ready to send reject emails to advisors for ${selectedAccounts.size} accounts. Do you want to proceed?`;
            }
            return `You are getting ready to update ${selectedAccounts.size} selected accounts in Orion, do you want to proceed?`;
        }

        if (advisoryReviewFilter === 'igo') {
            return "You are getting ready to update IGO accounts in Orion, do you want to proceed?";
        } else if (advisoryReviewFilter === 'nigo') {
            return "You are getting ready to send reject emails to advisors. Do you want to proceed?";
        }
        return "You are getting ready to update all accounts in Orion, do you want to proceed?";
    };

    const handlePushClick = () => {
        setIsPushModalOpen(true);
    };

    const handlePushConfirm = () => {
        // Logic to push would go here
        setIsPushModalOpen(false);
    };

    const filteredAccounts = allAccounts.filter(account => {
        const matchesSearch = account.accountNumber.toLowerCase().includes(advisoryReviewSearchQuery.toLowerCase()) ||
            account.clientName.toLowerCase().includes(advisoryReviewSearchQuery.toLowerCase());

        if (advisoryReviewFilter === 'igo') {
            return matchesSearch && account.status === 'igo';
        } else if (advisoryReviewFilter === 'nigo') {
            return matchesSearch && account.status === 'nigo';
        }
        return matchesSearch;
    });

    const toggleRow = (id: string) => {
        setExpandedRows(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    return (
        <div className="p-8 max-w-[1600px] mx-auto space-y-8">

            {/* Pending Review Card (Full Width) */}
            <div className="w-full rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-zinc-200 dark:border-zinc-800/30 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <h2 className="text-base font-semibold text-foreground">Pending Review</h2>
                            {/* Document count badge - shows newly detected documents */}
                            {(filteredAccounts.length > 0 || detectedDocuments.length > 0) && (
                                <span className={cn(
                                    "flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full text-xs font-semibold transition-colors border",
                                    advisoryReviewFilter === 'all' && "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700",
                                    advisoryReviewFilter === 'igo' && "bg-emerald-500/10 text-emerald-600 border-emerald-200",
                                    advisoryReviewFilter === 'nigo' && "bg-red-500/10 text-red-600 border-red-200"
                                )}>
                                    {filteredAccounts.length}
                                </span>
                            )}
                            {/* Loading indicator */}
                            {isLoadingDocuments && (
                                <RefreshCw className="w-4 h-4 text-muted-foreground animate-spin" />
                            )}
                        </div>

                        {/* Filter Buttons */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handleFilterChange('all')}
                                className={cn(
                                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                                    advisoryReviewFilter === 'all'
                                        ? "bg-blue-500/10 text-blue-600 border border-blue-200 shadow-sm dark:bg-primary dark:text-primary-foreground dark:border-none"
                                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                                )}
                            >
                                All
                            </button>
                            <button
                                onClick={() => handleFilterChange('igo')}
                                className={cn(
                                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                                    advisoryReviewFilter === 'igo'
                                        ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border border-emerald-200 shadow-sm"
                                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                                )}
                            >
                                IGO
                            </button>
                            <button
                                onClick={() => handleFilterChange('nigo')}
                                className={cn(
                                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                                    advisoryReviewFilter === 'nigo'
                                        ? "bg-red-500/10 text-red-600 hover:bg-red-500/20 border border-red-200 shadow-sm"
                                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                                )}
                            >
                                NIGO
                            </button>
                        </div>

                        {/* Error indicator */}
                        {documentError && (
                            <span className="flex items-center gap-1.5 text-xs text-destructive">
                                <AlertCircle className="w-3.5 h-3.5" />
                                {documentError}
                            </span>
                        )}
                    </div>

                    {/* Right Side: Push Button & Search */}
                    <div className="flex items-center gap-3">
                        {/* Manual Refresh Button */}
                        <button
                            onClick={fetchDetectedDocuments}
                            disabled={isLoadingDocuments}
                            className="flex items-center gap-2 px-3 py-2 bg-muted hover:bg-muted/80 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Refresh detected documents"
                        >
                            <RefreshCw className={cn("w-4 h-4", isLoadingDocuments && "animate-spin")} />
                        </button>

                        {/* Push Button */}
                        <button
                            onClick={handlePushClick}
                            disabled={selectedAccounts.size === 0}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border border-blue-200 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90 dark:border-none"
                        >
                            <ArrowUpFromLine className="w-4 h-4" />
                            <span>Push</span>
                        </button>

                        {/* Search Bar */}
                        <div className="relative w-64">
                            <input
                                type="text"
                                placeholder="Search..."
                                value={advisoryReviewSearchQuery}
                                onChange={(e) => setAdvisoryReviewSearchQuery(e.target.value)}
                                className="w-full h-10 pl-4 pr-10 rounded-xl border border-border bg-muted/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground/50">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="p-4">
                    {/* Existing accounts list (now includes detected documents as rows) */}
                    {filteredAccounts.length > 0 ? (
                        <div className="space-y-1">
                            {filteredAccounts.map((account) => {
                                const isExpanded = expandedRows.has(account.id);
                                const accountDataPoints = [
                                    // Page 1
                                    { label: 'Discretionary', value: account.discretionary, key: 'discretionary' },
                                    { label: 'WRAP', value: account.wrap, key: 'wrap' },
                                    { label: 'Advisor Name', value: account.advisorName, key: 'advisorName' },
                                    { label: 'Rep Code', value: account.repCode, key: 'repCode' },
                                    { label: 'Client Name', value: account.clientName, key: 'clientName' },
                                    { label: 'Effective Date', value: account.effectiveDate, key: 'effectiveDate' },

                                    // Page 10
                                    { label: 'ADV Received Date', value: account.advReceivedDate, key: 'advReceivedDate' },

                                    // Page 11 - Client 1
                                    { label: 'Client 1 Signed', value: account.clientSignedP11, key: 'clientSignedP11' },
                                    { label: 'Client 1 Name', value: account.clientNameP11, key: 'clientNameP11' },
                                    { label: 'Client 1 Date', value: account.clientDateP11, key: 'clientDateP11' },

                                    // Page 11 - Client 2 (conditional)
                                    ...(account.client2SignedP11 && account.client2SignedP11 !== 'N/A' ? [
                                        { label: 'Client 2 Signed', value: account.client2SignedP11, key: 'client2SignedP11' },
                                        { label: 'Client 2 Name', value: account.client2NameP11 || 'Missing', key: 'client2NameP11' },
                                        { label: 'Client 2 Date', value: account.client2DateP11 || 'Missing', key: 'client2DateP11' },
                                    ] : []),

                                    // Page 11 - Advisor
                                    { label: 'Advisor Signed', value: account.advisorSignedP11, key: 'advisorSignedP11' },
                                    { label: 'Advisor Name', value: account.advisorNameP11, key: 'advisorNameP11' },
                                    { label: 'Advisor Date', value: account.advisorDateP11, key: 'advisorDateP11' },

                                    // Page 12
                                    { label: 'Account Number', value: account.accountNumber, key: 'accountNumber' },

                                    // Page 13
                                    { label: 'Fee Type', value: account.feeType, key: 'feeType' },
                                    { label: 'Fee Amount', value: account.feeAmount, key: 'feeAmount' },

                                    // Page 14 - Client 1
                                    { label: 'Client 1 Signed', value: account.clientSignedP14, key: 'clientSignedP14' },
                                    { label: 'Client 1 Name', value: account.clientNameP14, key: 'clientNameP14' },
                                    { label: 'Client 1 Date', value: account.clientDateP14, key: 'clientDateP14' },

                                    // Page 14 - Client 2 (conditional)
                                    ...(account.client2SignedP14 && account.client2SignedP14 !== 'N/A' ? [
                                        { label: 'Client 2 Signed', value: account.client2SignedP14, key: 'client2SignedP14' },
                                        { label: 'Client 2 Name', value: account.client2NameP14 || 'Missing', key: 'client2NameP14' },
                                        { label: 'Client 2 Date', value: account.client2DateP14 || 'Missing', key: 'client2DateP14' },
                                    ] : []),

                                    // Page 14 - Advisor
                                    { label: 'Advisor Signed', value: account.advisorSignedP14, key: 'advisorSignedP14' },
                                    { label: 'Advisor Name', value: account.advisorNameP14, key: 'advisorNameP14' },
                                    { label: 'Advisor Date', value: account.advisorDateP14, key: 'advisorDateP14' },
                                ];

                                return (
                                    <div key={account.id} className="rounded-xl border border-border bg-card overflow-hidden">
                                        {/* Collapsible Header Row */}
                                        <div
                                            onClick={() => toggleRow(account.id)}
                                            className="flex items-center p-4 cursor-pointer hover:bg-muted/20 transition-colors gap-4"
                                        >
                                            {/* Grid Layout for Even Spacing with Checkbox */}
                                            <div className="flex-1 grid grid-cols-[40px_repeat(8,minmax(0,1fr))] gap-4 items-center">
                                                {/* Checkbox */}
                                                <div className="flex flex-col gap-1 items-center">
                                                    <span className="text-[10px] uppercase text-transparent font-semibold tracking-wider select-none">Sel</span>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedAccounts.has(account.id)}
                                                        onChange={(e) => toggleAccountSelection(account.id, e)}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                                                    />
                                                </div>

                                                {/* Account (Fixed First) */}
                                                <div className="flex flex-col gap-1 min-w-0">
                                                    <span className="text-[10px] uppercase text-muted-foreground font-semibold tracking-wider">Account</span>
                                                    <span className="text-sm font-bold text-foreground truncate" title={account.accountNumber}>{account.accountNumber}</span>
                                                </div>

                                                {/* Name */}
                                                <div className="flex flex-col gap-1 min-w-0">
                                                    <span className="text-[10px] uppercase text-muted-foreground font-semibold tracking-wider">Client Name</span>
                                                    <span className="text-sm font-medium text-foreground truncate" title={account.clientName}>{account.clientName}</span>
                                                </div>

                                                {/* Discretion */}
                                                <div className="flex flex-col gap-1 min-w-0">
                                                    <span className="text-[10px] uppercase text-muted-foreground font-semibold tracking-wider">Discretion</span>
                                                    <span className="text-sm font-medium text-muted-foreground truncate" title={account.discretionary}>{account.discretionary}</span>
                                                </div>

                                                {/* Wrap */}
                                                <div className="flex flex-col gap-1 min-w-0">
                                                    <span className="text-[10px] uppercase text-muted-foreground font-semibold tracking-wider">Wrap</span>
                                                    <span className="text-sm font-medium text-muted-foreground truncate" title={account.wrap}>{account.wrap}</span>
                                                </div>

                                                {/* Fee Type */}
                                                <div className="flex flex-col gap-1 min-w-0">
                                                    <span className="text-[10px] uppercase text-muted-foreground font-semibold tracking-wider">Fee Type</span>
                                                    <span className="text-sm font-medium text-muted-foreground truncate" title={account.feeType}>{account.feeType}</span>
                                                </div>

                                                {/* Fee Amount */}
                                                <div className="flex flex-col gap-1 min-w-0">
                                                    <span className="text-[10px] uppercase text-muted-foreground font-semibold tracking-wider">Fee Amt</span>
                                                    <span className="text-sm font-medium text-muted-foreground truncate" title={account.feeAmount}>{account.feeAmount}</span>
                                                </div>

                                                {/* PDF (New Column) */}
                                                <div className="flex flex-col gap-1 min-w-0">
                                                    <span className="text-[10px] uppercase text-muted-foreground font-semibold tracking-wider">PDF</span>
                                                    <button
                                                        onClick={async (e) => {
                                                            e.stopPropagation();
                                                            if (account.pdfPath) {
                                                                // Open PDF in new tab via API endpoint
                                                                // Fetch PDF with auth headers then open blob URL
                                                                try {
                                                                    const pdfUrl = `/api/view-pdf?path=${encodeURIComponent(account.pdfPath)}`;
                                                                    const res = await fetch(pdfUrl, {
                                                                        headers: {
                                                                            'Authorization': `Bearer ${accessToken}`
                                                                        }
                                                                    });
                                                                    if (!res.ok) throw new Error('Failed to load PDF');
                                                                    const blob = await res.blob();
                                                                    const blobUrl = URL.createObjectURL(blob);
                                                                    window.open(blobUrl, '_blank');
                                                                    // Clean up blob URL after a delay
                                                                    setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
                                                                } catch (err) {
                                                                    console.error('Error opening PDF:', err);
                                                                    alert('Failed to open PDF. Please try again.');
                                                                }
                                                            }
                                                        }}
                                                        disabled={!account.pdfPath}
                                                        className={cn(
                                                            "flex items-center gap-1.5 text-sm font-medium transition-colors group/pdf",
                                                            account.pdfPath
                                                                ? "text-muted-foreground hover:text-primary cursor-pointer"
                                                                : "text-muted-foreground/30 cursor-not-allowed"
                                                        )}
                                                    >
                                                        <FileText className="w-4 h-4 group-hover/pdf:text-primary transition-colors" />
                                                        <span>View</span>
                                                    </button>
                                                </div>

                                                {/* Status */}
                                                <div className="flex flex-col gap-1 min-w-0">
                                                    <span className="text-[10px] uppercase text-muted-foreground font-semibold tracking-wider">Status</span>
                                                    <div>
                                                        {account.status === 'igo' ? (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 border border-emerald-200">
                                                                IGO
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-600 border border-red-200">
                                                                NIGO
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Chevron Toggle */}
                                            <div className="shrink-0 pl-4 border-l border-border/50">
                                                <ChevronDown
                                                    className={cn(
                                                        "w-5 h-5 text-muted-foreground transition-transform duration-300",
                                                        isExpanded && "rotate-180"
                                                    )}
                                                />
                                            </div>
                                        </div>

                                        {/* Expanded Data Points (Editable) */}
                                        {isExpanded && (
                                            <div className="border-t border-border bg-muted/5 p-4 animate-in slide-in-from-top-2 duration-200">
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                                                    {accountDataPoints.map((point, index) => {
                                                        const isEditing = editingAccount?.id === account.id && editingAccount?.field === point.key;
                                                        const isFound = isValidValue(point.key, point.value);
                                                        const options = dropdownOptions[point.key];

                                                        return (
                                                            <div
                                                                key={index}
                                                                className={cn(
                                                                    "flex items-center gap-3 p-3 rounded-xl border transition-all group relative",
                                                                    isEditing
                                                                        ? "bg-background border-primary ring-1 ring-primary"
                                                                        : isFound
                                                                            ? "bg-emerald-500/5 border-emerald-500/20"
                                                                            : "bg-destructive/5 border-destructive/20"
                                                                )}
                                                            >
                                                                {isEditing ? (
                                                                    <>
                                                                        {/* Edit Mode */}
                                                                        <div className="flex-1 min-w-0">
                                                                            <span className="text-xs text-muted-foreground mb-1 block">{point.label}</span>
                                                                            {options ? (
                                                                                <select
                                                                                    value={editAccountValue}
                                                                                    onChange={(e) => setEditAccountValue(e.target.value)}
                                                                                    className="w-full h-8 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                                                                    autoFocus
                                                                                >
                                                                                    {options.map(opt => (
                                                                                        <option key={opt} value={opt}>{opt}</option>
                                                                                    ))}
                                                                                </select>
                                                                            ) : (
                                                                                <input
                                                                                    type="text"
                                                                                    value={editAccountValue}
                                                                                    onChange={(e) => setEditAccountValue(e.target.value)}
                                                                                    className="w-full h-8 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                                                                    autoFocus
                                                                                />
                                                                            )}
                                                                        </div>
                                                                        <div className="flex items-center gap-1 shrink-0">
                                                                            <button
                                                                                onClick={handleAccountEditSave}
                                                                                className="p-1.5 rounded-full hover:bg-emerald-500/10 text-emerald-600 transition-colors"
                                                                                title="Save"
                                                                            >
                                                                                <CheckCircle2 className="w-4 h-4" />
                                                                            </button>
                                                                            <button
                                                                                onClick={handleAccountEditCancel}
                                                                                className="p-1.5 rounded-full hover:bg-red-500/10 text-red-600 transition-colors"
                                                                                title="Cancel"
                                                                            >
                                                                                <XCircle className="w-4 h-4" />
                                                                            </button>
                                                                        </div>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        {/* View Mode */}
                                                                        <div className="shrink-0">
                                                                            {isFound ? (
                                                                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                                                            ) : (
                                                                                <XCircle className="w-4 h-4 text-destructive" />
                                                                            )}
                                                                        </div>
                                                                        <span className="text-sm text-muted-foreground shrink-0 min-w-[140px]">
                                                                            {point.label}
                                                                        </span>
                                                                        <div className="flex-1 flex items-center justify-end min-w-0">
                                                                            <span
                                                                                className={cn(
                                                                                    "text-sm font-medium truncate mr-8 transition-opacity",
                                                                                    isFound ? "text-foreground" : "text-destructive/70 italic"
                                                                                )}
                                                                                title={point.value}
                                                                            >
                                                                                {point.value}
                                                                            </span>
                                                                        </div>

                                                                        {/* Edit Button (Absolute positioned) */}
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleAccountEditStart(account.id, point.key, point.value);
                                                                            }}
                                                                            className="absolute right-3 opacity-0 group-hover:opacity-100 p-1.5 rounded-full hover:bg-muted text-muted-foreground transition-all"
                                                                            title="Edit"
                                                                        >
                                                                            <Pencil className="w-3.5 h-3.5" />
                                                                        </button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="py-12 flex flex-col items-center justify-center text-muted-foreground/50 gap-2 border-2 border-dashed border-muted-foreground/10 rounded-2xl">
                            <FileCheck className="w-10 h-10 opacity-20" />
                            <p className="text-sm">
                                {advisoryReviewSearchQuery ? "No matching accounts found" : "No accounts to review"}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Row: History Card (Full Width) */}
            <div className="w-full rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
                {/* Header with Title and Search */}
                <div className="p-4 border-b border-zinc-200 dark:border-zinc-800/30 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h2 className="text-base font-semibold text-foreground">History</h2>

                        {/* Filter Buttons */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setHistoryFilter('all')}
                                className={cn(
                                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                                    historyFilter === 'all'
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                                )}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setHistoryFilter('igo')}
                                className={cn(
                                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                                    historyFilter === 'igo'
                                        ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border border-emerald-200 shadow-sm"
                                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                                )}
                            >
                                IGO
                            </button>
                            <button
                                onClick={() => setHistoryFilter('nigo')}
                                className={cn(
                                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                                    historyFilter === 'nigo'
                                        ? "bg-red-500/10 text-red-600 hover:bg-red-500/20 border border-red-200 shadow-sm"
                                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                                )}
                            >
                                NIGO
                            </button>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="relative w-64">
                        <input
                            type="text"
                            placeholder="Search history..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-10 pl-4 pr-10 rounded-xl border border-border bg-muted/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground/50">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                        </div>
                    </div>
                </div>

                {/* Body - History Table */}
                <div className="p-4">
                    {filteredHistory.length === 0 ? (
                        <div className="py-12 flex flex-col items-center justify-center text-muted-foreground/50 gap-2 border-2 border-dashed border-muted-foreground/10 rounded-2xl">
                            <History className="w-10 h-10 opacity-20" />
                            <p className="text-sm">
                                {searchQuery ? "No matching records found" : "No files processed yet"}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto rounded-lg border border-border">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-muted/50 border-b border-border">
                                        <th className="text-left p-3 font-semibold text-foreground">Discretion</th>
                                        <th className="text-left p-3 font-semibold text-foreground">WRAP</th>
                                        <th className="text-left p-3 font-semibold text-foreground">Name</th>
                                        <th className="text-left p-3 font-semibold text-foreground">Eft Date</th>
                                        <th className="text-left p-3 font-semibold text-foreground">Sig page 11</th>
                                        <th className="text-left p-3 font-semibold text-foreground">Date page 11</th>
                                        <th className="text-left p-3 font-semibold text-foreground">account</th>
                                        <th className="text-left p-3 font-semibold text-foreground">Fee type</th>
                                        <th className="text-left p-3 font-semibold text-foreground">BPS</th>
                                        <th className="text-left p-3 font-semibold text-foreground">ADV received</th>
                                        <th className="text-left p-3 font-semibold text-foreground">Sig page 14</th>
                                        <th className="text-left p-3 font-semibold text-foreground">Date page 14</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredHistory.map((item, idx) => (
                                        <tr key={item.id} className={cn(
                                            "border-b border-border/40 dark:border-white/5 hover:bg-muted/20 transition-colors",
                                            idx === filteredHistory.length - 1 && "border-b-0"
                                        )}>
                                            <td className="p-3 text-muted-foreground">{item.discretion}</td>
                                            <td className="p-3 text-muted-foreground">{item.wrap}</td>
                                            <td className="p-3 text-muted-foreground">{item.clientsName}</td>
                                            <td className="p-3 text-muted-foreground">{item.effectiveDate}</td>
                                            <td className="p-3 text-muted-foreground">{item.clientSignaturePage11}</td>
                                            <td className="p-3 text-muted-foreground">{item.clientDatePage11}</td>
                                            <td className="p-3 text-muted-foreground">{item.accountNumber}</td>
                                            <td className="p-3 text-muted-foreground">{item.feeType}</td>
                                            <td className="p-3 text-muted-foreground">{item.feeAmount}</td>
                                            <td className="p-3 text-muted-foreground">{item.advReceivedDate}</td>
                                            <td className="p-3 text-muted-foreground">{item.clientSignaturePage14}</td>
                                            <td className="p-3 text-muted-foreground">{item.clientDatePage14}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Push Confirmation Modal */}
            {
                isPushModalOpen && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                        <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-xl overflow-hidden scale-100 animate-in zoom-in-95 duration-200">
                            <div className="p-6 flex flex-col items-center text-center gap-4">
                                <div className={cn(
                                    "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
                                    advisoryReviewFilter === 'igo'
                                        ? "bg-emerald-500/10"
                                        : advisoryReviewFilter === 'nigo'
                                            ? "bg-red-500/10"
                                            : "bg-blue-500/10"
                                )}>
                                    <ArrowUpFromLine className={cn(
                                        "w-6 h-6 transition-colors",
                                        advisoryReviewFilter === 'igo'
                                            ? "text-emerald-500"
                                            : advisoryReviewFilter === 'nigo'
                                                ? "text-red-500"
                                                : "text-blue-500"
                                    )} />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-semibold text-foreground">Confirm Push</h3>
                                    <p className="text-sm text-muted-foreground">{getPushMessage()}</p>
                                </div>
                            </div>
                            <div className="p-4 border-t border-border bg-muted/20 flex items-center justify-center gap-3">
                                <button
                                    onClick={() => setIsPushModalOpen(false)}
                                    className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handlePushConfirm}
                                    className={cn(
                                        "px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm text-white",
                                        advisoryReviewFilter === 'igo'
                                            ? "bg-emerald-500 hover:bg-emerald-600"
                                            : advisoryReviewFilter === 'nigo'
                                                ? "bg-red-500 hover:bg-red-600"
                                                : "bg-primary hover:bg-primary/90"
                                    )}
                                >
                                    Proceed
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Tier Editor Modal */}
            {showTierEditor && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={handleTierEditorCancel}>
                    <div className="bg-card border rounded-xl shadow-2xl p-6 max-w-2xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-xl font-bold mb-4">Edit Tiered Fee Structure</h3>

                        <textarea
                            value={tierEditorValue}
                            onChange={(e) => setTierEditorValue(e.target.value)}
                            className="w-full h-64 p-4 border rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                            placeholder="$0 To $500,000: 1.00%&#10;$500,000 To $1,000,000: 0.85%&#10;$1,000,000 To $2,000,000: 0.75%"
                        />

                        <div className="mt-4 text-xs text-muted-foreground">
                            Format: Each line should be: $From To $To: Percentage
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={handleTierEditorCancel}
                                className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleTierEditorSave}
                                className="px-4 py-2 rounded-xl text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
                            >
                                Save Tiers
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
}
