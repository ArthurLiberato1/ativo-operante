// home.js - Sistema da Home do Cidadão

// Configuração da API
const API_BASE_URL = 'http://localhost:8080/apis';

// Elementos do DOM
const userNameEl = document.getElementById('userName');
const userEmailEl = document.getElementById('userEmail');
const userAvatarEl = document.getElementById('userAvatar');
const loadingStateEl = document.getElementById('loadingState');
const emptyStateEl = document.getElementById('emptyState');
const complaintsGridEl = document.getElementById('complaintsGrid');
const successMessageEl = document.getElementById('successMessage');

// Estado da aplicação
let userData = null;
let complaints = [];
let currentFilter = 'todas';

// Inicialização quando o DOM carregar
document.addEventListener('DOMContentLoaded', function() {
    initializeHome();
});

// Função de inicialização
async function initializeHome() {
    console.log('🏠 Inicializando Home do Cidadão');
    
    try {
        // Verificar se usuário está logado
        await checkUserAuthentication();
        
        // Carregar dados do usuário na interface
        loadUserInterface();
        
        // Carregar denúncias do usuário
        await loadUserComplaints();
        
        console.log('✅ Home inicializada com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao inicializar home:', error);
        handleAuthenticationError();
    }
}

// Verificar autenticação do usuário
async function checkUserAuthentication() {
    // Verificar se existe dados do usuário no localStorage
    const userDataString = localStorage.getItem('userData');
    
    if (!userDataString) {
        throw new Error('Usuário não autenticado');
    }
    
    try {
        userData = JSON.parse(userDataString);
        console.log('👤 Usuário autenticado:', userData.name);
    } catch (error) {
        console.error('Erro ao parsear dados do usuário:', error);
        throw new Error('Dados de usuário inválidos');
    }
}

// Carregar interface do usuário
function loadUserInterface() {
    if (!userData) return;
    
    // Atualizar nome e email
    userNameEl.textContent = userData.name || 'Usuário';
    userEmailEl.textContent = userData.email || '';
    
    // Criar avatar com iniciais
    const initials = getInitials(userData.name || 'U');
    userAvatarEl.textContent = initials;
    
    // Atualizar informações de debug
    const debugUserInfo = document.getElementById('debugUserInfo');
    if (debugUserInfo) {
        debugUserInfo.textContent = `${userData.name} (ID: ${userData.id})`;
    }
    
    console.log('🎨 Interface do usuário carregada');
}

// Obter iniciais do nome
function getInitials(name) {
    return name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .substring(0, 2);
}

// Carregar denúncias do usuário
async function loadUserComplaints() {
    if (!userData || !userData.id) {
        console.error('Dados do usuário não disponíveis');
        return;
    }
    
    showLoadingState();
    
    try {
        console.log(`🔍 Buscando denúncias do usuário ID: ${userData.id}`);
        
        // Fazer requisição para API
        const response = await fetch(`${API_BASE_URL}/denuncia/usuario/${userData.id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            }
        });
        
        if (response.ok) {
            complaints = await response.json();
            console.log(`📋 ${complaints.length} denúncias carregadas`);
            
            // Renderizar denúncias
            renderComplaints();
        } else if (response.status === 404) {
            // Nenhuma denúncia encontrada
            complaints = [];
            renderComplaints();
        } else {
            throw new Error(`Erro na API: ${response.status}`);
        }
        
    } catch (error) {
        console.error('❌ Erro ao carregar denúncias:', error);
        showErrorMessage('Erro ao carregar suas denúncias. Tente novamente.');
        showEmptyState();
    }
}

// Renderizar denúncias na tela
function renderComplaints() {
    hideLoadingState();
    
    // Filtrar denúncias se necessário
    const filteredComplaints = filterComplaintsByStatus(complaints, currentFilter);
    
    if (filteredComplaints.length === 0) {
        showEmptyState();
        return;
    }
    
    // Mostrar grid e esconder empty state
    showComplaintsGrid();
    
    // Limpar grid atual
    complaintsGridEl.innerHTML = '';
    
    // Renderizar cada denúncia
    filteredComplaints.forEach(complaint => {
        const complainantCard = createComplaintCard(complaint);
        complaintsGridEl.appendChild(complainantCard);
    });
    
    console.log(`🎨 ${filteredComplaints.length} denúncias renderizadas`);
}

// Criar card de denúncia
function createComplaintCard(complaint) {
    const card = document.createElement('div');
    card.className = 'complaint-card';
    card.setAttribute('data-status', complaint.status || 'pendente');
    
    // Formatar data
    const formattedDate = formatDate(complaint.dataEnvio || complaint.createdAt);
    
    // Definir status
    const status = complaint.status || 'pendente';
    const statusClass = `status-${status.toLowerCase()}`;
    const statusText = getStatusText(status);
    
    card.innerHTML = `
        <div class="complaint-header">
            <div class="complaint-id">#${complaint.id || 'N/A'}</div>
            <div class="complaint-status ${statusClass}">${statusText}</div>
        </div>
        
        <h3 class="complaint-title">${complaint.titulo || complaint.assunto || 'Denúncia sem título'}</h3>
        <div class="complaint-date">📅 ${formattedDate}</div>
        <div class="complaint-description">${complaint.descricao || complaint.detalhes || 'Sem descrição disponível'}</div>
        
        ${complaint.feedback ? createFeedbackHtml(complaint.feedback) : ''}
    `;
    
    return card;
}

// Criar HTML do feedback
function createFeedbackHtml(feedback) {
    const feedbackDate = formatDate(feedback.dataFeedback || feedback.updatedAt);
    
    return `
        <div class="complaint-feedback">
            <div class="feedback-title">📨 Feedback da Autoridade</div>
            <div class="feedback-text">${feedback.mensagem || feedback.texto || 'Feedback recebido'}</div>
            <div class="feedback-date">🕒 ${feedbackDate}</div>
        </div>
    `;
}

// Formatar data
function formatDate(dateString) {
    if (!dateString) return 'Data não informada';
    
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        return 'Data inválida';
    }
}

// Obter texto do status
function getStatusText(status) {
    const statusMap = {
        'pendente': 'Pendente',
        'andamento': 'Em Andamento',
        'resolvida': 'Resolvida',
        'rejeitada': 'Rejeitada',
        'em_andamento': 'Em Andamento',
        'finalizada': 'Resolvida'
    };
    
    return statusMap[status.toLowerCase()] || 'Pendente';
}

// Filtrar denúncias por status
function filterComplaintsByStatus(complaints, filter) {
    if (filter === 'todas') {
        return complaints;
    }
    
    return complaints.filter(complaint => {
        const status = (complaint.status || 'pendente').toLowerCase();
        return status === filter.toLowerCase() || 
               (filter === 'andamento' && status === 'em_andamento');
    });
}

// Função para filtrar denúncias (chamada pelos botões)
function filterComplaints(filter) {
    currentFilter = filter;
    
    // Atualizar botões ativos
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
    
    // Re-renderizar com novo filtro
    renderComplaints();
    
    console.log(`🔍 Filtro aplicado: ${filter}`);
}

// Estados da interface
function showLoadingState() {
    loadingStateEl.style.display = 'block';
    emptyStateEl.style.display = 'none';
    complaintsGridEl.style.display = 'none';
}

function showEmptyState() {
    loadingStateEl.style.display = 'none';
    emptyStateEl.style.display = 'block';
    complaintsGridEl.style.display = 'none';
}

function showComplaintsGrid() {
    loadingStateEl.style.display = 'none';
    emptyStateEl.style.display = 'none';
    complaintsGridEl.style.display = 'grid';
}

function hideLoadingState() {
    loadingStateEl.style.display = 'none';
}

// Mostrar mensagem de sucesso
function showSuccessMessage(message) {
    successMessageEl.textContent = message;
    successMessageEl.classList.add('show');
    
    // Auto-ocultar após 5 segundos
    setTimeout(() => {
        successMessageEl.classList.remove('show');
    }, 5000);
}

// Mostrar mensagem de erro
function showErrorMessage(message) {
    console.error('💥 Erro:', message);
    // Aqui poderia implementar um toast de erro
    alert(message); // Temporário
}

// Tratar erro de autenticação
function handleAuthenticationError() {
    console.error('🚫 Erro de autenticação - redirecionando para login');
    localStorage.removeItem('userData');
    alert('Sessão expirada. Você será redirecionado para o login.');
    window.location.href = '../login.html'; // Ajustar caminho conforme necessário
}

// Função de logout
function logout() {
    if (confirm('Tem certeza que deseja sair?')) {
        console.log('👋 Fazendo logout...');
        
        // Limpar dados do localStorage
        localStorage.removeItem('userData');
        
        // Redirecionar para login
        window.location.href = '../login/login.html'; // Ajustar caminho conforme necessário
    }
}

// Redirecionar para página de nova denúncia
function redirectToNewComplaint() {
    console.log('📝 Redirecionando para nova denúncia...');
    
    // Aqui você redirecionaria para a página de nova denúncia
    window.location.href = './nova-denuncia.html'; // Ajustar caminho conforme necessário
    
    // Para demonstração, mostrar mensagem
    // showSuccessMessage('Redirecionando para página de nova denúncia...');
}

// Função para recarregar denúncias (útil após criar nova denúncia)
async function refreshComplaints() {
    console.log('🔄 Recarregando denúncias...');
    await loadUserComplaints();
    showSuccessMessage('Denúncias atualizadas com sucesso!');
}

// Função para verificar conexão com backend
async function testBackendConnection() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`, {
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

// Disponibilizar funções globalmente para uso no HTML e debugging
window.filterComplaints = filterComplaints;
window.redirectToNewComplaint = redirectToNewComplaint;
window.logout = logout;

window.homeDebug = {
    refreshComplaints,
    testBackendConnection,
    userData: () => userData,
    complaints: () => complaints,
    currentFilter: () => currentFilter
};

// Log inicial
console.log('🏠 Sistema da Home carregado!');
console.log('🔗 API Base URL:', API_BASE_URL);
console.log('💡 Digite "homeDebug.refreshComplaints()" para recarregar denúncias');
console.log('💡 Digite "homeDebug.testBackendConnection()" para testar conexão');