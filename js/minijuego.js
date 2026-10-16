/* ============================================================
   DAM Tutor Interactivo - Juego de Capas Libre (Drag & Drop)
   ============================================================ */
    let gameItemLocations = {}; // itemId -> 'pool' | 'ui' | 'vm' | 'data'

    function resetPoolGame(playAudio = true) {
      if (playAudio) soundManager.playClick();
      gameItemLocations = {};
      initialGameItems.forEach(i => gameItemLocations[i.id] = 'pool');
      renderGameItems();
      document.getElementById('game-results-text').innerText = '';
      saveAppData();
    }

    function renderGameItems() {
      const poolTray = document.getElementById('pool-tray');
      const zoneUi = document.getElementById('zone-ui');
      const zoneVm = document.getElementById('zone-vm');
      const zoneData = document.getElementById('zone-data');

      poolTray.innerHTML = '';
      zoneUi.innerHTML = '<div class="game-box-title">🖥️ 1. Capa de UI (Activity / Compose)</div>';
      zoneVm.innerHTML = '<div class="game-box-title">🧠 2. Capa ViewModel (Estado)</div>';
      zoneData.innerHTML = '<div class="game-box-title">💾 3. Capa de Datos (Repository)</div>';

      initialGameItems.forEach(item => {
        const loc = gameItemLocations[item.id] || 'pool';

        const card = document.createElement('div');
        card.className = 'game-item-card' + (loc !== 'pool' ? ' in-zone' : '');
        card.id = item.id;
        card.draggable = true;

        card.ondragstart = (e) => {
          e.dataTransfer.setData('text/plain', item.id);
        };

        let moveActionsHtml = '';
        if (loc === 'pool') {
          moveActionsHtml = `
            <div class="game-actions-bar">
              <button class="game-action-move-btn" onclick="moveItemToZone('${item.id}', 'ui', event)">→ A UI</button>
              <button class="game-action-move-btn" onclick="moveItemToZone('${item.id}', 'vm', event)">→ A VM</button>
              <button class="game-action-move-btn" onclick="moveItemToZone('${item.id}', 'data', event)">→ A Datos</button>
            </div>
          `;
        } else {
          moveActionsHtml = `
            <div class="game-actions-bar">
              <button class="game-item-remove-btn" onclick="returnItemToPool('${item.id}', event)" title="Regresar a la bandeja">
                ✕ Quitar
              </button>
              ${loc !== 'ui' ? `<button class="game-action-move-btn" onclick="moveItemToZone('${item.id}', 'ui', event)">→ UI</button>` : ''}
              ${loc !== 'vm' ? `<button class="game-action-move-btn" onclick="moveItemToZone('${item.id}', 'vm', event)">→ VM</button>` : ''}
              ${loc !== 'data' ? `<button class="game-action-move-btn" onclick="moveItemToZone('${item.id}', 'data', event)">→ Datos</button>` : ''}
            </div>
          `;
        }

        card.innerHTML = `
          <div style="display:flex; flex-direction:column; gap:0.4rem; width:100%;">
            <span>${item.text}</span>
            ${moveActionsHtml}
          </div>
        `;

        if (loc === 'pool') {
          poolTray.appendChild(card);
        } else if (loc === 'ui') {
          zoneUi.appendChild(card);
        } else if (loc === 'vm') {
          zoneVm.appendChild(card);
        } else if (loc === 'data') {
          zoneData.appendChild(card);
        }
      });
    }

    function moveItemToZone(itemId, targetLayer, e) {
      if (e) e.stopPropagation();
      gameItemLocations[itemId] = targetLayer;
      soundManager.playDrop();
      renderGameItems();
      saveAppData();
    }

    function allowGameDrop(e) {
      e.preventDefault();
      e.currentTarget.classList.add('drag-over');
    }

    function handleDropToZone(e, targetLayer) {
      e.preventDefault();
      e.currentTarget.classList.remove('drag-over');
      const itemId = e.dataTransfer.getData('text/plain');
      if (itemId) {
        gameItemLocations[itemId] = targetLayer;
        soundManager.playDrop();
        renderGameItems();
        saveAppData();
      }
    }

    function handleDropToPool(e) {
      e.preventDefault();
      e.currentTarget.classList.remove('drag-over');
      const itemId = e.dataTransfer.getData('text/plain');
      if (itemId) {
        gameItemLocations[itemId] = 'pool';
        soundManager.playDrop();
        renderGameItems();
        saveAppData();
      }
    }

    function returnItemToPool(itemId, e) {
      e.stopPropagation();
      gameItemLocations[itemId] = 'pool';
      soundManager.playClick();
      renderGameItems();
      saveAppData();
    }

    function checkGameAnswers() {
      let placedCount = 0;
      let correctCount = 0;

      initialGameItems.forEach(item => {
        const loc = gameItemLocations[item.id];
        const el = document.getElementById(item.id);
        if (loc && loc !== 'pool') {
          placedCount++;
          if (loc === item.correctLayer) {
            correctCount++;
            if (el) {
              el.style.borderColor = 'var(--accent)';
              el.style.background = 'rgba(16, 185, 129, 0.15)';
            }
          } else {
            if (el) {
              el.style.borderColor = 'var(--danger)';
              el.style.background = 'rgba(239, 68, 68, 0.15)';
            }
          }
        }
      });

      const resEl = document.getElementById('game-results-text');
      if (placedCount < initialGameItems.length) {
        soundManager.playError();
        resEl.style.color = '#fbbf24';
        resEl.innerText = `Ubicaste ${placedCount} de ${initialGameItems.length} acciones (${correctCount} correctas). Podés mover las restantes o corregir las que quedaron en rojo.`;
      } else if (correctCount === initialGameItems.length) {
        soundManager.playSuccess();
        resEl.style.color = '#34d399';
        resEl.innerText = `🎉 ¡Perfecto! Todas las 8 acciones están ubicadas en su capa correcta.`;
      } else {
        soundManager.playError();
        resEl.style.color = '#f87171';
        resEl.innerText = `Tenés ${correctCount} de ${initialGameItems.length} correctas. Las tarjetas en rojo están en la capa equivocada; podés arrastrarlas a otra zona o hacer clic en '✕ Quitar'.`;
      }
    }

