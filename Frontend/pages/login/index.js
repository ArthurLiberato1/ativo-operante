// Elementos do DOM
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');
        const messageDiv = document.getElementById('message');
        const loginSection = document.getElementById('loginSection');
        const registerSection = document.getElementById('registerSection');
        const loginModeBtn = document.getElementById('loginModeBtn');
        const registerModeBtn = document.getElementById('registerModeBtn');
        const pageTitle = document.getElementById('pageTitle');
        const pageSubtitle = document.getElementById('pageSubtitle');

        // Estado da aplicação
        let isLogging = false;
        let isRegistering = false;
        let currentMode = 'login';

        // Inicialização quando o DOM carregar
        document.addEventListener('DOMContentLoaded', function() {
            initializeLogin();
        });

        // Função de inicialização
        function initializeLogin() {
            console.log('Sistema de login inicializado');
            console.log('Conectando com backend em: http://localhost:8080');
            
            // Verificar se já está logado
            /*
            if (isUserLoggedIn()) {
                console.log('Usuário já está logado, redirecionando...');
                window.location.href = "./pages/home/home.html";
                return;
            }
            */
            
            // Auto-focus no campo email se estiver no modo login
            if (currentMode === 'login' && emailInput) {
                emailInput.focus();
            }
            
            // Event listeners
            if (loginForm) {
                loginForm.addEventListener('submit', handleLogin);
            }
            
            if (registerForm) {
                registerForm.addEventListener('submit', handleRegister);
            }
            
            // Event listeners para os botões de modo
            if (loginModeBtn) {
                loginModeBtn.addEventListener('click', () => switchMode('login'));
            }
            
            if (registerModeBtn) {
                registerModeBtn.addEventListener('click', () => switchMode('register'));
            }
            
            // Eventos de teclado para melhor UX
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' && !isLogging && !isRegistering) {
                    if (currentMode === 'login' && loginForm) {
                        loginForm.dispatchEvent(new Event('submit'));
                    } else if (currentMode === 'register' && registerForm) {
                        registerForm.dispatchEvent(new Event('submit'));
                    }
                }
            });

            // Testar conexão com backend
            testBackendConnection();
            
            // Formatação automática do CPF
            const cpfInput = document.getElementById('cpf');
            if (cpfInput) {
                cpfInput.addEventListener('input', formatCPF);
            }
        }

        // Função para alternar entre login e cadastro
        function switchMode(mode) {
            currentMode = mode;
            
            if (mode === 'login') {
                // Ativar modo login
                loginSection.classList.add('active');
                registerSection.classList.remove('active');
                loginModeBtn.classList.add('active');
                registerModeBtn.classList.remove('active');
                
                // Atualizar título
                pageTitle.textContent = 'Bem-vindo';
                pageSubtitle.textContent = 'Faça login para acessar sua conta';
                
                // Focus no campo email
                setTimeout(() => {
                    if (emailInput) emailInput.focus();
                }, 100);
                
            } else if (mode === 'register') {
                // Ativar modo cadastro
                loginSection.classList.remove('active');
                registerSection.classList.add('active');
                loginModeBtn.classList.remove('active');
                registerModeBtn.classList.add('active');
                
                // Atualizar título
                pageTitle.textContent = 'Criar Conta';
                pageSubtitle.textContent = 'Preencha os dados para se cadastrar';
                
                // Focus no campo CPF
                setTimeout(() => {
                    const cpfInput = document.getElementById('cpf');
                    if (cpfInput) cpfInput.focus();
                }, 100);
            }
            
            // Limpar mensagens
            hideMessage();
        }

        // Função principal de login
        // ✅ VERSÃO CORRIGIDA da função handleLogin
async function handleLogin(event) {
    event.preventDefault();
    
    if (isLogging) return;
    
    const email = emailInput ? emailInput.value.trim() : '';
    const password = passwordInput ? passwordInput.value.trim() : '';
    
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
    startLoginLoading();
    
    try {
        // Tentar autenticar
        const response = await authenticateUser(email, password);
        
        if (response && response.token) {
            // Login bem-sucedido
            await handleSuccessfulLogin(response);
        } else {
            // Login falhou
            showMessage('E-mail ou senha incorretos.', 'error');
        }
    } catch (error) {
        console.error('Erro durante o login:', error);
        
        if (error.message.includes('Failed to fetch')) {
            showMessage('Erro de conexão. Verifique se o backend está rodando.', 'error');
        } else {
            showMessage('Erro interno. Tente novamente.', 'error');
        }
    } finally {
        stopLoginLoading();
    }
}

        // Função principal de cadastro
        async function handleRegister(event) {
            event.preventDefault();
            
            if (isRegistering) return;
            
            const cpf = document.getElementById('cpf')?.value.trim() || '';
            const email = document.getElementById('registerEmail')?.value.trim() || '';
            const password = document.getElementById('registerPassword')?.value.trim() || '';
            const confirmPassword = document.getElementById('confirmPassword')?.value.trim() || '';
            
            // Validações básicas
            if (!cpf || !email || !password || !confirmPassword) {
                showMessage('Por favor, preencha todos os campos.', 'error');
                return;
            }
            
            if (!isValidCPF(cpf)) {
                showMessage('Por favor, insira um CPF válido.', 'error');
                return;
            }
            
            if (!isValidEmail(email)) {
                showMessage('Por favor, insira um e-mail válido.', 'error');
                return;
            }
            
            if (password.length < 6) {
                showMessage('A senha deve ter pelo menos 6 caracteres.', 'error');
                return;
            }
            
            if (password !== confirmPassword) {
                showMessage('As senhas não coincidem.', 'error');
                return;
            }
            
            // Iniciar processo de cadastro
            startRegisterLoading();
            
            try {
                // Simular cadastro (adapte para sua API)
                showMessage('Cadastro realizado com sucesso! Redirecionando para login...', 'success');
                
                // Limpar formulário e voltar para login após 2 segundos
                setTimeout(() => {
                    registerForm.reset();
                    switchMode('login');
                }, 2000);
                
            } catch (error) {
                console.error('Erro durante o cadastro:', error);
                showMessage('Erro interno. Tente novamente.', 'error');
            } finally {
                stopRegisterLoading();
            }
        }

        // ✅ VERSÃO CORRIGIDA da função authenticateUser
async function authenticateUser(email, password) {
    console.log(`Tentativa de login para: ${email}`);
    
    try {
        const response = await fetch(`http://localhost:8080/login/autenticar/${email}/${password}`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        
        if (response.ok) {
            // Se sua API retorna apenas o token como texto
            const token = await response.text();
            console.log('Login bem-sucedido, token recebido');
            
            // Retornar objeto estruturado para handleLogin
            return {
                token: token,
                email: email,
                // Se sua API não retorna esses dados, você precisa buscá-los separadamente
                nivel: 1 // ou buscar de outra endpoint
            };
        } else {
            console.log(`Login falhou para: ${email} - Status: ${response.status}`);
            return null;
        }
    } catch (error) {
        console.error('Erro na requisição de login:', error);
        throw error;
    }
}

        // Tratar login bem-sucedido
       // ✅ VERSÃO CORRIGIDA da função handleSuccessfulLogin
async function handleSuccessfulLogin(data) {
    const { token, email, nivel } = data;
    
    showMessage(`Bem-vindo, ${email}!`, 'success');
    
    // Salvar token JWT e dados do usuário (CONSISTÊNCIA: usar mesmo nome)
    const userData = {
        token: token,
        email: email,
        nivel: nivel || 0
    };
    
    // Salvar no localStorage com nomes consistentes
    try {
        localStorage.setItem('authToken', token); // ✅ Consistente com isUserLoggedIn
        localStorage.setItem('userData', JSON.stringify(userData));
    } catch (e) {
        console.warn('localStorage não disponível:', e);
    }
    
    console.log('Token JWT salvo:', token);
    console.log('Dados do usuário:', userData);
    
    // Verificar se o token é válido
    if (isTokenValid(token)) {
        console.log('Token JWT válido!');
        
        // Mostrar mensagem de redirecionamento
        showMessage('Redirecionando...', 'success');
        
        // Aguardar um pouco antes do redirecionamento
        await delay(1500);
        
        // ✅ CORREÇÃO: remover await de showMessage (não é async)
        if (userData.nivel == 1) {
            console.log('Redirecionando para painel admin');
            window.location.href = "../admin/home.html";
        } else {
            console.log('Redirecionando para painel usuário');
            window.location.href = "../user/home.html";
        }
    } else {
        console.error('Token JWT inválido!');
        showMessage('Erro na autenticação. Tente novamente.', 'error');
        clearAuthData();
    }
}

// ✅ FUNÇÃO MELHORADA para validação de token
function isTokenValid(token) {
    if (!token) return false;
    
    try {
        // Verificar se o token tem a estrutura correta de JWT (3 partes)
        const parts = token.split('.');
        if (parts.length !== 3) {
            console.log('Token não tem formato JWT válido');
            return false;
        }
        
        // Decodificar JWT (apenas payload, sem verificar assinatura)
        const payload = JSON.parse(atob(parts[1]));
        const now = Math.floor(Date.now() / 1000);
        
        // Verificar se não expirou
        if (payload.exp && payload.exp < now) {
            console.log('Token expirado');
            return false;
        }
        
        return true;
    } catch (error) {
        console.error('Erro ao verificar token:', error);
        return false;
    }
}

function showMessage(text, type = 'info') {
    if (!messageDiv) return;
    
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

        // Verificar se usuário está logado
        function isUserLoggedIn() {
            try {
                const token = localStorage.getItem('authToken');
                return token && isTokenValid(token);
            } catch (e) {
                return false;
            }
        }

        // Verificar se token é válido (básico - apenas expiry)
        function isTokenValid(token) {
            if (!token) return false;
            
            try {
                // Decodificar JWT (apenas payload, sem verificar assinatura)
                const payload = JSON.parse(atob(token.split('.')[1]));
                const now = Math.floor(Date.now() / 1000);
                
                // Verificar se não expirou
                if (payload.exp && payload.exp < now) {
                    console.log('Token expirado');
                    return false;
                }
                
                return true;
            } catch (error) {
                console.error('Erro ao verificar token:', error);
                return false;
            }
        }

        // Limpar dados de autenticação
        function clearAuthData() {
            try {
                localStorage.removeItem('authToken');
                localStorage.removeItem('userData');
            } catch (e) {
                console.warn('Erro ao limpar localStorage:', e);
            }
        }

        // Fazer logout
        function logout() {
            clearAuthData();
            window.location.href = "./login/login.html";
        }

        // Funções utilitárias
        function isValidEmail(email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        }

        function isValidCPF(cpf) {
            // Remove formatação
            cpf = cpf.replace(/[^\d]/g, '');
            
            // Verifica se tem 11 dígitos
            if (cpf.length !== 11) return false;
            
            // Verifica se todos os dígitos são iguais (CPF inválido)
            if (/^(\d)\1{10}$/.test(cpf)) return false;
            
            // Validação básica (algoritmo completo seria mais complexo)
            return true;
        }

        function formatCPF(event) {
            let value = event.target.value.replace(/[^\d]/g, '');
            
            if (value.length > 11) {
                value = value.slice(0, 11);
            }
            
            if (value.length > 9) {
                value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
            } else if (value.length > 6) {
                value = value.replace(/(\d{3})(\d{3})(\d{3})/, '$1.$2.$3');
            } else if (value.length > 3) {
                value = value.replace(/(\d{3})(\d{3})/, '$1.$2');
            }
            
            event.target.value = value;
        }

        async function showMessage(text, type = 'info') {
            if (!messageDiv) return;
            
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
            if (messageDiv) {
                messageDiv.classList.remove('show');
            }
        }

        function startLoginLoading() {
            isLogging = true;
            if (loginBtn) {
                loginBtn.disabled = true;
                loginBtn.innerHTML = '<span class="loading"></span> Entrando...';
            }
        }

        function stopLoginLoading() {
            isLogging = false;
            if (loginBtn) {
                loginBtn.disabled = false;
                loginBtn.innerHTML = 'Entrar';
            }
        }

        function startRegisterLoading() {
            isRegistering = true;
            if (registerBtn) {
                registerBtn.disabled = true;
                registerBtn.innerHTML = '<span class="loading"></span> Criando...';
            }
        }

        function stopRegisterLoading() {
            isRegistering = false;
            if (registerBtn) {
                registerBtn.disabled = false;
                registerBtn.innerHTML = 'Criar Conta';
            }
        }

        function resetForm() {
            if (currentMode === 'login' && loginForm) {
                loginForm.reset();
                if (emailInput) emailInput.focus();
            } else if (currentMode === 'register' && registerForm) {
                registerForm.reset();
                const cpfInput = document.getElementById('cpf');
                if (cpfInput) cpfInput.focus();
            }
            hideMessage();
        }

        function delay(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        // Função para verificar conexão com backend
        async function testBackendConnection() {
            try {
                const response = await fetch('http://localhost:8080/apis/usuario', {
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
                console.warn('🔧 Certifique-se de que o backend está rodando em http://localhost:8080');
                return false;
            }
        }

        // Função para fazer requisições autenticadas
        async function authenticatedRequest(url, options = {}) {
            let token;
            try {
                token = localStorage.getItem('authToken');
            } catch (e) {
                throw new Error('Token não encontrado');
            }
            
            if (!token) {
                throw new Error('Token não encontrado');
            }
            
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                ...options.headers
            };
            
            return fetch(url, {
                ...options,
                headers
            });
        }

        // Disponibilizar funções globalmente para debugging
        window.loginDebug = {
            testBackendConnection,
            resetForm,
            clearAuthData,
            isTokenValid,
            logout,
            authenticatedRequest,
            switchMode
        };

        // Log inicial
        console.log('🔐 Sistema de Login com JWT carregado!');
        console.log('🔗 Backend: http://localhost:8080');
        console.log('💡 Digite "loginDebug.testBackendConnection()" para testar conexão');
        console.log('🎫 Usuários de teste:');
        console.log('   📧 admin@teste.com / senha: 123');
        console.log('   📧 user@teste.com / senha: 456');