// Configurações da API
const API_BASE_URL = 'http://localhost:8080';
const API_ENDPOINTS = {
    listAll: '/apis/tipo-ocorrencia',
    search: '/apis/tipo-ocorrencia/buscar-nome',
    delete: '/apis/tipo-ocorrencia'
};

// Variáveis globais
let currentTipos = [];
let deleteTargetId = null;

// Elementos do DOM
const searchNameInput = document.getElementById('searchName');
const searchBtn = document.getElementById('searchBtn');
const loadAllBtn = document.getElementById('loadAllBtn');
const loadingState = document.getElementById('loadingState');
const emptyState = document.getElementById('emptyState');
const tableContainer = document.getElementById('tableContainer');
const tiposTableBody = document.getElementById('tiposTableBody');
const resultsCount = document.getElementById('resultsCount');
const deleteModal = document.getElementById('deleteModal');

// Inicialização da página
document.addEventListener('DOMContentLoaded', function() {
    console.log('Página de listagem de tipos de ocorrência carregada');
    loadAllTipos();
});

// Função para listar todos os tipos
async function loadAllTipos() {
    setLoadingState(true, 'Carregando todos os tipos de ocorrência...');
    hideAllAlerts();

    try {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.listAll}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Erro ao carregar tipos de ocorrência (Status: ${response.status})`);
        }

        const tipos = await response.json();
        console.log('Tipos de ocorrência carregados:', tipos);

        currentTipos = Array.isArray(tipos) ? tipos : [];
        displayTipos(currentTipos);
        
        if (currentTipos.length > 0) {
            showAlert('info', `${currentTipos.length} tipo(s) de ocorrência carregado(s) com sucesso.`);
        }

    } catch (error) {
        console.error('Erro ao carregar tipos de ocorrência:', error);
        handleApiError(error);
        displayTipos([]);
    } finally {
        setLoadingState(false);
    }
}

// Função para pesquisar tipos por nome
async function searchTipos(event) {
    event.preventDefault();
    
    const searchTerm = searchNameInput.value.trim();
    
    if (!searchTerm) {
        loadAllTipos();
        return;
    }

    setLoadingState(true, `Pesquisando por "${searchTerm}"...`);
    hideAllAlerts();

    try {
        const url = `${API_BASE_URL}${API_ENDPOINTS.search}/${encodeURIComponent(searchTerm)}`;
        console.log('URL de pesquisa:', url);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Erro na pesquisa (Status: ${response.status})`);
        }

        const tipos = await response.json();
        console.log('Resultados da pesquisa:', tipos);

        currentTipos = Array.isArray(tipos) ? tipos : [];
        displayTipos(currentTipos);

        if (currentTipos.length > 0) {
            showAlert('success', `${currentTipos.length} tipo(s) de ocorrência encontrado(s) para "${searchTerm}".`);
        } else {
            showAlert('info', `Nenhum tipo de ocorrência encontrado para "${searchTerm}".`);
        }

    } catch (error) {
        console.error('Erro na pesquisa:', error);
        handleApiError(error);
        displayTipos([]);
    } finally {
        setLoadingState(false);
    }
}

// Função para exibir os tipos na tabela
function displayTipos(tipos) {
    // Atualizar contador
    const count = tipos.length;
    resultsCount.textContent = `${count} tipo${count !== 1 ? 's' : ''} encontrado${count !== 1 ? 's' : ''}`;

    if (count === 0) {
        // Mostrar estado vazio
        tableContainer.style.display = 'none';
        emptyState.style.display = 'block';
    } else {
        // Mostrar tabela
        emptyState.style.display = 'none';
        tableContainer.style.display = 'block';
        
        // Limpar tabela
        tiposTableBody.innerHTML = '';
        
        // Adicionar linhas
        tipos.forEach(tipo => {
            const row = createTipoRow(tipo);
            tiposTableBody.appendChild(row);
        });
    }
}

// Função para criar uma linha da tabela
function createTipoRow(tipo) {
    const row = document.createElement('tr');
    
    row.innerHTML = `
        <td class="id-column">${tipo.id || 'N/A'}</td>
        <td class="name-column">${escapeHtml(tipo.nomeTipoOcorrencia || 'Nome não informado')}</td>
        <td class="actions-column">
            <div class="action-buttons">
                <button class="action-btn edit-btn" onclick="editTipo(${tipo.id})" title="Editar tipo de ocorrência">
                    ✏️
                </button>
                <button class="action-btn delete-btn" onclick="showDeleteModal(${tipo.id}, '${escapeHtml(tipo.nomeTipoOcorrencia)}')" title="Excluir tipo de ocorrência">
                    🗑️
                </button>
            </div>
        </td>
    `;
    
    return row;
}

// Função para editar tipo (redireciona para página de edição)
function editTipo(id) {
    if (!id) {
        showAlert('error', 'ID do tipo de ocorrência não encontrado.');
        return;
    }
    
    console.log('Redirecionando para edição do tipo de ocorrência ID:', id);
    
    // Redirecionar para página de edição
    const editUrl = `edicao-tipo-ocorrencia.html?id=${id}`;
    showAlert('info', `Redirecionando para edição do tipo de ocorrência ID ${id}...`);
    
    setTimeout(() => {
        // window.location.href = editUrl;
        alert(`Redirecionando para: ${editUrl}`);
    }, 1000);
}

// Função para mostrar modal de confirmação de exclusão
function showDeleteModal(id, nome) {
    if (!id) {
        showAlert('error', 'ID do tipo de ocorrência não encontrado.');
        return;
    }
    
    deleteTargetId = id;
    document.getElementById('deleteMessage').innerHTML = 
        `Tem certeza que deseja excluir o tipo de ocorrência <strong>"${escapeHtml(nome)}"</strong>?<br><br>Esta ação não pode ser desfeita.`;
    deleteModal.classList.add('show');
}

// Função para fechar modal de exclusão
function closeDeleteModal() {
    deleteModal.classList.remove('show');
    deleteTargetId = null;
}

// Função para confirmar exclusão
async function confirmDelete() {
    if (!deleteTargetId) {
        showAlert('error', 'ID do tipo de ocorrência não encontrado.');
        closeDeleteModal();
        return;
    }

    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    const deleteIcon = document.getElementById('deleteIcon');
    const deleteText = document.getElementById('deleteText');

    // Mostrar loading no botão
    confirmDeleteBtn.disabled = true;
    deleteIcon.innerHTML = '<div class="loading-spinner"></div>';
    deleteText.textContent = 'Excluindo...';

    try {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.delete}/${deleteTargetId}`, {
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
                // Se não conseguir parsear JSON, usar texto
                const errorText = await response.text();
                if (errorText) errorMessage = errorText;
            }

            throw new Error(`${errorMessage} (Status: ${response.status})`);
        }

        // Sucesso
        showAlert('success', `Tipo de ocorrência excluído com sucesso!`);
        closeDeleteModal();
        
        // Recarregar lista
        if (searchNameInput.value.trim()) {
            searchTipos({ preventDefault: () => {} });
        } else {
            loadAllTipos();
        }

    } catch (error) {
        console.error('Erro ao excluir tipo de ocorrência:', error);
        showAlert('error', error.message);
    } finally {
        // Restaurar botão
        confirmDeleteBtn.disabled = false;
        deleteIcon.textContent = '🗑️';
        deleteText.textContent = 'Excluir';
    }
}

// Função para limpar pesquisa
function clearSearch() {
    searchNameInput.value = '';
    searchNameInput.focus();
    hideAllAlerts();
}

// Função para mostrar/ocultar estado de loading
function setLoadingState(loading, message = 'Carregando...') {
    if (loading) {
        loadingState.style.display = 'block';
        emptyState.style.display = 'none';
        tableContainer.style.display = 'none';
        
        if (message) {
            loadingState.querySelector('p').textContent = message;
        }
        
        // Desabilitar botões
        searchBtn.disabled = true;
        loadAllBtn.disabled = true;
        document.getElementById('searchIcon').innerHTML = '<div class="loading-spinner"></div>';
        document.getElementById('loadAllIcon').innerHTML = '<div class="loading-spinner"></div>';
        
    } else {
        loadingState.style.display = 'none';
        
        // Habilitar botões
        searchBtn.disabled = false;
        loadAllBtn.disabled = false;
        document.getElementById('searchIcon').textContent = '🔍';
        document.getElementById('loadAllIcon').textContent = '📋';
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

// Função para escapar HTML
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

// Função para ir para cadastro
function goToCreate() {
    showAlert('info', 'Redirecionando para cadastro de tipos de ocorrência...');
    setTimeout(() => {
        // window.location.href = 'cadastro-tipo-ocorrencia.html';
        alert('Redirecionando para: cadastro-tipo-ocorrencia.html');
    }, 1000);
}

// Função para voltar
function goBack() {
    if (confirm('Tem certeza que deseja voltar?')) {
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

// Atalhos de teclado
document.addEventListener('keydown', function(event) {
    // Enter para pesquisar
    if (event.key === 'Enter' && document.activeElement === searchNameInput) {
        event.preventDefault();
        searchTipos(event);
    }
    
    // Escape para fechar modal
    if (event.key === 'Escape') {
        closeDeleteModal();
    }
    
    // Ctrl + N para novo tipo
    if (event.ctrlKey && event.key === 'n') {
        event.preventDefault();
        goToCreate();
    }
});

// Fechar modal clicando fora
deleteModal.addEventListener('click', function(event) {
    if (event.target === deleteModal) {
        closeDeleteModal();
    }
});