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
    // AI-extracted fields
    discretionary?: string;
    wrap?: string;
    clientName?: string;
    effectiveDate?: string;
    clientSignedP11?: string;
    clientDatedP11?: string;
    accountNumber?: string;
    feeType?: string;
    feeAmount?: string;
    advReceivedDate?: string;
    clientSignedP14?: string;
    clientDatedP14?: string;
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

                            // Add analysis to document
                            Object.assign(document, {
                                discretionary: analysis.discretionary,
                                wrap: analysis.wrap,
                                clientName: analysis.clientName,
                                effectiveDate: analysis.effectiveDate,
                                clientSignedP11: analysis.clientSignedP11,
                                clientDatedP11: analysis.clientDatedP11,
                                accountNumber: analysis.accountNumber,
                                feeType: analysis.feeType,
                                feeAmount: analysis.feeAmount,
                                advReceivedDate: analysis.advReceivedDate,
                                clientSignedP14: analysis.clientSignedP14,
                                clientDatedP14: analysis.clientDatedP14,
                            });

                            // Cache the result
                            analysisCache.set(docId, analysis);
                            console.log(`[AI] Successfully analyzed and cached: ${filename}`);

                            // Rate limiting: Wait 7 seconds between API calls (10 requests/min = 6s, adding buffer)
                            await new Promise(resolve => setTimeout(resolve, 7000));
                        } catch (analysisError) {
                            console.error(`[AI] Analysis failed for ${filename}:`, analysisError);
                            // Set all to "Missing" on error
                            Object.assign(document, {
                                discretionary: 'Missing',
                                wrap: 'Missing',
                                clientName: 'Missing',
                                effectiveDate: 'Missing',
                                clientSignedP11: 'Missing',
                                clientDatedP11: 'Missing',
                                accountNumber: 'Missing',
                                feeType: 'Missing',
                                feeAmount: 'Missing',
                                advReceivedDate: 'Missing',
                                clientSignedP14: 'Missing',
                                clientDatedP14: 'Missing',
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
