document.addEventListener('DOMContentLoaded', () => {
    // === SELEÇÃO DE ELEMENTOS DO DOM ===
    const API_URL = 'http://localhost:8080/api';
    // Conteúdo
    const storyLibrary = document.getElementById('story-library');
    const categoryFilters = document.getElementById('category-filters');
    
    // Botão "Conversar" na seção Hero
    const openChatHeroButton = document.getElementById('open-chat-hero-button');
    
    // Modal do Chatbot
    const chatModal = document.getElementById('chat-modal');
    const closeChatButton = document.getElementById('close-chat-button');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');

    // Modal de Gerar História
    const openGenerateModalButton = document.getElementById('open-generate-modal-button');
    const generateStoryModal = document.getElementById('generate-story-modal');
    const closeGenerateModalButton = document.getElementById('close-generate-modal-button');
    const generatePromptForm = document.getElementById('generate-prompt-form');
    
    // Modal de Alerta
    const customAlertModal = document.getElementById('custom-alert-modal');
    
    let allStories = [];

    // === FUNÇÕES REUTILIZÁVEIS ===
    function showCustomAlert(message, title = "Aviso") { /* ... (a implementação deste modal pode ser adicionada aqui) ... */ }

    // --- CARREGAMENTO E FILTRO DE HISTÓRIAS ---
    async function fetchAndRenderStories() {
        try {
            const response = await fetch(`${API_URL}/stories`);
            if (!response.ok) throw new Error('Falha ao buscar dados');
            allStories = await response.json();
            renderStories(allStories); // Mostra todas as histórias por padrão
        } catch (error) {
            console.error("Erro ao carregar histórias:", error);
            storyLibrary.innerHTML = "<p>Não foi possível carregar as histórias. Verifique a conexão com o servidor.</p>";
        }
    }

    function renderStories(storiesToRender) {
        storyLibrary.innerHTML = '';
        storiesToRender.forEach(story => {
            const storyCard = document.createElement('div');
            storyCard.className = 'story-card';
            storyCard.innerHTML = `
                <h3>${story.title}</h3>
                <p>${story.content}</p>
                <div class="story-card-meta">
                    <div class="meta-item"><i class="fa-regular fa-clock"></i><span>${story.durationInMinutes} min</span></div>
                    <div class="meta-item"><i class="fa-solid fa-users"></i><span>${story.ageRange}</span></div>
                </div>
                <a href="story.html?id=${story.id}" class="story-card-button"><i class="fa-solid fa-play"></i> Ouvir História</a>
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

    // --- LÓGICA DO CHATBOT LUNA ---
    function openChat() { chatModal.classList.remove('hidden'); }
    function closeChat() { chatModal.classList.add('hidden'); }
    // Evento no botão da seção hero
    openChatHeroButton.addEventListener('click', openChat);
    // Evento no botão do cabeçalho (que é dinâmico, adicionado em auth.js)
    document.body.addEventListener('click', e => { if (e.target && e.target.id === 'nav-chat-button') openChat(); });
    // Evento no botão de fechar do modal do chat
    closeChatButton.addEventListener('click', closeChat);

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
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
    chatMessages.scrollTop = chatMessages.scrollHeight; // Auto-scroll para a última mensagem
}

    // --- LÓGICA DE GERAR HISTÓRIA ---
    openGenerateModalButton.addEventListener('click', () => { generateStoryModal.classList.remove('hidden'); });
    closeGenerateModalButton.addEventListener('click', () => { generateStoryModal.classList.add('hidden'); });
    generatePromptForm.addEventListener('submit', async (e) => {
        e.preventDefault();
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
            // Aqui seria a chamada para showCustomAlert(error.message);
            alert("Erro: " + error.message);
            buttonText.classList.remove('hidden');
            loader.classList.add('hidden');
            submitButton.disabled = false;
        }
    });
    
    // --- INICIA A APLICAÇÃO ---
    fetchAndRenderStories();
});