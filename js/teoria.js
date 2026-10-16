/* ============================================================
   DAM Tutor Interactivo - Filtrado de Temas Teóricos
   ============================================================ */
    function filterTheoryTopics(filter, chipBtn) {
      if (window.soundManager) soundManager.playClick();

      // Actualizar botón activo
      document.querySelectorAll('.theory-filter-chip').forEach(btn => btn.classList.remove('active'));
      if (chipBtn) chipBtn.classList.add('active');

      const cards = document.querySelectorAll('.theory-card-item');
      cards.forEach(card => {
        const cardUnit = card.getAttribute('data-unit');
        if (filter === 'all' || cardUnit === filter) {
          card.classList.remove('hidden-by-filter');
        } else {
          card.classList.add('hidden-by-filter');
        }
      });
    }

