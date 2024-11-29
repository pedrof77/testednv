document.addEventListener("DOMContentLoaded", () => {
    const apiBaseUrl = "https://api-gilt-pi.vercel.app";

    const feedbackContainer = document.getElementById("feedback");
    const avaliacoesContainer = document.getElementById("avaliacoes-container");
    const produtos = document.querySelectorAll(".produto");

    const mostrarFeedback = (mensagem, tipo, tempo = 3000) => {
        feedbackContainer.textContent = mensagem;
        feedbackContainer.className = `feedback ${tipo}`;
        
        // Remove a mensagem após o tempo especificado
        setTimeout(() => {
            feedbackContainer.textContent = "";
            feedbackContainer.className = "feedback"; // Classe padrão para limpar estilos
        }, tempo);
    };

    const enviarAvaliacao = async (produtoId, rating) => {
        try {
            const resposta = await fetch(`${apiBaseUrl}/api/avaliacoes`, {
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
            const resposta = await fetch(`${apiBaseUrl}/api/compras`, {
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
            const resposta = await fetch(`${apiBaseUrl}/api/avaliacoes`, { method: "GET" });

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
            const resposta = await fetch(`${apiBaseUrl}/api/avaliacoes/${id}`, { method: "DELETE" });

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

    // Função que lida com a visibilidade do cabeçalho
    let lastScrollTop = 0; // Para armazenar a posição da última rolagem

    window.addEventListener('scroll', function () {
        let header = document.querySelector('header');
        let currentScroll = window.pageYOffset || document.documentElement.scrollTop;

        // Se o usuário estiver rolando para baixo, o cabeçalho desaparece
        if (currentScroll > lastScrollTop) {
            header.classList.add('hidden');
            header.classList.remove('visible');
        } else { // Caso contrário, o cabeçalho aparece
            header.classList.remove('hidden');
            header.classList.add('visible');
        }

        // Atualiza a posição da rolagem para a próxima comparação
        lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
    });

    // Ajusta o cabeçalho ao carregar a página
    if (window.pageYOffset > 0) {
        document.querySelector('header').classList.add('hidden');
    }
});
document.addEventListener("DOMContentLoaded", () => {
    const apiBaseUrl = "https://api-gilt-pi.vercel.app";

    const feedbackContainer = document.getElementById("feedback");
    const avaliacoesContainer = document.getElementById("avaliacoes-container");
    const produtos = document.querySelectorAll(".produto");

    // Função para mostrar o feedback usando o modal
    const mostrarFeedback = (mensagem, tipo) => {
        const modal = document.getElementById("modal-feedback");
        const modalMessage = document.getElementById("modal-message");

        // Define a mensagem no modal
        modalMessage.textContent = mensagem;

        // Definir a cor de fundo do modal com base no tipo de mensagem (sucesso ou erro)
        if (tipo === "sucesso") {
            modal.style.backgroundColor = "#4CAF50"; // Verde para sucesso
        } else if (tipo === "erro") {
            modal.style.backgroundColor = "#f44336"; // Vermelho para erro
        }

        // Exibir o modal
        modal.style.display = "flex";

        // Fechar o modal quando clicar no "x"
        const closeModal = document.getElementById("modal-close");
        closeModal.onclick = () => {
            modal.style.display = "none";
        };

        // Fechar o modal ao clicar fora do conteúdo
        window.onclick = (event) => {
            if (event.target === modal) {
                modal.style.display = "none";
            }
        };
    };

    const enviarAvaliacao = async (produtoId, rating) => {
        try {
            const resposta = await fetch(`${apiBaseUrl}/api/avaliacoes`, {
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
            const resposta = await fetch(`${apiBaseUrl}/api/compras`, {
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

    // Função de listagem de avaliações
    const listarAvaliacoes = async () => {
        try {
            const resposta = await fetch(`${apiBaseUrl}/api/avaliacoes`, { method: "GET" });

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
            const resposta = await fetch(`${apiBaseUrl}/api/avaliacoes/${id}`, { method: "DELETE" });

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

    // Processamento das interações com o produto
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
