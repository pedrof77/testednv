document.querySelectorAll('.estrela').forEach(estrela => {
    estrela.addEventListener('click', function() {
        let estrelas = this.parentNode.querySelectorAll('.estrela');
        let selecionada = this.dataset.value;

        estrelas.forEach(estrela => {
            estrela.classList.remove('selecionada');
        });

        for (let i = 0; i < selecionada; i++) {
            estrelas[i].classList.add('selecionada');
        }
    });
});