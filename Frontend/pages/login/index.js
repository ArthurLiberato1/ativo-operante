// login-cadastro.js - Sistema de Autenticação e Cadastro

// Elementos do DOM - Login
const loginForm = document.getElementById('loginForm');
const loginEmailInput = document.getElementById('loginEmail');
const loginPasswordInput = document.getElementById('loginPassword');
const loginBtn = document.getElementById('loginBtn');

// Elementos do DOM - Cadastro
const registerForm = document.getElementById('registerForm');
const cpfInput = document.getElementById('cpf');
const registerEmailInput = document.getElementById('registerEmail');
const registerPasswordInput = document.getElementById('registerPassword');
const confirmPasswordInput = document.getElementById('confirmPassword');
const registerBtn = document.getElementById('registerBtn');

// Elementos comuns
const messageDiv = document.getElementById('message');
const pageTitle = document.getElementById('pageTitle');
const pageSubtitle = document.getElementById('pageSubtitle');
const loginSection = document.getElementById('loginSection');
const registerSection = document.getElementById('registerSection');
const loginModeBtn = document.getElementById('loginModeBtn');
const registerModeBtn = document.getElementById('registerModeBtn');

// Estado da aplicação
let currentMode = 'login';
let isProcessing = false;

// Inicialização quando o DOM carregar
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Função de inicialização
function initializeApp() {
    console.log('Sistema de autenticação inicializado');
    console.log('Conectando com backend em: http://localhost:8080');
    
    // Event listeners
    loginForm.addEventListener('submit', handleLogin);
    registerForm.addEventListener('submit', handleRegister);
    
    // Auto-focus no primeiro campo do modo ativo
    loginEmailInput.focus();
    
    // Configurar validações em tempo real para cadastro
    setupValidations();
    
    // Eventos de teclado
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !isProcessing) {
            const activeForm = currentMode === 'login' ? loginForm : registerForm;
            activeForm.dispatchEvent(new Event('submit'));
        }
    });
}

// Função para alternar entre modos
function switchMode(mode) {
    if (isProcessing) return;
    
    currentMode = mode;
    hideMessage();
    
    // Atualizar botões de modo
    loginModeBtn.classList.toggle('active', mode === 'login');
    registerModeBtn.classList.toggle('active', mode === 'register');
    
    // Mostrar/ocultar seções
    loginSection.classList.toggle('active', mode === 'login');
    registerSection.classList.toggle('active', mode === 'register');
    
    // Atualizar título e subtítulo
    if (mode === 'login') {
        pageTitle.textContent = 'Bem-vindo de volta';
        pageSubtitle.textContent = 'Faça login para acessar sua conta';
        loginEmailInput.focus();
    } else {
        pageTitle.textContent = 'Criar Conta';
        pageSubtitle.textContent = 'Preencha os dados para se cadastrar';
        cpfInput.focus();
    }
    
    // Limpar formulários
    clearForms();
}

// Configurar validações em tempo real
function setupValidations() {
    // Validação do CPF
    cpfInput.addEventListener('input', () => {
        formatCPF(cpfInput);
        validateField('cpf');
    });
    cpfInput.addEventListener('blur', () => validateField('cpf'));
    
    // Validação do email de cadastro
    registerEmailInput.addEventListener('input', () => validateField('registerEmail'));
    registerEmailInput.addEventListener('blur', () => validateField('registerEmail'));
    
    // Validação da senha de cadastro
    registerPasswordInput.addEventListener('input', () => validateField('registerPassword'));
    registerPasswordInput.addEventListener('blur', () => validateField('registerPassword'));
    
    // Validação da confirmação de senha
    confirmPasswordInput.addEventListener('input', () => validateField('confirmPassword'));
    confirmPasswordInput.addEventListener('blur', () => validateField('confirmPassword'));
}

// Validação de campos individuais
function validateField(fieldName) {
    const field = document.getElementById(fieldName);
    const errorDiv = document.getElementById(fieldName + 'Error');
    const successDiv = document.getElementById(fieldName + 'Success');
    const value = field.value.trim();
    
    // Limpar estados anteriores
    field.classList.remove('error', 'success');
    if (errorDiv) errorDiv.style.display = 'none';
    if (successDiv) successDiv.style.display = 'none';
    
    let isValid = true;
    let errorMessage = '';
    
    switch (fieldName) {
        case 'cpf':
            if (!value) {
                errorMessage = 'CPF é obrigatório';
                isValid = false;
            } else if (!isValidCPF(value)) {
                errorMessage = 'CPF inválido';
                isValid = false;
            }
            break;
            
        case 'registerEmail':
            if (!value) {
                errorMessage = 'E-mail é obrigatório';
                isValid = false;
            } else if (!isValidEmail(value)) {
                errorMessage = 'E-mail inválido';
                isValid = false;
            } else if (value.length > 100) {
                errorMessage = 'E-mail muito longo';
                isValid = false;
            }
            break;
            
        case 'registerPassword':
            if (!value) {
                errorMessage = 'Senha é obrigatória';
                isValid = false;
            } else if (value.length < 6) {
                errorMessage = 'Senha deve ter pelo menos 6 caracteres';
                isValid = false;
            } else if (value.length > 50) {
                errorMessage = 'Senha muito longa';
                isValid = false;
            }
            // Validar confirmação se já foi preenchida
            if (confirmPasswordInput.value) {
                validateField('confirmPassword');
            }
            break;
            
        case 'confirmPassword':
            const password = registerPasswordInput.value;
            if (!value) {
                errorMessage = 'Confirmação de senha é obrigatória';
                isValid = false;
            } else if (value !== password) {
                errorMessage = 'Senhas não coincidem';
                isValid = false;
            }
            break;
    }
    
    // Aplicar resultado da validação
    if (isValid && value) {
        field.classList.add('success');
        if (successDiv) {
            successDiv.textContent = 'Válido';
            successDiv.style.display = 'block';
        }
    } else if (!isValid) {
        field.classList.add('error');
        if (errorDiv) {
            errorDiv.textContent = errorMessage;
            errorDiv.style.display = 'block';
        }
    }
    
    return isValid;
}

// Função principal de login
async function handleLogin(event) {
    event.preventDefault();
    
    if (isProcessing) return;
    
    const email = loginEmailInput.value.trim();
    const password = loginPasswordInput.value.trim();
    
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
    startLoading('login');
    
    try {
        // Simular delay de requisição
        await delay(1000);
        
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
        stopLoading('login');
    }
}

// Função principal de cadastro
async function handleRegister(event) {
    event.preventDefault();
    
    if (isProcessing) return;
    
    // Validar todos os campos
    const isCpfValid = validateField('cpf');
    const isEmailValid = validateField('registerEmail');
    const isPasswordValid = validateField('registerPassword');
    const isConfirmPasswordValid = validateField('confirmPassword');
    
    if (!isCpfValid || !isEmailValid || !isPasswordValid || !isConfirmPasswordValid) {
        showMessage('Por favor, corrija os erros no formulário.', 'error');
        return;
    }
    
    // Coletar dados do formulário
    const userData = {
        cpf: cpfInput.value.replace(/\D/g, ''), // Remover formatação
        email: registerEmailInput.value.trim(),
        senha: registerPasswordInput.value
    };
    
    // Iniciar processo de cadastro
    startLoading('register');
    
    try {
        // Simular delay de requisição
        await delay(1500);
        
        // Tentar cadastrar usuário
        const newUser = await registerUser(userData);
        
        if (newUser) {
            // Cadastro bem-sucedido
            showMessage(`Conta criada com sucesso! Bem-vindo!`, 'success');
            
            // Aguardar um pouco e fazer login automático
            await delay(2000);
            await handleSuccessfulLogin(newUser);
        } else {
            showMessage('Erro ao criar conta. Tente novamente.', 'error');
        }
    } catch (error) {
        console.error('Erro durante o cadastro:', error);
        
        if (error.message.includes('já existe') || error.message.includes('already exists')) {
            showMessage('Este e-mail já está cadastrado. Tente fazer login.', 'error');
        } else if (error.message.includes('400')) {
            showMessage('Dados inválidos. Verifique as informações.', 'error');
        } else {
            showMessage('Erro interno. Tente novamente.', 'error');
        }
    } finally {
        stopLoading('register');
    }
}

// Função de autenticação (mantida do código original)
async function authenticateUser(email, password) {
    console.log(`Tentativa de login para: ${email}`);
    
    try {
        const response = await fetch(`http://localhost:8080/login/autenticar/${email}/${password}`, {
            method: 'GET',
            headers: { 
                'Content-Type': 'application/json; charset=utf-8' 
            }
        });
        
        if (response.ok) {
            const user = await response.json();
            console.log(`Login bem-sucedido para: ${user.nome || user.email}`);
            return await user;
        } else {
            console.log(`Login falhou para: ${email} - Status: ${response.status}`);
            return await null;
        }
    } catch (error) {
        console.error('Erro na requisição de login:', error);
        throw error;
    }
}

// Função de cadastro de usuário
async function registerUser(userData) {
    console.log(`Tentativa de cadastro para CPF: ${userData.cpf}`);
    
    try {
        const response = await fetch('http://localhost:8080/apis/usuario', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json; charset=utf-8' 
            },
            body: JSON.stringify(userData)
        });
        
        if (response.ok) {
            const newUser = await response.json();
            console.log(`Cadastro bem-sucedido para CPF: ${userData.cpf}`);
            return newUser;
        } else {
            const errorText = await response.text();
            console.log(`Cadastro falhou para CPF: ${userData.cpf} - Status: ${response.status}`);
            throw new Error(`Erro ${response.status}: ${errorText}`);
        }
    } catch (error) {
        console.error('Erro na requisição de cadastro:', error);
        throw error;
    }
}

// Tratar login bem-sucedido (mantida do código original)
async function handleSuccessfulLogin(user) {
    showMessage(`Bem-vindo, ${user.nome || user.name || user.email}!`, 'success');
    
    // Salvar dados do usuário logado
    const userData = {
        id: user.id,
        nome: user.nome || user.name,
        cpf: user.cpf,
        email: user.email,
        role: user.role || 'user',
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

function startLoading(mode) {
    isProcessing = true;
    
    if (mode === 'login') {
        loginBtn.disabled = true;
        loginBtn.innerHTML = '<span class="loading"></span> Entrando...';
    } else {
        registerBtn.disabled = true;
        registerBtn.innerHTML = '<span class="loading"></span> Criando conta...';
    }
    
    // Desabilitar botões de modo durante processamento
    loginModeBtn.disabled = true;
    registerModeBtn.disabled = true;
}

function stopLoading(mode) {
    isProcessing = false;
    
    if (mode === 'login') {
        loginBtn.disabled = false;
        loginBtn.innerHTML = 'Entrar';
    } else {
        registerBtn.disabled = false;
        registerBtn.innerHTML = 'Criar Conta';
    }
    
    // Reabilitar botões de modo
    loginModeBtn.disabled = false;
    registerModeBtn.disabled = false;
}

function clearForms() {
    loginForm.reset();
    registerForm.reset();
    hideMessage();
    
    // Limpar estados visuais do formulário de cadastro
    document.querySelectorAll('.form-group input').forEach(input => {
        input.classList.remove('error', 'success');
    });
    
    document.querySelectorAll('.form-error, .form-success').forEach(div => {
        div.style.display = 'none';
    });
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Função para formatar CPF conforme digitação
function formatCPF(input) {
    let value = input.value.replace(/\D/g, ''); // Remove tudo que não é número
    
    if (value.length <= 11) {
        // Aplica a formatação XXX.XXX.XXX-XX
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        
        input.value = value;
    }
}

// Função para validar CPF
function isValidCPF(cpf) {
    // Remove formatação
    cpf = cpf.replace(/\D/g, '');
    
    // Verifica se tem 11 dígitos
    if (cpf.length !== 11) return false;
    
    // Verifica se não são todos dígitos iguais
    if (/^(\d)\1{10}$/.test(cpf)) return false;
    
    // Validação do primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let remainder = 11 - (sum % 11);
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(9))) return false;
    
    // Validação do segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    remainder = 11 - (sum % 11);
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(10))) return false;
    
    return true;
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
        return false;
    }
}

// Disponibilizar funções globalmente para debugging
window.authDebug = {
    testBackendConnection,
    clearForms,
    switchMode
};

// Log inicial
console.log('🔐 Sistema de Autenticação carregado!');
console.log('🔗 Backend: http://localhost:8080');
console.log('💡 Digite "authDebug.testBackendConnection()" para testar conexão');
console.log('🔄 Use authDebug.switchMode("login"|"register") para alternar modos');
console.log('📋 Cadastro: CPF, E-mail e Senha');