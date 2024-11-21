document.addEventListener("DOMContentLoaded", () => {
    const apiBaseUrl = "https://api-igljz2gr6-pedrof77s-projects.vercel.app/api";

    
    const enviarAvaliacao = async (produtoId, rating) => {
        try {
            const token = localStorage.getItem("jwt_token");
            if (!token) {
                alert("Token não encontrado. Por favor, faça login.");
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

            alert("Avaliação enviada com sucesso!");
        } catch (erro) {
            alert("Erro ao enviar avaliação: " + erro.message);
        }
    };

    
    const realizarCompra = async (produtoId) => {
        try {
            const token = localStorage.getItem("jwt_token");
            if (!token) {
                alert("Token não encontrado. Por favor, faça login.");
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

            alert("Compra realizada com sucesso!");
        } catch (erro) {
            alert("Erro ao realizar compra: " + erro.message);
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

    
    document.querySelectorAll(".comprar").forEach(button => {
        button.addEventListener("click", async () => {
            const produtoId = button.getAttribute("data-id");
            await realizarCompra(produtoId);
        });
    });

    
    const listarAvaliacoes = async () => {
        try {
            const token = localStorage.getItem("jwt_token");
            if (!token) {
                alert("Token não encontrado. Por favor, faça login.");
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
            console.log("Avaliações:", avaliacoes);
        } catch (erro) {
            alert("Erro ao listar avaliações: " + erro.message);
        }
    };

    
    const excluirAvaliacao = async (id) => {
        try {
            const token = localStorage.getItem("jwt_token");
            if (!token) {
                alert("Token não encontrado. Por favor, faça login.");
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

            alert("Avaliação excluída com sucesso!");
        } catch (erro) {
            alert("Erro ao excluir avaliação: " + erro.message);
        }
    };

    
    // listar avaliações: listarAvaliacoes();
    // excluir uma avaliação: excluirAvaliacao('id_da_avaliacao');
});
