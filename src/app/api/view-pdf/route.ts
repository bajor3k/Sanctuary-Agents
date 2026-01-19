import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import * as path from 'path';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const filePath = searchParams.get('path');

        if (!filePath) {
            return new NextResponse('File path is required', { status: 400 });
        }

        // Security check: ensure the file is in the Orion Advisory folder
        const DOCUMENTS_FOLDER = '/Users/bajor3k/Desktop/Orion Advisory';
        if (!filePath.startsWith(DOCUMENTS_FOLDER)) {
            return new NextResponse('Access denied', { status: 403 });
        }

        // Check if file exists
        try {
            await fs.access(filePath);
        } catch {
            return new NextResponse('File not found', { status: 404 });
        }

        // Read the file
        const fileBuffer = await fs.readFile(filePath);
        const fileName = path.basename(filePath);

        // Return the PDF with appropriate headers
        return new NextResponse(new Uint8Array(fileBuffer), {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `inline; filename="${fileName}"`,
            },
        });
    } catch (error) {
        console.error('Error serving PDF:', error);
        return new NextResponse('Failed to serve PDF', { status: 500 });
    }
}
