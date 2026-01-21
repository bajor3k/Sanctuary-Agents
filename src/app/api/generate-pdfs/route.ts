import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import fs from 'fs/promises';
import path from 'path';

// Template configurations matching all 16 reference documents
interface TemplateConfig {
    discretion: 'Discretionary' | 'Non-Discretionary';
    wrap: 'WRAP' | 'NON-WRAP';
    feeType: 'Flat' | 'Tiered';
    accountHolders: 1 | 2;
    filename: string;
}

const TEMPLATES: TemplateConfig[] = [
    { discretion: 'Discretionary', wrap: 'WRAP', feeType: 'Flat', accountHolders: 1, filename: 'Discretionary WRAP Flat (1).pdf' },
    { discretion: 'Discretionary', wrap: 'WRAP', feeType: 'Flat', accountHolders: 2, filename: 'Discretionary WRAP Flat (2).pdf' },
    { discretion: 'Discretionary', wrap: 'WRAP', feeType: 'Tiered', accountHolders: 1, filename: 'Discretionary WRAP Tiered (1).pdf' },
    { discretion: 'Discretionary', wrap: 'WRAP', feeType: 'Tiered', accountHolders: 2, filename: 'Discretionary WRAP Tiered (2).pdf' },

    { discretion: 'Discretionary', wrap: 'NON-WRAP', feeType: 'Flat', accountHolders: 1, filename: 'Discretionary NON-WRAP Flat (1).pdf' },
    { discretion: 'Discretionary', wrap: 'NON-WRAP', feeType: 'Flat', accountHolders: 2, filename: 'Discretionary NON-WRAP Flat (2).pdf' },
    { discretion: 'Discretionary', wrap: 'NON-WRAP', feeType: 'Tiered', accountHolders: 1, filename: 'Discretionary NON-WRAP Tiered (1).pdf' },
    { discretion: 'Discretionary', wrap: 'NON-WRAP', feeType: 'Tiered', accountHolders: 2, filename: 'Discretionary NON-WRAP Tiered (2).pdf' },

    { discretion: 'Non-Discretionary', wrap: 'WRAP', feeType: 'Flat', accountHolders: 1, filename: 'Non-Discretionary WRAP Flat (1).pdf' },
    { discretion: 'Non-Discretionary', wrap: 'WRAP', feeType: 'Flat', accountHolders: 2, filename: 'Non-Discretionary WRAP Flat (2).pdf' },
    { discretion: 'Non-Discretionary', wrap: 'WRAP', feeType: 'Tiered', accountHolders: 1, filename: 'Non-Discretionary WRAP Tiered (1).pdf' },
    { discretion: 'Non-Discretionary', wrap: 'WRAP', feeType: 'Tiered', accountHolders: 2, filename: 'Non-Discretionary WRAP Tiered (2).pdf' },

    { discretion: 'Non-Discretionary', wrap: 'NON-WRAP', feeType: 'Flat', accountHolders: 1, filename: 'Non-Discretionary NON-WRAP Flat (1).pdf' },
    { discretion: 'Non-Discretionary', wrap: 'NON-WRAP', feeType: 'Flat', accountHolders: 2, filename: 'Non-Discretionary NON-WRAP Flat (2).pdf' },
    { discretion: 'Non-Discretionary', wrap: 'NON-WRAP', feeType: 'Tiered', accountHolders: 1, filename: 'Non-Discretionary NON-WRAP Tiered (1).pdf' },
    { discretion: 'Non-Discretionary', wrap: 'NON-WRAP', feeType: 'Tiered', accountHolders: 2, filename: 'Non-Discretionary NON-WRAP Tiered (2).pdf' },
];

// Random data generators
const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Lisa', 'James', 'Mary', 'William', 'Jennifer', 'Richard', 'Linda', 'Thomas', 'Patricia', 'Charles', 'Barbara', 'Daniel', 'Susan'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];
const advisorFirstNames = ['James', 'Patricia', 'Mark', 'Jennifer', 'Steven', 'Michelle', 'Kevin', 'Angela', 'Brian', 'Rebecca'];
const repCodes = ['ABC', 'DEF', 'GHI', 'JKL', 'MNO', 'PQR', 'STU', 'VWX', 'YZA', 'BCD'];
const flatFees = ['0.50%', '0.75%', '0.85%', '1.00%', '1.15%', '1.25%', '1.35%', '1.50%', '1.75%', '2.00%'];

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

function generateTieredFeeStructure(): string {
    const structures = [
        `$0 To $500,000: 1.00%
$500,000 To $1,000,000: 0.85%
$1,000,000 To $2,000,000: 0.75%
$2,000,000 To $5,000,000: 0.50%`,
        `$0 To $250,000: 1.25%
$250,000 To $750,000: 1.00%
$750,000 To $1,500,000: 0.85%
$1,500,000 To $5,000,000: 0.65%`,
        `$0 To $1,000,000: 1.00%
$1,000,000 To $3,000,000: 0.75%
$3,000,000 To $5,000,000: 0.50%
$5,000,000+: 0.35%`
    ];
    return randomElement(structures);
}

async function fillPdfWithData(pdfBytes: Buffer, template: TemplateConfig): Promise<{ pdfBytes: Uint8Array, metadata: any }> {
    const pdfDoc = await PDFDocument.load(pdfBytes);

    // Generate dummy data based on template configuration
    const advisorFirstName = randomElement(advisorFirstNames);
    const advisorLastName = randomElement(lastNames);
    const advisorName = `${advisorFirstName} ${advisorLastName}`;

    const clientFirstName = randomElement(firstNames);
    const clientLastName = randomElement(lastNames);

    // Handle 1 or 2 account holders
    let clientName: string;
    let client2Name: string = '';
    if (template.accountHolders === 2) {
        const client2FirstName = randomElement(firstNames.filter(n => n !== clientFirstName));
        clientName = `${clientFirstName} ${clientLastName}`;
        client2Name = `${client2FirstName} ${clientLastName}`;
    } else {
        clientName = `${clientFirstName} ${clientLastName}`;
    }

    const repCode = randomElement(repCodes);
    const effectiveDate = randomDateInLastMonth();
    const advReceivedDate = randomDateInLastMonth();
    const accountNumber = randomAccountNumber();

    // Fee structure based on template type
    const feeAmount = template.feeType === 'Flat'
        ? randomElement(flatFees)
        : generateTieredFeeStructure();

    const clientDateP11 = randomDateInLastMonth();
    const clientDateP14 = randomDateInLastMonth();
    const advisorDateP11 = randomDateInLastMonth();
    const advisorDateP14 = randomDateInLastMonth();
    const client2DateP11 = randomDateInLastMonth();
    const client2DateP14 = randomDateInLastMonth();

    // Get all pages and replace XXXXXX with actual data
    const pages = pdfDoc.getPages();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // We'll use a find-and-replace approach by drawing over the XXXXXX text
    // This is a simplification - in production you'd want to use form fields or more sophisticated text replacement

    // Try to use form fields if they exist
    const form = pdfDoc.getForm();
    const fields = form.getFields();

    console.log(`[PDF Fill] Found ${fields.length} form fields`);

    // Replacements map - what to replace XXXXXX with based on context
    const replacements: Record<string, string> = {
        // Page 1
        'advisor_name': advisorName,
        'rep_code': repCode,
        'client_name': clientName,
        'effective_date': effectiveDate,

        // Page 10
        'adv_received_date': advReceivedDate,

        // Page 11
        'client_name_p11': clientName,
        'client_date_p11': clientDateP11,
        'advisor_name_p11': advisorName,
        'advisor_date_p11': advisorDateP11,

        // Page 11 - Client 2 (if 2 holders)
        ...(template.accountHolders === 2 ? {
            'client2_name_p11': client2Name,
            'client2_date_p11': client2DateP11,
        } : {}),

        // Page 12
        'account_number': accountNumber,

        // Page 13
        'fee_amount': feeAmount,

        // Page 14
        'client_name_p14': clientName,
        'client_date_p14': clientDateP14,
        'advisor_name_p14': advisorName,
        'advisor_date_p14': advisorDateP14,

        // Page 14 - Client 2 (if 2 holders)
        ...(template.accountHolders === 2 ? {
            'client2_name_p14': client2Name,
            'client2_date_p14': client2DateP14,
        } : {}),
    };

    // Try to fill form fields if they exist
    fields.forEach(field => {
        const fieldName = field.getName();
        const fieldType = field.constructor.name;

        console.log(`[PDF Fill] Field: ${fieldName} (${fieldType})`);

        if (fieldType === 'PDFTextField') {
            const textField = form.getTextField(fieldName);
            const currentValue = textField.getText() || '';

            // Replace if it contains XXXXXX or "Flat" placeholder
            if (currentValue.includes('XXXXXX') || currentValue === 'Flat' || currentValue.toLowerCase().includes('flat')) {
                // Try to find appropriate replacement
                const lowerFieldName = fieldName.toLowerCase();
                let replacement = 'FILLED';

                // Smart matching based on field name
                if (lowerFieldName.includes('advisor') && lowerFieldName.includes('name')) {
                    replacement = advisorName;
                } else if (lowerFieldName.includes('rep') || lowerFieldName.includes('code')) {
                    replacement = repCode;
                } else if (lowerFieldName.includes('client') && lowerFieldName.includes('name')) {
                    if (lowerFieldName.includes('2') || lowerFieldName.includes('joint')) {
                        replacement = client2Name || clientName;
                    } else {
                        replacement = clientName;
                    }
                } else if (lowerFieldName.includes('effective') || lowerFieldName.includes('date')) {
                    replacement = effectiveDate;
                } else if (lowerFieldName.includes('account') || lowerFieldName.includes('number')) {
                    replacement = accountNumber;
                } else if (lowerFieldName.includes('fee') || lowerFieldName.includes('rate') || lowerFieldName.includes('amount')) {
                    // For flat fee templates, use the percentage; for tiered, use first line or full structure
                    replacement = template.feeType === 'Flat' ? feeAmount : feeAmount;
                } else if (lowerFieldName.includes('adv')) {
                    replacement = advReceivedDate;
                } else if (currentValue === 'Flat' || currentValue.toLowerCase() === 'flat') {
                    // If the current value is literally "Flat", replace with a fee percentage
                    replacement = template.feeType === 'Flat' ? feeAmount : 'Tiered - See Schedule';
                }

                console.log(`[PDF Fill] Replacing "${currentValue}" with "${replacement}"`);
                textField.setText(replacement);
            }
        }
    });

    const filledPdfBytes = await pdfDoc.save();

    const metadata = {
        template: template.filename,
        discretion: template.discretion,
        wrap: template.wrap,
        feeType: template.feeType,
        accountHolders: template.accountHolders,
        generatedData: {
            advisorName,
            clientName,
            client2Name: template.accountHolders === 2 ? client2Name : null,
            repCode,
            accountNumber,
            effectiveDate,
            advReceivedDate,
            feeAmount: template.feeType === 'Flat' ? feeAmount : 'Tiered',
            clientDateP11,
            clientDateP14,
            advisorDateP11,
            advisorDateP14,
        }
    };

    return { pdfBytes: filledPdfBytes, metadata };
}

export async function POST(request: NextRequest) {
    console.log('[PDF] Starting PDF generation...');

    try {
        const body = await request.json();
        const { pdfBase64, count } = body;
        console.log(`[PDF] Request: count=${count}, hasUpload=${!!pdfBase64}`);

        // Create output folder
        const outputFolder = '/Users/bajor3k/Desktop/Orion Advisory';
        await fs.mkdir(outputFolder, { recursive: true });

        const filePaths: string[] = [];
        const parsedCount = parseInt(count);
        const generatedMetadata: any[] = [];

        // Generate PDFs
        for (let i = 1; i <= parsedCount; i++) {
            console.log(`[PDF] Generating ${i}/${parsedCount}...`);

            // Randomly select a template
            const template = randomElement(TEMPLATES);
            const templatePath = path.join(process.cwd(), 'src/ai/reference-docs', template.filename);

            let pdfBuffer: Buffer;

            if (pdfBase64) {
                // Use uploaded PDF if provided
                console.log('[PDF] Using uploaded PDF');
                pdfBuffer = Buffer.from(pdfBase64.split(',')[1], 'base64');
            } else {
                // Use selected template
                try {
                    pdfBuffer = await fs.readFile(templatePath);
                    console.log(`[PDF] Using template: ${template.filename}`);
                } catch (error) {
                    console.error(`[PDF] Template not found: ${template.filename}`);
                    return NextResponse.json(
                        { error: `Template not found: ${template.filename}. Ensure all 16 reference templates exist.` },
                        { status: 400 }
                    );
                }
            }

            // Fill the PDF with dummy data
            const { pdfBytes: filledPdfBytes, metadata } = await fillPdfWithData(pdfBuffer, template);

            // Create filename
            const templateType = `${template.discretion}_${template.wrap}_${template.feeType}_${template.accountHolders}holder`;
            const clientLastName = metadata.generatedData.clientName.split(' ')[1] || 'Unknown';
            const fileName = `FILLED_${templateType}_${clientLastName}_${metadata.generatedData.accountNumber}_${i}.pdf`;
            const filePath = path.join(outputFolder, fileName);

            await fs.writeFile(filePath, filledPdfBytes);
            filePaths.push(filePath);

            // Store metadata for logging
            generatedMetadata.push({
                filename: fileName,
                ...metadata
            });
        }

        console.log(`[PDF] Success! Generated ${parsedCount} files`);
        console.log('[PDF] Generated metadata:', JSON.stringify(generatedMetadata, null, 2));

        return NextResponse.json({
            success: true,
            message: `Generated ${count} PDFs`,
            filePaths,
            metadata: generatedMetadata,
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
