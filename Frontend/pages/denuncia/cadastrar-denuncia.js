// Configurações da API
const API_BASE_URL = 'http://localhost:8080';
const API_ENDPOINTS = {
    orgaos: '/apis/orgao',
    tipos: '/apis/tipo',
    cadastrar: '/apis/denuncia'
};

// ID do usuário logado (normalmente viria da sessão/localStorage)
const CURRENT_USER_ID = 1; // Substituir pela lógica real de autenticação

// Elementos do DOM
const form = document.getElementById('denunciaForm');
const tituloInput = document.getElementById('titulo');
const textoInput = document.getElementById('texto');
const dataInput = document.getElementById('data');
const urgenciaSelect = document.getElementById('urgencia');
const orgaoSelect = document.getElementById('orgao');
const tipoSelect = document.getElementById('tipo');
const submitBtn = document.getElementById('submitBtn');
const submitIcon = document.getElementById('submitIcon');
const submitText = document.getElementById('submitText');
const loadingState = document.getElementById('loadingState');
const formContainer = document.getElementById('formContainer');

// Dados carregados
let orgaosData = [];
let tiposData = [];

// Inicialização da página
document.addEventListener('DOMContentLoaded', function() {
    console.log('Página de cadastro de denúncias carregada');
    
    // Definir data máxima como hoje
    const today = new Date().toISOString().split('T')[0];
    dataInput.max = today;
    dataInput.value = today;
    
    // Mostrar ID do usuário para debug
    document.getElementById('debugUserId').textContent = CURRENT_USER_ID;
    
    // Carregar dados necessários
    loadInitialData();
    
    // Configurar validações em tempo real
    setupValidations();
});

// Função para carregar dados iniciais
async function loadInitialData() {
    setLoadingState(true);
    hideAllAlerts();

    try {
        // Carregar órgãos e tipos em paralelo
        const [orgaosPromise, tiposPromise] = await Promise.all([
            loadOrgaos(),
            loadTipos()
        ]);

        if (orgaosData.length === 0) {
            showAlert('warning', 'Nenhum órgão encontrado. Não será possível registrar denúncias.');
        }

        if (tiposData.length === 0) {
            showAlert('warning', 'Nenhum tipo de ocorrência encontrado. Não será possível registrar denúncias.');
        }

        if (orgaosData.length > 0 && tiposData.length > 0) {
            showAlert('info', 'Dados carregados com sucesso. Você pode preencher o formulário.');
        }

    } catch (error) {
        console.error('Erro ao carregar dados iniciais:', error);
        showAlert('error', 'Erro ao carregar dados necessários. Tente recarregar a página.');
    } finally {
        setLoadingState(false);
    }
}

// Função para carregar órgãos
async function loadOrgaos() {
    try {
        console.log('Carregando órgãos...');
        
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.orgaos}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Erro ao carregar órgãos (Status: ${response.status})`);
        }

        const orgaos = await response.json();
        console.log('Órgãos carregados:', orgaos);

        orgaosData = Array.isArray(orgaos) ? orgaos : [];
        populateOrgaoSelect();
        
        return orgaosData;

    } catch (error) {
        console.error('Erro ao carregar órgãos:', error);
        orgaoSelect.innerHTML = '<option value="">Erro ao carregar órgãos</option>';
        throw error;
    }
}

// Função para carregar tipos de ocorrência
async function loadTipos() {
    try {
        console.log('Carregando tipos de ocorrência...');
        
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.tipos}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Erro ao carregar tipos (Status: ${response.status})`);
        }

        const tipos = await response.json();
        console.log('Tipos carregados:', tipos);

        tiposData = Array.isArray(tipos) ? tipos : [];
        populateTipoSelect();
        
        return tiposData;

    } catch (error) {
        console.error('Erro ao carregar tipos:', error);
        tipoSelect.innerHTML = '<option value="">Erro ao carregar tipos</option>';
        throw error;
    }
}

// Função para popular select de órgãos
function populateOrgaoSelect() {
    orgaoSelect.innerHTML = '<option value="">Selecione um órgão</option>';
    
    orgaosData.forEach(orgao => {
        const option = document.createElement('option');
        option.value = orgao.id;
        option.textContent = orgao.nomeOrgao;
        orgaoSelect.appendChild(option);
    });
}

// Função para popular select de tipos
function populateTipoSelect() {
    tipoSelect.innerHTML = '<option value="">Selecione um tipo</option>';
    
    tiposData.forEach(tipo => {
        const option = document.createElement('option');
        option.value = tipo.id;
        option.textContent = tipo.nomeTipoOcorrencia;
        tipoSelect.appendChild(option);
    });
}

// Configurar validações em tempo real
function setupValidations() {
    // Validação do título
    tituloInput.addEventListener('input', function() {
        validateTitulo(this.value);
    });

    tituloInput.addEventListener('blur', function() {
        validateTitulo(this.value);
    });

    // Validação do texto
    textoInput.addEventListener('input', function() {
        validateTexto(this.value);
    });

    textoInput.addEventListener('blur', function() {
        validateTexto(this.value);
    });

    // Validação da data
    dataInput.addEventListener('change', function() {
        validateData(this.value);
    });

    // Validação da urgência
    urgenciaSelect.addEventListener('change', function() {
        validateUrgencia(this.value);
    });

    // Validação do órgão
    orgaoSelect.addEventListener('change', function() {
        validateOrgao(this.value);
    });

    // Validação do tipo
    tipoSelect.addEventListener('change', function() {
        validateTipo(this.value);
    });
}

// Função de validação do título
function validateTitulo(value) {
    const tituloError = document.getElementById('tituloError');
    const tituloSuccess = document.getElementById('tituloSuccess');
    
    // Limpar estados anteriores
    tituloInput.classList.remove('error', 'success');
    tituloError.style.display = 'none';
    tituloSuccess.style.display = 'none';

    if (!value.trim()) {
        tituloInput.classList.add('error');
        tituloError.querySelector('span:last-child').textContent = 'Título é obrigatório';
        tituloError.style.display = 'flex';
        return false;
    }

    if (value.trim().length < 5) {
        tituloInput.classList.add('error');
        tituloError.querySelector('span:last-child').textContent = 'Título deve ter pelo menos 5 caracteres';
        tituloError.style.display = 'flex';
        return false;
    }

    if (value.trim().length > 150) {
        tituloInput.classList.add('error');
        tituloError.querySelector('span:last-child').textContent = 'Título deve ter no máximo 150 caracteres';
        tituloError.style.display = 'flex';
        return false;
    }

    // Sucesso
    tituloInput.classList.add('success');
    tituloSuccess.style.display = 'flex';
    return true;
}

// Função de validação do texto
function validateTexto(value) {
    const textoError = document.getElementById('textoError');
    const textoSuccess = document.getElementById('textoSuccess');
    
    // Limpar estados anteriores
    textoInput.classList.remove('error', 'success');
    textoError.style.display = 'none';
    textoSuccess.style.display = 'none';

    if (!value.trim()) {
        textoInput.classList.add('error');
        textoError.querySelector('span:last-child').textContent = 'Descrição é obrigatória';
        textoError.style.display = 'flex';
        return false;
    }

    if (value.trim().length < 10) {
        textoInput.classList.add('error');
        textoError.querySelector('span:last-child').textContent = 'Descrição deve ter pelo menos 10 caracteres';
        textoError.style.display = 'flex';
        return false;
    }

    if (value.trim().length > 1000) {
        textoInput.classList.add('error');
        textoError.querySelector('span:last-child').textContent = 'Descrição deve ter no máximo 1000 caracteres';
        textoError.style.display = 'flex';
        return false;
    }

    // Sucesso
    textoInput.classList.add('success');
    textoSuccess.style.display = 'flex';
    return true;
}

// Função de validação da data
function validateData(value) {
    const dataError = document.getElementById('dataError');
    
    // Limpar estados anteriores
    dataInput.classList.remove('error', 'success');
    dataError.style.display = 'none';

    if (!value) {
        dataInput.classList.add('error');
        dataError.querySelector('span:last-child').textContent = 'Data é obrigatória';
        dataError.style.display = 'flex';
        return false;
    }

    const selectedDate = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate > today) {
        dataInput.classList.add('error');
        dataError.querySelector('span:last-child').textContent = 'Data não pode ser futura';
        dataError.style.display = 'flex';
        return false;
    }

    // Sucesso
    dataInput.classList.add('success');
    return true;
}

// Função de validação da urgência
function validateUrgencia(value) {
    const urgenciaError = document.getElementById('urgenciaError');
    
    // Limpar estados anteriores
    urgenciaSelect.classList.remove('error', 'success');
    urgenciaError.style.display = 'none';

    if (!value) {
        urgenciaSelect.classList.add('error');
        urgenciaError.querySelector('span:last-child').textContent = 'Urgência é obrigatória';
        urgenciaError.style.display = 'flex';
        return false;
    }

    if (!['1', '2', '3'].includes(value)) {
        urgenciaSelect.classList.add('error');
        urgenciaError.querySelector('span:last-child').textContent = 'Urgência deve ser 1, 2 ou 3';
        urgenciaError.style.display = 'flex';
        return false;
    }

    // Sucesso
    urgenciaSelect.classList.add('success');
    return true;
}

// Função de validação do órgão
function validateOrgao(value) {
    const orgaoError = document.getElementById('orgaoError');
    
    // Limpar estados anteriores
    orgaoSelect.classList.remove('error', 'success');
    orgaoError.style.display = 'none';

    if (!value) {
        orgaoSelect.classList.add('error');
        orgaoError.querySelector('span:last-child').textContent = 'Órgão é obrigatório';
        orgaoError.style.display = 'flex';
        return false;
    }

    // Verificar se o ID existe nos dados carregados
    const orgaoExists = orgaosData.some(orgao => orgao.id.toString() === value);
    if (!orgaoExists) {
        orgaoSelect.classList.add('error');
        orgaoError.querySelector('span:last-child').textContent = 'Órgão selecionado inválido';
        orgaoError.style.display = 'flex';
        return false;
    }

    // Sucesso
    orgaoSelect.classList.add('success');
    return true;
}

// Função de validação do tipo
function validateTipo(value) {
    const tipoError = document.getElementById('tipoError');
    
    // Limpar estados anteriores
    tipoSelect.classList.remove('error', 'success');
    tipoError.style.display = 'none';

    if (!value) {
        tipoSelect.classList.add('error');
        tipoError.querySelector('span:last-child').textContent = 'Tipo é obrigatório';
        tipoError.style.display = 'flex';
        return false;
    }

    // Verificar se o ID existe nos dados carregados
    const tipoExists = tiposData.some(tipo => tipo.id.toString() === value);
    if (!tipoExists) {
        tipoSelect.classList.add('error');
        tipoError.querySelector('span:last-child').textContent = 'Tipo selecionado inválido';
        tipoError.style.display = 'flex';
        return false;
    }

    // Sucesso
    tipoSelect.classList.add('success');
    return true;
}

// Função de envio do formulário
async function submitForm(event) {
    event.preventDefault();

    // Validar todos os campos
    const tituloValid = validateTitulo(tituloInput.value);
    const textoValid = validateTexto(textoInput.value);
    const dataValid = validateData(dataInput.value);
    const urgenciaValid = validateUrgencia(urgenciaSelect.value);
    const orgaoValid = validateOrgao(orgaoSelect.value);
    const tipoValid = validateTipo(tipoSelect.value);

    if (!tituloValid || !textoValid || !dataValid || !urgenciaValid || !orgaoValid || !tipoValid) {
        showAlert('error', 'Por favor, corrija os erros no formulário antes de continuar.');
        return;
    }

    // Mostrar loading
    setLoading(true);
    hideAllAlerts();

    try {
        // Preparar dados para envio
        const data = {
            titulo: tituloInput.value.trim(),
            texto: textoInput.value.trim(),
            urgencia: parseInt(urgenciaSelect.value),
            data: dataInput.value,
            idOrgao: parseInt(orgaoSelect.value),
            idTipo: parseInt(tipoSelect.value),
            idUsuario: CURRENT_USER_ID
        };

        console.log('Enviando denúncia:', data);

        // Enviar requisição
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.cadastrar}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(data)
        });

        console.log('Response status:', response.status);

        // Verificar se a resposta foi bem-sucedida
        if (!response.ok) {
            let errorMessage = 'Erro ao registrar denúncia';
            
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

        // Sucesso
        showAlert('success', `Denúncia "${data.titulo}" registrada com sucesso! ID: ${result.id || 'N/A'}`);
        
        // Limpar formulário
        clearForm();

        // Opcional: Redirecionar após alguns segundos
        setTimeout(() => {
            showAlert('info', 'Redirecionando para suas denúncias...');
            // window.location.href = 'minhas-denuncias.html';
        }, 3000);

    } catch (error) {
        console.error('Erro ao registrar denúncia:', error);
        
        let errorMessage = 'Erro inesperado ao registrar denúncia';
        
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
        submitText.textContent = 'Registrando...';
    } else {
        submitBtn.disabled = false;
        submitIcon.textContent = '📢';
        submitText.textContent = 'Registrar Denúncia';
    }
}

// Função para mostrar/ocultar estado de loading da página
function setLoadingState(loading) {
    if (loading) {
        loadingState.style.display = 'block';
        formContainer.style.display = 'none';
    } else {
        loadingState.style.display = 'none';
        formContainer.style.display = 'block';
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
        
        // Auto-hide após 7 segundos para alertas de sucesso e info
        if (type === 'success' || type === 'info') {
            setTimeout(() => {
                alertElement.classList.remove('show');
            }, 7000);
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
    // Limpar todos os campos
    form.reset();
    
    // Restaurar data para hoje
    const today = new Date().toISOString().split('T')[0];
    dataInput.value = today;
    
    // Limpar estados visuais
    document.querySelectorAll('.form-input, .form-select, .form-textarea').forEach(element => {
        element.classList.remove('error', 'success');
    });
    
    // Ocultar mensagens de erro/sucesso
    document.querySelectorAll('.form-error, .form-success').forEach(element => {
        element.style.display = 'none';
    });
    
    // Recarregar selects
    populateOrgaoSelect();
    populateTipoSelect();
    
    hideAllAlerts();
    tituloInput.focus();
}

// Função para voltar
function goBack() {
    const hasData = tituloInput.value.trim() || textoInput.value.trim();
    
    if (hasData) {
        if (confirm('Existem dados não salvos. Tem certeza que deseja voltar?')) {
            // window.history.back();
            alert('Voltando para a página anterior...');
        }
    } else {
        // window.history.back();
        alert('Voltando para a página anterior...');
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
    
    // Escape para limpar
    if (event.key === 'Escape') {
        clearForm();
    }
});

// Aviso antes de sair da página se houver dados
window.addEventListener('beforeunload', function(event) {
    const hasData = tituloInput.value.trim() || textoInput.value.trim();
    
    if (hasData) {
        event.preventDefault();
        event.returnValue = 'Existem dados não salvos. Tem certeza que deseja sair?';
        return event.returnValue;
    }
});