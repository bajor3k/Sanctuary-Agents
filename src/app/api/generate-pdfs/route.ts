import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';
import fs from 'fs/promises';
import path from 'path';

// Random data generators
const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Lisa', 'James', 'Mary', 'William', 'Jennifer', 'Richard', 'Linda', 'Thomas', 'Patricia', 'Charles', 'Barbara', 'Daniel', 'Susan'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];
const repCodes = ['ABC', 'DEF', 'GHI', 'JKL', 'MNO', 'PQR', 'STU', 'VWX', 'YZA', 'BCD'];
const feeStructures = ['Flat 1%', 'Flat 1.25%', 'Flat 1.5%', 'Flat 0.75%', 'Flat 2%'];

function randomElement<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randomAccountNumber(): string {
    const prefix = ['PZG', 'ABC', 'XYZ', 'QRS', 'TUV'][Math.floor(Math.random() * 5)];
    const number = Math.floor(100000 + Math.random() * 900000);
    return `${prefix}${number}`;
}

function randomDateInLastMonth(): string {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const randomTime = thirtyDaysAgo.getTime() + Math.random() * (now.getTime() - thirtyDaysAgo.getTime());
    const randomDate = new Date(randomTime);

    const month = String(randomDate.getMonth() + 1).padStart(2, '0');
    const day = String(randomDate.getDate()).padStart(2, '0');
    const year = randomDate.getFullYear();

    return `${month}/${day}/${year}`;
}

export async function POST(request: NextRequest) {
    try {
        const { pdfBase64, count } = await request.json();

        // Determine source PDF
        let pdfBuffer: Buffer;
        const signedTemplatePath = '/Users/bajor3k/Desktop/AA Dummy/Filled AA copy.pdf';

        // Check if local signed template exists
        let useSignedTemplate = false;
        try {
            await fs.access(signedTemplatePath);
            useSignedTemplate = true;
        } catch {
            // Local file doesn't exist
        }

        if (useSignedTemplate) {
            console.log('Using local signed template:', signedTemplatePath);
            const templateBytes = await fs.readFile(signedTemplatePath);
            pdfBuffer = templateBytes;
        } else if (pdfBase64) {
            console.log('Using uploaded template');
            pdfBuffer = Buffer.from(pdfBase64.split(',')[1], 'base64');
        } else {
            return NextResponse.json(
                { error: 'No template available. Please upload a PDF or ensure the signed template exists on the desktop.' },
                { status: 400 }
            );
        }

        // Create output folder if it doesn't exist
        const outputFolder = '/Users/bajor3k/Desktop/Orion Advisory';
        await fs.mkdir(outputFolder, { recursive: true });

        const filePaths: string[] = [];

        // Generate PDFs
        for (let i = 1; i <= parseInt(count); i++) {
            // Generate random data for this PDF
            const advisorFirstName = randomElement(firstNames);
            const advisorLastName = randomElement(lastNames);
            const advisorName = `${advisorFirstName} ${advisorLastName}`;
            const repCode = randomElement(repCodes);
            const clientFirstName = randomElement(firstNames);
            const clientLastName = randomElement(lastNames);
            const clientName = `${clientFirstName} ${clientLastName}`;
            const accountNumber = randomAccountNumber();
            const fee = randomElement(feeStructures);
            const effectiveDate = randomDateInLastMonth();

            // Load the template PDF
            const pdfDoc = await PDFDocument.load(pdfBuffer);
            const form = pdfDoc.getForm();

            // Helper to fill field if it exists
            const fillField = (name: string, value: string) => {
                try {
                    const field = form.getTextField(name);
                    if (field) {
                        field.setText(value);
                    }
                } catch (e) {
                    // Field might not exist or be a different type, ignore
                }
            };

            // 1. FILL ALL STANDARD FIELDS
            fillField('Investment Advisor Representative Name', advisorName);
            fillField('Investment Adviser Name Printed_2', advisorName);
            fillField('Investment Adviser Name Printed_4', advisorName);
            fillField('Rep Code', repCode);
            fillField('Print Client Name Trustee or Authorized Signor', clientName);
            fillField('Client Name Pr', clientName);
            fillField('Client Name Pr_2', clientName);
            fillField('Client Name Printed', clientName);
            fillField('Client Name Printed_2', clientName);
            fillField('Account Registration Name  TypeRow1', accountNumber);
            fillField('Text3', fee);
            fillField('Effective Date', effectiveDate);
            fillField('Date_1', effectiveDate);
            fillField('Date_6', effectiveDate);
            fillField('Date received', effectiveDate);
            fillField('Date_5', effectiveDate);
            fillField('Date_10', effectiveDate);

            // 2. NO SIGNATURE DRAWING NEEDED (Template is already signed)

            // 3. FLATTEN THE FORM (Makes fields uneditable)
            // form.flatten(); // CAUSING ERROR with signed template: "Could not find page for PDFRef..."
            // We will skip flattening for now to allow generation to succeed.

            // Save the PDF to disk
            const pdfBytes = await pdfDoc.save();
            const fileName = `${clientLastName}_${accountNumber}_${i}.pdf`;
            const filePath = path.join(outputFolder, fileName);
            await fs.writeFile(filePath, pdfBytes);
            filePaths.push(filePath);
        }

        return NextResponse.json({
            success: true,
            message: `Generated ${count} PDFs with random data`,
            filePaths,
        });
    } catch (error) {
        console.error('Error generating PDFs:', error);
        return NextResponse.json(
            { error: 'Failed to generate PDFs', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
