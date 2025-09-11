document.addEventListener('DOMContentLoaded', () => {
    // === SELEÇÃO DE ELEMENTOS GLOBAIS ===
    const header = document.getElementById('header');
    const authModal = document.getElementById('auth-modal');
    // Tentativa de buscar o usuário logado no armazenamento do navegador
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    const API_URL = 'http://localhost:8080/api';
    
    // HTML do Logo - reutilizado para não repetir código
    const logoHtml = `
        <a href="index.html" class="logo">
            <i class="fa-solid fa-water"></i>
            <div>
                <h1>SeaKalm</h1>
                <p>Histórias que acalmam e tranquilizam</p>
            </div>
        </a>`;

    // --- LÓGICA PRINCIPAL DE RENDERIZAÇÃO DO HEADER ---
    if (loggedInUser && loggedInUser.id) {
        // Se um usuário ESTÁ logado, renderiza o header para usuários autenticados
        header.innerHTML = logoHtml + `
            <nav class="main-nav">
                <button id="nav-chat-button"><i class="fa-regular fa-comment-dots"></i> Conversar</button>
                <a href="profile.html" class="user-profile" title="Ver Perfil">
                    <div class="avatar">${loggedInUser.username.substring(0, 2).toUpperCase()}</div>
                    <span>${loggedInUser.username}</span>
                </a>
                <a href="#" id="logout-button" class="nav-link">Sair</a>
            </nav>`;

        // Adiciona o evento de clique para o botão de SAIR
        document.getElementById('logout-button').addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('loggedInUser'); // Limpa a sessão
            window.location.href = 'index.html'; // Redireciona para a home
        });

    } else {
        // Se NÃO HÁ usuário logado, renderiza o header para visitantes
        header.innerHTML = logoHtml + `
            <nav class="main-nav">
                <button id="nav-chat-button"><i class="fa-regular fa-comment-dots"></i> Conversar</button>
                <button id="nav-login-button"><i class="fa-solid fa-arrow-right-to-bracket"></i> Entrar</button>
            </nav>`;
    }
    
    // --- GERAÇÃO E CONTROLE DO MODAL DE AUTENTICAÇÃO ---
    // Injeta o HTML do modal na página (ele começa escondido)
    authModal.innerHTML = `
        <div class="modal-content">
            <button id="close-auth-modal-button" class="close-button">&times;</button>
            <div id="login-view">
                <h2>Bem-vindo de volta!</h2>
                <form id="login-form">
                    <input type="text" id="login-username" placeholder="Nome de usuário" required>
                    <input type="password" id="login-password" placeholder="Senha" required>
                    <button type="submit" class="button-primary">Entrar</button>
                </form>
                <div id="login-message" class="auth-message"></div>
                <p class="switch-form-link">Não tem uma conta? <a href="#" id="show-register-view">Registre-se</a></p>
            </div>
            <div id="register-view" class="hidden">
                <h2>Crie sua conta</h2>
                <form id="register-form">
                    <input type="text" id="register-username" placeholder="Nome de usuário" required>
                    <input type="password" id="register-password" placeholder="Senha" required>
                    <button type="submit" class="button-primary">Registrar</button>
                </form>
                <div id="register-message" class="auth-message"></div>
                <p class="switch-form-link">Já tem uma conta? <a href="#" id="show-login-view">Entrar</a></p>
            </div>
        </div>`;

    // Seleciona os elementos recém-criados do modal
    const closeAuthBtn = document.getElementById('close-auth-modal-button');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const showRegisterLink = document.getElementById('show-register-view');
    const showLoginLink = document.getElementById('show-login-view');
    
    // Adiciona os eventos para abrir, fechar e alternar os formulários
    document.body.addEventListener('click', e => { if (e.target && e.target.id == 'nav-login-button') authModal.classList.remove('hidden'); });
    closeAuthBtn.addEventListener('click', () => authModal.classList.add('hidden'));
    showRegisterLink.addEventListener('click', e => { e.preventDefault(); document.getElementById('login-view').classList.add('hidden'); document.getElementById('register-view').classList.remove('hidden'); });
    showLoginLink.addEventListener('click', e => { e.preventDefault(); document.getElementById('register-view').classList.add('hidden'); document.getElementById('login-view').classList.remove('hidden'); });

    // Lida com o envio do formulário de LOGIN
    loginForm.addEventListener('submit', async e => {
        e.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        try {
            const response = await fetch(`${API_URL}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
            if (!response.ok) throw new Error('Falha no login');
            localStorage.setItem('loggedInUser', JSON.stringify(await response.json()));
            window.location.reload();
        } catch (error) {
            document.getElementById('login-message').textContent = 'Usuário ou senha inválidos.';
        }
    });

    // Lida com o envio do formulário de REGISTRO
    registerForm.addEventListener('submit', async e => {
        e.preventDefault();
        const username = document.getElementById('register-username').value;
        const password = document.getElementById('register-password').value;
        try {
            const response = await fetch(`${API_URL}/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
            const result = await response.json();
            const msgEl = document.getElementById('register-message');
            msgEl.textContent = result.message;
            msgEl.style.color = response.ok ? 'green' : 'red';
        } catch (error) {
            document.getElementById('register-message').textContent = 'Erro de conexão.';
        }
    });
});