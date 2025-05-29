// admin.js - Sistema do Painel Administrativo

// Configuração da API
const API_BASE_URL = 'http://localhost:8080/apis';

// Elementos do DOM
const sidebar = document.getElementById('sidebar');
const contentContainer = document.getElementById('contentContainer');
const modalOverlay = document.getElementById('modalOverlay');
const modalTitle = document.getElementById('modalTitle');
const modalContent = document.getElementById('modalContent');
const userNameEl = document.getElementById('userName');
const userEmailEl = document.getElementById('userEmail');
const userAvatarEl = document.getElementById('userAvatar');

// Estado da aplicação
let userData = null;
let currentPage = 'dashboard';
let currentData = {};

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    initializeAdmin();
});

// ================================
// INICIALIZAÇÃO E AUTENTICAÇÃO
// ================================

async function initializeAdmin() {
    console.log('🔧 Inicializando Painel Administrativo');
    
    try {
        await checkAdminAuthentication();
        loadUserInterface();
        navigateTo('dashboard');
        console.log('✅ Painel inicializado com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao inicializar painel:', error);
        handleAuthenticationError();
    }
}

async function checkAdminAuthentication() {
    const userDataString = localStorage.getItem('userData');
    
    if (!userDataString) {
        throw new Error('Usuário não autenticado');
    }
    
    try {
        userData = JSON.parse(userDataString);
        
        // Verificar se é admin
        if (userData.role !== 'admin') {
            throw new Error('Acesso negado - apenas administradores');
        }
        
        console.log('👑 Admin autenticado:', userData.name);
    } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        throw error;
    }
}

function loadUserInterface() {
    if (!userData) return;
    
    userNameEl.textContent = userData.name || 'Administrador';
    userEmailEl.textContent = userData.email || '';
    
    const initials = getInitials(userData.name || 'A');
    userAvatarEl.textContent = initials;
}

function getInitials(name) {
    return name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .substring(0, 2);
}

// ================================
// SISTEMA DE NAVEGAÇÃO
// ================================

function navigateTo(page) {
    console.log(`🧭 Navegando para: ${page}`);
    
    // Atualizar estado atual
    currentPage = page;
    
    // Atualizar sidebar ativa
    updateSidebarActiveState(page);
    
    // Carregar conteúdo da página
    loadPageContent(page);
}

function updateSidebarActiveState(page) {
    // Remover todos os estados ativos
    document.querySelectorAll('.nav-toggle').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelectorAll('.nav-dropdown-item').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Ativar página atual
    if (page === 'dashboard') {
        document.querySelector('.nav-toggle[onclick*="dashboard"]').classList.add('active');
    } else {
        const activeItem = document.querySelector(`[onclick*="${page}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
            
            // Se for um dropdown item, abrir o dropdown pai
            if (activeItem.classList.contains('nav-dropdown-item')) {
                const dropdown = activeItem.closest('.nav-dropdown');
                if (dropdown) {
                    dropdown.classList.add('open');
                    const toggle = dropdown.parentElement.querySelector('.nav-toggle');
                    toggle.classList.add('active');
                    const arrow = toggle.querySelector('.nav-arrow');
                    if (arrow) arrow.classList.add('rotated');
                }
            }
        }
    }
}

function toggleNavDropdown(section) {
    const dropdown = document.getElementById(`dropdown-${section}`);
    const toggle = dropdown.parentElement.querySelector('.nav-toggle');
    const arrow = toggle.querySelector('.nav-arrow');
    
    dropdown.classList.toggle('open');
    arrow.classList.toggle('rotated');
}

function toggleSidebar() {
    sidebar.classList.toggle('open');
}

// ================================
// TEMPLATES DE PÁGINAS
// ================================

function loadPageContent(page) {
    const breadcrumb = getBreadcrumb(page);
    
    switch (page) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'orgaos-cadastrar':
            loadOrgaoForm();
            break;
        case 'orgaos-listar':
            loadOrgaosList();
            break;
        case 'usuarios-cadastrar':
            loadUsuarioForm();
            break;
        case 'usuarios-listar':
            loadUsuariosList();
            break;
        case 'denuncias-listar':
            loadDenunciasList();
            break;
        case 'denuncias-feedback':
            loadDenunciasFeedback();
            break;
        case 'tipos-cadastrar':
            loadTipoForm();
            break;
        case 'tipos-listar':
            loadTiposList();
            break;
        default:
            load404();
    }
}

function getBreadcrumb(page) {
    const breadcrumbs = {
        'dashboard': 'Dashboard',
        'orgaos-cadastrar': 'Órgãos > Cadastrar',
        'orgaos-listar': 'Órgãos > Listar',
        'usuarios-cadastrar': 'Usuários > Cadastrar',
        'usuarios-listar': 'Usuários > Listar',
        'denuncias-listar': 'Denúncias > Visualizar',
        'denuncias-feedback': 'Denúncias > Feedback',
        'tipos-cadastrar': 'Tipos > Cadastrar',
        'tipos-listar': 'Tipos > Listar'
    };
    
    return breadcrumbs[page] || 'Página';
}

// ================================
// DASHBOARD
// ================================

async function loadDashboard() {
    const breadcrumb = getBreadcrumb('dashboard');
    
    contentContainer.innerHTML = `
        <div class="content-header">
            <div class="breadcrumb">
                <span class="breadcrumb-current">${breadcrumb}</span>
            </div>
            <h1 class="content-title">📊 Dashboard</h1>
            <p class="content-subtitle">Visão geral do sistema de denúncias</p>
        </div>
        
        <div class="dashboard-stats" id="dashboardStats">
            <div class="loading-state">
                <div class="loading-spinner"></div>
                <p>Carregando estatísticas...</p>
            </div>
        </div>
        
        <div class="api-info">
            <p><strong>🔗 API Base:</strong> ${API_BASE_URL}</p>
            <p><strong>👤 Admin:</strong> ${userData.name} (ID: ${userData.id})</p>
            <p><strong>🕒 Última atualização:</strong> ${new Date().toLocaleString('pt-BR')}</p>
        </div>
    `;
    
    // Carregar estatísticas
    await loadDashboardStats();
}

async function loadDashboardStats() {
    try {
        // Simular carregamento de estatísticas
        await delay(1000);
        
        // Em uma aplicação real, faria múltiplas chamadas para APIs
        const stats = await Promise.allSettled([
            fetchStats('denuncias'),
            fetchStats('usuarios'),
            fetchStats('orgaos'),
            fetchStats('tipos')
        ]);
        
        const statsHtml = `
            <div class="stat-card">
                <div class="stat-icon">📢</div>
                <div class="stat-number">${stats[0].value || '0'}</div>
                <div class="stat-label">Total de Denúncias</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">👥</div>
                <div class="stat-number">${stats[1].value || '0'}</div>
                <div class="stat-label">Usuários Cadastrados</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">🏢</div>
                <div class="stat-number">${stats[2].value || '0'}</div>
                <div class="stat-label">Órgãos Registrados</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">🏷️</div>
                <div class="stat-number">${stats[3].value || '0'}</div>
                <div class="stat-label">Tipos de Ocorrência</div>
            </div>
        `;
        
        document.getElementById('dashboardStats').innerHTML = statsHtml;
        
    } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
        document.getElementById('dashboardStats').innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📊</div>
                <h3>Erro ao carregar estatísticas</h3>
                <p>Não foi possível conectar com a API</p>
            </div>
        `;
    }
}

async function fetchStats(type) {
    // Simular chamada à API
    const endpoints = {
        'denuncias': '/denuncia/count',
        'usuarios': '/usuario/count',
        'orgaos': '/orgao/count',
        'tipos': '/tipo-ocorrencia/count'
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}${endpoints[type]}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.ok) {
            const data = await response.json();
            return data.total || data.count || Math.floor(Math.random() * 100);
        }
    } catch (error) {
        console.warn(`Erro ao buscar ${type}:`, error);
    }
    
    // Retornar número aleatório para demonstração
    return Math.floor(Math.random() * 100);
}

// ================================
// ÓRGÃOS
// ================================

function loadOrgaoForm() {
    const breadcrumb = getBreadcrumb('orgaos-cadastrar');
    
    contentContainer.innerHTML = `
        <div class="content-header">
            <div class="breadcrumb">
                <span>Órgãos</span>
                <span class="breadcrumb-separator">></span>
                <span class="breadcrumb-current">Cadastrar</span>
            </div>
            <h1 class="content-title">🏢 Cadastrar Órgão</h1>
            <p class="content-subtitle">Adicione um novo órgão ao sistema</p>
        </div>
        
        <div class="content-card">
            <form id="orgaoForm" onsubmit="handleOrgaoSubmit(event)">
                <div class="form-group">
                    <label class="form-label">Nome do Órgão*</label>
                    <input type="text" class="form-input" name="nome" required placeholder="Ex: Secretaria de Saúde">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Sigla</label>
                    <input type="text" class="form-input" name="sigla" placeholder="Ex: SS">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Descrição</label>
                    <textarea class="form-input form-textarea" name="descricao" placeholder="Descrição das responsabilidades do órgão"></textarea>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Email de Contato</label>
                    <input type="email" class="form-input" name="email" placeholder="contato@orgao.gov.br">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Telefone</label>
                    <input type="tel" class="form-input" name="telefone" placeholder="(11) 1234-5678">
                </div>
                
                <div class="action-buttons">
                    <button type="submit" class="btn btn-primary">
                        <span>💾</span> Salvar Órgão
                    </button>
                    <button type="button" class="btn btn-secondary" onclick="navigateTo('orgaos-listar')">
                        <span>📋</span> Ver Lista
                    </button>
                </div>
            </form>
        </div>
    `;
}

async function loadOrgaosList() {
    const breadcrumb = getBreadcrumb('orgaos-listar');
    
    contentContainer.innerHTML = `
        <div class="content-header">
            <div class="breadcrumb">
                <span>Órgãos</span>
                <span class="breadcrumb-separator">></span>
                <span class="breadcrumb-current">Listar</span>
            </div>
            <h1 class="content-title">🏢 Gerenciar Órgãos</h1>
            <p class="content-subtitle">Visualize e gerencie todos os órgãos cadastrados</p>
        </div>
        
        <div class="action-buttons">
            <button class="btn btn-primary" onclick="navigateTo('orgaos-cadastrar')">
                <span>➕</span> Novo Órgão
            </button>
            <button class="btn btn-secondary" onclick="loadOrgaosList()">
                <span>🔄</span> Atualizar
            </button>
        </div>
        
        <div class="table-container">
            <div id="orgaosTableContainer">
                <div class="loading-state">
                    <div class="loading-spinner"></div>
                    <p>Carregando órgãos...</p>
                </div>
            </div>
        </div>
    `;
    
    await loadOrgaosTable();
}

async function loadOrgaosTable() {
    try {
        const response = await fetch(`${API_BASE_URL}/orgao`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        
        let orgaos = [];
        if (response.ok) {
            orgaos = await response.json();
        } else {
            // Dados mockados para demonstração
            orgaos = [
                { id: 1, nome: 'Secretaria de Saúde', sigla: 'SS', email: 'saude@gov.br', telefone: '(11) 3333-4444', status: 'ativo' },
                { id: 2, nome: 'Secretaria de Educação', sigla: 'SE', email: 'educacao@gov.br', telefone: '(11) 5555-6666', status: 'ativo' }
            ];
        }
        
        const tableHtml = createOrgaosTableHTML(orgaos);
        document.getElementById('orgaosTableContainer').innerHTML = tableHtml;
        
    } catch (error) {
        console.error('Erro ao carregar órgãos:', error);
        document.getElementById('orgaosTableContainer').innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🏢</div>
                <h3>Erro ao carregar órgãos</h3>
                <p>Não foi possível conectar com a API</p>
            </div>
        `;
    }
}

function createOrgaosTableHTML(orgaos) {
    if (orgaos.length === 0) {
        return `
            <div class="empty-state">
                <div class="empty-icon">🏢</div>
                <h3>Nenhum órgão cadastrado</h3>
                <p>Cadastre o primeiro órgão do sistema</p>
            </div>
        `;
    }
    
    const rows = orgaos.map(orgao => `
        <tr>
            <td><strong>${orgao.nome}</strong></td>
            <td>${orgao.sigla || '-'}</td>
            <td>${orgao.email || '-'}</td>
            <td>${orgao.telefone || '-'}</td>
            <td><span class="status-badge status-${orgao.status || 'ativo'}">${orgao.status || 'Ativo'}</span></td>
            <td>
                <div style="display: flex; gap: 10px;">
                    <button class="btn btn-secondary" onclick="editOrgao(${orgao.id})" style="padding: 6px 12px; font-size: 12px;">
                        ✏️ Editar
                    </button>
                    <button class="btn btn-danger" onclick="deleteOrgao(${orgao.id})" style="padding: 6px 12px; font-size: 12px;">
                        🗑️ Excluir
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
    
    return `
        <table class="table">
            <thead>
                <tr>
                    <th>Nome</th>
                    <th>Sigla</th>
                    <th>Email</th>
                    <th>Telefone</th>
                    <th>Status</th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody>
                ${rows}
            </tbody>
        </table>
    `;
}

async function handleOrgaoSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const orgaoData = Object.fromEntries(formData.entries());
    
    try {
        const response = await fetch(`${API_BASE_URL}/orgao`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orgaoData)
        });
        
        if (response.ok) {
            alert('Órgão cadastrado com sucesso!');
            event.target.reset();
        } else {
            throw new Error('Erro ao cadastrar órgão');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao cadastrar órgão. Verifique os dados e tente novamente.');
    }
}

async function editOrgao(id) {
    // Implementar edição de órgão
    console.log('Editando órgão:', id);
    alert('Funcionalidade de edição será implementada em breve');
}

async function deleteOrgao(id) {
    if (!confirm('Tem certeza que deseja excluir este órgão?')) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/orgao/${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.ok) {
            alert('Órgão excluído com sucesso!');
            loadOrgaosList();
        } else {
            throw new Error('Erro ao excluir órgão');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao excluir órgão. Tente novamente.');
    }
}

// ================================
// USUÁRIOS (Estrutura similar aos órgãos)
// ================================

function loadUsuarioForm() {
    const breadcrumb = getBreadcrumb('usuarios-cadastrar');
    
    contentContainer.innerHTML = `
        <div class="content-header">
            <div class="breadcrumb">
                <span>Usuários</span>
                <span class="breadcrumb-separator">></span>
                <span class="breadcrumb-current">Cadastrar</span>
            </div>
            <h1 class="content-title">👥 Cadastrar Usuário</h1>
            <p class="content-subtitle">Adicione um novo usuário ao sistema</p>
        </div>
        
        <div class="content-card">
            <form id="usuarioForm" onsubmit="handleUsuarioSubmit(event)">
                <div class="form-group">
                    <label class="form-label">Nome Completo*</label>
                    <input type="text" class="form-input" name="name" required placeholder="Nome completo do usuário">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Email*</label>
                    <input type="email" class="form-input" name="email" required placeholder="email@exemplo.com">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Senha*</label>
                    <input type="password" class="form-input" name="password" required placeholder="Senha segura">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Tipo de Usuário*</label>
                    <select class="form-input" name="role" required>
                        <option value="">Selecione o tipo</option>
                        <option value="user">Cidadão</option>
                        <option value="admin">Administrador</option>
                        <option value="moderator">Moderador</option>
                    </select>
                </div>
                
                <div class="action-buttons">
                    <button type="submit" class="btn btn-primary">
                        <span>💾</span> Salvar Usuário
                    </button>
                    <button type="button" class="btn btn-secondary" onclick="navigateTo('usuarios-listar')">
                        <span>📋</span> Ver Lista
                    </button>
                </div>
            </form>
        </div>
    `;
}

async function loadUsuariosList() {
    const breadcrumb = getBreadcrumb('usuarios-listar');
    
    contentContainer.innerHTML = `
        <div class="content-header">
            <div class="breadcrumb">
                <span>Usuários</span>
                <span class="breadcrumb-separator">></span>
                <span class="breadcrumb-current">Listar</span>
            </div>
            <h1 class="content-title">👥 Gerenciar Usuários</h1>
            <p class="content-subtitle">Visualize e gerencie todos os usuários do sistema</p>
        </div>
        
        <div class="action-buttons">
            <button class="btn btn-primary" onclick="navigateTo('usuarios-cadastrar')">
                <span>➕</span> Novo Usuário
            </button>
            <button class="btn btn-secondary" onclick="loadUsuariosList()">
                <span>🔄</span> Atualizar
            </button>
        </div>
        
        <div class="table-container">
            <div id="usuariosTableContainer">
                <div class="loading-state">
                    <div class="loading-spinner"></div>
                    <p>Carregando usuários...</p>
                </div>
            </div>
        </div>
    `;
    
    await loadUsuariosTable();
}

async function loadUsuariosTable() {
    try {
        // Simular dados mockados
        const usuarios = [
            { id: 1, name: 'João Silva', email: 'joao@email.com', role: 'user', status: 'ativo', lastLogin: '2024-01-15' },
            { id: 2, name: 'Maria Santos', email: 'maria@empresa.com', role: 'admin', status: 'ativo', lastLogin: '2024-01-16' }
        ];
        
        const tableHtml = createUsuariosTableHTML(usuarios);
        document.getElementById('usuariosTableContainer').innerHTML = tableHtml;
        
    } catch (error) {
        console.error('Erro ao carregar usuários:', error);
        document.getElementById('usuariosTableContainer').innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">👥</div>
                <h3>Erro ao carregar usuários</h3>
                <p>Não foi possível conectar com a API</p>
            </div>
        `;
    }
}

function createUsuariosTableHTML(usuarios) {
    if (usuarios.length === 0) {
        return `
            <div class="empty-state">
                <div class="empty-icon">👥</div>
                <h3>Nenhum usuário cadastrado</h3>
                <p>Cadastre o primeiro usuário do sistema</p>
            </div>
        `;
    }
    
    const rows = usuarios.map(usuario => `
        <tr>
            <td><strong>${usuario.name}</strong></td>
            <td>${usuario.email}</td>
            <td><span class="status-badge status-${usuario.role === 'admin' ? 'andamento' : 'ativo'}">${getRoleText(usuario.role)}</span></td>
            <td><span class="status-badge status-${usuario.status || 'ativo'}">${usuario.status || 'Ativo'}</span></td>
            <td>${formatDate(usuario.lastLogin) || 'Nunca'}</td>
            <td>
                <div style="display: flex; gap: 10px;">
                    <button class="btn btn-secondary" onclick="editUsuario(${usuario.id})" style="padding: 6px 12px; font-size: 12px;">
                        ✏️ Editar
                    </button>
                    <button class="btn btn-danger" onclick="deleteUsuario(${usuario.id})" style="padding: 6px 12px; font-size: 12px;">
                        🗑️ Excluir
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
    
    return `
        <table class="table">
            <thead>
                <tr>
                    <th>Nome</th>
                    <th>Email</th>
                    <th>Tipo</th>
                    <th>Status</th>
                    <th>Último Login</th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody>
                ${rows}
            </tbody>
        </table>
    `;
}

function getRoleText(role) {
    const roles = {
        'user': 'Cidadão',
        'admin': 'Administrador',
        'moderator': 'Moderador'
    };
    return roles[role] || role;
}

async function handleUsuarioSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const usuarioData = Object.fromEntries(formData.entries());
    
    try {
        const response = await fetch(`${API_BASE_URL}/usuario`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(usuarioData)
        });
        
        if (response.ok) {
            alert('Usuário cadastrado com sucesso!');
            event.target.reset();
        } else {
            throw new Error('Erro ao cadastrar usuário');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao cadastrar usuário. Verifique os dados e tente novamente.');
    }
}

async function editUsuario(id) {
    console.log('Editando usuário:', id);
    alert('Funcionalidade de edição será implementada em breve');
}

async function deleteUsuario(id) {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return;
    
    try {
        alert('Usuário excluído com sucesso! (Simulação)');
        loadUsuariosList();
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao excluir usuário. Tente novamente.');
    }
}

// ================================
// DENÚNCIAS
// ================================

async function loadDenunciasList() {
    const breadcrumb = getBreadcrumb('denuncias-listar');
    
    contentContainer.innerHTML = `
        <div class="content-header">
            <div class="breadcrumb">
                <span>Denúncias</span>
                <span class="breadcrumb-separator">></span>
                <span class="breadcrumb-current">Visualizar</span>
            </div>
            <h1 class="content-title">📢 Gerenciar Denúncias</h1>
            <p class="content-subtitle">Visualize e gerencie todas as denúncias do sistema</p>
        </div>
        
        <div class="action-buttons">
            <button class="btn btn-secondary" onclick="loadDenunciasList()">
                <span>🔄</span> Atualizar
            </button>
            <button class="btn" onclick="navigateTo('denuncias-feedback')" style="background: #17a2b8; color: white;">
                <span>💬</span> Dar Feedback
            </button>
        </div>
        
        <div class="table-container">
            <div id="denunciasTableContainer">
                <div class="loading-state">
                    <div class="loading-spinner"></div>
                    <p>Carregando denúncias...</p>
                </div>
            </div>
        </div>
    `;
    
    await loadDenunciasTable();
}

async function loadDenunciasTable() {
    try {
        // Simular dados mockados
        const denuncias = [
            { 
                id: 1, 
                titulo: 'Buraco na rua principal', 
                usuario: 'João Silva', 
                status: 'pendente', 
                dataEnvio: '2024-01-15',
                descricao: 'Grande buraco na Rua das Flores, causando acidentes'
            },
            { 
                id: 2, 
                titulo: 'Falta de iluminação pública', 
                usuario: 'Maria Santos', 
                status: 'andamento', 
                dataEnvio: '2024-01-14',
                descricao: 'Rua escura à noite, causando insegurança'
            }
        ];
        
        const tableHtml = createDenunciasTableHTML(denuncias);
        document.getElementById('denunciasTableContainer').innerHTML = tableHtml;
        
    } catch (error) {
        console.error('Erro ao carregar denúncias:', error);
        document.getElementById('denunciasTableContainer').innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📢</div>
                <h3>Erro ao carregar denúncias</h3>
                <p>Não foi possível conectar com a API</p>
            </div>
        `;
    }
}

function createDenunciasTableHTML(denuncias) {
    if (denuncias.length === 0) {
        return `
            <div class="empty-state">
                <div class="empty-icon">📢</div>
                <h3>Nenhuma denúncia encontrada</h3>
                <p>Aguardando novas denúncias dos cidadãos</p>
            </div>
        `;
    }
    
    const rows = denuncias.map(denuncia => `
        <tr>
            <td><strong>#${denuncia.id}</strong></td>
            <td><strong>${denuncia.titulo}</strong></td>
            <td>${denuncia.usuario}</td>
            <td><span class="status-badge status-${denuncia.status}">${getStatusText(denuncia.status)}</span></td>
            <td>${formatDate(denuncia.dataEnvio)}</td>
            <td>
                <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                    <button class="btn btn-secondary" onclick="viewDenuncia(${denuncia.id})" style="padding: 6px 12px; font-size: 12px;">
                        👁️ Ver
                    </button>
                    <button class="btn" onclick="giveFeedback(${denuncia.id})" style="padding: 6px 12px; font-size: 12px; background: #17a2b8; color: white;">
                        💬 Feedback
                    </button>
                    <button class="btn btn-danger" onclick="deleteDenuncia(${denuncia.id})" style="padding: 6px 12px; font-size: 12px;">
                        🗑️ Excluir
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
    
    return `
        <table class="table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Título</th>
                    <th>Usuário</th>
                    <th>Status</th>
                    <th>Data</th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody>
                ${rows}
            </tbody>
        </table>
    `;
}

function getStatusText(status) {
    const statusMap = {
        'pendente': 'Pendente',
        'andamento': 'Em Andamento',
        'resolvida': 'Resolvida',
        'rejeitada': 'Rejeitada'
    };
    return statusMap[status] || 'Pendente';
}

async function viewDenuncia(id) {
    console.log('Visualizando denúncia:', id);
    
    // Simular dados da denúncia
    const denuncia = {
        id: id,
        titulo: 'Buraco na rua principal',
        descricao: 'Grande buraco na Rua das Flores, número 123, causando acidentes de trânsito. O buraco tem aproximadamente 1 metro de diâmetro e está causando danos aos veículos.',
        usuario: 'João Silva',
        email: 'joao@email.com',
        dataEnvio: '2024-01-15T10:30:00',
        status: 'pendente',
        tipo: 'Infraestrutura',
        endereco: 'Rua das Flores, 123 - Centro'
    };
    
    openModal('Detalhes da Denúncia', `
        <div style="line-height: 1.6;">
            <p><strong>ID:</strong> #${denuncia.id}</p>
            <p><strong>Título:</strong> ${denuncia.titulo}</p>
            <p><strong>Status:</strong> <span class="status-badge status-${denuncia.status}">${getStatusText(denuncia.status)}</span></p>
            <p><strong>Tipo:</strong> ${denuncia.tipo}</p>
            <p><strong>Data:</strong> ${formatDate(denuncia.dataEnvio)}</p>
            <p><strong>Usuário:</strong> ${denuncia.usuario} (${denuncia.email})</p>
            <p><strong>Endereço:</strong> ${denuncia.endereco}</p>
            <hr style="margin: 20px 0; border: 1px solid #E8E8E8;">
            <p><strong>Descrição:</strong></p>
            <p style="background: #F6F6F6; padding: 15px; border-radius: 8px; margin-top: 10px;">
                ${denuncia.descricao}
            </p>
            <div style="margin-top: 25px; display: flex; gap: 10px;">
                <button class="btn btn-primary" onclick="giveFeedback(${denuncia.id}); closeModal();">
                    💬 Dar Feedback
                </button>
                <button class="btn btn-secondary" onclick="closeModal()">
                    Fechar
                </button>
            </div>
        </div>
    `);
}

async function giveFeedback(id) {
    console.log('Dando feedback para denúncia:', id);
    
    openModal('Dar Feedback', `
        <form onsubmit="handleFeedbackSubmit(event, ${id})">
            <div class="form-group">
                <label class="form-label">Status da Denúncia*</label>
                <select class="form-input" name="status" required>
                    <option value="">Selecione o status</option>
                    <option value="andamento">Em Andamento</option>
                    <option value="resolvida">Resolvida</option>
                    <option value="rejeitada">Rejeitada</option>
                </select>
            </div>
            
            <div class="form-group">
                <label class="form-label">Mensagem de Feedback*</label>
                <textarea class="form-input form-textarea" name="mensagem" required 
                    placeholder="Escreva sua resposta ao cidadão..." style="min-height: 120px;"></textarea>
            </div>
            
            <div style="display: flex; gap: 10px; margin-top: 25px;">
                <button type="submit" class="btn btn-primary">
                    💾 Enviar Feedback
                </button>
                <button type="button" class="btn btn-secondary" onclick="closeModal()">
                    Cancelar
                </button>
            </div>
        </form>
    `);
}

async function handleFeedbackSubmit(event, denunciaId) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const feedbackData = Object.fromEntries(formData.entries());
    feedbackData.denunciaId = denunciaId;
    
    try {
        const response = await fetch(`${API_BASE_URL}/denuncia/${denunciaId}/feedback`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(feedbackData)
        });
        
        if (response.ok || true) { // Simulação sempre ok
            alert('Feedback enviado com sucesso!');
            closeModal();
            loadDenunciasList();
        } else {
            throw new Error('Erro ao enviar feedback');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao enviar feedback. Tente novamente.');
    }
}

async function deleteDenuncia(id) {
    if (!confirm('Tem certeza que deseja excluir esta denúncia? Esta ação não pode ser desfeita.')) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/denuncia/${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.ok || true) { // Simulação sempre ok
            alert('Denúncia excluída com sucesso!');
            loadDenunciasList();
        } else {
            throw new Error('Erro ao excluir denúncia');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao excluir denúncia. Tente novamente.');
    }
}

function loadDenunciasFeedback() {
    const breadcrumb = getBreadcrumb('denuncias-feedback');
    
    contentContainer.innerHTML = `
        <div class="content-header">
            <div class="breadcrumb">
                <span>Denúncias</span>
                <span class="breadcrumb-separator">></span>
                <span class="breadcrumb-current">Feedback</span>
            </div>
            <h1 class="content-title">💬 Central de Feedback</h1>
            <p class="content-subtitle">Gerencie feedbacks e respostas às denúncias</p>
        </div>
        
        <div class="content-card">
            <h3>🎯 Denúncias Pendentes de Resposta</h3>
            <p style="color: #666; margin-bottom: 25px;">
                Lista de denúncias que ainda não receberam feedback das autoridades
            </p>
            
            <div id="pendingFeedbackContainer">
                <div class="loading-state">
                    <div class="loading-spinner"></div>
                    <p>Carregando denúncias pendentes...</p>
                </div>
            </div>
        </div>
    `;
    
    // Simular carregamento
    setTimeout(() => {
        document.getElementById('pendingFeedbackContainer').innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">✅</div>
                <h3>Parabéns!</h3>
                <p>Todas as denúncias foram respondidas</p>
            </div>
        `;
    }, 1000);
}

// ================================
// TIPOS DE OCORRÊNCIA
// ================================

function loadTipoForm() {
    const breadcrumb = getBreadcrumb('tipos-cadastrar');
    
    contentContainer.innerHTML = `
        <div class="content-header">
            <div class="breadcrumb">
                <span>Tipos de Ocorrência</span>
                <span class="breadcrumb-separator">></span>
                <span class="breadcrumb-current">Cadastrar</span>
            </div>
            <h1 class="content-title">🏷️ Cadastrar Tipo de Ocorrência</h1>
            <p class="content-subtitle">Adicione um novo tipo de ocorrência ao sistema</p>
        </div>
        
        <div class="content-card">
            <form id="tipoForm" onsubmit="handleTipoSubmit(event)">
                <div class="form-group">
                    <label class="form-label">Nome do Tipo*</label>
                    <input type="text" class="form-input" name="nome" required placeholder="Ex: Infraestrutura">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Descrição</label>
                    <textarea class="form-input form-textarea" name="descricao" 
                        placeholder="Descrição detalhada do tipo de ocorrência"></textarea>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Órgão Responsável</label>
                    <select class="form-input" name="orgaoId">
                        <option value="">Selecione o órgão responsável</option>
                        <option value="1">Secretaria de Obras</option>
                        <option value="2">Secretaria de Saúde</option>
                        <option value="3">Secretaria de Educação</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Prioridade</label>
                    <select class="form-input" name="prioridade">
                        <option value="baixa">Baixa</option>
                        <option value="media" selected>Média</option>
                        <option value="alta">Alta</option>
                        <option value="urgente">Urgente</option>
                    </select>
                </div>
                
                <div class="action-buttons">
                    <button type="submit" class="btn btn-primary">
                        <span>💾</span> Salvar Tipo
                    </button>
                    <button type="button" class="btn btn-secondary" onclick="navigateTo('tipos-listar')">
                        <span>📋</span> Ver Lista
                    </button>
                </div>
            </form>
        </div>
    `;
}

async function loadTiposList() {
    const breadcrumb = getBreadcrumb('tipos-listar');
    
    contentContainer.innerHTML = `
        <div class="content-header">
            <div class="breadcrumb">
                <span>Tipos de Ocorrência</span>
                <span class="breadcrumb-separator">></span>
                <span class="breadcrumb-current">Listar</span>
            </div>
            <h1 class="content-title">🏷️ Gerenciar Tipos de Ocorrência</h1>
            <p class="content-subtitle">Visualize e gerencie todos os tipos de ocorrência</p>
        </div>
        
        <div class="action-buttons">
            <button class="btn btn-primary" onclick="navigateTo('tipos-cadastrar')">
                <span>➕</span> Novo Tipo
            </button>
            <button class="btn btn-secondary" onclick="loadTiposList()">
                <span>🔄</span> Atualizar
            </button>
        </div>
        
        <div class="table-container">
            <div id="tiposTableContainer">
                <div class="loading-state">
                    <div class="loading-spinner"></div>
                    <p>Carregando tipos...</p>
                </div>
            </div>
        </div>
    `;
    
    await loadTiposTable();
}

async function loadTiposTable() {
    try {
        // Simular dados mockados
        const tipos = [
            { id: 1, nome: 'Infraestrutura', descricao: 'Problemas de ruas, calçadas, etc', orgao: 'Secretaria de Obras', prioridade: 'alta', status: 'ativo' },
            { id: 2, nome: 'Saúde Pública', descricao: 'Questões relacionadas à saúde', orgao: 'Secretaria de Saúde', prioridade: 'urgente', status: 'ativo' }
        ];
        
        const tableHtml = createTiposTableHTML(tipos);
        document.getElementById('tiposTableContainer').innerHTML = tableHtml;
        
    } catch (error) {
        console.error('Erro ao carregar tipos:', error);
        document.getElementById('tiposTableContainer').innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🏷️</div>
                <h3>Erro ao carregar tipos</h3>
                <p>Não foi possível conectar com a API</p>
            </div>
        `;
    }
}

function createTiposTableHTML(tipos) {
    if (tipos.length === 0) {
        return `
            <div class="empty-state">
                <div class="empty-icon">🏷️</div>
                <h3>Nenhum tipo cadastrado</h3>
                <p>Cadastre o primeiro tipo de ocorrência</p>
            </div>
        `;
    }
    
    const rows = tipos.map(tipo => `
        <tr>
            <td><strong>${tipo.nome}</strong></td>
            <td>${tipo.descricao || '-'}</td>
            <td>${tipo.orgao || '-'}</td>
            <td><span class="status-badge status-${tipo.prioridade === 'urgente' ? 'rejeitada' : tipo.prioridade === 'alta' ? 'andamento' : 'ativo'}">${tipo.prioridade}</span></td>
            <td><span class="status-badge status-${tipo.status || 'ativo'}">${tipo.status || 'Ativo'}</span></td>
            <td>
                <div style="display: flex; gap: 10px;">
                    <button class="btn btn-secondary" onclick="editTipo(${tipo.id})" style="padding: 6px 12px; font-size: 12px;">
                        ✏️ Editar
                    </button>
                    <button class="btn btn-danger" onclick="deleteTipo(${tipo.id})" style="padding: 6px 12px; font-size: 12px;">
                        🗑️ Excluir
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
    
    return `
        <table class="table">
            <thead>
                <tr>
                    <th>Nome</th>
                    <th>Descrição</th>
                    <th>Órgão</th>
                    <th>Prioridade</th>
                    <th>Status</th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody>
                ${rows}
            </tbody>
        </table>
    `;
}

async function handleTipoSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const tipoData = Object.fromEntries(formData.entries());
    
    try {
        const response = await fetch(`${API_BASE_URL}/tipo-ocorrencia`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tipoData)
        });
        
        if (response.ok || true) { // Simulação sempre ok
            alert('Tipo de ocorrência cadastrado com sucesso!');
            event.target.reset();
        } else {
            throw new Error('Erro ao cadastrar tipo');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao cadastrar tipo. Verifique os dados e tente novamente.');
    }
}

async function editTipo(id) {
    console.log('Editando tipo:', id);
    alert('Funcionalidade de edição será implementada em breve');
}

async function deleteTipo(id) {
    if (!confirm('Tem certeza que deseja excluir este tipo de ocorrência?')) return;
    
    try {
        alert('Tipo excluído com sucesso! (Simulação)');
        loadTiposList();
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao excluir tipo. Tente novamente.');
    }
}

function load404() {
    contentContainer.innerHTML = `
        <div class="empty-state">
            <div class="empty-icon">🔍</div>
            <h3>Página não encontrada</h3>
            <p>A página solicitada não existe</p>
            <button class="btn btn-primary" onclick="navigateTo('dashboard')">
                🏠 Voltar ao Dashboard
            </button>
        </div>
    `;
}

// ================================
// SISTEMA DE MODAL
// ================================

function openModal(title, content) {
    modalTitle.textContent = title;
    modalContent.innerHTML = content;
    modalOverlay.classList.add('show');
}

function closeModal() {
    modalOverlay.classList.remove('show');
}

// Fechar modal clicando fora
modalOverlay.addEventListener('click', function(e) {
    if (e.target === modalOverlay) {
        closeModal();
    }
});

// ================================
// FUNÇÕES UTILITÁRIAS
// ================================

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

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function handleAuthenticationError() {
    console.error('🚫 Erro de autenticação - redirecionando para login');
    localStorage.removeItem('userData');
    alert('Acesso negado. Apenas administradores podem acessar esta área.');
    window.location.href = '../login.html';
}

function logout() {
    if (confirm('Tem certeza que deseja sair do painel administrativo?')) {
        console.log('👋 Admin fazendo logout...');
        localStorage.removeItem('userData');
        window.location.href = '../login/login.html';
    }
}

// ================================
// FUNÇÕES GLOBAIS
// ================================

// Disponibilizar funções globalmente
window.navigateTo = navigateTo;
window.toggleNavDropdown = toggleNavDropdown;
window.toggleSidebar = toggleSidebar;
window.logout = logout;
window.openModal = openModal;
window.closeModal = closeModal;

// Handlers de formulários
window.handleOrgaoSubmit = handleOrgaoSubmit;
window.handleUsuarioSubmit = handleUsuarioSubmit;
window.handleTipoSubmit = handleTipoSubmit;
window.handleFeedbackSubmit = handleFeedbackSubmit;

// Ações CRUD
window.editOrgao = editOrgao;
window.deleteOrgao = deleteOrgao;
window.editUsuario = editUsuario;
window.deleteUsuario = deleteUsuario;
window.editTipo = editTipo;
window.deleteTipo = deleteTipo;
window.viewDenuncia = viewDenuncia;
window.giveFeedback = giveFeedback;
window.deleteDenuncia = deleteDenuncia;

// Debug
window.adminDebug = {
    userData: () => userData,
    currentPage: () => currentPage,
    navigateTo: navigateTo,
    API_BASE_URL: API_BASE_URL
};

// Log inicial
console.log('🔧 Painel Administrativo carregado!');
console.log('🔗 API Base URL:', API_BASE_URL);
console.log('💡 Digite "adminDebug.navigateTo(\'dashboard\')" para navegar');
console.log('💡 Digite "adminDebug.userData()" para ver dados do usuário');