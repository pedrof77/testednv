const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

const uri = 'mongodb+srv://augustopietro482:88323571@cluster0.991nw.mongodb.net/'; // URI direta, conforme solicitado
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
let dbInstance;

/**
 * Retorna a instância do banco de dados.
 */
async function getDatabase() {
    if (!dbInstance) {
        try {
            console.log("Conectando ao MongoDB...");
            await client.connect();
            dbInstance = client.db('loja'); // Nome do banco de dados
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

// Rotas
app.post('/api/avaliacoes', async (req, res) => {
    const { produtoId, rating } = req.body;

    // Validação dos dados
    if (!produtoId || !rating || rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Avaliação inválida. O rating deve estar entre 1 e 5.' });
    }

    try {
        const db = await getDatabase();

        // Verifica se o produto existe com o produtoId
        const produto = await db.collection('produtos').findOne({ _id: produtoId });

        if (!produto) {
            return res.status(404).json({ error: 'Produto não encontrado.' });
        }

        // Criando a avaliação (sem passar o _id para forçar o MongoDB a gerar o seu próprio ObjectId)
        const novaAvaliacao = {
            produtoId,   // produtoId é o número, como 1
            rating,      // A nota da avaliação
            produtoNome: produto.nome,  // Nome do produto
            date: new Date(),  // Data da avaliação
        };

        // Inserindo a avaliação no banco de dados
        const resultado = await db.collection('avaliacoes').insertOne(novaAvaliacao);

        // Retornando o resultado com o id gerado para a avaliação
        res.status(201).json({ message: 'Avaliação criada com sucesso!', id: resultado.insertedId, produtoNome: novaAvaliacao.produtoNome });

    } catch (error) {
        console.error("Erro ao criar avaliação:", error);
        res.status(500).json({ error: 'Erro interno ao criar avaliação.' });
    }
});


//


/**
 * Listagem de todas as avaliações.
 */
app.get('/api/avaliacoes', async (req, res) => {
    try {
        const db = await getDatabase();

        // Buscando todas as avaliações
        const avaliacoes = await db.collection('avaliacoes').find().toArray();

        // Para cada avaliação, vamos buscar o nome do produto correspondente
        for (let i = 0; i < avaliacoes.length; i++) {
            const produto = await db.collection('produtos').findOne({ _id: avaliacoes[i].produtoId });
            if (produto) {
                avaliacoes[i].produtoNome = produto.nome;  // Adiciona o nome do produto
            }
        }

        res.status(200).json(avaliacoes);  // Retorna todas as avaliações com o nome do produto
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

    if (!ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'ID da avaliação inválido.' });
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

app.get('/api/produtos', async (req, res) => {
    try {
        const db = await getDatabase();
        const produtos = await db.collection('produtos').find().toArray();
        res.status(200).json(produtos);
    } catch (error) {
        console.error("Erro ao listar produtos:", error);
        res.status(500).json({ error: 'Erro interno ao listar produtos.' });
    }
});


/**
 * Exclusão de uma avaliação.
 */
app.delete('/api/avaliacoes/:id', async (req, res) => {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'ID da avaliação inválido.' });
    }

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
