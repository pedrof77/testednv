if (process.env.NODE_ENV !== 'production') require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverSelectionTimeoutMS: 10000 });
let dbInstance;

async function getDatabase() {
    if (!dbInstance) {
        try {
            console.log("Conectando ao MongoDB...");
            await client.connect();
            dbInstance = client.db(process.env.MONGODB_DB || 'loja');
            console.log("Conexão estabelecida com o MongoDB!");
        } catch (error) {
            console.error("Erro ao conectar ao MongoDB:", error);
            throw new Error("Falha na conexão com o banco de dados.");
        }
    }
    return dbInstance;
}

app.get('/', (req, res) => res.status(200).json({ message: 'API rodando com sucesso!' }));

app.post('/api/compra', async (req, res) => {
    const { produtoId, quantidade, usuarioId, precoTotal } = req.body;
    if (!produtoId || !quantidade || !usuarioId || !precoTotal || quantidade <= 0 || precoTotal <= 0) {
        return res.status(400).json({ error: 'Dados inválidos.' });
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
        res.status(201).json({ message: 'Compra realizada!', id: resultado.insertedId });
    } catch (error) {
        console.error("Erro ao processar compra:", error);
        res.status(500).json({ error: 'Erro interno.' });
    }
});

app.post('/api/avaliacoes', async (req, res) => {
    const { produtoId, rating } = req.body;
    if (!produtoId || !rating || rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Avaliação inválida (1-5).' });
    }
    try {
        const db = await getDatabase();
        const resultado = await db.collection('avaliacoes').insertOne({
            produtoId: new ObjectId(produtoId),
            rating,
            date: new Date(),
        });
        res.status(201).json({ message: 'Avaliação criada!', id: resultado.insertedId });
    } catch (error) {
        console.error("Erro ao criar avaliação:", error);
        res.status(500).json({ error: 'Erro interno.' });
    }
});

app.get('/api/avaliacoes', async (_, res) => {
    try {
        const db = await getDatabase();
        res.status(200).json(await db.collection('avaliacoes').find().toArray());
    } catch (error) {
        console.error("Erro ao listar avaliações:", error);
        res.status(500).json({ error: 'Erro interno.' });
    }
});

app.put('/api/avaliacoes/:id', async (req, res) => {
    const { id } = req.params;
    const { rating } = req.body;
    if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Avaliação inválida (1-5).' });
    }
    try {
        const db = await getDatabase();
        const resultado = await db.collection('avaliacoes').updateOne(
            { _id: new ObjectId(id) },
            { $set: { rating, date: new Date() } }
        );
        if (!resultado.matchedCount) return res.status(404).json({ error: 'Avaliação não encontrada.' });
        res.status(200).json({ message: 'Avaliação atualizada!' });
    } catch (error) {
        console.error("Erro ao atualizar avaliação:", error);
        res.status(500).json({ error: 'Erro interno.' });
    }
});

app.delete('/api/avaliacoes/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const db = await getDatabase();
        const resultado = await db.collection('avaliacoes').deleteOne({ _id: new ObjectId(id) });
        if (!resultado.deletedCount) return res.status(404).json({ error: 'Avaliação não encontrada.' });
        res.status(200).json({ message: 'Avaliação excluída!' });
    } catch (error) {
        console.error("Erro ao excluir avaliação:", error);
        res.status(500).json({ error: 'Erro interno.' });
    }
});

const port = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => console.log(`Servidor rodando em http://localhost:${port}`));
}

module.exports = app;
