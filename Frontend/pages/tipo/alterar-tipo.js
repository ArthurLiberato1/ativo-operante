// Configurações da API
const API_BASE_URL = 'http://localhost:8080';
const API_ENDPOINTS = {
    getById: '/apis/tipo-ocorrencia',
    update: '/apis/tipo-ocorrencia',
    delete: '/apis/tipo-ocorrencia'
};

// Variáveis globais
let currentTipoId = null;
let originalData = null;

// Elementos do DOM
const form = document.getElementById('tipoOcorrenciaForm');
const nomeInput = document.getElementById('nomeTipoOcorrencia');
const submitBtn = document.getElementById('submitBtn');
const submitIcon = document.getElementById('submitIcon');
const submitText = document.getElementById('submitText');
const loadingState = document.getElementById('loadingState');
const formContainer = document.getElementById('formContainer');

// Inicialização da página
document.addEventListener('DOMContentLoaded', function() {
    console.log('Página de edição de tipos de ocorrência carregada');
    
    // Extrair ID da URL
    const urlParams = new URLSearchParams(window.location.search);
    currentTipoId = urlParams.get('id');
    
    if (!currentTipoId) {
        showAlert('error', 'ID do tipo de ocorrência não encontrado na URL.');
        return;
    }
    
    // Atualizar displays do ID
    document.getElementById('pageId').textContent = `ID: ${currentTipoId}`;
    document.getElementById('apiCurrentId').textContent = currentTipoId;
    
    // Carregar dados
    loadTipoData();
});

// Validação em tempo real
nomeInput.addEventListener('input', function() {
    validateNome(this.value);
    checkForChanges();
});

nomeInput.addEventListener('blur', function() {
    validateNome(this.value);
});

// Função para carregar dados do tipo de ocorrência
async function loadTipoData() {
    setLoadingState(true);
    hideAllAlerts();

    try {
        console.log(`Carregando dados do tipo ID: ${currentTipoId}`);
        
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.getById}/${currentTipoId}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Tipo de ocorrência não encontrado.');
            }
            throw new Error(`Erro ao carregar dados (Status: ${response.status})`);
        }

        const tipoData = await response.json();
        console.log('Dados carregados:', tipoData);

        // Armazenar dados originais
        originalData = { ...tipoData };
        
        // Preencher formulário
        populateForm(tipoData);
        
        // Mostrar formulário
        setLoadingState(false);
        formContainer.style.display = 'block';
        
        showAlert('info', 'Dados carregados com sucesso. Você pode editar as informações.');

    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setLoadingState(false);
        handleApiError(error);
    }
}

// Função para preencher o formulário
function populateForm(data) {
    // Preencher campo
    nomeInput.value = data.nomeTipoOcorrencia || '';
    
    // Preencher info box
    document.getElementById('infoId').textContent = data.id || 'N/A';
    document.getElementById('infoDataCriacao').textContent = formatDate(data.dataCriacao) || 'N/A';
    document.getElementById('infoUltimaAtualizacao').textContent = formatDate(data.ultimaAtualizacao) || 'N/A';
    
    // Validar campo preenchido
    validateNome(nomeInput.value);
    
    // Focar no campo
    nomeInput.focus();
}

// Função de validação do nome
function validateNome(value) {
    const nomeError = document.getElementById('nomeError');
    const nomeSuccess = document.getElementById('nomeSuccess');
    
    // Limpar estados anteriores
    nomeInput.classList.remove('error', 'success');
    nomeError.style.display = 'none';
    nomeSuccess.style.display = 'none';

    if (!value.trim()) {
        nomeInput.classList.add('error');
        nomeError.querySelector('span:last-child').textContent = 'Nome é obrigatório';
        nomeError.style.display = 'flex';
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

// Função para verificar se houve alterações
function checkForChanges() {
    if (!originalData) return;
    
    const currentName = nomeInput.value.trim();
    const originalName = originalData.nomeTipoOcorrencia || '';
    
    const hasChanges = currentName !== originalName;
    
    // Atualizar texto do botão
    if (hasChanges) {
        submitText.textContent = 'Salvar Alterações';
        submitBtn.classList.add('btn-primary');
        submitBtn.classList.remove('btn-secondary');
    } else {
        submitText.textContent = 'Sem Alterações';
        submitBtn.classList.add('btn-secondary');
        submitBtn.classList.remove('btn-primary');
    }
    
    return hasChanges;
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

    // Verificar se houve alterações
    if (!checkForChanges()) {
        showAlert('info', 'Nenhuma alteração foi detectada.');
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

        console.log('Atualizando tipo ID:', currentTipoId);
        console.log('Enviando dados:', data);

        // Enviar requisição
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.update}/${currentTipoId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(data)
        });

        console.log('Response status:', response.status);

        // Verificar se a resposta foi bem-sucedida
        if (!response.ok) {
            let errorMessage = 'Erro ao atualizar tipo de ocorrência';
            
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorData.error || errorMessage;
            } catch (parseError) {
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

        // Atualizar dados originais
        originalData = { ...result };
        
        // Sucesso
        showAlert('success', `Tipo de ocorrência "${nomeTipoOcorrencia}" atualizado com sucesso!`);
        
        // Atualizar info box se houver dados de data
        if (result.ultimaAtualizacao) {
            document.getElementById('infoUltimaAtualizacao').textContent = formatDate(result.ultimaAtualizacao);
        }
        
        // Verificar alterações novamente
        checkForChanges();

        // Opcional: Redirecionar após alguns segundos
        setTimeout(() => {
            showAlert('info', 'Redirecionando para a listagem...');
            // window.location.href = 'listagem-tipo-ocorrencia.html';
        }, 3000);

    } catch (error) {
        console.error('Erro ao atualizar tipo de ocorrência:', error);
        
        let errorMessage = 'Erro inesperado ao atualizar tipo de ocorrência';
        
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

// Função para resetar formulário
function resetForm() {
    if (!originalData) {
        showAlert('error', 'Dados originais não encontrados.');
        return;
    }
    
    if (confirm('Tem certeza que deseja descartar as alterações e voltar aos dados originais?')) {
        populateForm(originalData);
        hideAllAlerts();
        showAlert('info', 'Formulário resetado para os dados originais.');
    }
}

// Função para confirmar exclusão
function confirmDelete() {
    if (!currentTipoId || !originalData) {
        showAlert('error', 'Dados do tipo de ocorrência não encontrados.');
        return;
    }
    
    const nomeAtual = originalData.nomeTipoOcorrencia || 'Nome não informado';
    
    if (confirm(`Tem certeza que deseja EXCLUIR permanentemente o tipo de ocorrência "${nomeAtual}"?\n\nEsta ação NÃO pode ser desfeita!`)) {
        deleteTipo();
    }
}

// Função para excluir tipo
async function deleteTipo() {
    setLoading(true, 'Excluindo...');
    hideAllAlerts();

    try {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.delete}/${currentTipoId}`, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            let errorMessage = 'Erro ao excluir tipo de ocorrência';
            
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorData.error || errorMessage;
            } catch (parseError) {
                const errorText = await response.text();
                if (errorText) errorMessage = errorText;
            }

            throw new Error(`${errorMessage} (Status: ${response.status})`);
        }

        // Sucesso
        showAlert('success', 'Tipo de ocorrência excluído com sucesso!');
        
        // Desabilitar formulário
        form.querySelectorAll('input, button').forEach(element => {
            element.disabled = true;
        });

        // Redirecionar após alguns segundos
        setTimeout(() => {
            // window.location.href = 'listagem-tipo-ocorrencia.html';
            alert('Redirecionando para listagem...');
        }, 2000);

    } catch (error) {
        console.error('Erro ao excluir tipo de ocorrência:', error);
        showAlert('error', error.message);
    } finally {
        setLoading(false);
    }
}

// Função para mostrar/ocultar loading
function setLoading(loading, text = 'Salvando...') {
    if (loading) {
        submitBtn.disabled = true;
        submitIcon.innerHTML = '<div class="loading-spinner"></div>';
        submitText.textContent = text;
    } else {
        submitBtn.disabled = false;
        submitIcon.textContent = '💾';
        checkForChanges(); // Restaurar texto correto do botão
    }
}

// Função para mostrar/ocultar estado de loading da página
function setLoadingState(loading) {
    if (loading) {
        loadingState.style.display = 'block';
        formContainer.style.display = 'none';
    } else {
        loadingState.style.display = 'none';
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

// Função para tratar erros da API
function handleApiError(error) {
    let errorMessage = 'Erro inesperado ao comunicar com o servidor';
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage = 'Erro de conexão. Verifique se o servidor está rodando.';
    } else if (error.message) {
        errorMessage = error.message;
    }

    showAlert('error', errorMessage);
}

// Função para formatar data
function formatDate(dateString) {
    if (!dateString) return null;
    
    try {
        const date = new Date(dateString);
        return date.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        return dateString;
    }
}

// Função para voltar
function goBack() {
    if (checkForChanges()) {
        if (confirm('Existem alterações não salvas. Tem certeza que deseja voltar sem salvar?')) {
            // window.history.back();
            alert('Voltando para a listagem...');
        }
    } else {
        // window.history.back();
        alert('Voltando para a listagem...');
    }
}

// Função de logout
function logout() {
    if (confirm('Tem certeza que deseja sair?')) {
        alert('Logout realizado com sucesso!');
        // window.location.href = 'login.html';
    }
}

// Atalhos de teclado
document.addEventListener('keydown', function(event) {
    // Ctrl + Enter para submeter
    if (event.ctrlKey && event.key === 'Enter') {
        event.preventDefault();
        submitForm(event);
    }
    
    // Ctrl + R para resetar
    if (event.ctrlKey && event.key === 'r') {
        event.preventDefault();
        resetForm();
    }
    
    // Escape para voltar (com confirmação se houver alterações)
    if (event.key === 'Escape') {
        goBack();
    }
});

// Aviso antes de sair da página se houver alterações
window.addEventListener('beforeunload', function(event) {
    if (checkForChanges()) {
        event.preventDefault();
        event.returnValue = 'Existem alterações não salvas. Tem certeza que deseja sair?';
        return event.returnValue;
    }
});