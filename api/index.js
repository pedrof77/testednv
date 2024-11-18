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

    // Aqui você pode salvar as avaliações no banco de dados ou em um arquivo
    // Simulando uma resposta de sucesso
    console.log(`Avaliação para produto ${produtoId} recebida com nota ${rating}`);

    // Retornando sucesso (simulação de sucesso)
    return res.status(200).json({ message: 'Avaliação enviada com sucesso!' });
});

// Rota para realizar a compra de um produto
app.post('/api/compras', (req, res) => {
    const { produtoId } = req.body;

    if (!produtoId) {
        return res.status(400).json({ error: 'Produto é obrigatório!' });
    }

    // Aqui você pode adicionar a lógica de compra (ex: estoque, pagamento)
    // Simulando uma resposta de sucesso
    console.log(`Compra realizada para o produto ${produtoId}`);

    // Retornando sucesso (simulação de sucesso)
    return res.status(200).json({ message: 'Compra realizada com sucesso!' });
});

// Exporte o app para uso no Vercel
module.exports = app;
