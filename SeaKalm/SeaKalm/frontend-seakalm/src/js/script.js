document.addEventListener('DOMContentLoaded', () => {
    // ========================================================================
    // --- CHAVE GERAL DE MANUTENÇÃO ---
    // Mude para 'false' para reativar as funções de IA quando estiverem prontas.
    // ========================================================================
    const isMaintenanceMode = true;

    // --- Template HTML para o aviso de manutenção ---
    const maintenanceHTML = `
        <div class="maintenance-notice">
            <i class="fa-solid fa-person-digging"></i>
            <h4>Em Construção</h4>
            <p>Estamos trabalhando para deixar esta função ainda melhor! Volte em breve para conferir as novidades.</p>
        </div>
    `;

    // === SELEÇÃO DE ELEMENTOS DO DOM ===
    const API_URL = 'http://localhost:8080/api';
    const storyLibrary = document.getElementById('story-library');
    const categoryFilters = document.getElementById('category-filters');
    
    const openChatHeroButton = document.getElementById('open-chat-hero-button');
    const chatModal = document.getElementById('chat-modal');
    const closeChatButton = document.getElementById('close-chat-button');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');

    const openGenerateModalButton = document.getElementById('open-generate-modal-button');
    const generateStoryModal = document.getElementById('generate-story-modal');
    const closeGenerateModalButton = document.getElementById('close-generate-modal-button');
    const generatePromptForm = document.getElementById('generate-prompt-form');
    
    const customAlertModal = document.getElementById('custom-alert-modal');
    
    let allStories = [];

    // === FUNÇÕES REUTILIZÁVEIS ===

    /**
     * Exibe um modal de alerta customizado com um conteúdo HTML.
     */
    function showCustomAlert(htmlContent, title = "Aviso") {
        customAlertModal.innerHTML = `
            <div class="modal-content alert-modal">
                <button class="close-button">&times;</button>
                <h3>${title}</h3>
                ${htmlContent}
            </div>
        `;
        customAlertModal.classList.remove('hidden');
        // Adiciona evento para fechar o modal no botão de fechar recém-criado
        customAlertModal.querySelector('.close-button').addEventListener('click', () => {
            customAlertModal.classList.add('hidden');
        });
    }

    /**
     * Trunca um texto para um comprimento máximo, sem cortar palavras ao meio.
     */
    function truncateText(text, maxLength) {
        if (!text || text.length <= maxLength) {
            return text;
        }
        const truncated = text.substring(0, maxLength);
        const lastSpaceIndex = truncated.lastIndexOf(' ');
        if (lastSpaceIndex > 0) {
            return truncated.substring(0, lastSpaceIndex) + '...';
        }
        return truncated + '...';
    }

    // --- CARREGAMENTO E FILTRO DE HISTÓRIAS ---
    async function fetchAndRenderStories() {
        try {
            const response = await fetch(`${API_URL}/stories`);
            if (!response.ok) throw new Error('Falha ao buscar dados');
            allStories = await response.json();
            renderStories(allStories);
        } catch (error) {
            console.error("Erro ao carregar histórias:", error);
            storyLibrary.innerHTML = "<p>Não foi possível carregar as histórias. Verifique a conexão com o servidor.</p>";
        }
    }

    /**
     * Renderiza os cards de história na página principal, usando o resumo do conteúdo.
     */
    function renderStories(storiesToRender) {
        storyLibrary.innerHTML = '';
        storiesToRender.forEach(story => {
            // Cria um resumo do conteúdo da história.
            const summary = truncateText(story.content, 120);

            // O card é um link <a> para que toda a área seja clicável.
            const storyCard = document.createElement('a');
            storyCard.className = 'story-card';
            storyCard.href = `story.html?id=${story.id}`;
            storyCard.innerHTML = `
                <h3>${story.title}</h3>
                <p>${summary}</p> <!-- Usa o resumo aqui -->
                <div class="story-card-meta">
                    <div class="meta-item"><i class="fa-regular fa-clock"></i><span>${story.durationInMinutes || '?'} min</span></div>
                    <div class="meta-item"><i class="fa-solid fa-users"></i><span>${story.ageRange || 'N/A'}</span></div>
                </div>
                <!-- O botão agora é um <span> para manter o estilo sem aninhar links -->
                <span class="story-card-button"><i class="fa-solid fa-play"></i> Ler e Ouvir História</span>
            `;
            storyLibrary.appendChild(storyCard);
        });
    }

    categoryFilters.addEventListener('click', (event) => {
        const target = event.target.closest('button.filter-button');
        if (target) {
            const selectedCategory = target.dataset.category;
            document.querySelectorAll('.filter-button').forEach(btn => btn.classList.remove('active'));
            target.classList.add('active');
            const filteredStories = selectedCategory === 'Todas' ? allStories : allStories.filter(story => story.category === selectedCategory);
            renderStories(filteredStories);
        }
    });

    // --- LÓGICA DO CHATBOT LUNA (COM MODO MANUTENÇÃO) ---
    function openChat() {
        chatModal.classList.remove('hidden');
        if (isMaintenanceMode) {
            chatMessages.innerHTML = maintenanceHTML;
            chatForm.classList.add('hidden'); // Esconde o campo de input
        } else {
            chatForm.classList.remove('hidden'); // Mostra o campo de input
            chatMessages.innerHTML = '<div class="message luna-message"><p>Olá! Eu sou o assistente SeaKalm. Como você está se sentindo hoje?</p></div>';
        }
    }

    function closeChat() { chatModal.classList.add('hidden'); }
    
    openChatHeroButton.addEventListener('click', openChat);
    document.body.addEventListener('click', e => { if (e.target && e.target.id === 'nav-chat-button') openChat(); });
    closeChatButton.addEventListener('click', closeChat);

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (isMaintenanceMode) return; // Bloqueia a função se estiver em manutenção

        const userMessage = chatInput.value.trim();
        if (!userMessage) return;

        addMessageToChat(userMessage, 'user');
        chatInput.value = '';
        
        try {
            const response = await fetch(`${API_URL}/chatbot/ask`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: userMessage }) });
            const data = await response.json();
            addMessageToChat(data.reply, 'luna');
        } catch (error) {
            console.error("Erro na API do Chatbot:", error);
            addMessageToChat("Desculpe, estou com dificuldades para me conectar no momento.", 'luna');
        }
    });

    function addMessageToChat(text, sender) {
        const messageContainer = document.createElement('div');
        messageContainer.className = `message ${sender}-message`;
        const messageBubble = document.createElement('p');
        messageBubble.textContent = text;
        messageContainer.appendChild(messageBubble);
        chatMessages.appendChild(messageContainer);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // --- LÓGICA DE GERAR HISTÓRIA (COM MODO MANUTENÇÃO) ---
    openGenerateModalButton.addEventListener('click', () => {
        if (isMaintenanceMode) {
            showCustomAlert(maintenanceHTML, "Criador de Histórias");
        } else {
            generateStoryModal.classList.remove('hidden');
        }
    });
    
    closeGenerateModalButton.addEventListener('click', () => { generateStoryModal.classList.add('hidden'); });

    generatePromptForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (isMaintenanceMode) return; // Bloqueia a função

        const userPrompt = document.getElementById('story-prompt-input').value.trim();
        if (!userPrompt) return;

        const submitButton = generatePromptForm.querySelector('button[type="submit"]');
        const buttonText = submitButton.querySelector('.generate-button-text');
        const loader = submitButton.querySelector('.loader');

        buttonText.classList.add('hidden');
        loader.classList.remove('hidden');
        submitButton.disabled = true;

        try {
            const response = await fetch(`${API_URL}/generate-story`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: userPrompt }) });
            if (!response.ok) throw new Error("A IA não conseguiu criar a história.");
            
            const newStory = await response.json();
            window.location.href = `story.html?id=${newStory.id}`;
        } catch (error) {
            console.error("Erro ao gerar história:", error);
            alert("Erro: " + error.message);
            buttonText.classList.remove('hidden');
            loader.classList.add('hidden');
            submitButton.disabled = false;
        }
    });
    
    // --- INICIA A APLICAÇÃO ---
    fetchAndRenderStories();
});