/* ============================================================
   DAM Tutor Interactivo - Navegación de Pestañas y Menú Móvil
   ============================================================ */
    let currentActiveTab = 'simulador';

    const MODULE_PILL_LABELS = {
      simulador: '📱 Ciclo de Vida',
      quiz: '📝 Simulacro 1',
      quiz2: '🎯 Simulacro 2',
      flashcards: '🃏 Tarjetas 3D',
      minijuego: '🎮 Juego de Capas',
      teoria: '📖 Resumen Oficial'
    };

    function toggleMobileMenu() {
      const panel = document.getElementById('header-menu-panel');
      const btn = document.getElementById('hamburger-btn');
      const backdrop = document.getElementById('menu-backdrop');
      if (!panel || !btn) return;

      const isOpen = panel.classList.toggle('open');
      btn.classList.toggle('open', isOpen);
      btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      if (backdrop) backdrop.classList.toggle('open', isOpen);
      if (window.soundManager) soundManager.playClick();
    }

    function closeMobileMenu() {
      const panel = document.getElementById('header-menu-panel');
      const btn = document.getElementById('hamburger-btn');
      const backdrop = document.getElementById('menu-backdrop');
      if (panel) panel.classList.remove('open');
      if (btn) {
        btn.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      }
      if (backdrop) backdrop.classList.remove('open');
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMobileMenu();
    });

    function switchTab(tabId, playAudio = true) {
      if (playAudio && currentActiveTab !== tabId) {
        soundManager.playClick();
      }
      if (tabId !== 'simulador' && window.soundManager) {
        soundManager.stopRing(); // Para de sonar si sale de la pantalla
        soundManager.stopCallActive(); // Para el audio de llamada si sale de la pantalla
        if (typeof stopActiveCallTimer === 'function') stopActiveCallTimer();
      }
      currentActiveTab = tabId;
      document.querySelectorAll('.header-menu-panel .tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.view-section').forEach(s => s.classList.remove('active'));

      const btn = document.getElementById('tab-btn-' + tabId);
      if (btn) btn.classList.add('active');

      const sec = document.getElementById('view-' + tabId);
      if (sec) sec.classList.add('active');

      const pill = document.getElementById('active-module-pill');
      if (pill && MODULE_PILL_LABELS[tabId]) {
        pill.innerText = MODULE_PILL_LABELS[tabId];
      }

      closeMobileMenu();
      saveAppData();
    }

