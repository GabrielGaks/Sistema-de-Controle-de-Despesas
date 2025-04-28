// Script para evitar flash do tema claro antes de aplicar o tema escuro
(function() {
    // APLICAÇÃO IMEDIATA DO TEMA: Executa antes de qualquer renderização
    const isDarkMode = localStorage.getItem('isDarkMode') === 'true';
    
    // Bloquear temporariamente a renderização da página
    document.documentElement.style.display = 'none';
    
    // Aplicar tema escuro ao HTML imediatamente
    if (isDarkMode) {
        document.documentElement.classList.add('dark-mode');
    }
    
    // Permitir a renderização da página após aplicar o tema
    document.addEventListener('DOMContentLoaded', function() {
        document.documentElement.style.display = '';

        // Adicionar overlay de transição ao DOM
        const overlay = document.createElement('div');
        overlay.className = 'page-transition-overlay';
        document.body.appendChild(overlay);

        // Gerenciar transições entre páginas
        setupPageTransitions();
    });

    // Função para configurar transições entre páginas
    function setupPageTransitions() {
        // Seleciona todos os links internos de navegação
        const internalLinks = document.querySelectorAll('a[href]:not([href^="http"]):not([href^="mailto"]):not([href^="#"])');
        
        internalLinks.forEach(link => {
            link.addEventListener('click', function(event) {
                // Ignora cliques com tecla modificadora ou botão direito
                if (event.ctrlKey || event.metaKey || event.shiftKey || event.which !== 1) {
                    return;
                }
                
                const targetHref = link.getAttribute('href');
                // Verifica se é um link interno para outra página
                if (targetHref && !targetHref.startsWith('#')) {
                    event.preventDefault();
                    
                    // Ativa animação de saída
                    const mainContent = document.querySelector('.page-content') || document.querySelector('main');
                    if (mainContent) {
                        mainContent.classList.add('page-exit');
                        
                        // Ativa o overlay de transição
                        const overlay = document.querySelector('.page-transition-overlay');
                        overlay.classList.add('active');
                        
                        // Navega para a nova página após a animação
                        setTimeout(() => {
                            window.location.href = targetHref;
                        }, 500); // Tempo correspondente à duração da animação fadeOutPage
                    } else {
                        // Se não encontrar o conteúdo principal, navega diretamente
                        window.location.href = targetHref;
                    }
                }
            });
        });
    }
})();