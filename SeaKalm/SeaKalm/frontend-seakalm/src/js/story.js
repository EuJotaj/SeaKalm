document.addEventListener('DOMContentLoaded', () => {
    // --- SELEÇÃO DE ELEMENTOS ---
    const storyContentBox = document.getElementById('story-content');
    const player = document.getElementById('tts-player');
    const playButton = document.getElementById('play-button');
    const pauseButton = document.getElementById('pause-button');
    const stopButton = document.getElementById('stop-button');
    
    // Elementos para os novos metadados
    const categoryEl = document.getElementById('story-category');
    const durationEl = document.getElementById('story-duration');
    const ageEl = document.getElementById('story-age');

    const API_URL = 'http://localhost:8080/api/stories';

    // --- VARIÁVEIS DE ESTADO (Refatoradas para a nova lógica) ---
    let wordSpans = []; // Array com TODAS as <span> de palavras da história inteira
    let textChunks = []; // Array com os PEDAÇOS de texto a serem falados (título + parágrafos)
    let currentChunkIndex = 0; // Qual parágrafo está sendo lido
    let globalWordIndex = 0; // Índice global da palavra para o destaque
    let isSpeaking = false;

    /**
     * Pega o ID da história da URL.
     */
    function getStoryIdFromUrl() {
        const params = new URLSearchParams(window.location.search);
        return params.get('id');
    }

    /**
     * Busca os dados da história e inicia o processo.
     */
    async function fetchStory() {
        const storyId = getStoryIdFromUrl();
        if (!storyId) {
            storyContentBox.innerHTML = '<h1>Erro: História não encontrada.</h1>';
            return;
        }
        try {
            const response = await fetch(`${API_URL}/${storyId}`);
            if (!response.ok) throw new Error('História não pôde ser carregada.');
            
            const story = await response.json();
            
            // 1. Preenche os metadados na página
            populateStoryMetadata(story);
            
            // 2. Renderiza o texto e o divide em pedaços para a fala
            renderAndChunkStory(story.title, story.content);

            player.classList.remove('hidden');

        } catch (error) {
            console.error("Erro ao buscar história:", error);
            storyContentBox.innerHTML = `<h1>Oops! ${error.message}</h1>`;
        }
    }
    
    /**
     * NOVO: Preenche o card de informações da história.
     */
    function populateStoryMetadata(story) {
        categoryEl.textContent = story.category || 'N/A';
        durationEl.textContent = story.durationInMinutes ? `${story.durationInMinutes} min de leitura` : 'N/A';
        ageEl.textContent = story.ageRange || 'Todas as idades';
    }

    /**
     * MELHORADO: Renderiza o texto, respeitando parágrafos, e cria os "chunks" para a fala.
     */
    function renderAndChunkStory(title, content) {
        storyContentBox.innerHTML = ''; // Limpa
        wordSpans = [];
        textChunks = [];

        // 1. Processa o TÍTULO
        const titleElement = document.createElement('h1');
        processTextChunk(title, titleElement);
        storyContentBox.appendChild(titleElement);
        textChunks.push(title + "."); // Adiciona título como primeiro "chunk" de fala
        
        // 2. Processa o CONTEÚDO, parágrafo por parágrafo
        const paragraphs = content.split('\n').filter(p => p.trim() !== ''); // Separa por quebra de linha
        paragraphs.forEach(paragraphText => {
            const pElement = document.createElement('p');
            processTextChunk(paragraphText, pElement);
            storyContentBox.appendChild(pElement);
            textChunks.push(paragraphText); // Adiciona cada parágrafo como um "chunk"
        });
    }

    /**
     * Função auxiliar para processar um pedaço de texto (título ou parágrafo).
     */
    function processTextChunk(text, parentElement) {
        const words = text.split(/\s+/).filter(w => w.length > 0);
        words.forEach(word => {
            const wordSpan = document.createElement('span');
            wordSpan.textContent = word + ' ';
            parentElement.appendChild(wordSpan);
            wordSpans.push(wordSpan); // Adiciona a <span> ao array global
        });
    }

    /**
     * NOVO: A função principal para a fala. Fala um "chunk" e, quando termina, chama a si mesma para o próximo.
     */
    function speakNextChunk() {
        if (currentChunkIndex >= textChunks.length || !isSpeaking) {
            resetPlayer();
            return; // Acabaram os chunks ou o usuário parou
        }

        const utterance = new SpeechSynthesisUtterance(textChunks[currentChunkIndex]);
        utterance.lang = 'pt-BR';

        utterance.onboundary = (event) => {
            if (event.name === 'word') {
                // Remove destaque da palavra anterior e destaca a atual
                if (wordSpans[globalWordIndex - 1]) wordSpans[globalWordIndex - 1].classList.remove('highlight');
                if (wordSpans[globalWordIndex]) wordSpans[globalWordIndex].classList.add('highlight');
                globalWordIndex++;
            }
        };

        utterance.onend = () => {
            currentChunkIndex++; // Vai para o próximo chunk
            speakNextChunk(); // Chama a função para o próximo
        };
        
        speechSynthesis.speak(utterance);
    }
    
    /**
     * MELHORADO: Reseta o player e as variáveis de estado.
     */
    function resetPlayer() {
        isSpeaking = false;
        wordSpans.forEach(span => span.classList.remove('highlight'));
        currentChunkIndex = 0;
        globalWordIndex = 0;
        playButton.classList.remove('hidden');
        pauseButton.classList.add('hidden');
        stopButton.classList.add('hidden');
    }

    // --- CONTROLES DO PLAYER (Atualizados) ---
    playButton.addEventListener('click', () => {
        if (speechSynthesis.paused && isSpeaking) {
            speechSynthesis.resume();
        } else {
            resetPlayer();
            isSpeaking = true;
            speakNextChunk(); // Inicia a sequência de fala
        }
        playButton.classList.add('hidden');
        pauseButton.classList.remove('hidden');
        stopButton.classList.remove('hidden');
    });

    pauseButton.addEventListener('click', () => {
        speechSynthesis.pause();
        pauseButton.classList.add('hidden');
        playButton.classList.remove('hidden');
    });

    stopButton.addEventListener('click', () => {
        isSpeaking = false; // Sinaliza para parar a sequência
        speechSynthesis.cancel(); // Limpa a fila de falas
        resetPlayer();
    });

    // Limpa a fala ao sair da página
    window.addEventListener('beforeunload', () => {
        speechSynthesis.cancel();
    });

    // Inicia tudo
    fetchStory();
});