document.addEventListener("DOMContentLoaded", () => {
    const apiBaseUrl = "https://api-gilt-pi.vercel.app";

    const feedbackContainer = document.getElementById("feedback");
    const avaliacoesContainer = document.getElementById("avaliacoes-container");
    const produtos = document.querySelectorAll(".produto");

    
    
    let lastScrollTop = 0; 

    window.addEventListener('scroll', function () {
        let header = document.querySelector('header');
        let currentScroll = window.pageYOffset || document.documentElement.scrollTop;

        
        if (currentScroll > lastScrollTop) {
            header.classList.add('hidden');
            header.classList.remove('visible');
        } else { 
            header.classList.remove('hidden');
            header.classList.add('visible');
        }

       
        lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
    });


    if (window.pageYOffset > 0) {
        document.querySelector('header').classList.add('hidden');
    }
});
document.addEventListener("DOMContentLoaded", () => {
    const apiBaseUrl = "https://api-gilt-pi.vercel.app";

    const feedbackContainer = document.getElementById("feedback");
    const avaliacoesContainer = document.getElementById("avaliacoes-container");
    const listarAvaliacoesButton = document.getElementById("listar-avaliacoes");
    const produtos = document.querySelectorAll(".produto");

    
    const mostrarFeedback = (mensagem, tipo) => {
        const modal = document.getElementById("modal-feedback");
        const modalMessage = document.getElementById("modal-message");
        const modalAtualizar = document.getElementById("modal-atualizar");

        
        modalMessage.textContent = mensagem;

        
        if (tipo === "sucesso") {
            modal.style.backgroundColor = "#4CAF50"; 
        } else if (tipo === "erro") {
            modal.style.backgroundColor = "#f44336"; 
        }

        
        modal.style.display = "flex";

        
        const closeModal = document.getElementById("modal-close");
        closeModal.onclick = () => {
            modal.style.display = "none";
        };

        
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
    
        
            const respostaJson = await resposta.json();
            const produtoNome = respostaJson.produtoNome || 'Produto'; 
    
            
            mostrarFeedback(`Avaliação enviada com sucesso para o produto: ${produtoNome}!`, "sucesso");
        } catch (erro) {
            console.error("Erro ao enviar avaliação:", erro);
            mostrarFeedback("Erro ao enviar avaliação: " + erro.message, "erro");
        }
    };
    
    
    produtos.forEach((produto) => {
        const estrelas = produto.querySelectorAll(".estrela");
        const produtoId = produto.querySelector(".avaliacao").getAttribute("data-id"); 
    
        estrelas.forEach((estrela) => {
            estrela.addEventListener("click", async () => {
                const rating = estrela.getAttribute("data-value");
    
                
                estrelas.forEach((s, index) => {
                    s.classList.toggle("selecionada", index < rating);
                });
    
                
                await enviarAvaliacao(produtoId, rating);
            });
        });
    });
    
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

            if (avaliacoes.length === 0) {
                avaliacoesContainer.innerHTML = "<p>Não há avaliações para exibir.</p>";
                return;
            }

            
            avaliacoes.forEach((avaliacao) => {
                const avaliacaoElement = document.createElement("div");
                avaliacaoElement.classList.add("avaliacao-item");
                avaliacaoElement.innerHTML = `
                     <p class="nome-produto"> ${avaliacao.produtoNome}</p>
                <p>ID do Produto: ${avaliacao.produtoId}</p>
                <p>Nota: ${avaliacao.rating}</p>
                    <button onclick="excluirAvaliacao('${avaliacao._id}')">Excluir</button>
                    <button onclick="atualizarAvaliacao('${avaliacao._id}', ${avaliacao.rating})">Atualizar</button>
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

    
     window.atualizarAvaliacao = (id, ratingAtual) => {
        const modalAtualizar = document.getElementById("modal-atualizar");
        const novoRatingInput = document.getElementById("novo-rating");
        const confirmarAtualizarBtn = document.getElementById("confirmar-atualizar");

        
        novoRatingInput.value = ratingAtual;

        
        modalAtualizar.style.display = "flex";

        
        const closeModalAtualizar = document.getElementById("modal-close-atualizar");
        closeModalAtualizar.onclick = () => {
            modalAtualizar.style.display = "none";
        };

        
        window.onclick = (event) => {
            if (event.target === modalAtualizar) {
                modalAtualizar.style.display = "none";
            }
        };

        
        confirmarAtualizarBtn.onclick = async () => {
            const novoRating = novoRatingInput.value;
            if (novoRating >= 1 && novoRating <= 5) {
                try {
                    const resposta = await fetch(`${apiBaseUrl}/api/avaliacoes/${id}`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ rating: parseInt(novoRating, 10) }),
                    });

                    if (!resposta.ok) {
                        const contentType = resposta.headers.get("content-type");
                        if (contentType && contentType.includes("application/json")) {
                            const errorData = await resposta.json();
                            throw new Error(errorData.error || "Erro ao atualizar avaliação.");
                        } else {
                            throw new Error("Resposta inesperada do servidor.");
                        }
                    }

                    
                    mostrarFeedback("Avaliação atualizada com sucesso!", "sucesso");
                    listarAvaliacoes(); 

                    
                    modalAtualizar.style.display = "none";
                } catch (erro) {
                    console.error("Erro ao atualizar avaliação:", erro);
                    mostrarFeedback("Erro ao atualizar avaliação: " + erro.message, "erro");
                }
            } else {
                mostrarFeedback("Rating inválido. Por favor, insira um número entre 1 e 5.", "erro");
            }
        };
    };




    
    produtos.forEach((produto) => {
        const produtoId = produto.querySelector(".avaliacao").getAttribute("data-id");
        const estrelas = produto.querySelectorAll(".estrela");
        const botaoComprar = produto.querySelector(".comprar");
        const quantidadeInput = produto.querySelector(".quantidade");

        estrelas.forEach((estrela) => {
            estrela.addEventListener("click", async () => {
                const rating = estrela.getAttribute("data-value");

                
                estrelas.forEach((s, index) => {
                    s.classList.toggle("selecionada", index < rating);
                });

                
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

    listarAvaliacoesButton.addEventListener("click", listarAvaliacoes);
});
