if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb'); 

const app = express();
app.use(cors());
app.use(express.json());


const uri = process.env.MONGODB_URI;  

const client = new MongoClient(uri);


async function connectToDatabase() {
    try {
        await client.connect();
        console.log('Conectado ao MongoDB!');
        return client.db(); 
    } catch (error) {
        console.error('Erro ao conectar ao MongoDB:', error);
        throw new Error('Erro ao conectar ao banco de dados.');
    }
}


const validTokens = [
    "kyHDa6uhj5OG3PeneWDiDGpo",  // Token 1 Vercel
    "ghI93k8jYJQmuLfLoKnJvFyq"   // Token 2 Vercel
];


function autenticarToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token não fornecido.' });
    }

    
    if (!validTokens.includes(token)) {
        return res.status(403).json({ error: 'Token inválido.' });
    }

    
    next(); 
}


app.get('/api/hello', (req, res) => {
    res.status(200).json({ message: 'Olá, mundo!' });
});


app.post('/api/avaliacoes', autenticarToken, async (req, res) => {
    const { produtoId, rating } = req.body;

    if (!produtoId || !rating) {
        return res.status(400).json({ error: 'Produto e avaliação são obrigatórios!' });
    }

    if (typeof produtoId !== 'number' || typeof rating !== 'number' || rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Avaliação deve ser um número entre 1 e 5.' });
    }

    try {
        const db = await connectToDatabase();

        const resultado = await db.collection('avaliacoes').insertOne({
            produtoId,
            rating,
            userId: 'usuario_id_aqui',  
            date: new Date(),
        });

        res.status(200).json({ message: 'Avaliação enviada com sucesso!', id: resultado.insertedId });
    } catch (error) {
        console.error('Erro ao salvar avaliação:', error);
        res.status(500).json({ error: 'Erro ao salvar avaliação.' });
    }
});


app.post('/api/compras', autenticarToken, async (req, res) => {
    const { produtoId } = req.body;

    if (!produtoId) {
        return res.status(400).json({ error: 'Produto é obrigatório!' });
    }

    if (typeof produtoId !== 'number') {
        return res.status(400).json({ error: 'Produto deve ser um número válido!' });
    }

    try {
        const db = await connectToDatabase();

        const resultado = await db.collection('compras').insertOne({
            produtoId,
            userId: 'usuario_id_aqui',  
            date: new Date(),
        });

        res.status(200).json({ message: 'Compra realizada com sucesso!', id: resultado.insertedId });
    } catch (error) {
        console.error('Erro ao processar compra:', error);
        res.status(500).json({ error: 'Erro ao processar compra.' });
    }
});

module.exports = app;
