/* ============================================================
   DAM Tutor Interactivo - Simulador Smartphone & Ciclo de Vida
   ============================================================ */
    let currentSimScenario = 'create';
    let phoneTriviaScore = 150;
    let rotationDestroyTimeout = null;

    // Control de la secuencia temporizada: onCreate -> (3s) -> onStart -> (4s) -> onPause (SIN LOOP)
    let hasAutoSequenceFinished = false;
    let autoStepTimerId = null;
    let autoStepIntervalId = null;
    let autoSequencePhase = 'idle'; // 'idle' | 'create_to_start' | 'start_to_pause' | 'done'
    let autoSecondsLeft = 3;

    function clearAutoLifecycleTimers() {
      if (autoStepTimerId) {
        clearTimeout(autoStepTimerId);
        autoStepTimerId = null;
      }
      if (autoStepIntervalId) {
        clearInterval(autoStepIntervalId);
        autoStepIntervalId = null;
      }
    }

    function updateAutoPausePillUI(state, text) {
      const pill = document.getElementById('auto-pause-pill');
      const pillText = document.getElementById('auto-pause-pill-text');
      if (!pill || !pillText) return;
      pill.classList.remove('counting', 'done');
      if (state === 'counting') pill.classList.add('counting');
      if (state === 'done') pill.classList.add('done');
      pillText.innerHTML = text;
    }

    function startAutoLifecycleSequence() {
      if (hasAutoSequenceFinished) return;
      if (currentActiveTab !== 'simulador') return;
      if (autoStepTimerId !== null) return; // Ya en marcha

      // Fase 1: onCreate -> onStart en 3 segundos
      autoSequencePhase = 'create_to_start';
      autoSecondsLeft = 3;
      updateAutoPausePillUI(
        'counting',
        `⏳ 1. onCreate() inflando vistas... pasando a <strong>onStart()</strong> en <strong>${autoSecondsLeft}s</strong>`
      );

      autoStepIntervalId = setInterval(() => {
        autoSecondsLeft--;
        if (autoSequencePhase === 'create_to_start' && autoSecondsLeft > 0) {
          updateAutoPausePillUI(
            'counting',
            `⏳ 1. onCreate() inflando vistas... pasando a <strong>onStart()</strong> en <strong>${autoSecondsLeft}s</strong>`
          );
        }
      }, 1000);

      autoStepTimerId = setTimeout(() => {
        clearAutoLifecycleTimers();
        if (hasAutoSequenceFinished) return;

        // Pasar a onStart()
        setScenario('start', true, false);

        // Fase 2: onStart -> onPause en 4 segundos
        autoSequencePhase = 'start_to_pause';
        autoSecondsLeft = 4;
        updateAutoPausePillUI(
          'counting',
          `⏱️ 2. onStart() visible... llamada entrante (<strong>onPause</strong>) en <strong>${autoSecondsLeft}s</strong>`
        );

        autoStepIntervalId = setInterval(() => {
          autoSecondsLeft--;
          if (autoSequencePhase === 'start_to_pause' && autoSecondsLeft > 0) {
            updateAutoPausePillUI(
              'counting',
              `⏱️ 2. onStart() visible... llamada entrante (<strong>onPause</strong>) en <strong>${autoSecondsLeft}s</strong>`
            );
          }
        }, 1000);

        autoStepTimerId = setTimeout(() => {
          clearAutoLifecycleTimers();
          if (hasAutoSequenceFinished) return;
          hasAutoSequenceFinished = true;
          autoSequencePhase = 'done';
          updateAutoPausePillUI(
            'done',
            '✅ Secuencia completada: <strong>onCreate</strong> ➔ (3s) ➔ <strong>onStart</strong> ➔ (4s) ➔ <strong>onPause</strong> (sin loop)'
          );
          setScenario('llamada', true, false);
        }, 4000);

      }, 3000);
    }

    function notifySimulatorUserActivity() {
      // Si el usuario interactúa y la secuencia aún no corrió, la arranca
      if (!hasAutoSequenceFinished && autoStepTimerId === null && currentSimScenario === 'create') {
        startAutoLifecycleSequence();
      }
    }

    function resetPhoneOptionsVisuals(statusLabelText) {
      for (let i = 0; i < 3; i++) {
        const optEl = document.getElementById('phone-opt-' + i);
        const stEl = document.getElementById('phone-opt-status-' + i);
        if (optEl) {
          optEl.classList.remove('opt-answered-correct', 'opt-answered-wrong');
        }
        if (stEl && statusLabelText !== undefined) {
          stEl.innerHTML = statusLabelText;
        }
      }
    }

    function handlePhoneOptionClick(optIdx) {
      notifySimulatorUserActivity();

      const banner = document.getElementById('app-lifecycle-banner');
      if (currentSimScenario === 'create') {
        if (window.soundManager) soundManager.playError();
        if (banner) {
          banner.innerHTML = '<strong>⚠️ En <code>onCreate()</code>:</strong> El layout recién se está inflando en memoria y no recibe eventos táctiles. Pasando a <code>onStart()</code>...';
        }
        return;
      }

      if (currentSimScenario === 'start') {
        if (window.soundManager) soundManager.playError();
        if (banner) {
          banner.innerHTML = '<strong>🔒 Sin foco en <code>onStart()</code>:</strong> La Activity es visible en pantalla pero todavía <strong>no tiene el foco interactivo</strong>. Esperá el paso a <code>onResume()</code> o toques.';
        }
        return;
      }

      if (currentSimScenario !== 'resume' && currentSimScenario !== 'rotacion') {
        return;
      }

      resetPhoneOptionsVisuals('👆 Tocá');
      const clickedOpt = document.getElementById('phone-opt-' + optIdx);
      const clickedStatus = document.getElementById('phone-opt-status-' + optIdx);
      const scoreBadge = document.getElementById('app-score-display');
      const vmStatusText = document.getElementById('app-vm-status-text');

      if (optIdx === 0) {
        if (window.soundManager) soundManager.playSuccess();
        if (clickedOpt) clickedOpt.classList.add('opt-answered-correct');
        if (clickedStatus) clickedStatus.innerText = '✓ ¡Correcta! (+50)';
        phoneTriviaScore = 200;
        if (scoreBadge) scoreBadge.innerText = 'Puntos: ' + phoneTriviaScore;
        if (vmStatusText) vmStatusText.innerText = '🟢 ViewModel@9c21 actualizó estado: ' + phoneTriviaScore + ' pts';
        if (banner) {
          banner.innerHTML = '<strong>✅ ¡Interacción procesada en <code>onResume()</code>!</strong> La UI tiene foco activo y notificó el evento al <code>ViewModel</code> (Puntaje: ' + phoneTriviaScore + ' pts).';
        }
      } else {
        if (window.soundManager) soundManager.playError();
        if (clickedOpt) clickedOpt.classList.add('opt-answered-wrong');
        if (clickedStatus) clickedStatus.innerText = '✕ Incorrecta';
        const correctOpt = document.getElementById('phone-opt-0');
        const correctStatus = document.getElementById('phone-opt-status-0');
        if (correctOpt) correctOpt.classList.add('opt-answered-correct');
        if (correctStatus) correctStatus.innerText = '✓ Era la A';
        if (banner) {
          banner.innerHTML = '<strong>👆 Toque recibido en <code>onResume()</code>:</strong> En Kotlin las clases son <code>final</code> por defecto y requieren <code>open</code> para heredarse.';
        }
      }
    }

    function handlePhoneNextStepClick(e) {
      if (e) e.stopPropagation();
      notifySimulatorUserActivity();

      if (currentSimScenario === 'create') {
        setScenario('start', true, true);
      } else if (currentSimScenario === 'start') {
        setScenario('resume', true, true);
      } else if (currentSimScenario === 'resume') {
        setScenario('llamada', true, true);
      } else if (currentSimScenario === 'rotacion') {
        setScenario('rotacion', true, true);
      }
    }

    let activeCallTimerInterval = null;
    let activeCallSeconds = 0;

    function startActiveCallTimer() {
      stopActiveCallTimer();
      activeCallSeconds = 0;
      const timerEl = document.getElementById('active-call-timer');
      if (timerEl) timerEl.innerText = '00:00';
      activeCallTimerInterval = setInterval(() => {
        activeCallSeconds++;
        const mins = String(Math.floor(activeCallSeconds / 60)).padStart(2, '0');
        const secs = String(activeCallSeconds % 60).padStart(2, '0');
        if (timerEl) timerEl.innerText = mins + ':' + secs;
      }, 1000);
    }

    function stopActiveCallTimer() {
      if (activeCallTimerInterval) {
        clearInterval(activeCallTimerInterval);
        activeCallTimerInterval = null;
      }
    }

    function handleRejectCall(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      notifySimulatorUserActivity();
      if (window.soundManager) {
        soundManager.stopRing();
        soundManager.stopCallActive();
        soundManager.playClick();
      }
      setScenario('resume', false, true);
    }

    function handleAnswerCall(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      notifySimulatorUserActivity();
      if (window.soundManager) {
        soundManager.stopRing();
        soundManager.playCallActive();
      }
      setScenario('call_active', false, true);
    }

    function hangUpCall(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      notifySimulatorUserActivity();
      stopActiveCallTimer();
      if (window.soundManager) {
        soundManager.stopCallActive();
        soundManager.playClick();
      }
      const activeCallPill = document.getElementById('home-active-call-pill');
      if (activeCallPill) activeCallPill.style.display = 'none';
      setScenario('resume', false, true);
    }

    function setScenario(scen, playAudio = true, isUserClick = false) {
      const prevScenario = currentSimScenario;
      currentSimScenario = scen;

      // Si salimos de 'llamada' (onPause), DETENER inmediatamente el ringtone de Eminem
      if (prevScenario === 'llamada' && scen !== 'llamada') {
        if (window.soundManager) soundManager.stopRing();
      }

      // Si salimos de 'call_active' o 'home', DETENER el audio de llamada Inspector Morfi y timer
      if ((prevScenario === 'call_active' || prevScenario === 'home') && scen !== 'call_active' && scen !== 'home') {
        stopActiveCallTimer();
        if (window.soundManager) soundManager.stopCallActive();
        const activeCallPill = document.getElementById('home-active-call-pill');
        if (activeCallPill) activeCallPill.style.display = 'none';
      }

      if (isUserClick) {
        // Si el usuario interactúa manualmente con botones de estado, detenemos cualquier timer automático pendiente para respetar su navegación manual
        clearAutoLifecycleTimers();
        hasAutoSequenceFinished = true;
        updateAutoPausePillUI(
          'done',
          '🎮 Control manual activado (secuencia automática completada)'
        );
      }

      if (rotationDestroyTimeout) {
        clearTimeout(rotationDestroyTimeout);
        rotationDestroyTimeout = null;
      }

      if (playAudio && window.soundManager) {
        if (scen === 'llamada') {
          soundManager.playRing(); // Reproduce Eminem The Real Slim Shady en loop continuo
        } else if (scen === 'anr') {
          soundManager.playError();
        } else {
          soundManager.playClick();
        }
      }

      // Highlight button
      document.querySelectorAll('.sim-event-chip').forEach(b => b.classList.remove('active', 'active-alert'));
      const activeChip = document.getElementById('chip-' + scen) || (scen === 'call_active' ? document.getElementById('chip-home') : null);
      if (activeChip) {
        activeChip.classList.add(scen === 'anr' ? 'active-alert' : 'active');
      }

      // Stepper references
      const sCreate = document.getElementById('step-create');
      const sStart = document.getElementById('step-start');
      const sResume = document.getElementById('step-resume');
      const sPause = document.getElementById('step-pause');
      const sStop = document.getElementById('step-stop');
      const sDestroy = document.getElementById('step-destroy');

      // Layer cards
      const cardUi = document.getElementById('sim-layer-ui');
      const cardVm = document.getElementById('sim-layer-vm');
      const cardData = document.getElementById('sim-layer-data');

      const txtUi = document.getElementById('sim-text-ui');
      const txtVm = document.getElementById('sim-text-vm');
      const txtData = document.getElementById('sim-text-data');

      // Phone elements
      const phoneMockup = document.getElementById('phone-mockup');
      const appTriviaUi = document.getElementById('app-trivia-ui');
      const instanceBadge = document.getElementById('app-instance-badge');
      const orientationTag = document.getElementById('phone-orientation-tag');
      const scoreBadge = document.getElementById('app-score-display');
      const lifecycleBanner = document.getElementById('app-lifecycle-banner');
      const vmStatusText = document.getElementById('app-vm-status-text');
      const nextStepBtn = document.getElementById('app-next-step-btn');
      const phoneCaption = document.getElementById('phone-caption-label');

      const overlayCall = document.getElementById('overlay-call');
      const overlayActiveCall = document.getElementById('overlay-active-call');
      const overlayDestroy = document.getElementById('overlay-destroy');
      const overlayHome = document.getElementById('overlay-home');
      const overlayAnr = document.getElementById('overlay-anr');
      const stageIndicator = document.getElementById('app-stage-indicator');
      const timerBar = document.getElementById('app-timer-bar');

      // Reset common phone states
      const simWrapper = document.getElementById('sim-wrapper-box');
      if (simWrapper) simWrapper.classList.remove('is-rotated');
      phoneMockup.classList.remove('rotated');
      if (overlayCall) overlayCall.style.display = 'none';
      if (overlayActiveCall) overlayActiveCall.style.display = 'none';
      if (overlayDestroy) overlayDestroy.style.display = 'none';
      if (overlayHome) overlayHome.style.display = 'none';
      if (overlayAnr) overlayAnr.style.display = 'none';

      if (scoreBadge) scoreBadge.innerText = 'Puntos: ' + phoneTriviaScore;
      if (orientationTag) orientationTag.innerText = 'VERTICAL';
      if (instanceBadge) {
        instanceBadge.innerText = 'MainActivity@4f8a';
        instanceBadge.style.borderColor = 'rgba(148, 163, 184, 0.3)';
        instanceBadge.style.color = '#cbd5e1';
      }

      // Reset steps & layer styles
      [sCreate, sStart, sResume, sPause, sStop, sDestroy].forEach(el => {
        if (el) el.className = 'lc-step';
      });
      [cardUi, cardVm, cardData].forEach(el => {
        if (el) el.className = 'layer-card';
      });

      if (scen === 'create') {
        sCreate.className = 'lc-step active';
        cardUi.classList.add('highlight');
        cardVm.classList.add('highlight');

        if (appTriviaUi) appTriviaUi.className = 'app-screen-content state-create';
        resetPhoneOptionsVisuals('&lt;Button&gt;');

        stageIndicator.innerText = '🟡 Estado: onCreate() • Inflando Layout y enlazando ViewModel';
        stageIndicator.style.color = '#fef08a';
        timerBar.style.width = '100%';
        timerBar.style.background = '#eab308';

        if (lifecycleBanner) {
          lifecycleBanner.className = 'app-lifecycle-banner banner-create';
          lifecycleBanner.innerHTML = '<strong>🛠️ onCreate():</strong> Ejecutando <code>setContentView(R.layout.activity_trivia)</code> / Compose <code>setContent</code>. Construyendo jerarquía de vistas en memoria (aún sin foco).';
        }
        if (vmStatusText) vmStatusText.innerText = '🧠 by viewModels() ➔ TriviaViewModel@9c21';
        if (nextStepBtn) {
          nextStepBtn.style.display = 'inline-block';
          nextStepBtn.innerText = '▶ Pasar a onStart()';
        }
        if (phoneCaption) {
          phoneCaption.innerHTML = 'Simulador de Smartphone Android • Estado actual: <strong>1. onCreate() (Inflado de UI)</strong>';
        }

        txtUi.innerHTML = '<strong>onCreate() en la UI:</strong> Se ejecuta una sola vez al nacer la Activity (<code>MainActivity@4f8a</code>). Se infla el diseño (<code>setContentView(R.layout...)</code> o Compose <code>setContent</code>) y se enlazan vistas con ViewBinding.';
        txtVm.innerHTML = '<strong>Inicialización del ViewModel:</strong> Se obtiene la instancia del ViewModel asociada a este Scope (<code>by viewModels()</code> ➔ <code>TriviaViewModel@9c21</code>) y se preparan los flujos de datos reactivos.';
        txtData.innerHTML = '<strong>Capa de Datos lista:</strong> El Repository queda instanciado a la espera de peticiones de lectura o escritura.';

      } else if (scen === 'start') {
        sCreate.className = 'lc-step active';
        sStart.className = 'lc-step active';
        cardUi.classList.add('highlight');

        if (appTriviaUi) appTriviaUi.className = 'app-screen-content state-start';
        resetPhoneOptionsVisuals('🔒 Sin foco');

        stageIndicator.innerText = '🔵 Estado: onStart() • Pantalla VISIBLE (Sin foco táctil aún)';
        stageIndicator.style.color = '#93c5fd';
        timerBar.style.width = '90%';
        timerBar.style.background = '#3b82f6';

        if (lifecycleBanner) {
          lifecycleBanner.className = 'app-lifecycle-banner banner-start';
          lifecycleBanner.innerHTML = '<strong>👁️ onStart():</strong> La interfaz ya es <strong>visible</strong> en pantalla para el usuario, pero <em>aún no tiene el foco interactivo</em> (botones bloqueados hasta <code>onResume</code>).';
        }
        if (vmStatusText) vmStatusText.innerText = '🧠 ViewModel@9c21 • Suscribiendo observadores UI';
        if (nextStepBtn) {
          nextStepBtn.style.display = 'inline-block';
          nextStepBtn.innerText = '▶ Dar foco (onResume)';
        }
        if (phoneCaption) {
          phoneCaption.innerHTML = 'Simulador de Smartphone Android • Estado actual: <strong>2. onStart() (Visible sin foco)</strong>';
        }

        txtUi.innerHTML = '<strong>onStart() en la UI:</strong> La aplicación se vuelve visible para el usuario en pantalla, pero <em>aún no tiene el foco</em> para responder toques. Se inician componentes visuales y observadores de UI.';
        txtVm.innerHTML = '<strong>Observadores en espera:</strong> El ViewModel ya tiene los datos cargados en memoria (' + phoneTriviaScore + ' pts) listos para ser observados por la vista.';
        txtData.innerHTML = '<strong>Datos listos:</strong> El repositorio provee los datos iniciales al ViewModel.';

      } else if (scen === 'resume') {
        sCreate.className = 'lc-step active';
        sStart.className = 'lc-step active';
        sResume.className = 'lc-step active';
        cardUi.classList.add('highlight');
        cardVm.classList.add('highlight');

        if (appTriviaUi) appTriviaUi.className = 'app-screen-content state-resume';
        resetPhoneOptionsVisuals('👆 Tocá');

        stageIndicator.innerText = '🟢 Estado: onResume() • En ejecución con FOCO INTERACTIVO';
        stageIndicator.style.color = '#34d399';
        timerBar.style.width = '68%';
        timerBar.style.background = '#10b981';

        if (lifecycleBanner) {
          lifecycleBanner.className = 'app-lifecycle-banner banner-resume';
          lifecycleBanner.innerHTML = '<strong>▶️ onResume():</strong> La aplicación está en primer plano absoluto y tiene <strong>foco táctil</strong>. ¡Tocá una opción (A, B o C) en la pantalla para responder!';
        }
        if (vmStatusText) vmStatusText.innerText = '🟢 ViewModel@9c21 activo • Recibiendo toques';
        if (nextStepBtn) {
          nextStepBtn.style.display = 'inline-block';
          nextStepBtn.innerText = '📞 Simular Llamada (onPause)';
        }
        if (phoneCaption) {
          phoneCaption.innerHTML = 'Simulador de Smartphone Android • Estado actual: <strong>3. onResume() (Interactiva con foco)</strong>';
        }

        txtUi.innerHTML = '<strong>onResume() en la UI:</strong> La aplicación pasa a primer plano absoluto y obtiene el foco interactivo. El usuario puede tocar las opciones A, B y C en pantalla y responder la trivia.';
        txtVm.innerHTML = '<strong>Lógica activa:</strong> El ViewModel ejecuta la corrutina del temporizador y procesa las respuestas del usuario actualizando el puntaje en RAM (' + phoneTriviaScore + ' pts).';
        txtData.innerHTML = '<strong>Operación normal:</strong> La capa de datos permanece en espera de eventos de guardado o actualización.';

      } else if (scen === 'llamada') {
        sPause.className = 'lc-step active-critical';
        cardUi.classList.add('highlight');
        cardVm.classList.add('highlight');
        cardData.classList.add('highlight');

        if (appTriviaUi) appTriviaUi.className = 'app-screen-content state-pause';
        overlayCall.style.display = 'flex';
        stageIndicator.innerText = '🔴 Estado: onPause() • Pausa obligatoria (Foco perdido)';
        stageIndicator.style.color = '#fca5a5';
        timerBar.style.width = '40%';
        timerBar.style.background = '#f59e0b';

        if (lifecycleBanner) {
          lifecycleBanner.className = 'app-lifecycle-banner';
          lifecycleBanner.innerHTML = '<strong>⏸️ Activity en Pausa:</strong> Sin foco interactivo por superposición de llamada.';
        }
        if (vmStatusText) vmStatusText.innerText = '💾 Guardando borrador en hilo IO...';
        if (nextStepBtn) nextStepBtn.style.display = 'none';
        if (phoneCaption) {
          phoneCaption.innerHTML = 'Simulador de Smartphone Android • Estado actual: <strong>4. onPause() (Llamada entrante / Persistencia segura)</strong>';
        }

        txtUi.innerHTML = '<strong>onPause() por llamada entrante:</strong> La pantalla pierde el foco (queda parcialmente visible detrás del banner de llamada). La Activity detiene animaciones, sonido y temporizador, y <strong>avisa al ViewModel</strong> para persistir.';
        txtVm.innerHTML = '<strong>Salvar estado en memoria:</strong> El ViewModel toma el puntaje (' + phoneTriviaScore + ' pts) y la pregunta vigente, y despacha una corrutina (<code>viewModelScope.launch</code>) al Repository.';
        txtData.innerHTML = '<strong>Persistencia Garantizada:</strong> El Repository guarda el borrador en <code>SharedPreferences</code> o JSON en segundo plano (hilo IO), porque <code>onPause()</code> es el último método garantizado antes de que Android pueda matar el proceso si falta RAM.';

      } else if (scen === 'call_active') {
        sCreate.className = 'lc-step active';
        sStart.className = 'lc-step active';
        sResume.className = 'lc-step active';
        sPause.className = 'lc-step active';
        sStop.className = 'lc-step active-critical';
        cardUi.classList.add('highlight');
        cardVm.classList.add('highlight');
        cardData.classList.add('highlight');

        if (overlayActiveCall) overlayActiveCall.style.display = 'flex';
        startActiveCallTimer();

        stageIndicator.innerText = '🟣 Estado: onStop() • Llamada activa en pantalla completa';
        stageIndicator.style.color = '#c4b5fd';
        timerBar.style.width = '20%';
        timerBar.style.background = '#8b5cf6';

        if (lifecycleBanner) {
          lifecycleBanner.className = 'app-lifecycle-banner';
          lifecycleBanner.innerHTML = '<strong>🛑 onStop():</strong> La llamada con Mc Donald\'s tomó el 100% de la pantalla. La Activity de Trivia ya <strong>no es visible</strong>. Tocá <strong>Colgar llamada</strong> para volver (<code>onRestart ➔ onStart ➔ onResume</code>).';
        }
        if (vmStatusText) vmStatusText.innerText = '🛡️ ViewModel@9c21 preservado en RAM (' + phoneTriviaScore + ' pts)';
        if (nextStepBtn) nextStepBtn.style.display = 'none';
        if (phoneCaption) {
          phoneCaption.innerHTML = 'Simulador de Smartphone Android • Estado actual: <strong>5. onStop() (Llamada activa a pantalla completa con Inspector Morfi)</strong>';
        }

        txtUi.innerHTML = '<strong>onStop() por llamada atendida:</strong> Al contestar la llamada, la pantalla completa pasa a la aplicación de Teléfono. Trivia pasó de <code>onPause()</code> (parcialmente visible) a <code>onStop()</code> (100% invisible en segundo plano).';
        txtVm.innerHTML = '<strong>El ViewModel sigue vivo en RAM:</strong> <code>TriviaViewModel@9c21</code> preserva el puntaje (' + phoneTriviaScore + ' pts) y el estado intacto en memoria durante la conversación telefónica.';
        txtData.innerHTML = '<strong>Persistencia asegurada:</strong> Los datos ya se habían asegurado en disco durante <code>onPause()</code>, cumpliendo con la arquitectura recomendada.';

      } else if (scen === 'home') {
        sPause.className = 'lc-step active';
        sStop.className = 'lc-step active-critical';
        cardUi.classList.add('highlight');
        cardVm.classList.add('highlight');

        overlayHome.style.display = 'flex';
        stageIndicator.innerText = '🟣 Estado: onStop() • 100% Oculta en segundo plano';
        stageIndicator.style.color = '#c4b5fd';
        if (phoneCaption) {
          phoneCaption.innerHTML = 'Simulador de Smartphone Android • Estado actual: <strong>5. onStop() (100% Oculta en Home)</strong>';
        }

        txtUi.innerHTML = '<strong>onStop() al presionar Home / Atender:</strong> La aplicación pasa a estar <strong>100% oculta</strong> (segundo plano). Se liberan recursos visuales pesados mientras el usuario no ve la app.';
        txtVm.innerHTML = '<strong>Estado en espera:</strong> El ViewModel conserva todo en RAM (' + phoneTriviaScore + ' pts) por si el usuario vuelve a abrir la app desde el ícono 🎮 o Recientes.';
        txtData.innerHTML = '<strong>Almacenamiento cerrado:</strong> Se terminan de confirmar las escrituras pendientes en disco local.';

      } else if (scen === 'rotacion') {
        sPause.className = 'lc-step active';
        sStop.className = 'lc-step active';
        sDestroy.className = 'lc-step active-critical';

        if (simWrapper) simWrapper.classList.add('is-rotated');
        phoneMockup.classList.add('rotated');
        cardUi.classList.add('danger');
        cardVm.classList.add('highlight');

        if (orientationTag) orientationTag.innerText = 'HORIZONTAL';

        // FASE 1 (0s - 1.35s): Mostrar explícitamente la DESTRUCCIÓN de la Activity vertical (onDestroy)
        if (overlayDestroy) overlayDestroy.style.display = 'flex';
        stageIndicator.innerText = '💥 Fase 1/2: onDestroy() • Destruyendo MainActivity@4f8a (Vertical)...';
        stageIndicator.style.color = '#fca5a5';
        if (phoneCaption) {
          phoneCaption.innerHTML = '🔄 Girando móvil: <strong>1° onDestroy()</strong> destruye la Activity vertical mientras el <strong>ViewModel sobrevive</strong>...';
        }

        txtUi.innerHTML = '<strong>1° Destrucción (onDestroy) y 2° Recreación (onCreate):</strong> Al girar el celular a horizontal, Android <strong>destruye por completo</strong> la Activity vertical (<code>MainActivity@4f8a</code>) y crea una nueva instancia (<code>MainActivity@b71e</code>) para inflar el diseño apaisado (Landscape) con el contenido derecho.';
        txtVm.innerHTML = '<strong>🛡️ ¡El ViewModel NO se destruye!</strong> <code>TriviaViewModel@9c21</code> tiene un ciclo de vida desacoplado y sobrevive en memoria RAM. Cuando la nueva Activity horizontal nace, se reconecta al mismo ViewModel y recupera los <strong>' + phoneTriviaScore + ' puntos intactos</strong>.';
        txtData.innerHTML = '<strong>Sin lecturas de disco innecesarias:</strong> No hizo falta volver a consultar SQLite ni SharedPreferences porque el estado siguió vivo en el ViewModel en RAM.';

        // FASE 2 (tras 1.35s): Ocultar overlay de destrucción y mostrar la nueva Activity recreada en Landscape con contenido girado
        rotationDestroyTimeout = setTimeout(() => {
          if (currentSimScenario !== 'rotacion') return;
          if (overlayDestroy) overlayDestroy.style.display = 'none';
          if (appTriviaUi) appTriviaUi.className = 'app-screen-content state-rotated';
          resetPhoneOptionsVisuals('👆 Tocá');

          sDestroy.className = 'lc-step active-critical';
          sCreate.className = 'lc-step active';
          sStart.className = 'lc-step active';
          sResume.className = 'lc-step active';

          if (instanceBadge) {
            instanceBadge.innerText = 'MainActivity@b71e (Nueva)';
            instanceBadge.style.borderColor = '#a855f7';
            instanceBadge.style.color = '#e9d5ff';
          }

          stageIndicator.innerText = '🔄 Fase 2/2: Recreada en Horizontal (onDestroy ➔ onCreate ➔ onResume)';
          stageIndicator.style.color = '#e9d5ff';
          timerBar.style.width = '68%';
          timerBar.style.background = '#a855f7';

          if (lifecycleBanner) {
            lifecycleBanner.className = 'app-lifecycle-banner banner-rotated';
            lifecycleBanner.innerHTML = '<strong>🔄 Activity Recreada en Landscape:</strong> Se destruyó <code>@4f8a</code> y nació <code>MainActivity@b71e</code> con diseño horizontal de 2 columnas, recuperando los <strong>' + phoneTriviaScore + ' pts</strong> del mismo <code>ViewModel@9c21</code>.';
          }
          if (vmStatusText) {
            vmStatusText.innerText = '🛡️ Mismo ViewModel@9c21 en RAM (' + phoneTriviaScore + ' pts intactos)';
          }
          if (nextStepBtn) {
            nextStepBtn.style.display = 'inline-block';
            nextStepBtn.innerText = '🔁 Ver destrucción de nuevo';
          }
          if (phoneCaption) {
            phoneCaption.innerHTML = 'Smartphone en <strong>Modo Horizontal (Landscape)</strong> • Contenido girado y nueva Activity conectada al mismo ViewModel';
          }
        }, 1350);

      } else if (scen === 'anr') {
        sPause.className = 'lc-step active-critical';
        cardUi.classList.add('danger');
        cardData.classList.add('danger');

        overlayAnr.style.display = 'flex';
        stageIndicator.innerText = '⛔ ERROR ANR • Main Thread bloqueado (> 5s)';
        stageIndicator.style.color = '#f87171';
        if (phoneCaption) {
          phoneCaption.innerHTML = '⛔ <strong>Application Not Responding (ANR)</strong> • Bloqueo del Hilo Principal (UI Thread)';
        }

        txtUi.innerHTML = '<strong>⛔ ERROR GRAVE (ANR):</strong> Se intentó escribir en SQLite/disco adentro del método de ciclo de vida directamente en el Hilo Principal. La interfaz se congela más de 5 segundos y Android muestra el cartel de "Cerrar app".';
        txtVm.innerHTML = '<strong>Solución Arquitectónica:</strong> El ViewModel debe usar <code>viewModelScope.launch(Dispatchers.IO)</code> para delegar la persistencia en segundo plano sin bloquear el Main Thread.';
        txtData.innerHTML = '<strong>Regla de Oro:</strong> La persistencia y llamadas de red SIEMPRE deben ser asíncronas mediante corrutinas o hilos secundarios.';
      }
    }

