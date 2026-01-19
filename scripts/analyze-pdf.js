
const { PDFDocument } = require('pdf-lib');
const fs = require('fs');

async function analyze() {
    try {
        const filledPath = '/Users/bajor3k/Desktop/AA Dummy/Analysis/analysis_example.pdf';
        const filledBytes = fs.readFileSync(filledPath);
        const pdfDoc = await PDFDocument.load(filledBytes);

        const form = pdfDoc.getForm();
        const fields = form.getFields();

        console.log('--- Filled Form Values ---');
        fields.forEach(field => {
            const name = field.getName();
            const type = field.constructor.name;
            let value = '(no value)';

            try {
                if (type === 'PDFTextField') {
                    value = field.getText();
                } else if (type === 'PDFCheckBox') {
                    value = field.isChecked() ? 'Checked' : 'Unchecked';
                } else if (type === 'PDFDropdown') {
                    value = field.getSelected();
                } else if (type === 'PDFRadioGroup') {
                    value = field.getSelected();
                }
            } catch (e) {
                value = '(error reading value)';
            }

            if (value !== undefined && value !== null && value !== '' && value !== '(no value)') {
                console.log(`Field: "${name}"`);
                console.log(`Value: "${value}"`);
                console.log('---');
            }
        });

    } catch (error) {
        console.error('Error analyzing PDF:', error);
    }
}

analyze();
