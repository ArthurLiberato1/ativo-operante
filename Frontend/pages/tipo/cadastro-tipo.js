// Configurações da API
const API_BASE_URL = 'http://localhost:8080';
const API_ENDPOINT = '/apis/tipo';

// Elementos do DOM
const form = document.getElementById('tipoOcorrenciaForm');
const nomeInput = document.getElementById('nomeTipoOcorrencia');
const submitBtn = document.getElementById('submitBtn');
const submitIcon = document.getElementById('submitIcon');
const submitText = document.getElementById('submitText');

// Validação em tempo real
nomeInput.addEventListener('input', function() {
    validateNome(this.value);
});

nomeInput.addEventListener('blur', function() {
    validateNome(this.value);
});

// Função de validação do nome
function validateNome(value) {
    const nomeError = document.getElementById('nomeError');
    const nomeSuccess = document.getElementById('nomeSuccess');
    
    // Limpar estados anteriores
    nomeInput.classList.remove('error', 'success');
    nomeError.style.display = 'none';
    nomeSuccess.style.display = 'none';

    if (!value.trim()) {
        return false;
    }

    if (value.trim().length < 3) {
        nomeInput.classList.add('error');
        nomeError.querySelector('span:last-child').textContent = 'Nome deve ter pelo menos 3 caracteres';
        nomeError.style.display = 'flex';
        return false;
    }

    if (value.trim().length > 100) {
        nomeInput.classList.add('error');
        nomeError.querySelector('span:last-child').textContent = 'Nome deve ter no máximo 100 caracteres';
        nomeError.style.display = 'flex';
        return false;
    }

    // Validação de caracteres especiais
    const regex = /^[a-zA-ZÀ-ÿ0-9\s\-\.\_]+$/;
    if (!regex.test(value.trim())) {
        nomeInput.classList.add('error');
        nomeError.querySelector('span:last-child').textContent = 'Nome contém caracteres inválidos';
        nomeError.style.display = 'flex';
        return false;
    }

    // Sucesso
    nomeInput.classList.add('success');
    nomeSuccess.style.display = 'flex';
    return true;
}

// Função de envio do formulário
async function submitForm(event) {
    event.preventDefault();

    const nomeTipoOcorrencia = nomeInput.value.trim();

    // Validação final
    if (!validateNome(nomeTipoOcorrencia)) {
        showAlert('error', 'Por favor, corrija os erros no formulário antes de continuar.');
        return;
    }

    // Mostrar loading
    setLoading(true);
    hideAllAlerts();

    try {
        // Preparar dados
        const data = {
            nomeTipoOcorrencia: nomeTipoOcorrencia
        };

        console.log('Enviando dados:', data);

        // Enviar requisição
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINT}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(data)
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);

        // Verificar se a resposta foi bem-sucedida
        if (!response.ok) {
            let errorMessage = 'Erro ao cadastrar tipo de ocorrência';
            
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorData.error || errorMessage;
            } catch (parseError) {
                // Se não conseguir parsear como JSON, pegar o texto
                const errorText = await response.text();
                if (errorText) {
                    errorMessage = errorText;
                }
            }

            throw new Error(`${errorMessage} (Status: ${response.status})`);
        }

        // Parsear resposta
        const result = await response.json();
        console.log('Resposta da API:', result);

        // Sucesso
        showAlert('success', `Tipo de ocorrência "${nomeTipoOcorrencia}" cadastrado com sucesso! ID: ${result.id || 'N/A'}`);
        clearForm();

        // Opcional: Redirecionar após alguns segundos
        setTimeout(() => {
            showAlert('info', 'Redirecionando para a listagem...');
            // window.location.href = 'listagem-tipos-ocorrencia.html';
        }, 2000);

    } catch (error) {
        console.error('Erro ao cadastrar tipo de ocorrência:', error);
        
        let errorMessage = 'Erro inesperado ao cadastrar tipo de ocorrência';
        
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            errorMessage = 'Erro de conexão. Verifique se o servidor está rodando.';
        } else if (error.message) {
            errorMessage = error.message;
        }

        showAlert('error', errorMessage);
    } finally {
        setLoading(false);
    }
}

// Função para mostrar/ocultar loading
function setLoading(loading) {
    if (loading) {
        submitBtn.disabled = true;
        submitIcon.innerHTML = '<div class="loading-spinner"></div>';
        submitText.textContent = 'Cadastrando...';
    } else {
        submitBtn.disabled = false;
        submitIcon.textContent = '💾';
        submitText.textContent = 'Cadastrar Tipo';
    }
}

// Função para mostrar alertas
function showAlert(type, message) {
    hideAllAlerts();
    
    const alertElement = document.getElementById(`alert${type.charAt(0).toUpperCase() + type.slice(1)}`);
    const messageElement = document.getElementById(`${type}Message`);
    
    if (alertElement && messageElement) {
        messageElement.textContent = message;
        alertElement.classList.add('show');
        
        // Auto-hide após 5 segundos para alertas de sucesso e info
        if (type === 'success' || type === 'info') {
            setTimeout(() => {
                alertElement.classList.remove('show');
            }, 5000);
        }
    }
}

// Função para ocultar todos os alertas
function hideAllAlerts() {
    document.querySelectorAll('.alert').forEach(alert => {
        alert.classList.remove('show');
    });
}

// Função para limpar formulário
function clearForm() {
    form.reset();
    nomeInput.classList.remove('error', 'success');
    document.getElementById('nomeError').style.display = 'none';
    document.getElementById('nomeSuccess').style.display = 'none';
    hideAllAlerts();
    nomeInput.focus();
}

// Função para voltar
function goBack() {
    if (confirm('Tem certeza que deseja voltar? Os dados não salvos serão perdidos.')) {
        // window.history.back();
        alert('Voltando para o painel administrativo...');
    }
}

// Função de logout
function logout() {
    if (confirm('Tem certeza que deseja sair?')) {
        alert('Logout realizado com sucesso!');
        // window.location.href = 'login.html';
    }
}

// Inicialização da página
document.addEventListener('DOMContentLoaded', function() {
    console.log('Página de cadastro de tipos de ocorrência carregada');
    nomeInput.focus();
    
    // Mostrar informações da API no console
    console.log('API Configuration:');
    console.log('Base URL:', API_BASE_URL);
    console.log('Endpoint:', API_ENDPOINT);
    console.log('Full URL:', `${API_BASE_URL}${API_ENDPOINT}`);
});

// Atalhos de teclado
document.addEventListener('keydown', function(event) {
    // Ctrl + Enter para submeter
    if (event.ctrlKey && event.key === 'Enter') {
        event.preventDefault();
        submitForm(event);
    }
    
    // Escape para limpar
    if (event.key === 'Escape') {
        clearForm();
    }
});