const fs = require('fs');
const path = require('path');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');

async function createReport(data) {
    const templatePath = path.join(__dirname, `models/${data.reportTemplate}.docx`);
    const templateFile = fs.readFileSync(templatePath, 'binary');

    const zip = new PizZip(templateFile);

    const doc = new Docxtemplater(zip);

    doc.setData(data);

    try {
        doc.render();
    } catch (error) {
        throw new Error('Erro ao renderizar o template: ' + error);
    }

    const docxBuffer = doc.getZip().generate({ type: 'nodebuffer' });
    return docxBuffer;
}

module.exports = { createReport };
