 // Configurações da API
        const API_BASE_URL = 'http://localhost:8080';
        const API_ENDPOINTS = {
            listAll: '/apis/orgao',
            search: '/apis/orgao/buscar-nome',
            delete: '/apis/orgao'
        };

        // Variáveis globais
        let currentOrgaos = [];
        let deleteTargetId = null;

        // Elementos do DOM
        const searchNameInput = document.getElementById('searchName');
        const searchBtn = document.getElementById('searchBtn');
        const loadAllBtn = document.getElementById('loadAllBtn');
        const loadingState = document.getElementById('loadingState');
        const emptyState = document.getElementById('emptyState');
        const tableContainer = document.getElementById('tableContainer');
        const orgaosTableBody = document.getElementById('orgaosTableBody');
        const resultsCount = document.getElementById('resultsCount');
        const deleteModal = document.getElementById('deleteModal');

        // Inicialização da página
        document.addEventListener('DOMContentLoaded', function() {
            console.log('Página de listagem de órgãos carregada');
            loadAllOrgaos();
        });

        // Função para listar todos os órgãos
        async function loadAllOrgaos() {
            setLoadingState(true, 'Carregando todos os órgãos...');
            hideAllAlerts();

            try {
                const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.listAll}`, {
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

                currentOrgaos = Array.isArray(orgaos) ? orgaos : [];
                displayOrgaos(currentOrgaos);
                
                if (currentOrgaos.length > 0) {
                    showAlert('info', `${currentOrgaos.length} órgão(s) carregado(s) com sucesso.`);
                }

            } catch (error) {
                console.error('Erro ao carregar órgãos:', error);
                handleApiError(error);
                displayOrgaos([]);
            } finally {
                setLoadingState(false);
            }
        }

        // Função para pesquisar órgãos por nome
        async function searchOrgaos(event) {
            event.preventDefault();
            
            const searchTerm = searchNameInput.value.trim();
            
            if (!searchTerm) {
                loadAllOrgaos();
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

                const orgaos = await response.json();
                console.log('Resultados da pesquisa:', orgaos);

                currentOrgaos = Array.isArray(orgaos) ? orgaos : [];
                displayOrgaos(currentOrgaos);

                if (currentOrgaos.length > 0) {
                    showAlert('success', `${currentOrgaos.length} órgão(s) encontrado(s) para "${searchTerm}".`);
                } else {
                    showAlert('info', `Nenhum órgão encontrado para "${searchTerm}".`);
                }

            } catch (error) {
                console.error('Erro na pesquisa:', error);
                handleApiError(error);
                displayOrgaos([]);
            } finally {
                setLoadingState(false);
            }
        }

        // Função para exibir os órgãos na tabela
        function displayOrgaos(orgaos) {
            // Atualizar contador
            const count = orgaos.length;
            resultsCount.textContent = `${count} órgão${count !== 1 ? 's' : ''} encontrado${count !== 1 ? 's' : ''}`;

            if (count === 0) {
                // Mostrar estado vazio
                tableContainer.style.display = 'none';
                emptyState.style.display = 'block';
            } else {
                // Mostrar tabela
                emptyState.style.display = 'none';
                tableContainer.style.display = 'block';
                
                // Limpar tabela
                orgaosTableBody.innerHTML = '';
                
                // Adicionar linhas
                orgaos.forEach(orgao => {
                    const row = createOrgaoRow(orgao);
                    orgaosTableBody.appendChild(row);
                });
            }
        }

        // Função para criar uma linha da tabela
        function createOrgaoRow(orgao) {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td class="id-column">${orgao.id || 'N/A'}</td>
                <td class="name-column">${escapeHtml(orgao.nomeOrgao || 'Nome não informado')}</td>
                <td class="actions-column">
                    <div class="action-buttons">
                        <button class="action-btn edit-btn" onclick="editOrgao(${orgao.id})" title="Editar órgão">
                            ✏️
                        </button>
                        <button class="action-btn delete-btn" onclick="showDeleteModal(${orgao.id}, '${escapeHtml(orgao.nomeOrgao)}')" title="Excluir órgão">
                            🗑️
                        </button>
                    </div>
                </td>
            `;
            
            return row;
        }

        // Função para editar órgão (redireciona para página de edição)
        function editOrgao(id) {
            if (!id) {
                showAlert('error', 'ID do órgão não encontrado.');
                return;
            }
            
            console.log('Redirecionando para edição do órgão ID:', id);
            
            // Redirecionar para página de edição
            const editUrl = `edicao-orgao.html?id=${id}`;
            showAlert('info', `Redirecionando para edição do órgão ID ${id}...`);
            
            setTimeout(() => {
                // window.location.href = editUrl;
                alert(`Redirecionando para: ${editUrl}`);
            }, 1000);
        }

        // Função para mostrar modal de confirmação de exclusão
        function showDeleteModal(id, nome) {
            if (!id) {
                showAlert('error', 'ID do órgão não encontrado.');
                return;
            }
            
            deleteTargetId = id;
            document.getElementById('deleteMessage').innerHTML = 
                `Tem certeza que deseja excluir o órgão <strong>"${escapeHtml(nome)}"</strong>?<br><br>Esta ação não pode ser desfeita.`;
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
                showAlert('error', 'ID do órgão não encontrado.');
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
                    let errorMessage = 'Erro ao excluir órgão';
                    
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
                showAlert('success', `Órgão excluído com sucesso!`);
                closeDeleteModal();
                
                // Recarregar lista
                if (searchNameInput.value.trim()) {
                    searchOrgaos({ preventDefault: () => {} });
                } else {
                    loadAllOrgaos();
                }

            } catch (error) {
                console.error('Erro ao excluir órgão:', error);
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
            showAlert('info', 'Redirecionando para cadastro de órgãos...');
            setTimeout(() => {
                // window.location.href = 'cadastro-orgao.html';
                alert('Redirecionando para: cadastro-orgao.html');
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
                searchOrgaos(event);
            }
            
            // Escape para fechar modal
            if (event.key === 'Escape') {
                closeDeleteModal();
            }
            
            // Ctrl + N para novo órgão
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