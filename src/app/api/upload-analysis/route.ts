import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const blankFile = formData.get('blankPdf') as File | null;
        const filledFile = formData.get('filledPdf') as File | null;

        if (!blankFile || !filledFile) {
            return NextResponse.json(
                { error: 'Both blank and filled PDF files are required' },
                { status: 400 }
            );
        }

        // Create output folder if it doesn't exist
        const outputFolder = '/Users/bajor3k/Desktop/AA Dummy/Analysis';
        await fs.mkdir(outputFolder, { recursive: true });

        // Save blank file
        const blankBuffer = Buffer.from(await blankFile.arrayBuffer());
        const blankPath = path.join(outputFolder, 'analysis_template.pdf');
        await fs.writeFile(blankPath, blankBuffer);

        // Save filled file
        const filledBuffer = Buffer.from(await filledFile.arrayBuffer());
        const filledPath = path.join(outputFolder, 'analysis_example.pdf');
        await fs.writeFile(filledPath, filledBuffer);

        return NextResponse.json({
            success: true,
            message: 'Analysis files uploaded successfully',
            paths: {
                blank: blankPath,
                filled: filledPath
            }
        });

    } catch (error) {
        console.error('Error uploading analysis files:', error);
        return NextResponse.json(
            { error: 'Failed to upload files', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
