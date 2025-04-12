require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { createReport } = require('./reportGenerator');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());

app.get('get-token', (req,res) => {
    res.json({})
})
app.post('/get-token', (req, res) => {
    const { secretKey } = req.body;
    if (secretKey !== process.env.SECRET_KEY) {
        return res.status(403).json({ message: 'Chave inválida' });
    }

    const token = jwt.sign({ acesso: 'permitido' }, process.env.SECRET_KEY, { expiresIn: '20000' });
    res.json({ token });
});

function verificarToken(req, res, next) {
    const token = req.headers.authorization.split(' ')[1];
    if (!token) return res.status(403).json({ message: 'Token ausente' });
        const filePath = path.join(__dirname, `relatorio.docx`);
        console.error({test: filePath, message: filePath})
    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
        if (err) return res.status(401).json({ message: 'Token inválido' });
        req.user = decoded;
        next();
    });
}

app.post('/generate-report', verificarToken, async (req, res) => {
    const data = req.body;
    try {
        const docxBuffer = await createReport(data);
        const filePath = path.join(__dirname, `relatorio.docx`);
        console.error({test: filePath, message: filePath})
        fs.writeFileSync(filePath, docxBuffer);

        const fileBase64 = fs.readFileSync(filePath, { encoding: 'base64' });

        res.json({ file: fileBase64 });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao gerar relatório', error });
    }
});

app.listen(3000, () => console.log('Servidor rodando na porta 3000'));
