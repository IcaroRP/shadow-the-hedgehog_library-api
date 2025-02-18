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
    
                // Define a posição inicial (por exemplo, após o caractere "|")
                const posicaoInicial = richPresenceMsg.indexOf('in ') + 2;
    
                // Extrai o texto a partir da posição inicial
                const textoFormatado = richPresenceMsg.substring(posicaoInicial).replace(/\|/g, '\n');
    
                // Exibe na página
                document.getElementById('richPresenceTexto').innerText = textoFormatado;
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

function desenharLinha() {
    const svg = document.getElementById('linhaRota');
    svg.innerHTML = ''; // Limpa linhas anteriores

    // Seleciona apenas as fases que estão ativas (com as classes .dark, .normal, ou .hero)
    const activeStages = document.querySelectorAll('.diagrama .stage.dark, .diagrama .stage.normal, .diagrama .stage.hero');
    const pontos = [];

    // Obtém o contêiner do diagrama para calcular as coordenadas relativas
    const diagrama = document.querySelector('.diagrama');

    activeStages.forEach(stage => {
        // Calcula as coordenadas relativas ao contêiner do diagrama
        const rect = stage.getBoundingClientRect();
        const diagramaRect = diagrama.getBoundingClientRect();
        const x = rect.left - diagramaRect.left + (rect.width / 2);
        const y = rect.top - diagramaRect.top + (rect.height / 1.6);
        
        // Obtém o tipo da fase (dark, normal, hero)
        const tipoFase = stage.classList.contains('dark') ? 'dark' :
                         stage.classList.contains('hero') ? 'hero' : 'normal';
        
        pontos.push({ x, y, tipoFase }); // Armazena as coordenadas e o tipo da fase
    });

    // Desenha a linha apenas entre as fases ativas
    for (let i = 0; i < pontos.length - 1; i++) {
        const linha = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        linha.setAttribute('x1', pontos[i].x);
        linha.setAttribute('y1', pontos[i].y);
        linha.setAttribute('x2', pontos[i + 1].x);
        linha.setAttribute('y2', pontos[i + 1].y);

        // Define a cor da linha com base nos tipos das fases conectadas
        const tipoAtual = pontos[i].tipoFase;
        const tipoProximo = pontos[i + 1].tipoFase;

        if (tipoAtual === 'dark' && tipoProximo === 'dark') {
            linha.setAttribute('stroke', 'red'); // Vermelho para dark-dark
        } else if (tipoAtual === 'normal' && tipoProximo === 'normal') {
            linha.setAttribute('stroke', 'green'); // Verde para normal-normal
        } else if (tipoAtual === 'hero' && tipoProximo === 'hero') {
            linha.setAttribute('stroke', 'blue'); // Azul para hero-hero
        } else if (
            (tipoAtual === 'dark' && tipoProximo === 'normal') ||
            (tipoAtual === 'normal' && tipoProximo === 'dark')
        ) {
            linha.setAttribute('stroke', 'orange'); // Laranja para dark-normal ou normal-dark
        } else if (
            (tipoAtual === 'dark' && tipoProximo === 'hero') ||
            (tipoAtual === 'hero' && tipoProximo === 'dark')
        ) {
            linha.setAttribute('stroke', 'purple'); // Roxo para dark-hero ou hero-dark
        } else if (
            (tipoAtual === 'normal' && tipoProximo === 'hero') ||
            (tipoAtual === 'hero' && tipoProximo === 'normal')
        ) {
            linha.setAttribute('stroke', 'cyan'); // Ciano para normal-hero ou hero-normal
        }

        linha.setAttribute('stroke-width', '12'); // Espessura da linha
        linha.setAttribute('stroke-opacity', '0.7'); // Transparência da linha
        svg.appendChild(linha);
    }
}

// Redesenha a linha quando a janela é redimensionada
window.addEventListener('resize', desenharLinha);

// Chama a função sempre que uma rota é buscada
function buscarRota(rotaId) {
    fetch(`http://localhost:5000/rotas/${rotaId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro na requisição');
            }
            return response.json();
        })
        .then(data => {
            document.getElementById('nomeRota').innerText = `Agora: #${data.id} ${data.Name}`;
            const fases = Object.values(data).slice(1, 7);

            document.querySelectorAll('.stage').forEach(el => {
                el.classList.remove('dark', 'normal', 'hero');
                el.innerHTML = el.innerText.split(" (")[0];
            });

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

                    if (!elemento.innerHTML.includes(tipoFase)) {
                        elemento.innerHTML += ` <span class="tipoFase">(${tipoFase})</span>`;
                    }
                }
            });

            desenharLinha(); // Desenha a linha após atualizar as fases
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
