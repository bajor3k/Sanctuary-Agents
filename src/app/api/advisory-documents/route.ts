import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import * as path from 'path';
import { analyzeAdvisoryPdf } from '@/ai/flows/analyze-advisory-pdf';

const DOCUMENTS_FOLDER = '/Users/bajor3k/Desktop/Orion Advisory';

// Allowed file extensions
const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.doc'];

interface DocumentFile {
    id: string;
    filename: string;
    path: string;
    size: number;
    createdAt: string;
    modifiedAt: string;
    extension: string;
    // AI-extracted fields (up to 29 total for 2-holder accounts)
    discretionary?: string;
    wrap?: string;
    advisorName?: string;
    repCode?: string;
    clientName?: string;
    effectiveDate?: string;
    accountHolders?: number;
    advReceivedDate?: string;
    // Page 11 - Client 1  
    clientSignedP11?: string;
    clientNameP11?: string;
    clientDateP11?: string;
    // Page 11 - Client 2 (optional)
    client2SignedP11?: string;
    client2NameP11?: string;
    client2DateP11?: string;
    // Page 11 - Advisor
    advisorSignedP11?: string;
    advisorNameP11?: string;
    advisorDateP11?: string;
    accountNumber?: string;
    feeType?: string;
    feeAmount?: string;
    // Page 14 - Client 1
    clientSignedP14?: string;
    clientNameP14?: string;
    clientDateP14?: string;
    // Page 14 - Client 2 (optional)
    client2SignedP14?: string;
    client2NameP14?: string;
    client2DateP14?: string;
    // Page 14 - Advisor
    advisorSignedP14?: string;
    advisorNameP14?: string;
    advisorDateP14?: string;
}

// Cache to store AI analysis results
const analysisCache = new Map<string, any>();

export async function GET() {
    try {
        console.log('[Advisory API] Starting document fetch...');
        console.log('[Advisory API] Documents folder:', DOCUMENTS_FOLDER);

        // Check if the folder exists
        try {
            await fs.access(DOCUMENTS_FOLDER);
            console.log('[Advisory API] Folder access confirmed');
        } catch (accessError) {
            console.error('[Advisory API] Folder access failed:', accessError);
            // Return success with empty documents instead of 404
            return NextResponse.json(
                {
                    success: true,
                    documents: [],
                    count: 0,
                    folder: DOCUMENTS_FOLDER,
                    warning: 'Documents folder not found'
                },
                { status: 200 }
            );
        }

        // Read the directory
        console.log('[Advisory API] Reading directory...');
        const files = await fs.readdir(DOCUMENTS_FOLDER);
        console.log('[Advisory API] Found files:', files.length);

        // Get file stats and filter by extension
        const documents: DocumentFile[] = [];

        // Process files sequentially to avoid rate limits (max 10 requests/minute)
        for (const filename of files) {
            const filePath = path.join(DOCUMENTS_FOLDER, filename);

            try {
                const stats = await fs.stat(filePath);

                // Skip directories
                if (stats.isDirectory()) {
                    continue;
                }

                const extension = path.extname(filename).toLowerCase();

                // Filter by allowed extensions
                if (!ALLOWED_EXTENSIONS.includes(extension)) {
                    continue;
                }

                const docId = `${filename}-${stats.mtimeMs}`;

                const document: DocumentFile = {
                    id: docId,
                    filename,
                    path: filePath,
                    size: stats.size,
                    createdAt: stats.birthtime.toISOString(),
                    modifiedAt: stats.mtime.toISOString(),
                    extension,
                };

                // Only analyze PDFs
                if (extension === '.pdf') {
                    // Check cache first
                    if (analysisCache.has(docId)) {
                        const cachedAnalysis = analysisCache.get(docId);
                        console.log(`[AI] Using cached analysis for: ${filename}`);
                        Object.assign(document, cachedAnalysis);
                    } else {
                        try {
                            console.log(`[AI] Starting analysis for: ${filename}`);
                            // Analyze the PDF with AI
                            const analysis = await analyzeAdvisoryPdf(filePath);
                            console.log(`[AI] Analysis result for ${filename}:`, JSON.stringify(analysis, null, 2));

                            // Add analysis to document (all fields including optional client2)
                            Object.assign(document, {
                                discretionary: analysis.discretionary,
                                wrap: analysis.wrap,
                                advisorName: analysis.advisorName,
                                repCode: analysis.repCode,
                                clientName: analysis.clientName,
                                effectiveDate: analysis.effectiveDate,
                                accountHolders: analysis.accountHolders,
                                advReceivedDate: analysis.advReceivedDate,

                                clientSignedP11: analysis.clientSignedP11,
                                clientNameP11: analysis.clientNameP11,
                                clientDateP11: analysis.clientDateP11,
                                client2SignedP11: analysis.client2SignedP11,
                                client2NameP11: analysis.client2NameP11,
                                client2DateP11: analysis.client2DateP11,
                                advisorSignedP11: analysis.advisorSignedP11,
                                advisorNameP11: analysis.advisorNameP11,
                                advisorDateP11: analysis.advisorDateP11,

                                accountNumber: analysis.accountNumber,
                                feeType: analysis.feeType,
                                feeAmount: analysis.feeAmount,

                                clientSignedP14: analysis.clientSignedP14,
                                clientNameP14: analysis.clientNameP14,
                                clientDateP14: analysis.clientDateP14,
                                client2SignedP14: analysis.client2SignedP14,
                                client2NameP14: analysis.client2NameP14,
                                client2DateP14: analysis.client2DateP14,
                                advisorSignedP14: analysis.advisorSignedP14,
                                advisorNameP14: analysis.advisorNameP14,
                                advisorDateP14: analysis.advisorDateP14,
                            });

                            // Cache the result
                            analysisCache.set(docId, analysis);
                            console.log(`[AI] Successfully analyzed and cached: ${filename}`);

                            // Rate limiting: Wait 7 seconds between API calls (10 requests/min = 6s, adding buffer)
                            await new Promise(resolve => setTimeout(resolve, 7000));
                        } catch (analysisError) {
                            console.error(`[AI] Analysis failed for ${filename}:`, analysisError);
                            // Set all to "Missing" on error (all 23 fields)
                            Object.assign(document, {
                                discretionary: 'Missing',
                                wrap: 'Missing',
                                advisorName: 'Missing',
                                repCode: 'Missing',
                                clientName: 'Missing',
                                effectiveDate: 'Missing',
                                accountHolders: 1,
                                advReceivedDate: 'Missing',
                                clientSignedP11: 'Missing',
                                clientNameP11: 'Missing',
                                clientDateP11: 'Missing',
                                advisorSignedP11: 'Missing',
                                advisorNameP11: 'Missing',
                                advisorDateP11: 'Missing',
                                accountNumber: 'Missing',
                                feeType: 'Missing',
                                feeAmount: 'Missing',
                                clientSignedP14: 'Missing',
                                clientNameP14: 'Missing',
                                clientDateP14: 'Missing',
                                advisorSignedP14: 'Missing',
                                advisorNameP14: 'Missing',
                                advisorDateP14: 'Missing',
                            });
                        }
                    }
                }

                documents.push(document);
            } catch (error) {
                console.error(`Error reading file ${filename}:`, error);
            }
        }

        // Sort by modified date (newest first)
        documents.sort((a, b) =>
            new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime()
        );

        return NextResponse.json({
            success: true,
            documents,
            count: documents.length,
            folder: DOCUMENTS_FOLDER,
        });
    } catch (error) {
        console.error('Error reading documents folder:', error);
        return NextResponse.json(
            {
                error: 'Failed to read documents folder',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
