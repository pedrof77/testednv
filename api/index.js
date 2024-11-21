if (process.env.NODE_ENV !== 'production') {  
    require('dotenv').config(); // Carregar variáveis de ambiente do arquivo .env (para desenvolvimento)
}

const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

// Obter a URL do MongoDB de variáveis de ambiente
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

// Conexão com o banco de dados MongoDB
let dbInstance = null;
async function getDatabase() {
    if (!dbInstance) {
        try {
            await client.connect();
            console.log('Conectado ao MongoDB!');
            dbInstance = client.db();
        } catch (error) {
            console.error('Erro ao conectar ao MongoDB:', error);
            throw new Error('Falha na conexão com o banco de dados.');
        }
    }
    return dbInstance;
}

// Rota POST para criar uma avaliação
app.post('/api/avaliacoes', async (req, res) => {
    const { produtoId, rating } = req.body;

    if (!produtoId || !rating || typeof produtoId !== 'number' || typeof rating !== 'number' || rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Dados inválidos. Avaliação deve ser entre 1 e 5.' });
    }

    try {
        const db = await getDatabase();
        const resultado = await db.collection('avaliacoes').insertOne({
            produtoId,
            rating,
            date: new Date()
        });

        res.status(201).json({ message: 'Avaliação enviada com sucesso!', id: resultado.insertedId });
    } catch (error) {
        console.error('Erro ao criar avaliação:', error);
        res.status(500).json({ error: 'Erro interno ao criar avaliação.' });
    }
});

// Rota GET para listar todas as avaliações
app.get('/api/avaliacoes', async (req, res) => {
    try {
        const db = await getDatabase();
        const avaliacoes = await db.collection('avaliacoes').find().toArray();
        res.status(200).json(avaliacoes);
    } catch (error) {
        console.error('Erro ao listar avaliações:', error);
        res.status(500).json({ error: 'Erro interno ao listar avaliações.' });
    }
});

// Rota PUT para atualizar uma avaliação
app.put('/api/avaliacoes/:id', async (req, res) => {
    const { id } = req.params;
    const { rating } = req.body;

    if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Avaliação deve ser um número entre 1 e 5.' });
    }

    try {
        const db = await getDatabase();
        const resultado = await db.collection('avaliacoes').updateOne(
            { _id: new ObjectId(id) },
            { $set: { rating, date: new Date() } }
        );

        if (resultado.matchedCount === 0) {
            return res.status(404).json({ error: 'Avaliação não encontrada.' });
        }

        res.status(200).json({ message: 'Avaliação atualizada com sucesso!' });
    } catch (error) {
        console.error('Erro ao atualizar avaliação:', error);
        res.status(500).json({ error: 'Erro interno ao atualizar avaliação.' });
    }
});

// Rota DELETE para excluir uma avaliação
app.delete('/api/avaliacoes/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const db = await getDatabase();
        const resultado = await db.collection('avaliacoes').deleteOne({ _id: new ObjectId(id) });

        if (resultado.deletedCount === 0) {
            return res.status(404).json({ error: 'Avaliação não encontrada.' });
        }

        res.status(200).json({ message: 'Avaliação excluída com sucesso!' });
    } catch (error) {
        console.error('Erro ao excluir avaliação:', error);
        res.status(500).json({ error: 'Erro interno ao excluir avaliação.' });
    }
});

// Configuração da porta do servidor
const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});

module.exports = app;
