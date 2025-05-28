// login.js - Sistema de Autenticação com Backend

// Elementos do DOM
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('loginBtn');
const messageDiv = document.getElementById('message');

// Estado da aplicação
let isLogging = false;

// Inicialização quando o DOM carregar
document.addEventListener('DOMContentLoaded', function() {
    initializeLogin();
});

// Função de inicialização
function initializeLogin() {
    console.log('Sistema de login inicializado');
    console.log('Conectando com backend em: http://localhost:8080');
    
    // Event listeners
    loginForm.addEventListener('submit', handleLogin);
    
    // Auto-focus no campo email
    emailInput.focus();
    
    // Eventos de teclado para melhor UX
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !isLogging) {
            loginForm.dispatchEvent(new Event('submit'));
        }
    });
}

// Função principal de login
async function handleLogin(event) {
    event.preventDefault();
    
    if (isLogging) return;
    
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    
    // Validações básicas
    if (!email || !password) {
        showMessage('Por favor, preencha todos os campos.', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showMessage('Por favor, insira um e-mail válido.', 'error');
        return;
    }
    
    // Iniciar processo de login
    startLoading();
    
    try {
        // Simular delay de requisição
        await delay(1500);
        
        // Tentar autenticar
        const user = await authenticateUser(email, password);
        
        if (user) {
            // Login bem-sucedido
            await handleSuccessfulLogin(user);
        } else {
            // Login falhou
            showMessage('E-mail ou senha incorretos.', 'error');
        }
    } catch (error) {
        console.error('Erro durante o login:', error);
        showMessage('Erro interno. Tente novamente.', 'error');
    } finally {
        stopLoading();
    }
}

// Função de autenticação
async function authenticateUser(email, password) {
    console.log(`Tentativa de login para: ${email}`);
    
    try {
        // OPÇÃO 1: Mantendo sua URL original (GET) - CORRIGIDA
        const response = await fetch(`http://localhost:8080/apis/usuario/${email}/${password}`, {
            method: 'GET',
            headers: { 
                'Content-Type': 'application/json; charset=utf-8' 
            }
        });
        /*
        const response = await fetch('http://localhost:8080/apis/usuario/login', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json; charset=utf-8' 
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });
        */
        
        if (response.ok) {
            const user = await response.json();
            console.log(`Login bem-sucedido para: ${user.name || user.email}`);
            return user;
        } else {
            console.log(`Login falhou para: ${email} - Status: ${response.status}`);
            return null;
        }
    } catch (error) {
        console.error('Erro na requisição de login:', error);
        throw error; // Propaga o erro para ser tratado na função handleLogin
    }
}

// Tratar login bem-sucedido
async function handleSuccessfulLogin(user) {
    showMessage(`Bem-vindo, ${user.name || user.email}!`, 'success');
    
    // Salvar dados do usuário logado
    const userData = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        loginTime: new Date().toISOString()
    };
    
    // Salvar no localStorage para usar em outras páginas
    localStorage.setItem('userData', JSON.stringify(userData));
    console.log('Dados do usuário logado:', userData);
    
    // Mostrar mensagem de redirecionamento
    showMessage('Redirecionando...', 'success');
    
    // Aguardar um pouco antes do redirecionamento
    await delay(1500);
    
    // Redirecionar para a página home
    window.location.href = "./pages/home/home.html";
}

// Funções utilitárias
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showMessage(text, type = 'info') {
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    
    // Mostrar mensagem
    setTimeout(() => {
        messageDiv.classList.add('show');
    }, 100);
    
    // Auto-ocultar mensagens de erro após 5 segundos
    if (type === 'error') {
        setTimeout(() => {
            hideMessage();
        }, 5000);
    }
}

function hideMessage() {
    messageDiv.classList.remove('show');
}

function startLoading() {
    isLogging = true;
    loginBtn.disabled = true;
    loginBtn.innerHTML = '<span class="loading"></span> Entrando...';
}

function stopLoading() {
    isLogging = false;
    loginBtn.disabled = false;
    loginBtn.innerHTML = 'Entrar';
}

function resetForm() {
    loginForm.reset();
    hideMessage();
    emailInput.focus();
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}



// Função para verificar conexão com backend
async function testBackendConnection() {
    try {
        const response = await fetch('http://localhost:8080/apis/usuario/health', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.ok) {
            console.log('✅ Backend conectado com sucesso!');
            return true;
        } else {
            console.warn('⚠️ Backend respondeu com erro:', response.status);
            return false;
        }
    } catch (error) {
        console.error('❌ Erro ao conectar com backend:', error);
        return false;
    }
}

// Disponibilizar funções globalmente para debugging
window.loginDebug = {
    testBackendConnection,
    resetForm
};

// Log inicial
console.log('🔐 Sistema de Login carregado!');
console.log('🔗 Backend: http://localhost:8080');
console.log('💡 Digite "loginDebug.testBackendConnection()" para testar conexão');