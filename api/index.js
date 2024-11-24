if (process.env.NODE_ENV !== 'production') require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

// Configuração do MongoDB
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 });
let dbInstance;

/**
 * Retorna a instância do banco de dados.
 */
async function getDatabase() {
    if (!dbInstance) {
        try {
            console.log("Conectando ao MongoDB...");
            await client.connect();
            dbInstance = client.db(process.env.MONGODB_DB || 'loja');
            console.log("Conexão com o MongoDB estabelecida.");
        } catch (error) {
            console.error("Erro ao conectar ao MongoDB:", error);
            throw new Error("Falha ao conectar ao banco de dados.");
        }
    }
    return dbInstance;
}

// Rotas
app.get('/', (req, res) => res.status(200).json({ message: 'API rodando com sucesso!' }));

/**
 * Criação de uma nova compra.
 */
app.post('/api/compra', async (req, res) => {
    const { produtoId, quantidade, usuarioId, precoTotal } = req.body;

    if (!produtoId || !quantidade || !usuarioId || !precoTotal || quantidade <= 0 || precoTotal <= 0) {
        return res.status(400).json({ error: 'Dados inválidos. Verifique os campos.' });
    }

    try {
        const db = await getDatabase();
        const resultado = await db.collection('compras').insertOne({
            produtoId: new ObjectId(produtoId),
            quantidade,
            usuarioId: new ObjectId(usuarioId),
            precoTotal,
            date: new Date(),
        });
        res.status(201).json({ message: 'Compra realizada com sucesso!', id: resultado.insertedId });
    } catch (error) {
        console.error("Erro ao processar compra:", error);
        res.status(500).json({ error: 'Erro interno ao processar a compra.' });
    }
});

/**
 * Criação de uma nova avaliação.
 */
app.post('/api/avaliacoes', async (req, res) => {
    const { produtoId, rating } = req.body;

    if (!produtoId || !rating || rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Avaliação inválida. Deve estar entre 1 e 5.' });
    }

    try {
        const db = await getDatabase();
        const resultado = await db.collection('avaliacoes').insertOne({
            produtoId: new ObjectId(produtoId),
            rating,
            date: new Date(),
        });
        res.status(201).json({ message: 'Avaliação criada com sucesso!', id: resultado.insertedId });
    } catch (error) {
        console.error("Erro ao criar avaliação:", error);
        res.status(500).json({ error: 'Erro interno ao criar avaliação.' });
    }
});

/**
 * Listagem de todas as avaliações.
 */
app.get('/api/avaliacoes', async (req, res) => {
    try {
        const db = await getDatabase();
        const avaliacoes = await db.collection('avaliacoes').find().toArray();
        res.status(200).json(avaliacoes);
    } catch (error) {
        console.error("Erro ao listar avaliações:", error);
        res.status(500).json({ error: 'Erro interno ao listar avaliações.' });
    }
});

/**
 * Atualização de uma avaliação existente.
 */
app.put('/api/avaliacoes/:id', async (req, res) => {
    const { id } = req.params;
    const { rating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Avaliação inválida. Deve estar entre 1 e 5.' });
    }

    try {
        const db = await getDatabase();
        const resultado = await db.collection('avaliacoes').updateOne(
            { _id: new ObjectId(id) },
            { $set: { rating, date: new Date() } }
        );
        if (!resultado.matchedCount) return res.status(404).json({ error: 'Avaliação não encontrada.' });
        res.status(200).json({ message: 'Avaliação atualizada com sucesso!' });
    } catch (error) {
        console.error("Erro ao atualizar avaliação:", error);
        res.status(500).json({ error: 'Erro interno ao atualizar avaliação.' });
    }
});

/**
 * Exclusão de uma avaliação.
 */
app.delete('/api/avaliacoes/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const db = await getDatabase();
        const resultado = await db.collection('avaliacoes').deleteOne({ _id: new ObjectId(id) });
        if (!resultado.deletedCount) return res.status(404).json({ error: 'Avaliação não encontrada.' });
        res.status(200).json({ message: 'Avaliação excluída com sucesso!' });
    } catch (error) {
        console.error("Erro ao excluir avaliação:", error);
        res.status(500).json({ error: 'Erro interno ao excluir avaliação.' });
    }
});

// Inicialização do servidor
const port = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => console.log(`Servidor rodando em http://localhost:${port}`));
}

module.exports = app;
