document.addEventListener("DOMContentLoaded", () => {
    const apiBaseUrl = "https://api-igljz2gr6-pedrof77s-projects.vercel.app/api";
    
    const feedbackContainer = document.getElementById("feedback"); // Container para mensagens de feedback
    const avaliacoesContainer = document.getElementById("avaliacoes-container"); // Container para exibir avaliações
    
    const mostrarFeedback = (mensagem, tipo) => {
        feedbackContainer.textContent = mensagem;
        feedbackContainer.className = tipo; // Define a classe para o estilo (sucesso ou erro)
    };

    // Função para enviar avaliação
    const enviarAvaliacao = async (produtoId, rating) => {
        try {
            const token = localStorage.getItem("jwt_token");
            if (!token) {
                mostrarFeedback("Token não encontrado. Por favor, faça login.", "erro");
                return;
            }

            const resposta = await fetch(`${apiBaseUrl}/avaliacoes`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ produtoId: Number(produtoId), rating: Number(rating) })
            });

            if (!resposta.ok) {
                const errorData = await resposta.json();
                throw new Error(errorData.error || "Erro ao enviar avaliação.");
            }

            mostrarFeedback("Avaliação enviada com sucesso!", "sucesso");
            listarAvaliacoes(); // Atualiza a lista de avaliações
        } catch (erro) {
            mostrarFeedback("Erro ao enviar avaliação: " + erro.message, "erro");
        }
    };

    // Função para realizar a compra
    const realizarCompra = async (produtoId) => {
        try {
            const token = localStorage.getItem("jwt_token");
            if (!token) {
                mostrarFeedback("Token não encontrado. Por favor, faça login.", "erro");
                return;
            }

            const resposta = await fetch(`${apiBaseUrl}/compras`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ produtoId: Number(produtoId) })
            });

            if (!resposta.ok) {
                const errorData = await resposta.json();
                throw new Error(errorData.error || "Erro ao realizar compra.");
            }

            mostrarFeedback("Compra realizada com sucesso!", "sucesso");
        } catch (erro) {
            mostrarFeedback("Erro ao realizar compra: " + erro.message, "erro");
        }
    };

    // Função para listar as avaliações
    const listarAvaliacoes = async () => {
        try {
            const token = localStorage.getItem("jwt_token");
            if (!token) {
                mostrarFeedback("Token não encontrado. Por favor, faça login.", "erro");
                return;
            }

            const resposta = await fetch(`${apiBaseUrl}/avaliacoes`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!resposta.ok) {
                const errorData = await resposta.json();
                throw new Error(errorData.error || "Erro ao listar avaliações.");
            }

            const avaliacoes = await resposta.json();
            // Limpar o container antes de adicionar as avaliações
            avaliacoesContainer.innerHTML = "";

            avaliacoes.forEach(avaliacao => {
                const avaliacaoElement = document.createElement("div");
                avaliacaoElement.classList.add("avaliacao-item");
                avaliacaoElement.innerHTML = `
                    <p>Produto ID: ${avaliacao.produtoId}, Nota: ${avaliacao.rating}</p>
                    <button onclick="excluirAvaliacao('${avaliacao._id}')">Excluir</button>
                `;
                avaliacoesContainer.appendChild(avaliacaoElement);
            });
        } catch (erro) {
            mostrarFeedback("Erro ao listar avaliações: " + erro.message, "erro");
        }
    };

    // Função para excluir avaliação
    const excluirAvaliacao = async (id) => {
        try {
            const token = localStorage.getItem("jwt_token");
            if (!token) {
                mostrarFeedback("Token não encontrado. Por favor, faça login.", "erro");
                return;
            }

            const resposta = await fetch(`${apiBaseUrl}/avaliacoes/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!resposta.ok) {
                const errorData = await resposta.json();
                throw new Error(errorData.error || "Erro ao excluir avaliação.");
            }

            mostrarFeedback("Avaliação excluída com sucesso!", "sucesso");
            listarAvaliacoes(); // Atualiza a lista de avaliações
        } catch (erro) {
            mostrarFeedback("Erro ao excluir avaliação: " + erro.message, "erro");
        }
    };

    // Lidar com a seleção de estrelas para avaliação
    document.querySelectorAll(".avaliacao").forEach(container => {
        container.querySelectorAll(".estrela").forEach(star => {
            star.addEventListener("click", async () => {
                const produtoId = container.getAttribute("data-id");
                const rating = star.getAttribute("data-value");

                // Atualiza a classe das estrelas na interface
                container.querySelectorAll(".estrela").forEach((s, index) => {
                    s.classList.toggle("selecionada", index < rating);
                });

                // Envia a avaliação
                await enviarAvaliacao(produtoId, rating);
            });
        });
    });

    // Lidar com os botões de compra
    document.querySelectorAll(".comprar").forEach(button => {
        button.addEventListener("click", async () => {
            const produtoId = button.getAttribute("data-id");
            await realizarCompra(produtoId);
        });
    });

    // Carregar avaliações ao iniciar a página
    listarAvaliacoes();
});
