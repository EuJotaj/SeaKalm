document.addEventListener('DOMContentLoaded', () => {
    // Seleção de todos os elementos necessários
    const storyContentBox = document.getElementById('story-content');
    const player = document.getElementById('tts-player');
    const playButton = document.getElementById('play-button');
    const pauseButton = document.getElementById('pause-button');
    const stopButton = document.getElementById('stop-button');
    const API_URL = 'http://localhost:8080/api/stories';

    let fullStoryText = '';
    let wordSpans = []; // Array para guardar todas as nossas <span> de palavras
    let currentWordIndex = 0; // Para saber qual palavra está sendo lida

    // UTTERANCE: O OBJETO DE FALA
    const utterance = new SpeechSynthesisUtterance();

    /**
     * Pega o ID da história da URL
     */
    function getStoryIdFromUrl() {
        const params = new URLSearchParams(window.location.search);
        return params.get('id');
    }

    /**
     * Busca os dados da história da API.
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
            
            // Une o título e o conteúdo para a leitura da IA
            fullStoryText = story.title + ". " + story.content;
            
            // Chama a função CORRIGIDA para renderizar o texto
            renderStoryTextAsSpans(story.title, story.content);

            setupUtterance();

        } catch (error) {
            console.error("Erro ao buscar história:", error);
            storyContentBox.innerHTML = `<h1>Oops! ${error.message}</h1>`;
        }
    }

    /**
     * === FUNÇÃO CORRIGIDA ===
     * Agora, esta função processa TANTO o título QUANTO o conteúdo,
     * envolvendo cada palavra em uma <span> e guardando-a no array wordSpans.
     */
    function renderStoryTextAsSpans(title, content) {
        storyContentBox.innerHTML = ''; // Limpa o conteúdo
        wordSpans = []; // Limpa o array de palavras para uma nova história
        
        // Processa o TÍTULO
        const titleElement = document.createElement('h1');
        const titleWords = title.split(/\s+/);
        titleWords.forEach(word => {
            const wordSpan = document.createElement('span');
            wordSpan.textContent = word + ' ';
            titleElement.appendChild(wordSpan);
            wordSpans.push(wordSpan); // Adiciona as <span>s do título ao array
        });
        storyContentBox.appendChild(titleElement);
        
        // Adiciona um ponto final virtual ao array, correspondendo ao ". " que uniu os textos
        const periodSpan = document.createElement('span'); 
        periodSpan.style.display = 'none';
        wordSpans.push(periodSpan);

        // Processa o CONTEÚDO
        const paragraph = document.createElement('p');
        const contentWords = content.split(/\s+/);
        contentWords.forEach(word => {
            const wordSpan = document.createElement('span');
            wordSpan.textContent = word + ' ';
            paragraph.appendChild(wordSpan);
            wordSpans.push(wordSpan); // Adiciona as <span>s do conteúdo ao array
        });
        storyContentBox.appendChild(paragraph);
    }
    
    /**
     * Configura o objeto de fala com o texto e os eventos.
     */
    function setupUtterance() {
        utterance.text = fullStoryText;
        utterance.lang = 'pt-BR';

        utterance.onboundary = (event) => {
            // A lógica de onboundary permanece a mesma e agora funcionará para o título
            if (event.name === 'word') {
                if (wordSpans[currentWordIndex - 1]) {
                    wordSpans[currentWordIndex - 1].classList.remove('highlight');
                }
                if (wordSpans[currentWordIndex]) {
                   wordSpans[currentWordIndex].classList.add('highlight');
                }
                currentWordIndex++;
            }
        };

        utterance.onend = () => {
            resetPlayer();
        };

        player.classList.remove('hidden');
    }

    /**
     * Reseta o player para o estado inicial.
     */
    function resetPlayer() {
        // Remove o destaque de todas as palavras
        wordSpans.forEach(span => span.classList.remove('highlight'));
        currentWordIndex = 0;
        playButton.classList.remove('hidden');
        pauseButton.classList.add('hidden');
        stopButton.classList.add('hidden');
    }

    // --- CONTROLES DO PLAYER ---
    playButton.addEventListener('click', () => {
        if (speechSynthesis.paused) {
            speechSynthesis.resume();
        } else {
            // Garante que o estado seja resetado antes de começar de novo
            resetPlayer();
            speechSynthesis.speak(utterance);
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
        speechSynthesis.cancel();
        // A função resetPlayer será chamada pelo evento 'onend'
    });

    window.addEventListener('beforeunload', () => {
        speechSynthesis.cancel();
    });

    fetchStory();
});