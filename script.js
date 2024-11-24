document.addEventListener("DOMContentLoaded", () => { 
    const apiBaseUrl = "https://api-gilt-pi.vercel.app";

    const feedbackContainer = document.getElementById("feedback");
    const avaliacoesContainer = document.getElementById("avaliacoes-container");
    const produtos = document.querySelectorAll(".produto");

    const mostrarFeedback = (mensagem, tipo) => {
        feedbackContainer.textContent = mensagem;
        feedbackContainer.className = `feedback ${tipo}`;
    };

    const enviarAvaliacao = async (produtoId, rating) => {
        try {
            const resposta = await fetch(`${apiBaseUrl}/avaliacoes`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ produtoId: Number(produtoId), rating: Number(rating) }),
            });

            if (!resposta.ok) {
                const contentType = resposta.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                    const errorData = await resposta.json();
                    throw new Error(errorData.error || "Erro ao enviar avaliação.");
                } else {
                    throw new Error("Resposta inesperada do servidor.");
                }
            }

            mostrarFeedback("Avaliação enviada com sucesso!", "sucesso");
        } catch (erro) {
            console.error("Erro ao enviar avaliação:", erro);
            mostrarFeedback("Erro ao enviar avaliação: " + erro.message, "erro");
        }
    };

    const enviarCompra = async (produtoId, quantidade) => {
        try {
            const resposta = await fetch(`${apiBaseUrl}/compras`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ produtoId: Number(produtoId), quantidade: Number(quantidade) }),
            });

            if (!resposta.ok) {
                const contentType = resposta.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                    const errorData = await resposta.json();
                    throw new Error(errorData.error || "Erro ao enviar compra.");
                } else {
                    throw new Error("Resposta inesperada do servidor.");
                }
            }

            mostrarFeedback("Compra realizada com sucesso!", "sucesso");
        } catch (erro) {
            console.error("Erro ao realizar compra:", erro);
            mostrarFeedback("Erro ao realizar compra: " + erro.message, "erro");
        }
    };

    const listarAvaliacoes = async () => {
        try {
            const resposta = await fetch(`${apiBaseUrl}/avaliacoes`, {
                method: "GET",
            });

            if (!resposta.ok) {
                const contentType = resposta.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                    const errorData = await resposta.json();
                    throw new Error(errorData.error || "Erro ao listar avaliações.");
                } else {
                    throw new Error("Resposta inesperada do servidor.");
                }
            }

            const avaliacoes = await resposta.json();
            avaliacoesContainer.innerHTML = "";

            avaliacoes.forEach((avaliacao) => {
                const avaliacaoElement = document.createElement("div");
                avaliacaoElement.classList.add("avaliacao-item");
                avaliacaoElement.innerHTML = `
                    <p>Produto ID: ${avaliacao.produtoId}, Nota: ${avaliacao.rating}</p>
                    <button onclick="excluirAvaliacao('${avaliacao._id}')">Excluir</button>
                `;
                avaliacoesContainer.appendChild(avaliacaoElement);
            });
        } catch (erro) {
            console.error("Erro ao listar avaliações:", erro);
            mostrarFeedback("Erro ao listar avaliações: " + erro.message, "erro");
        }
    };

    window.excluirAvaliacao = async (id) => {
        try {
            const resposta = await fetch(`${apiBaseUrl}/avaliacoes/${id}`, {
                method: "DELETE",
            });

            if (!resposta.ok) {
                const contentType = resposta.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                    const errorData = await resposta.json();
                    throw new Error(errorData.error || "Erro ao excluir avaliação.");
                } else {
                    throw new Error("Resposta inesperada do servidor.");
                }
            }

            mostrarFeedback("Avaliação excluída com sucesso!", "sucesso");
            listarAvaliacoes();
        } catch (erro) {
            console.error("Erro ao excluir avaliação:", erro);
            mostrarFeedback("Erro ao excluir avaliação: " + erro.message, "erro");
        }
    };

    produtos.forEach((produto) => {
        const produtoId = produto.querySelector(".avaliacao").getAttribute("data-id");
        const estrelas = produto.querySelectorAll(".estrela");
        const botaoComprar = produto.querySelector(".comprar");
        const quantidadeInput = produto.querySelector(".quantidade");

        estrelas.forEach((estrela) => {
            estrela.addEventListener("click", async () => {
                const rating = estrela.getAttribute("data-value");

                // Atualiza as estrelas visualmente
                estrelas.forEach((s, index) => {
                    s.classList.toggle("selecionada", index < rating);
                });

                // Envia a avaliação para o backend
                await enviarAvaliacao(produtoId, rating);
            });
        });

        botaoComprar.addEventListener("click", async () => {
            const quantidade = quantidadeInput.value;
            if (quantidade > 0) {
                await enviarCompra(produtoId, quantidade);
            } else {
                mostrarFeedback("Por favor, insira uma quantidade válida.", "erro");
            }
        });
    });

    listarAvaliacoes();
});
