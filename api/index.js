const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

const uri = 'mongodb+srv://augustopietro482:88323571@cluster0.991nw.mongodb.net/'; 
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
let dbInstance;


async function getDatabase() {
    if (!dbInstance) {
        try {
            console.log("Conectando ao MongoDB...");
            await client.connect();
            dbInstance = client.db('loja'); 
            console.log("Conexão com o MongoDB estabelecida.");
        } catch (error) {
            console.error("Erro ao conectar ao MongoDB:", error);
            throw new Error("Falha ao conectar ao banco de dados.");
        }
    }
    return dbInstance;
}


app.get('/', (req, res) => res.status(200).json({ message: 'API rodando com sucesso!' }));


app.post('/api/compras', async (req, res) => {
    const { produtoId, quantidade } = req.body;

    
    if (!produtoId || !quantidade || quantidade <= 0) {
        return res.status(400).json({ error: 'Dados inválidos. Produto e quantidade devem ser fornecidos, e a quantidade deve ser maior que 0.' });
    }

    try {
        const db = await getDatabase();

        
        const produto = await db.collection('produtos').findOne({ _id: produtoId });

        if (!produto) {
            return res.status(404).json({ error: 'Produto não encontrado.' });
        }

        
        const novaCompra = {
            produtoId,
            produtoNome: produto.nome,
            quantidade,
            date: new Date(),
        };

        
        const resultado = await db.collection('compras').insertOne(novaCompra);

        
        res.status(201).json({
            message: 'Compra realizada com sucesso!',
            id: resultado.insertedId,
            produtoNome: novaCompra.produtoNome,
            quantidade: novaCompra.quantidade,
        });
    } catch (error) {
        console.error("Erro ao registrar compra:", error);
        res.status(500).json({ error: 'Erro interno ao registrar a compra.' });
    }
});


app.get('/api/compras', async (req, res) => {
    try {
        const db = await getDatabase();

        
        const compras = await db.collection('compras').find().toArray();

        res.status(200).json(compras);
    } catch (error) {
        console.error("Erro ao listar compras:", error);
        res.status(500).json({ error: 'Erro interno ao listar compras.' });
    }
});



app.post('/api/avaliacoes', async (req, res) => {
    const { produtoId, rating } = req.body;

    
    if (!produtoId || !rating || rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Avaliação inválida. O rating deve estar entre 1 e 5.' });
    }

    try {
        const db = await getDatabase();

        
        const produto = await db.collection('produtos').findOne({ _id: produtoId });

        if (!produto) {
            return res.status(404).json({ error: 'Produto não encontrado.' });
        }

        
        const novaAvaliacao = {
            produtoId,   
            rating,      
            produtoNome: produto.nome,  
            date: new Date(),  
        };

       
        const resultado = await db.collection('avaliacoes').insertOne(novaAvaliacao);

        
        res.status(201).json({ message: 'Avaliação criada com sucesso!', id: resultado.insertedId, produtoNome: novaAvaliacao.produtoNome });

    } catch (error) {
        console.error("Erro ao criar avaliação:", error);
        res.status(500).json({ error: 'Erro interno ao criar avaliação.' });
    }
});


//


app.get('/api/avaliacoes', async (req, res) => {
    try {
        const db = await getDatabase();


        const avaliacoes = await db.collection('avaliacoes').find().toArray();

        
        for (let i = 0; i < avaliacoes.length; i++) {
            const produto = await db.collection('produtos').findOne({ _id: avaliacoes[i].produtoId });
            if (produto) {
                avaliacoes[i].produtoNome = produto.nome;  
            }
        }

        res.status(200).json(avaliacoes);  
    } catch (error) {
        console.error("Erro ao listar avaliações:", error);
        res.status(500).json({ error: 'Erro interno ao listar avaliações.' });
    }
});



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


const port = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => console.log(`Servidor rodando em http://localhost:${port}`));
}

module.exports = app;
