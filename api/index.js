const express = require('express');
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken'); // Importando o jwt

app.use(cors()); // Habilita CORS para todas as origens

// Middleware para parse de JSON
app.use(express.json());

// Middleware para autenticação com Bearer Token
function autenticarJWT(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1]; // Obtendo o token após 'Bearer'
    
    if (!token) {
        return res.status(401).json({ error: 'Token não fornecido.' });
    }

    jwt.verify(token, 'kyHDa6uhj5OG3PeneWDiDGpo', (err, decoded) => {

        if (err) {
            return res.status(403).json({ error: 'Token inválido.' });
        }
        req.user = decoded; // Decodificando o token e anexando o payload na requisição
        next(); // Prossegue com a requisição
    });
}

// Rota inicial
app.get('/api/hello', (req, res) => {
    res.status(200).json({ message: 'Olá, mundo!' });
});

// Rota para enviar avaliação de produto (com autenticação)
app.post('/api/avaliacoes', autenticarJWT, (req, res) => {
    const { produtoId, rating } = req.body;

    if (!produtoId || !rating) {
        return res.status(400).json({ error: 'Produto e avaliação são obrigatórios!' });
    }

    if (typeof produtoId !== 'number' || typeof rating !== 'number' || rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Avaliação deve ser um número entre 1 e 5.' });
    }

    // Lógica de salvar avaliação no banco de dados
    res.status(200).json({ message: 'Avaliação enviada com sucesso!' });
});

// Rota para compras (com autenticação)
app.post('/api/compras', autenticarJWT, (req, res) => {
    const { produtoId } = req.body;

    if (!produtoId) {
        return res.status(400).json({ error: 'Produto é obrigatório!' });
    }

    if (typeof produtoId !== 'number') {
        return res.status(400).json({ error: 'Produto deve ser um número válido!' });
    }

    // Lógica de processamento da compra
    res.status(200).json({ message: 'Compra realizada com sucesso!' });
});

// Exporte o app para uso no Vercel
module.exports = app;
