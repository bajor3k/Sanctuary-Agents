import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import fs from 'fs/promises';
import path from 'path';

// Random data generators
const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Lisa', 'James', 'Mary', 'William', 'Jennifer', 'Richard', 'Linda', 'Thomas', 'Patricia', 'Charles', 'Barbara', 'Daniel', 'Susan'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];
const repCodes = ['ABC123', 'DEF456', 'GHI789', 'JKL012', 'MNO345', 'PQR678', 'STU901', 'VWX234', 'YZA567', 'BCD890'];
const feeStructures = ['1.00%', '1.25%', '1.50%', '0.75%', '2.00%'];

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
    console.log('[PDF] Starting PDF generation...');

    try {
        const body = await request.json();
        const { pdfBase64, count } = body;
        console.log(`[PDF] Request: count=${count}, hasUpload=${!!pdfBase64}`);

        // Determine source PDF - prioritize: uploaded > reference template > fallback
        let pdfBuffer: Buffer;
        const referenceTemplatePath = path.join(process.cwd(), 'src/ai/reference-docs/Discretionary Wrap IGO.pdf');
        const fallbackTemplatePath = '/Users/bajor3k/Desktop/AA Dummy/Filled AA copy.pdf';

        if (pdfBase64) {
            console.log('[PDF] Using uploaded PDF');
            pdfBuffer = Buffer.from(pdfBase64.split(',')[1], 'base64');
        } else {
            // Try reference template first
            try {
                await fs.access(referenceTemplatePath);
                console.log('[PDF] Using reference template from src/ai/reference-docs/');
                pdfBuffer = await fs.readFile(referenceTemplatePath);
            } catch {
                // Fall back to legacy desktop template
                try {
                    await fs.access(fallbackTemplatePath);
                    console.log('[PDF] Using fallback desktop template');
                    pdfBuffer = await fs.readFile(fallbackTemplatePath);
                } catch {
                    return NextResponse.json(
                        { error: 'No template available. Please upload a PDF or ensure reference template exists in src/ai/reference-docs/' },
                        { status: 400 }
                    );
                }
            }
        }

        // Create output folder
        const outputFolder = '/Users/bajor3k/Desktop/Orion Advisory';
        await fs.mkdir(outputFolder, { recursive: true });

        const filePaths: string[] = [];
        const parsedCount = parseInt(count);

        // Generate PDFs
        for (let i = 1; i <= parsedCount; i++) {
            console.log(`[PDF] Generating ${i}/${parsedCount}...`);

            // Generate ALL 22 fields of dummy data
            const advisorFirstName = randomElement(firstNames);
            const advisorLastName = randomElement(lastNames);
            const advisorName = `${advisorFirstName} ${advisorLastName}`;
            const clientFirstName = randomElement(firstNames);
            const clientLastName = randomElement(lastNames);
            const clientName = `${clientFirstName} ${clientLastName}`;
            const repCode = randomElement(repCodes);
            const effectiveDate = randomDateInLastMonth();
            const advReceivedDate = randomDateInLastMonth();
            const accountNumber = randomAccountNumber();
            const feeType = 'Flat';
            const feeAmount = `Flat ${randomElement(feeStructures)}`;
            const clientDateP11 = randomDateInLastMonth();
            const clientDateP14 = randomDateInLastMonth();
            const advisorDateP11 = randomDateInLastMonth();
            const advisorDateP14 = randomDateInLastMonth();

            // Load template
            const pdfDoc = await PDFDocument.load(pdfBuffer);
            const form = pdfDoc.getForm();

            // Embed font for signatures
            const signatureFont = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);

            // 1. PAGE 1 - Checkboxes
            // We need to find the specific checkboxes. Based on standard forms:
            try {
                // Try checking "Discretionary" box - strictly looking for match
                // If specific names aren't known, we might need to inspect via logic, 
                // but for now let's assume standard names or try to find them.
                // Since we don't have exact checkbox names from the dump (it only showed TextFields),
                // we'll try common variations.
                const fields = form.getFields();
                const checkField = (partialName: string) => {
                    const field = fields.find(f => f.getName().toLowerCase().includes(partialName.toLowerCase()));
                    if (field && field.constructor.name === 'PDFCheckBox') {
                        form.getCheckBox(field.getName()).check();
                    }
                };

                checkField('Discretionary'); // Check Discretionary
                checkField('Wrap');          // Check Wrap
            } catch (e) {
                console.log('[PDF] Error checking boxes:', e);
            }

            // Helper to fill text field
            const fillField = (fieldName: string, value: string) => {
                try {
                    const field = form.getTextField(fieldName);
                    if (field) {
                        const currentValue = field.getText() || '';
                        if (!currentValue || currentValue === 'XXXXXX' || currentValue.includes('XXXXXX')) {
                            field.setText(value);
                        }
                    }
                } catch (e) { }
            };

            // Helper to sign field (italicized)
            const signField = (fieldName: string, value: string) => {
                try {
                    // Try to find field by exact name or partial match if needed
                    let field = form.getTextField(fieldName);
                    if (!field) {
                        const match = form.getFields().find(f => f.getName() === fieldName);
                        if (match && match.constructor.name === 'PDFTextField') {
                            field = form.getTextField(match.getName());
                        }
                    }

                    if (field) {
                        field.setText(`/s/ ${value}`);
                        field.updateAppearances(signatureFont);
                    }
                } catch (e) { }
            };

            // --- PAGE 1 FIELDS ---
            fillField('Investment Advisor Representative Name', advisorName);
            fillField('Rep Code', repCode);
            fillField('Print Client Name Trustee or Authorized Signor', clientName);
            fillField('Date_5', effectiveDate);
            fillField('Effective Date', effectiveDate);

            // --- PAGE 10 ---
            fillField('Date received', advReceivedDate);

            // --- PAGE 11 ---
            fillField('Client Name Pr', clientName);
            fillField('Date_6', clientDateP11);
            fillField('Investment Adviser Name Printed_2', advisorName);
            fillField('Date_10', advisorDateP11);

            // Signatures P11
            signField('Client Signature Trustee or Author', clientName);
            signField('Investment Adviser Representative Signature', advisorName); // Assuming this is P11 advisor sig

            // --- PAGE 12 ---
            fillField('Account Registration Name  TypeRow1', accountNumber);

            // --- PAGE 13 ---
            fillField('Text3', feeAmount);

            // --- PAGE 14 ---
            fillField('Client Name Pr_2', clientName);
            fillField('Date_1', clientDateP14);
            fillField('Investment Adviser Name Printed_4', advisorName); // Field 66 from dump
            // Missing explicit Advisor Date P14 field in dump? Try 'Date_7' or 'Date_8'?
            // Dump showed Date_7, Date_8, Date_9. Let's fill them.
            fillField('Date_7', advisorDateP14);

            // Signatures P14
            signField('Client Signature Trustee or Author_2', clientName);
            signField('Investment Adviser Signature', advisorName);

            // Save
            const pdfBytes = await pdfDoc.save();
            const fileName = `IGO_${clientLastName}_${accountNumber}_${i}.pdf`;
            const filePath = path.join(outputFolder, fileName);
            await fs.writeFile(filePath, pdfBytes);
            filePaths.push(filePath);
        }

        console.log(`[PDF] Success! Generated ${parsedCount} files`);
        return NextResponse.json({
            success: true,
            message: `Generated ${count} PDFs with random data`,
            filePaths,
        });
    } catch (error) {
        console.error('[PDF] ERROR:', error);

        // Log to file
        try {
            const logPath = path.join(process.cwd(), 'pdf-error.log');
            const errorMsg = error instanceof Error ? `${error.message}\n${error.stack}` : String(error);
            await fs.writeFile(logPath, `${new Date().toISOString()}\n${errorMsg}\n\n`, { flag: 'a' });
        } catch { }

        return NextResponse.json(
            {
                error: 'Failed to generate PDFs',
                details: error instanceof Error ? error.message : String(error)
            },
            { status: 500 }
        );
    }
}
