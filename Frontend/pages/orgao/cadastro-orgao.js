// ✅ CORREÇÕES no JavaScript para cadastro de órgãos

// Configurações da API
const API_BASE_URL = 'http://localhost:8080';
const API_ENDPOINT = '/apis/orgaos';

// ✅ CORREÇÃO: usar chave consistente com login
const token = localStorage.getItem("authToken"); // ou "token" - seja consistente

// ✅ VERIFICAÇÃO INICIAL: validar se usuário está logado e tem permissão
document.addEventListener('DOMContentLoaded', function() {
    console.log('Página de cadastro de órgãos carregada');
    
    // Verificar se está logado
    if (!token) {
        alert('Token não encontrado. Redirecionando para login...');
        window.location.href = '../login/login.html';
        return;
    }
    
    // Verificar se token é válido e se usuário é admin
    if (!isValidToken(token)) {
        alert('Token inválido. Redirecionando para login...');
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        window.location.href = '../login/login.html';
        return;
    }
    
    // Verificar se usuário é admin (necessário para cadastrar órgãos)
    const userData = getUserData();
    if (!userData || userData.nivel !== 1) {
        alert('Acesso negado. Apenas administradores podem cadastrar órgãos.');
        window.history.back();
        return;
    }
    
    
    
    
    // Mostrar informações da API no console
    console.log('API Configuration:');
    console.log('Base URL:', API_BASE_URL);
    console.log('Endpoint:', API_ENDPOINT);
    console.log('Full URL:', `${API_BASE_URL}${API_ENDPOINT}`);
    console.log('Token disponível:', token ? 'Sim' : 'Não');
    console.log('Usuário:', userData ? userData.email : 'N/A');
    console.log('Nível:', userData ? userData.nivel : 'N/A');
});

// ✅ FUNÇÃO MELHORADA: validação de token
function isValidToken(token) {
    if (!token) return false;
    
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return false;
        
        const payload = JSON.parse(atob(parts[1]));
        const now = Math.floor(Date.now() / 1000);
        
        // Verificar expiração
        if (payload.exp && payload.exp < now) {
            console.log('Token expirado');
            return false;
        }
        
        return true;
    } catch (error) {
        console.error('Erro ao validar token:', error);
        return false;
    }
}

// ✅ FUNÇÃO: obter dados do usuário
function getUserData() {
    try {
        const userData = localStorage.getItem('userData');
        return userData ? JSON.parse(userData) : null;
    } catch (error) {
        console.error('Erro ao obter dados do usuário:', error);
        return null;
    }
}

// ✅ FUNÇÃO MELHORADA: envio do formulário com melhor tratamento de erros
async function submitForm(event) {
    event.preventDefault();

    const nomeInput = document.getElementById('nomeOrgao');
    nomeInput.focus();
    const nomeOrgao = nomeInput.value.trim();
    // Verificar token antes de enviar
    if (!token) {
        showAlert('error', 'Token não encontrado. Faça login novamente.');
        setTimeout(() => {
            window.location.href = '../login/login.html';
        }, 2000);
        return;
    }

    // Mostrar loading
    //setLoading(true);
    //hideAllAlerts();

    try {
        // Preparar dados
        const data = {
            nome: nomeOrgao
        };

        console.log('Enviando dados:', data);
        console.log('Token usado:', token.substring(0, 20) + '...');

        // Enviar requisição
        const response = await fetch(`http://localhost:8080/apis/orgaos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}` // ✅ Formato correto
            },
            body: JSON.stringify(data)
        });
        if(!response.ok){
            throw new Error("Erro ao cadastrar");
            
        }

        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);

        // ✅ MELHOR TRATAMENTO DE ERROS por status
        if (!response.ok) {
            let errorMessage = 'Erro ao cadastrar órgão';
            
            switch (response.status) {
                case 401:
                    errorMessage = 'Token inválido ou expirado. Faça login novamente.';
                    // Redirecionar para login após erro 401
                    setTimeout(() => {
                        localStorage.removeItem('authToken');
                        localStorage.removeItem('userData');
                        window.location.href = '../login/login.html';
                    }, 3000);
                    break;
                case 403:
                    errorMessage = 'Acesso negado. Você não tem permissão para cadastrar órgãos.';
                    break;
                case 400:
                    errorMessage = 'Dados inválidos. Verifique as informações enviadas.';
                    break;
                case 409:
                    errorMessage = 'Órgão já existe com este nome.';
                    break;
                case 500:
                    errorMessage = 'Erro interno do servidor. Tente novamente mais tarde.';
                    break;
                default:
                    try {
                        const errorData = await response.json();
                        errorMessage = errorData.message || errorData.error || `Erro ${response.status}`;
                    } catch (parseError) {
                        const errorText = await response.text();
                        errorMessage = errorText || `Erro ${response.status}`;
                    }
            }

            throw new Error(errorMessage);
        }

        // ✅ MELHOR TRATAMENTO DA RESPOSTA
        let result;
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.indexOf('application/json') !== -1) {
            result = await response.json();
        } else {
            result = { message: await response.text() };
        }

        console.log('Resposta da API:', result);

        // Sucesso
        showAlert('success', `Órgão "${nomeOrgao}" cadastrado com sucesso!${result.id ? ` ID: ${result.id}` : ''}`);
        clearForm();

        // Opcional: Redirecionar após alguns segundos
        setTimeout(() => {
            showAlert('info', 'Redirecionando para a listagem...');
            // window.location.href = 'listagem-orgaos.html';
        }, 2000);

    } catch (error) {
        console.error('Erro ao cadastrar órgão:', error);
        
        let errorMessage = error.message || 'Erro inesperado ao cadastrar órgão';
        
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            errorMessage = 'Erro de conexão. Verifique se o servidor está rodando.';
        }

        showAlert('error', errorMessage);
    } finally {
        setLoading(false);
    }
}

// ✅ FUNÇÃO DE LOGOUT MELHORADA
function logout() {
    if (confirm('Tem certeza que deseja sair?')) {
        // Limpar dados locais
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        
        // Redirecionar
        window.location.href = '../login/login.html';
    }
}

// ✅ FUNÇÃO DE DEBUG para testar conexão
async function testConnection() {
    try {
        const response = await fetch(`${API_BASE_URL}/login/acesso`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('Teste de conexão:', response.status, response.ok);
        
        if (response.ok) {
            const result = await response.text();
            console.log('Resposta:', result);
            showAlert('success', 'Conexão com backend OK!');
        } else {
            showAlert('error', `Erro na conexão: ${response.status}`);
        }
    } catch (error) {
        console.error('Erro no teste:', error);
        showAlert('error', 'Erro de conexão com o servidor');
    }
}

// ✅ DISPONIBILIZAR FUNÇÕES PARA DEBUG
window.debugOrgao = {
    testConnection,
    token: token,
    userData: getUserData(),
    isValidToken: () => isValidToken(token)
};

// Resto do código permanece igual...
// (validateNome, setLoading, showAlert, etc.)

console.log('🏢 Sistema de Cadastro de Órgãos carregado!');
console.log('🔗 Backend:', API_BASE_URL);
console.log('💡 Digite "debugOrgao.testConnection()" para testar conexão');
console.log('🎫 Token válido:', isValidToken(token));