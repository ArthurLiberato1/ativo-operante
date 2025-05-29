// Configurações da API
const API_BASE_URL = 'http://localhost:8080';
const API_ENDPOINTS = {
    listAll: '/apis/denuncia',
    search: '/apis/denuncia/buscar',
    getById: '/apis/denuncia',
    addFeedback: '/apis/denuncia',
    delete: '/apis/denuncia'
};

// Variáveis globais
let currentDenuncias = [];
let deleteTargetId = null;
let feedbackTargetId = null;

// Elementos do DOM
const searchTermInput = document.getElementById('searchTerm');
const searchBtn = document.getElementById('searchBtn');
const loadAllBtn = document.getElementById('loadAllBtn');
const loadingState = document.getElementById('loadingState');
const emptyState = document.getElementById('emptyState');
const tableContainer = document.getElementById('tableContainer');
const denunciasTableBody = document.getElementById('denunciasTableBody');
const resultsCount = document.getElementById('resultsCount');

// Modais
const viewModal = document.getElementById('viewModal');
const feedbackModal = document.getElementById('feedbackModal');
const deleteModal = document.getElementById('deleteModal');
const feedbackForm = document.getElementById('feedbackForm');

// Inicialização da página
document.addEventListener('DOMContentLoaded', function() {
    console.log('Página de gerenciamento de denúncias carregada');
    loadAllDenuncias();
});

// Função para listar todas as denúncias
async function loadAllDenuncias() {
    setLoadingState(true, 'Carregando todas as denúncias...');
    hideAllAlerts();

    try {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.listAll}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Erro ao carregar denúncias (Status: ${response.status})`);
        }

        const denuncias = await response.json();
        console.log('Denúncias carregadas:', denuncias);

        currentDenuncias = Array.isArray(denuncias) ? denuncias : [];
        displayDenuncias(currentDenuncias);
        
        if (currentDenuncias.length > 0) {
            showAlert('info', `${currentDenuncias.length} denúncia(s) carregada(s) com sucesso.`);
        }

    } catch (error) {
        console.error('Erro ao carregar denúncias:', error);
        handleApiError(error);
        displayDenuncias([]);
    } finally {
        setLoadingState(false);
    }
}

// Função para pesquisar denúncias
async function searchDenuncias(event) {
    event.preventDefault();
    
    const searchTerm = searchTermInput.value.trim();
    
    if (!searchTerm) {
        loadAllDenuncias();
        return;
    }

    setLoadingState(true, `Pesquisando por "${searchTerm}"...`);
    hideAllAlerts();

    try {
        const url = `${API_BASE_URL}${API_ENDPOINTS.search}?termo=${encodeURIComponent(searchTerm)}`;
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

        const denuncias = await response.json();
        console.log('Resultados da pesquisa:', denuncias);

        currentDenuncias = Array.isArray(denuncias) ? denuncias : [];
        displayDenuncias(currentDenuncias);

        if (currentDenuncias.length > 0) {
            showAlert('success', `${currentDenuncias.length} denúncia(s) encontrada(s) para "${searchTerm}".`);
        } else {
            showAlert('info', `Nenhuma denúncia encontrada para "${searchTerm}".`);
        }

    } catch (error) {
        console.error('Erro na pesquisa:', error);
        handleApiError(error);
        displayDenuncias([]);
    } finally {
        setLoadingState(false);
    }
}

// Função para exibir as denúncias na tabela
function displayDenuncias(denuncias) {
    // Atualizar contador
    const count = denuncias.length;
    resultsCount.textContent = `${count} denúncia${count !== 1 ? 's' : ''} encontrada${count !== 1 ? 's' : ''}`;

    if (count === 0) {
        // Mostrar estado vazio
        tableContainer.style.display = 'none';
        emptyState.style.display = 'block';
    } else {
        // Mostrar tabela
        emptyState.style.display = 'none';
        tableContainer.style.display = 'block';
        
        // Limpar tabela
        denunciasTableBody.innerHTML = '';
        
        // Adicionar linhas
        denuncias.forEach(denuncia => {
            const row = createDenunciaRow(denuncia);
            denunciasTableBody.appendChild(row);
        });
    }
}

// Função para criar uma linha da tabela
function createDenunciaRow(denuncia) {
    const row = document.createElement('tr');
    
    // Determinar status
    const status = denuncia.status || 'pendente';
    const statusClass = `status-${status.toLowerCase()}`;
    const statusText = getStatusText(status);
    
    row.innerHTML = `
        <td class="id-column">${denuncia.id || 'N/A'}</td>
        <td class="title-column">
            <div class="truncate" title="${escapeHtml(denuncia.titulo || 'Título não informado')}">
                ${escapeHtml(denuncia.titulo || 'Título não informado')}
            </div>
        </td>
        <td class="description-column">
            <div class="truncate" title="${escapeHtml(denuncia.descricao || 'Descrição não informada')}">
                ${escapeHtml(denuncia.descricao || 'Descrição não informada')}
            </div>
        </td>
        <td class="status-column">
            <span class="status-badge ${statusClass}">${statusText}</span>
        </td>
        <td class="date-column">${formatDate(denuncia.dataCriacao) || 'N/A'}</td>
        <td class="actions-column">
            <div class="action-buttons">
                <button class="action-btn view-btn" onclick="viewDenuncia(${denuncia.id})" title="Ver detalhes">
                    👁️
                </button>
                <button class="action-btn feedback-btn" onclick="showFeedbackModal(${denuncia.id})" title="Adicionar feedback">
                    💬
                </button>
                <button class="action-btn delete-btn" onclick="showDeleteModal(${denuncia.id}, '${escapeHtml(denuncia.titulo)}')" title="Excluir denúncia">
                    🗑️
                </button>
            </div>
        </td>
    `;
    
    return row;
}

// Função para obter texto do status
function getStatusText(status) {
    const statusMap = {
        'pendente': 'Pendente',
        'andamento': 'Em Andamento',
        'resolvida': 'Resolvida',
        'rejeitada': 'Rejeitada'
    };
    return statusMap[status.toLowerCase()] || status;
}

// Função para visualizar detalhes da denúncia
async function viewDenuncia(id) {
    if (!id) {
        showAlert('error', 'ID da denúncia não encontrado.');
        return;
    }

    try {
        showAlert('info', 'Carregando detalhes da denúncia...');
        
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.getById}/${id}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Erro ao carregar detalhes (Status: ${response.status})`);
        }

        const denuncia = await response.json();
        console.log('Detalhes da denúncia:', denuncia);

        displayDenunciaDetails(denuncia);
        viewModal.classList.add('show');
        hideAllAlerts();

    } catch (error) {
        console.error('Erro ao carregar detalhes:', error);
        showAlert('error', 'Erro ao carregar detalhes da denúncia.');
    }
}

// Função para exibir detalhes da denúncia no modal
function displayDenunciaDetails(denuncia) {
    const viewContent = document.getElementById('viewContent');
    
    viewContent.innerHTML = `
        <div class="detail-item">
            <div class="detail-label">ID:</div>
            <div class="detail-value">${denuncia.id || 'N/A'}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Título:</div>
            <div class="detail-value">${escapeHtml(denuncia.titulo || 'Não informado')}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Descrição:</div>
            <div class="detail-value">${escapeHtml(denuncia.descricao || 'Não informada')}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Status:</div>
            <div class="detail-value">
                <span class="status-badge status-${(denuncia.status || 'pendente').toLowerCase()}">
                    ${getStatusText(denuncia.status || 'pendente')}
                </span>
            </div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Data de Criação:</div>
            <div class="detail-value">${formatDate(denuncia.dataCriacao) || 'N/A'}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Órgão Responsável:</div>
            <div class="detail-value">${escapeHtml(denuncia.nomeOrgao || 'Não informado')}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Tipo de Ocorrência:</div>
            <div class="detail-value">${escapeHtml(denuncia.nomeTipoOcorrencia || 'Não informado')}</div>
        </div>
        ${denuncia.feedback ? `
        <div class="detail-item">
            <div class="detail-label">Feedback:</div>
            <div class="detail-value">${escapeHtml(denuncia.feedback)}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Data do Feedback:</div>
            <div class="detail-value">${formatDate(denuncia.dataFeedback) || 'N/A'}</div>
        </div>
        ` : ''}
    `;
}

// Função para mostrar modal de feedback
function showFeedbackModal(id) {
    if (!id) {
        showAlert('error', 'ID da denúncia não encontrado.');
        return;
    }
    
    feedbackTargetId = id;
    document.getElementById('feedbackText').value = '';
    feedbackModal.classList.add('show');
}

// Função para fechar modal de feedback
function closeFeedbackModal() {
    feedbackModal.classList.remove('show');
    feedbackTargetId = null;
}

// Função para enviar feedback
async function submitFeedback(event) {
    event.preventDefault();
    
    if (!feedbackTargetId) {
        showAlert('error', 'ID da denúncia não encontrado.');
        closeFeedbackModal();
        return;
    }

    const feedbackText = document.getElementById('feedbackText').value.trim();
    
    if (!feedbackText) {
        showAlert('error', 'Por favor, digite um feedback.');
        return;
    }

    const feedbackSubmitBtn = document.getElementById('feedbackSubmitBtn');
    const feedbackIcon = document.getElementById('feedbackIcon');
    const feedbackTextBtn = document.getElementById('feedbackText');

    // Mostrar loading no botão
    feedbackSubmitBtn.disabled = true;
    feedbackIcon.innerHTML = '<div class="loading-spinner"></div>';
    feedbackTextBtn.textContent = 'Enviando...';

    try {
        const data = {
            feedback: feedbackText
        };

        console.log('Enviando feedback para denúncia ID:', feedbackTargetId);
        console.log('Dados do feedback:', data);

        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.addFeedback}/${feedbackTargetId}/feedback`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            let errorMessage = 'Erro ao enviar feedback';
            
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
        showAlert('success', 'Feedback enviado com sucesso!');
        closeFeedbackModal();
        
        // Recarregar lista
        if (searchTermInput.value.trim()) {
            searchDenuncias({ preventDefault: () => {} });
        } else {
            loadAllDenuncias();
        }

    } catch (error) {
        console.error('Erro ao enviar feedback:', error);
        showAlert('error', error.message);
    } finally {
        // Restaurar botão
        feedbackSubmitBtn.disabled = false;
        feedbackIcon.textContent = '💾';
        feedbackTextBtn.textContent = 'Enviar Feedback';
    }
}

// Função para mostrar modal de confirmação de exclusão
function showDeleteModal(id, titulo) {
    if (!id) {
        showAlert('error', 'ID da denúncia não encontrado.');
        return;
    }
    
    deleteTargetId = id;
    document.getElementById('deleteMessage').innerHTML = 
        `Tem certeza que deseja excluir a denúncia <strong>"${escapeHtml(titulo)}"</strong>?<br><br>Esta ação não pode ser desfeita.`;
    deleteModal.classList.add('show');
}

// Função para fechar modal de exclusão
function closeDeleteModal() {
    deleteModal.classList.remove('show');
    deleteTargetId = null;
}

// Função para fechar modal de visualização
function closeViewModal() {
    viewModal.classList.remove('show');
}

// Função para confirmar exclusão
async function confirmDelete() {
    if (!deleteTargetId) {
        showAlert('error', 'ID da denúncia não encontrado.');
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
            let errorMessage = 'Erro ao excluir denúncia';
            
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
        showAlert('success', 'Denúncia excluída com sucesso!');
        closeDeleteModal();
        
        // Recarregar lista
        if (searchTermInput.value.trim()) {
            searchDenuncias({ preventDefault: () => {} });
        } else {
            loadAllDenuncias();
        }

    } catch (error) {
        console.error('Erro ao excluir denúncia:', error);
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
    searchTermInput.value = '';
    searchTermInput.focus();
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
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
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
    // window.history.back();
    alert('Voltando para o painel administrativo...');
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
    if (event.key === 'Enter' && document.activeElement === searchTermInput) {
        event.preventDefault();
        searchDenuncias(event);
    }
    
    // Escape para fechar modais
    if (event.key === 'Escape') {
        closeViewModal();
        closeFeedbackModal();
        closeDeleteModal();
    }
});

// Fechar modais clicando fora
[viewModal, feedbackModal, deleteModal].forEach(modal => {
    modal.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.classList.remove('show');
        }
    });
});