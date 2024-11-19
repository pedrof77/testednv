document.addEventListener("DOMContentLoaded", () => {
    // Função para lidar com a seleção de estrelas (Avaliação)
    document.querySelectorAll(".avaliacao").forEach(container => {
        container.querySelectorAll(".estrela").forEach(star => {
            star.addEventListener("click", async () => {
                const produtoId = container.getAttribute("data-id");
                const rating = star.getAttribute("data-value");

                // Atualizar visual das estrelas
                container.querySelectorAll(".estrela").forEach((s, index) => {
                    s.classList.toggle("selecionada", index < rating);
                });

                // Enviar avaliação para a API
                try {
                    const token = localStorage.getItem("jwt_token"); // Supondo que o token esteja armazenado no localStorage

                    const resposta = await fetch("https://api-igljz2gr6-pedrof77s-projects.vercel.app/api/avaliacoes", {
                        method: "POST",
                        headers: { 
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}` // Passando o token no cabeçalho
                        },
                        body: JSON.stringify({ produtoId, rating }),
                    });

                    if (!resposta.ok) throw new Error("Erro ao enviar avaliação.");
                    alert("Avaliação enviada com sucesso!");
                } catch (erro) {
                    alert("Erro ao enviar avaliação: " + erro.message);
                }
            });
        });
    });

    // Função para lidar com as compras
    document.querySelectorAll(".comprar").forEach(button => {
        button.addEventListener("click", async () => {
            const produtoId = button.getAttribute("data-id");

            try {
                const token = localStorage.getItem("jwt_token"); // Supondo que o token esteja armazenado no localStorage

                const resposta = await fetch("https://api-igljz2gr6-pedrof77s-projects.vercel.app/api/compras", {
                    method: "POST",
                    headers: { 
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}` // Passando o token no cabeçalho
                    },
                    body: JSON.stringify({ produtoId }),
                });

                if (resposta.ok) {
                    alert("Compra realizada com sucesso!");
                } else {
                    throw new Error("Erro ao realizar compra.");
                }
            } catch (erro) {
                alert("Erro ao realizar compra: " + erro.message);
            }
        });
    });
});
