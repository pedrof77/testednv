require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient } = require('mongodb'); // Importando o driver MongoDB

const app = express();
app.use(cors());
app.use(express.json());

// String de conexão do MongoDB
const uri = process.env.MONGODB_URI; // Certifique-se de configurar esta variável no ambiente (Vercel ou local)

// Criando um cliente MongoDB
const client = new MongoClient(uri);

// Função para conectar ao banco
async function connectToDatabase() {
    if (!client.isConnected) {
        await client.connect();
        console.log('Conectado ao MongoDB!');
    }
    return client.db(); // Retorna o banco de dados padrão configurado na URI
}

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
app.post('/api/avaliacoes', autenticarJWT, async (req, res) => {
    const { produtoId, rating } = req.body;

    if (!produtoId || !rating) {
        return res.status(400).json({ error: 'Produto e avaliação são obrigatórios!' });
    }

    if (typeof produtoId !== 'number' || typeof rating !== 'number' || rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Avaliação deve ser um número entre 1 e 5.' });
    }

    try {
        const db = await connectToDatabase();
        const result = await db.collection('avaliacoes').insertOne({
            produtoId,
            rating,
            userId: req.user.id, // Usando o ID do usuário do token JWT
            date: new Date(),
        });

        res.status(200).json({ message: 'Avaliação enviada com sucesso!', id: result.insertedId });
    } catch (error) {
        console.error('Erro ao salvar avaliação:', error);
        res.status(500).json({ error: 'Erro ao salvar avaliação.' });
    }
});

// Rota para compras (com autenticação)
app.post('/api/compras', autenticarJWT, async (req, res) => {
    const { produtoId } = req.body;

    if (!produtoId) {
        return res.status(400).json({ error: 'Produto é obrigatório!' });
    }

    if (typeof produtoId !== 'number') {
        return res.status(400).json({ error: 'Produto deve ser um número válido!' });
    }

    try {
        const db = await connectToDatabase();
        const result = await db.collection('compras').insertOne({
            produtoId,
            userId: req.user.id, // Usando o ID do usuário do token JWT
            date: new Date(),
        });

        res.status(200).json({ message: 'Compra realizada com sucesso!', id: result.insertedId });
    } catch (error) {
        console.error('Erro ao processar compra:', error);
        res.status(500).json({ error: 'Erro ao processar compra.' });
    }
});

// Exporte o app para uso no Vercel
module.exports = app;
