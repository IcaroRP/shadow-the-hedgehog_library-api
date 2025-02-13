document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('rotaForm').addEventListener('submit', function (e) {
        e.preventDefault();
        const rotaId = document.getElementById('rotaInput').value;

        fetch(`http://localhost:5000/rotas/${rotaId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro na requisição');
                }
                return response.json();
            })
            .then(data => {
                console.log(data);

                // Exibir o nome da rota acima dos diagramas
                document.getElementById('nomeRota').innerText = `Agora: ${data.Name}`;

                // Pegar apenas os valores das fases Stage 1 a Stage 6
                const fases = Object.values(data).slice(1, 7);

                // Remover classes anteriores de cores
                document.querySelectorAll('.stage').forEach(el => {
                    el.classList.remove('dark', 'normal', 'hero');
                });

                // Adicionar destaque nas fases da rota com base no tipo
                fases.forEach(fase => {
                    const nomeFase = fase.split("(")[0].trim();
                    const tipoFase = fase.split("(")[1]?.replace(")", "").toLowerCase().trim();

                    const elemento = Array.from(document.querySelectorAll('.stage'))
                        .find(el => el.innerText.includes(nomeFase));

                    if (elemento) {
                        if (tipoFase === 'dark') {
                            elemento.classList.add('dark');
                        } else if (tipoFase === 'hero') {
                            elemento.classList.add('hero');
                        } else {
                            elemento.classList.add('normal');
                        }
                    }
                });
            })
            .catch(error => {
                console.error('Erro:', error);
            });
    });
});
