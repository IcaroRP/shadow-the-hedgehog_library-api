// Captura os parâmetros key e id na URL (ex: ?key=chave_aqui&id=1)
const urlParams = new URLSearchParams(window.location.search);
const apiKey = urlParams.get('key');
const rotaId = urlParams.get('id');

// Verifica se a chave foi informada na URL
if (apiKey) {
    // Monta a URL da API usando a chave informada na URL
    const apiUrl = `https://retroachievements.org/API/API_GetUserProfile.php?u=Kent&y=${apiKey}`;

    // Função para buscar a informação e exibir na página
    function buscarRichPresence() {
        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro na requisição');
                }
                return response.json();
            })
            .then(data => {
                // Pega a informação RichPresenceMsg do JSON
                const richPresenceMsg = data.RichPresenceMsg;

                // Exibe na página
                document.getElementById('richPresenceTexto').innerText = richPresenceMsg;
            })
            .catch(error => {
                console.error('Erro ao buscar RichPresence:', error);
                document.getElementById('richPresenceTexto').innerText = 'Erro ao carregar';
            });
    }

    // Atualiza o RichPresenceMsg a cada 5 segundos
    document.addEventListener('DOMContentLoaded', buscarRichPresence);
    setInterval(buscarRichPresence, 5000);
}

// Função para buscar a rota pelo ID
function buscarRota(rotaId) {
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
                el.innerHTML = el.innerText.split(" (")[0];
            });

            // Adicionar destaque nas fases da rota com base no tipo e mostrar o tipo ao lado
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

                    // Exibir o tipo da fase ao lado do nome
                    if (!elemento.innerHTML.includes(tipoFase)) {
                        elemento.innerHTML += ` <span class="tipoFase">(${tipoFase})</span>`;
                    }
                }
            });
        })
        .catch(error => {
            console.error('Erro ao buscar rota:', error);
            document.getElementById('nomeRota').innerText = 'Rota não encontrada';
        });
}

// Verifica se existe um ID na URL e faz a busca automaticamente
document.addEventListener('DOMContentLoaded', () => {
    if (rotaId) {
        document.getElementById('rotaInput').value = rotaId;
        buscarRota(rotaId);
    }
});

// Evento para o formulário de busca manual
document.getElementById('rotaForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const rotaId = document.getElementById('rotaInput').value;

    // Atualiza a URL com o ID e mantém a chave da API
    window.history.pushState({}, '', `index.html?key=${apiKey}&id=${rotaId}`);
    buscarRota(rotaId);
});
