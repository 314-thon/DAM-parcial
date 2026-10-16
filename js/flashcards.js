/* ============================================================
   DAM Tutor Interactivo - Tarjetas Didácticas 3D
   ============================================================ */
    let currentFcIdx = 0;
    let cardIsFlipped = false;

    function renderFlashcard() {
      const item = flashcardsData[currentFcIdx];
      document.getElementById('fc-tag-text').innerText = item.tag;
      document.getElementById('fc-counter-front').innerText = `Tarjeta ${currentFcIdx + 1} de ${flashcardsData.length}`;
      document.getElementById('fc-index-label').innerText = `${currentFcIdx + 1} / ${flashcardsData.length}`;
      document.getElementById('fc-front-question').innerText = item.q;

      const backContent = document.getElementById('fc-back-content');
      if (item.isTable) {
        let tableHtml = `<table class="fc-table-comp"><thead><tr>`;
        item.headers.forEach(h => tableHtml += `<th>${h}</th>`);
        tableHtml += `</tr></thead><tbody>`;
        item.rows.forEach(r => {
          tableHtml += `<tr>`;
          r.forEach(cell => tableHtml += `<td>${cell}</td>`);
          tableHtml += `</tr>`;
        });
        tableHtml += `</tbody></table>`;
        backContent.innerHTML = tableHtml;
      } else {
        backContent.innerHTML = `<div class="fc-answer-text">${item.textAnswer}</div>`;
      }

      cardIsFlipped = false;
      document.getElementById('flashcard-3d').classList.remove('flipped');
      saveAppData();
    }

    function toggleCardFlip() {
      cardIsFlipped = !cardIsFlipped;
      soundManager.playFlip();
      document.getElementById('flashcard-3d').classList.toggle('flipped', cardIsFlipped);
    }

    function navCard(direction) {
      soundManager.playClick();
      currentFcIdx = (currentFcIdx + direction + flashcardsData.length) % flashcardsData.length;
      renderFlashcard();
    }

