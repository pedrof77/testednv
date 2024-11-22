if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config(); // Carregar variáveis de ambiente para desenvolvimento
}

const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

// URL do MongoDB
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017'; // Fallback para banco local, se necessário
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 100000 // Aumenta o timeout para 10 segundos
});


let dbInstance = null;

// Função de conexão com o banco de dados
async function getDatabase() {
    if (!dbInstance) {
        try {
            console.log("Tentando conectar ao MongoDB...");
            await client.connect();
            console.log('Conectado ao MongoDB!');
            dbInstance = client.db(process.env.MONGODB_DB || 'loja');
        } catch (error) {
            console.error('Erro ao conectar ao MongoDB:', error);
            throw new Error('Falha na conexão com o banco de dados.');
        }
    }
    return dbInstance;
}


// Rota base para verificação
app.get('/', (req, res) => {
    res.status(200).json({ message: 'API rodando com sucesso!' });
});

// **Função de Compra** - Rota POST
app.post('/api/compra', async (req, res) => {
    const { produtoId, quantidade, usuarioId, precoTotal } = req.body;

    if (!produtoId || !quantidade || !usuarioId || !precoTotal || typeof quantidade !== 'number' || quantidade <= 0 || precoTotal <= 0) {
        return res.status(400).json({ error: 'Dados inválidos. Verifique os dados da compra.' });
    }

    try {
        const db = await getDatabase();
        const resultado = await db.collection('compras').insertOne({
            produtoId: new ObjectId(produtoId),
            quantidade,
            usuarioId: new ObjectId(usuarioId),
            precoTotal,
            date: new Date()
        });

        res.status(201).json({ message: 'Compra realizada com sucesso!', id: resultado.insertedId });
    } catch (error) {
        console.error('Erro ao processar a compra:', error.stack);
        res.status(500).json({ error: 'Erro interno ao processar a compra.' });
    }
});

// **Função de Avaliação** - Rota POST
app.post('/api/avaliacoes', async (req, res) => {
    const { produtoId, rating } = req.body;

    if (!produtoId || !rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Dados inválidos. Avaliação deve ser entre 1 e 5.' });
    }

    try {
        const db = await getDatabase();
        const resultado = await db.collection('avaliacoes').insertOne({
            produtoId: new ObjectId(produtoId),
            rating,
            date: new Date()
        });

        res.status(201).json({ message: 'Avaliação enviada com sucesso!', id: resultado.insertedId });
    } catch (error) {
        console.error('Erro ao criar avaliação:', error.stack);
        res.status(500).json({ error: 'Erro interno ao criar avaliação.' });
    }
});

// **Função de Listar Avaliações** - Rota GET
app.get('/api/avaliacoes', async (req, res) => {
    try {
        const db = await getDatabase();
        const avaliacoes = await db.collection('avaliacoes').find().toArray();
        res.status(200).json(avaliacoes);
    } catch (error) {
        console.error('Erro ao listar avaliações:', error.stack);
        res.status(500).json({ error: 'Erro interno ao listar avaliações.' });
    }
});

// **Função de Atualizar Avaliação** - Rota PUT
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
        console.error('Erro ao atualizar avaliação:', error.stack);
        res.status(500).json({ error: 'Erro interno ao atualizar avaliação.' });
    }
});

// **Função de Excluir Avaliação** - Rota DELETE
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
        console.error('Erro ao excluir avaliação:', error.stack);
        res.status(500).json({ error: 'Erro interno ao excluir avaliação.' });
    }
});

// Inicializar servidor em localhost
const port = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => {
        console.log(`Servidor rodando em http://localhost:${port}`);
    });
}

// Exportar para Vercel ou outro serviço de hospedagem
module.exports = app;
