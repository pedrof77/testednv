document.addEventListener("DOMContentLoaded", () => {
    
    const apiBaseUrl = "https://api-gilt-pi.vercel.app";

    const feedbackContainer = document.getElementById("feedback"); 
    const avaliacoesContainer = document.getElementById("avaliacoes-container"); 
    const comprasContainer = document.getElementById("compras-container"); 

    const mostrarFeedback = (mensagem, tipo) => {
        feedbackContainer.textContent = mensagem;
        feedbackContainer.className = tipo; 
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
                const errorData = await resposta.json();
                throw new Error(errorData.error || "Erro ao enviar avaliação.");
            }

            mostrarFeedback("Avaliação enviada com sucesso!", "sucesso");
            listarAvaliacoes(); 
        } catch (erro) {
            mostrarFeedback("Erro ao enviar avaliação: " + erro.message, "erro");
        }
    };

    
    const listarAvaliacoes = async () => {
        try {
            const resposta = await fetch(`${apiBaseUrl}/avaliacoes`, {
                method: "GET",
            });

            if (!resposta.ok) {
                const errorData = await resposta.json();
                throw new Error(errorData.error || "Erro ao listar avaliações.");
            }

            const avaliacoes = await resposta.json();
            
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

    
    const excluirAvaliacao = async (id) => {
        try {
            const resposta = await fetch(`${apiBaseUrl}/avaliacoes/${id}`, {
                method: "DELETE",
            });

            if (!resposta.ok) {
                const errorData = await resposta.json();
                throw new Error(errorData.error || "Erro ao excluir avaliação.");
            }

            mostrarFeedback("Avaliação excluída com sucesso!", "sucesso");
            listarAvaliacoes(); 
        } catch (erro) {
            mostrarFeedback("Erro ao excluir avaliação: " + erro.message, "erro");
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
                const errorData = await resposta.json();
                throw new Error(errorData.error || "Erro ao enviar compra.");
            }

            mostrarFeedback("Compra realizada com sucesso!", "sucesso");
            listarCompras(); 
        } catch (erro) {
            mostrarFeedback("Erro ao realizar compra: " + erro.message, "erro");
        }
    };

    
    const listarCompras = async () => {
        try {
            const resposta = await fetch(`${apiBaseUrl}/compras`, {
                method: "GET",
            });

            if (!resposta.ok) {
                const errorData = await resposta.json();
                throw new Error(errorData.error || "Erro ao listar compras.");
            }

            const compras = await resposta.json();
            
            comprasContainer.innerHTML = "";

            compras.forEach(compra => {
                const compraElement = document.createElement("div");
                compraElement.classList.add("compra-item");
                compraElement.innerHTML = `
                    <p>Produto ID: ${compra.produtoId}, Quantidade: ${compra.quantidade}</p>
                    <button onclick="excluirCompra('${compra._id}')">Excluir</button>
                `;
                comprasContainer.appendChild(compraElement);
            });
        } catch (erro) {
            mostrarFeedback("Erro ao listar compras: " + erro.message, "erro");
        }
    };

    
    const excluirCompra = async (id) => {
        try {
            const resposta = await fetch(`${apiBaseUrl}/compras/${id}`, {
                method: "DELETE",
            });

            if (!resposta.ok) {
                const errorData = await resposta.json();
                throw new Error(errorData.error || "Erro ao excluir compra.");
            }

            mostrarFeedback("Compra excluída com sucesso!", "sucesso");
            listarCompras(); 
        } catch (erro) {
            mostrarFeedback("Erro ao excluir compra: " + erro.message, "erro");
        }
    };

    
    document.querySelectorAll(".avaliacao").forEach(container => {
        container.querySelectorAll(".estrela").forEach(star => {
            star.addEventListener("click", async () => {
                const produtoId = container.getAttribute("data-id");
                const rating = star.getAttribute("data-value");

                
                container.querySelectorAll(".estrela").forEach((s, index) => {
                    s.classList.toggle("selecionada", index < rating);
                });

                
                await enviarAvaliacao(produtoId, rating);
            });
        });
    });

    
    document.querySelectorAll(".compra").forEach(container => {
        container.querySelector("button").addEventListener("click", async () => {
            const produtoId = container.getAttribute("data-id");
            const quantidade = container.querySelector("input").value;

            
            await enviarCompra(produtoId, quantidade);
        });
    });

    
    listarAvaliacoes();
    listarCompras();
});
