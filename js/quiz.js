/* ============================================================
   DAM Tutor Interactivo - Motor de Simulacros 1 y 2
   ============================================================ */
    let currentQuizList = [];
    let userSelectedAnswers = {};
    let pendingPreselections = {}; // qId -> optIndex
    let currentQuizIdx = 0;

    function shuffleArray(arr) {
      const copy = [...arr];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    }

    function shuffleAndResetQuiz(forceNew, playAudio = false) {
      if (forceNew) {
        if (playAudio) soundManager.playClick();
        userSelectedAnswers = {};
        pendingPreselections = {};
        currentQuizIdx = 0;
      }
      // Preguntas SIEMPRE en el orden oficial del material de la profesora (1 a 10)
      const orderedQuestions = [...originalQuizData].sort((a, b) => a.id - b.id);
      
      // En cada refresh / barajado, las opciones (A, B, C, D) cambian de posición aleatoriamente
      currentQuizList = orderedQuestions.map(q => {
        return {
          ...q,
          options: shuffleArray(q.options)
        };
      });

      renderQuizUI();
      saveAppData();
    }

    function navQuiz(delta) {
      const nextIdx = currentQuizIdx + delta;
      if (nextIdx < 0 || nextIdx >= currentQuizList.length) return;
      if (window.soundManager) soundManager.playClick();
      currentQuizIdx = nextIdx;
      renderQuizUI();
      saveAppData();
    }

    function goToQuizQuestion(idx) {
      if (idx < 0 || idx >= currentQuizList.length) return;
      if (window.soundManager) soundManager.playClick();
      currentQuizIdx = idx;
      renderQuizUI();
      saveAppData();
    }

    function renderQuizUI() {
      const wrapper = document.getElementById('quiz-wrapper');
      if (!wrapper || currentQuizList.length === 0) return;
      wrapper.innerHTML = '';
      const letters = ['A', 'B', 'C', 'D'];

      if (currentQuizIdx >= currentQuizList.length) currentQuizIdx = 0;
      const qIndex = currentQuizIdx;
      const q = currentQuizList[qIndex];

      const card = document.createElement('div');
      card.className = 'quiz-card';

      let optionsGridHtml = '';
      const savedAnswerIdx = userSelectedAnswers[q.id];
      const preselectedIdx = pendingPreselections[q.id];

      q.options.forEach((opt, optIndex) => {
        let btnClass = 'quiz-option-btn';
        let confirmTagHtml = '';

        if (savedAnswerIdx !== undefined) {
          btnClass += ' locked';
          if (opt.correct) {
            btnClass += ' correct';
          } else if (optIndex === savedAnswerIdx && !opt.correct) {
            btnClass += ' incorrect';
          }
        } else if (preselectedIdx === optIndex) {
          btnClass += ' preselected';
          confirmTagHtml = `<div class="opt-confirm-tag">👉 Volvé a tocar para confirmar</div>`;
        }

        optionsGridHtml += `
          <button class="${btnClass}" id="btn_q${q.id}_opt${optIndex}" onclick="chooseOption(${q.id}, ${optIndex})">
            <span class="opt-letter-box">${letters[optIndex]}</span>
            <div style="flex:1;">
              <div>${opt.text}</div>
              ${confirmTagHtml}
            </div>
          </button>
        `;
      });

      // Feedback
      let feedbackHtml = '';
      let statusBadgeHtml = `<span class="badge-tag badge-primary">Pregunta ${qIndex + 1} de ${currentQuizList.length}</span>`;
      if (savedAnswerIdx !== undefined) {
        const isCorrect = q.options[savedAnswerIdx] && q.options[savedAnswerIdx].correct;
        if (isCorrect) {
          statusBadgeHtml = `<span class="badge-tag badge-accent">✅ Respondida Correcta</span>`;
          feedbackHtml = `<div class="quiz-feedback-box show-correct" style="display:block;">✅ <strong>¡Correcto!</strong> ${q.explanation}</div>`;
        } else {
          statusBadgeHtml = `<span class="badge-tag badge-danger">❌ Respondida Incorrecta</span>`;
          feedbackHtml = `<div class="quiz-feedback-box show-incorrect" style="display:block;">❌ <strong>Respuesta incorrecta.</strong> ${q.explanation}</div>`;
        }
      } else {
        feedbackHtml = `<div class="quiz-feedback-box" id="feedback_q${q.id}"></div>`;
      }

      const isLast = (qIndex === currentQuizList.length - 1);
      const nextBtnClass = savedAnswerIdx !== undefined ? 'quiz-nav-btn primary-next' : 'quiz-nav-btn';
      const nextBtnHtml = isLast
        ? `<button class="${nextBtnClass}" onclick="shuffleAndResetQuiz(true, true)">🎲 Reiniciar Simulacro</button>`
        : `<button class="${nextBtnClass}" onclick="navQuiz(1)">Siguiente →</button>`;

      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; font-size:0.85rem; color:var(--text-muted); flex-wrap:wrap; gap:0.5rem;">
          <span>Caso Práctico ${qIndex + 1} de ${currentQuizList.length}</span>
          ${statusBadgeHtml}
        </div>

        <div class="quiz-question-centered">
          ${q.question}
        </div>

        <div class="quiz-grid-2x2" id="grid_q${q.id}">
          ${optionsGridHtml}
        </div>

        ${feedbackHtml}

        <div class="quiz-nav-footer">
          <button class="quiz-nav-btn" onclick="navQuiz(-1)" ${qIndex === 0 ? 'disabled' : ''}>← Anterior</button>
          <span style="font-size:0.84rem; font-weight:700; color:var(--text-muted);">${qIndex + 1} / ${currentQuizList.length}</span>
          ${nextBtnHtml}
        </div>
      `;
      wrapper.appendChild(card);
      updateScoreBanner();
    }

    /* ============================================================
       LÓGICA DE DOS CLICS: 
       1er Clic: Preseleccionar opción (cambia cuantas veces quieras)
       2do Clic en la misma opción: Confirmar y evaluar definitivamente
       ============================================================ */
    function chooseOption(qId, optIndex) {
      if (userSelectedAnswers[qId] !== undefined) return; // ya respondida

      const prevPre = pendingPreselections[qId];

      if (prevPre === optIndex) {
        // SEGUNDO CLIC en la misma opción preseleccionada ➔ CONFIRMACIÓN
        confirmSelection(qId, optIndex);
      } else {
        // PRIMER CLIC en una opción ➔ PRESELECCIÓN
        pendingPreselections[qId] = optIndex;
        soundManager.playSelect();
        updateQuestionOptionsUI(qId);
      }
    }

    function updateQuestionOptionsUI(qId) {
      const q = currentQuizList.find(item => item.id === qId);
      if (!q) return;
      const letters = ['A', 'B', 'C', 'D'];
      const preselectedIdx = pendingPreselections[qId];

      q.options.forEach((opt, optIndex) => {
        const btn = document.getElementById(`btn_q${qId}_opt${optIndex}`);
        if (!btn) return;

        if (preselectedIdx === optIndex) {
          btn.className = 'quiz-option-btn preselected';
          btn.innerHTML = `
            <span class="opt-letter-box">${letters[optIndex]}</span>
            <div style="flex:1;">
              <div>${opt.text}</div>
              <div class="opt-confirm-tag">👉 Volvé a tocar para confirmar</div>
            </div>
          `;
        } else {
          btn.className = 'quiz-option-btn';
          btn.innerHTML = `
            <span class="opt-letter-box">${letters[optIndex]}</span>
            <div style="flex:1;">
              <div>${opt.text}</div>
            </div>
          `;
        }
      });
    }

    function confirmSelection(qId, selectedOptIndex) {
      userSelectedAnswers[qId] = selectedOptIndex;
      delete pendingPreselections[qId];

      const q = currentQuizList.find(item => item.id === qId);
      const isCorrect = q.options[selectedOptIndex].correct;

      if (isCorrect) {
        soundManager.playSuccess();
      } else {
        soundManager.playError();
      }

      renderQuizUI();
      saveAppData();
    }

    function updateScoreBanner() {
      const total = currentQuizList.length || 10;
      let correctCount = 0;
      const answeredCount = Object.keys(userSelectedAnswers).length;

      Object.keys(userSelectedAnswers).forEach(qId => {
        const q = currentQuizList.find(item => item.id == qId);
        const selIdx = userSelectedAnswers[qId];
        if (q && q.options[selIdx] && q.options[selIdx].correct) {
          correctCount++;
        }
      });

      const scoreEl = document.getElementById('quiz-score-num');
      const noteEl = document.getElementById('quiz-note-calc');
      if (scoreEl) scoreEl.innerText = `${correctCount} / ${total}`;
      if (noteEl) {
        const note = (correctCount / total) * 5.0;
        noteEl.innerText = `(Nota: ${note.toFixed(1)} / 5.0)`;
      }

      const progLabel = document.getElementById('quiz-progress-label');
      const ansLabel = document.getElementById('quiz-answered-label');
      const progFill = document.getElementById('quiz-progress-fill');
      const dotsBox = document.getElementById('quiz-steps-dots');

      const pct = Math.round(((currentQuizIdx + 1) / total) * 100);
      if (progLabel) progLabel.innerText = `Pregunta ${currentQuizIdx + 1} de ${total}`;
      if (ansLabel) ansLabel.innerText = `Respondidas: ${answeredCount} / ${total} • Avance ${pct}%`;
      if (progFill) progFill.style.width = `${pct}%`;

      if (dotsBox) {
        let dotsHtml = '';
        currentQuizList.forEach((item, idx) => {
          let cls = 'quiz-step-dot';
          if (idx === currentQuizIdx) cls += ' active';
          const ansIdx = userSelectedAnswers[item.id];
          if (ansIdx !== undefined) {
            const ok = item.options[ansIdx] && item.options[ansIdx].correct;
            cls += ok ? ' done-correct' : ' done-incorrect';
          }
          dotsHtml += `<button class="${cls}" onclick="goToQuizQuestion(${idx})" title="Ir a pregunta ${idx + 1}">${idx + 1}</button>`;
        });
        dotsBox.innerHTML = dotsHtml;
      }
    }



    let currentQuizList2 = [];
    let userSelectedAnswers2 = {};
    let pendingPreselections2 = {};
    let currentQuizIdx2 = 0;

    function shuffleAndResetQuiz2(forceNew, playAudio = false) {
      if (forceNew) {
        if (playAudio && window.soundManager) soundManager.playClick();
        userSelectedAnswers2 = {};
        pendingPreselections2 = {};
        currentQuizIdx2 = 0;
      }
      const orderedQuestions = [...originalQuizData2].sort((a, b) => a.id - b.id);
      currentQuizList2 = orderedQuestions.map(q => {
        return {
          ...q,
          options: shuffleArray(q.options)
        };
      });

      renderQuizUI2();
      saveAppData();
    }

    function navQuiz2(delta) {
      const nextIdx = currentQuizIdx2 + delta;
      if (nextIdx < 0 || nextIdx >= currentQuizList2.length) return;
      if (window.soundManager) soundManager.playClick();
      currentQuizIdx2 = nextIdx;
      renderQuizUI2();
      saveAppData();
    }

    function goToQuizQuestion2(idx) {
      if (idx < 0 || idx >= currentQuizList2.length) return;
      if (window.soundManager) soundManager.playClick();
      currentQuizIdx2 = idx;
      renderQuizUI2();
      saveAppData();
    }

    function renderQuizUI2() {
      const wrapper = document.getElementById('quiz2-wrapper');
      if (!wrapper || currentQuizList2.length === 0) return;
      wrapper.innerHTML = '';
      const letters = ['A', 'B', 'C', 'D'];

      if (currentQuizIdx2 >= currentQuizList2.length) currentQuizIdx2 = 0;
      const qIndex = currentQuizIdx2;
      const q = currentQuizList2[qIndex];

      const card = document.createElement('div');
      card.className = 'quiz-card';

      let optionsGridHtml = '';
      const savedAnswerIdx = userSelectedAnswers2[q.id];
      const preselectedIdx = pendingPreselections2[q.id];

      q.options.forEach((opt, optIndex) => {
        let btnClass = 'quiz-option-btn';
        let confirmTagHtml = '';

        if (savedAnswerIdx !== undefined) {
          btnClass += ' locked';
          if (opt.correct) {
            btnClass += ' correct';
          } else if (optIndex === savedAnswerIdx && !opt.correct) {
            btnClass += ' incorrect';
          }
        } else if (preselectedIdx === optIndex) {
          btnClass += ' preselected';
          confirmTagHtml = `<div class="opt-confirm-tag">👉 Volvé a tocar para confirmar</div>`;
        }

        optionsGridHtml += `
          <button class="${btnClass}" id="btn_q2_${q.id}_opt${optIndex}" onclick="chooseOption2(${q.id}, ${optIndex})">
            <span class="opt-letter-box">${letters[optIndex]}</span>
            <div style="flex:1;">
              <div>${opt.text}</div>
              ${confirmTagHtml}
            </div>
          </button>
        `;
      });

      // Feedback
      let feedbackHtml = '';
      let statusBadgeHtml = `<span class="badge-tag badge-accent">Pregunta ${qIndex + 1} de ${currentQuizList2.length}</span>`;
      if (savedAnswerIdx !== undefined) {
        const isCorrect = q.options[savedAnswerIdx] && q.options[savedAnswerIdx].correct;
        if (isCorrect) {
          statusBadgeHtml = `<span class="badge-tag badge-accent">✅ Respondida Correcta</span>`;
          feedbackHtml = `<div class="quiz-feedback-box show-correct" style="display:block;">✅ <strong>¡Correcto!</strong> ${q.explanation}</div>`;
        } else {
          statusBadgeHtml = `<span class="badge-tag badge-danger">❌ Respondida Incorrecta</span>`;
          feedbackHtml = `<div class="quiz-feedback-box show-incorrect" style="display:block;">❌ <strong>Respuesta incorrecta.</strong> ${q.explanation}</div>`;
        }
      } else {
        feedbackHtml = `<div class="quiz-feedback-box" id="feedback_q2_${q.id}"></div>`;
      }

      const isLast = (qIndex === currentQuizList2.length - 1);
      const nextBtnClass = savedAnswerIdx !== undefined ? 'quiz-nav-btn primary-next' : 'quiz-nav-btn';
      const nextBtnHtml = isLast
        ? `<button class="${nextBtnClass}" onclick="shuffleAndResetQuiz2(true, true)">🎲 Reiniciar Simulacro</button>`
        : `<button class="${nextBtnClass}" onclick="navQuiz2(1)">Siguiente →</button>`;

      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; font-size:0.85rem; color:var(--text-muted); flex-wrap:wrap; gap:0.5rem;">
          <span>Pregunta ${qIndex + 1} de ${currentQuizList2.length}</span>
          ${statusBadgeHtml}
        </div>

        <div class="quiz-question-centered">
          ${q.question}
        </div>

        <div class="quiz-grid-2x2" id="grid_q2_${q.id}">
          ${optionsGridHtml}
        </div>

        ${feedbackHtml}

        <div class="quiz-nav-footer">
          <button class="quiz-nav-btn" onclick="navQuiz2(-1)" ${qIndex === 0 ? 'disabled' : ''}>← Anterior</button>
          <span style="font-size:0.84rem; font-weight:700; color:var(--text-muted);">${qIndex + 1} / ${currentQuizList2.length}</span>
          ${nextBtnHtml}
        </div>
      `;
      wrapper.appendChild(card);
      updateScoreBanner2();
    }

    function chooseOption2(qId, optIndex) {
      if (userSelectedAnswers2[qId] !== undefined) return;

      const prevPre = pendingPreselections2[qId];

      if (prevPre === optIndex) {
        confirmSelection2(qId, optIndex);
      } else {
        pendingPreselections2[qId] = optIndex;
        if (window.soundManager) soundManager.playSelect();
        updateQuestionOptionsUI2(qId);
      }
    }

    function updateQuestionOptionsUI2(qId) {
      const q = currentQuizList2.find(item => item.id === qId);
      if (!q) return;
      const letters = ['A', 'B', 'C', 'D'];
      const preselectedIdx = pendingPreselections2[qId];

      q.options.forEach((opt, optIndex) => {
        const btn = document.getElementById(`btn_q2_${qId}_opt${optIndex}`);
        if (!btn) return;

        if (preselectedIdx === optIndex) {
          btn.className = 'quiz-option-btn preselected';
          btn.innerHTML = `
            <span class="opt-letter-box">${letters[optIndex]}</span>
            <div style="flex:1;">
              <div>${opt.text}</div>
              <div class="opt-confirm-tag">👉 Volvé a tocar para confirmar</div>
            </div>
          `;
        } else {
          btn.className = 'quiz-option-btn';
          btn.innerHTML = `
            <span class="opt-letter-box">${letters[optIndex]}</span>
            <div style="flex:1;">
              <div>${opt.text}</div>
            </div>
          `;
        }
      });
    }

    function confirmSelection2(qId, selectedOptIndex) {
      userSelectedAnswers2[qId] = selectedOptIndex;
      delete pendingPreselections2[qId];

      const q = currentQuizList2.find(item => item.id === qId);
      const isCorrect = q.options[selectedOptIndex].correct;

      if (window.soundManager) {
        if (isCorrect) {
          soundManager.playSuccess();
        } else {
          soundManager.playError();
        }
      }

      renderQuizUI2();
      saveAppData();
    }

    function updateScoreBanner2() {
      const total = currentQuizList2.length || 10;
      let correctCount = 0;
      const answeredCount = Object.keys(userSelectedAnswers2).length;

      Object.keys(userSelectedAnswers2).forEach(qId => {
        const q = currentQuizList2.find(item => item.id == qId);
        const selIdx = userSelectedAnswers2[qId];
        if (q && q.options[selIdx] && q.options[selIdx].correct) {
          correctCount++;
        }
      });

      const scoreEl = document.getElementById('quiz2-score-num');
      const noteEl = document.getElementById('quiz2-note-calc');
      if (scoreEl) scoreEl.innerText = `${correctCount} / ${total}`;
      if (noteEl) {
        const note = total > 0 ? (correctCount / total) * 5.0 : 0;
        noteEl.innerText = `(Nota: ${note.toFixed(1)} / 5.0)`;
      }

      const progLabel = document.getElementById('quiz2-progress-label');
      const ansLabel = document.getElementById('quiz2-answered-label');
      const progFill = document.getElementById('quiz2-progress-fill');
      const dotsBox = document.getElementById('quiz2-steps-dots');

      const pct = Math.round(((currentQuizIdx2 + 1) / total) * 100);
      if (progLabel) progLabel.innerText = `Pregunta ${currentQuizIdx2 + 1} de ${total}`;
      if (ansLabel) ansLabel.innerText = `Respondidas: ${answeredCount} / ${total} • Avance ${pct}%`;
      if (progFill) progFill.style.width = `${pct}%`;

      if (dotsBox) {
        let dotsHtml = '';
        currentQuizList2.forEach((item, idx) => {
          let cls = 'quiz-step-dot';
          if (idx === currentQuizIdx2) cls += ' active';
          const ansIdx = userSelectedAnswers2[item.id];
          if (ansIdx !== undefined) {
            const ok = item.options[ansIdx] && item.options[ansIdx].correct;
            cls += ok ? ' done-correct' : ' done-incorrect';
          }
          dotsHtml += `<button class="${cls}" onclick="goToQuizQuestion2(${idx})" title="Ir a pregunta ${idx + 1}">${idx + 1}</button>`;
        });
        dotsBox.innerHTML = dotsHtml;
      }
    }

