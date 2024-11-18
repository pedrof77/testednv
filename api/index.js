const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors()); // Habilita CORS para todas as origens

// Middleware para parse de JSON
app.use(express.json());

// Rota inicial
app.get('/api/hello', (req, res) => {
    res.status(200).json({ message: 'Olá, mundo!' });
});

// Rota para enviar avaliação de produto
app.post('/api/avaliacoes', (req, res) => {
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

// Rota para compras
app.post('/api/compras', (req, res) => {
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