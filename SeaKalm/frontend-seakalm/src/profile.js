document.addEventListener('DOMContentLoaded', () => {
    // Verificação de segurança: só usuários logados podem ver esta página.
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (!loggedInUser) {
        // Se não houver usuário logado, redireciona para a página inicial.
        window.location.href = 'index.html';
        return; // Para a execução do script
    }

    // Seleção dos elementos da página
    const profileForm = document.getElementById('profile-form');
    const usernameInput = document.getElementById('username');
    const newPasswordInput = document.getElementById('new-password');
    const profilePicImg = document.getElementById('profile-pic');
    const profileMessage = document.getElementById('profile-message');
    const API_URL = 'http://localhost:8080/api';

    /**
     * Carrega e exibe as informações do perfil do usuário.
     */
    function loadUserProfile() {
        usernameInput.value = loggedInUser.username;
        // Se houver uma foto de perfil salva, usa. Senão, usa uma padrão.
        profilePicImg.src = loggedInUser.profilePictureUrl || 'foto_perfil.png';
    }

    /**
     * Lida com o envio do formulário para atualizar os dados do usuário.
     */
    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Impede o recarregamento da página

        const newUsername = usernameInput.value;
        const newPassword = newPasswordInput.value;

        const payload = {
            username: newUsername
            // Opcionalmente incluir a senha, apenas se o campo não estiver vazio
        };

        if (newPassword) {
            payload.password = newPassword;
        }

        try {
            const response = await fetch(`${API_URL}/users/${loggedInUser.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) {
                throw new Error("Não foi possível atualizar o perfil. O nome de usuário já pode existir.");
            }

            const updatedUser = await response.json();

            // CRUCIAL: Atualiza os dados no localStorage para manter a sessão consistente.
            localStorage.setItem('loggedInUser', JSON.stringify(updatedUser));

            // Feedback visual para o usuário
            showMessage("Perfil atualizado com sucesso!", "success");
            
            // Recarrega o `auth.js` para atualizar o header (ou força um reload da página)
             window.location.reload(); 

        } catch (error) {
            console.error("Erro ao atualizar perfil:", error);
            showMessage(error.message, "error");
        }
    });

    /**
     * Exibe uma mensagem de feedback na tela e a remove após alguns segundos.
     * @param {string} message - A mensagem a ser exibida.
     * @param {string} type - 'success' ou 'error'.
     */
    function showMessage(message, type) {
        profileMessage.textContent = message;
        profileMessage.className = type; // Adiciona a classe .success ou .error
        
        setTimeout(() => {
            profileMessage.textContent = '';
            profileMessage.className = '';
        }, 4000); // Remove a mensagem após 4 segundos
    }

    // Chama a função para carregar os dados do usuário quando a página abre
    loadUserProfile();
});