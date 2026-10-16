/* ============================================================
   DAM Tutor Interactivo - Punto de Entrada y Orquestador Principal
   ============================================================ */

// Exposición explícita en window para compatibilidad total con eventos inline (onclick)
if (typeof window !== 'undefined') {
  // Estado
  if (typeof getSavedData !== 'undefined') window.getSavedData = getSavedData;
  if (typeof saveAppData !== 'undefined') window.saveAppData = saveAppData;
  if (typeof clearAllUserData !== 'undefined') window.clearAllUserData = clearAllUserData;

  // Navegación
  if (typeof switchTab !== 'undefined') window.switchTab = switchTab;
  if (typeof toggleMobileMenu !== 'undefined') window.toggleMobileMenu = toggleMobileMenu;
  if (typeof closeMobileMenu !== 'undefined') window.closeMobileMenu = closeMobileMenu;

  // Simulador
  if (typeof setScenario !== 'undefined') window.setScenario = setScenario;
  if (typeof handlePhoneOptionClick !== 'undefined') window.handlePhoneOptionClick = handlePhoneOptionClick;
  if (typeof handlePhoneNextStepClick !== 'undefined') window.handlePhoneNextStepClick = handlePhoneNextStepClick;
  if (typeof handleRejectCall !== 'undefined') window.handleRejectCall = handleRejectCall;
  if (typeof handleAnswerCall !== 'undefined') window.handleAnswerCall = handleAnswerCall;
  if (typeof hangUpCall !== 'undefined') window.hangUpCall = hangUpCall;
  if (typeof triggerPhoneRotation !== 'undefined') window.triggerPhoneRotation = triggerPhoneRotation;
  if (typeof triggerPhoneLauncher !== 'undefined') window.triggerPhoneLauncher = triggerPhoneLauncher;
  if (typeof triggerPhoneANR !== 'undefined') window.triggerPhoneANR = triggerPhoneANR;

  // Simulacros (Quiz)
  if (typeof chooseOption !== 'undefined') window.chooseOption = chooseOption;
  if (typeof chooseOption2 !== 'undefined') window.chooseOption2 = chooseOption2;
  if (typeof navQuiz !== 'undefined') window.navQuiz = navQuiz;
  if (typeof navQuiz2 !== 'undefined') window.navQuiz2 = navQuiz2;
  if (typeof goToQuizQuestion !== 'undefined') window.goToQuizQuestion = goToQuizQuestion;
  if (typeof goToQuizQuestion2 !== 'undefined') window.goToQuizQuestion2 = goToQuizQuestion2;
  if (typeof shuffleAndResetQuiz !== 'undefined') window.shuffleAndResetQuiz = shuffleAndResetQuiz;
  if (typeof shuffleAndResetQuiz2 !== 'undefined') window.shuffleAndResetQuiz2 = shuffleAndResetQuiz2;

  // Flashcards
  if (typeof toggleCardFlip !== 'undefined') window.toggleCardFlip = toggleCardFlip;
  if (typeof navCard !== 'undefined') window.navCard = navCard;
  if (typeof renderFlashcard !== 'undefined') window.renderFlashcard = renderFlashcard;

  // Minijuego de Capas
  if (typeof moveItemToZone !== 'undefined') window.moveItemToZone = moveItemToZone;
  if (typeof returnItemToPool !== 'undefined') window.returnItemToPool = returnItemToPool;
  if (typeof resetPoolGame !== 'undefined') window.resetPoolGame = resetPoolGame;
  if (typeof checkGameAnswers !== 'undefined') window.checkGameAnswers = checkGameAnswers;
  if (typeof allowGameDrop !== 'undefined') window.allowGameDrop = allowGameDrop;
  if (typeof handleDropToZone !== 'undefined') window.handleDropToZone = handleDropToZone;
  if (typeof handleDropToPool !== 'undefined') window.handleDropToPool = handleDropToPool;

  // Teoría
  if (typeof filterTheoryTopics !== 'undefined') window.filterTheoryTopics = filterTheoryTopics;
}

window.addEventListener('DOMContentLoaded', () => {
  if (window.soundManager) {
    soundManager.init();
  }

  // Desbloqueo suave del AudioContext y arranque de música de fondo en la primera interacción
  const unlockAudio = () => {
    try {
      if (window.soundManager) {
        soundManager.getAudioContext();
        soundManager.playMusic();
      }
    } catch (e) {}
    document.removeEventListener('pointerdown', unlockAudio);
    document.removeEventListener('click', unlockAudio);
    document.removeEventListener('keydown', unlockAudio);
  };
  document.addEventListener('pointerdown', unlockAudio);
  document.addEventListener('click', unlockAudio);
  document.addEventListener('keydown', unlockAudio);

  // 1. Leer estado guardado antes de inicializar los simulacros
  const saved = typeof getSavedData === 'function' ? getSavedData() : null;

  // 2. En CADA refresh: las preguntas van en orden oficial 1 a 10 y las opciones A, B, C, D se barajan aleatoriamente
  if (typeof shuffleAndResetQuiz === 'function') shuffleAndResetQuiz(true, false);
  if (typeof shuffleAndResetQuiz2 === 'function') shuffleAndResetQuiz2(true, false);

  // 3. Restaurar el estado de las otras secciones (tarjetas, juego de capas, pestaña activa)
  if (saved) {
    if (saved.flashcardIndex !== undefined && typeof currentFcIdx !== 'undefined') {
      currentFcIdx = saved.flashcardIndex;
    }
    if (typeof renderFlashcard === 'function') renderFlashcard();

    if (saved.gameLocations && typeof gameItemLocations !== 'undefined') {
      gameItemLocations = saved.gameLocations;
      if (typeof renderGameItems === 'function') renderGameItems();
    } else {
      if (typeof resetPoolGame === 'function') resetPoolGame(false);
    }

    if (saved.activeTab && typeof switchTab === 'function') {
      switchTab(saved.activeTab, false);
    } else {
      if (typeof switchTab === 'function') switchTab('simulador', false);
    }
  } else {
    if (typeof renderFlashcard === 'function') renderFlashcard();
    if (typeof resetPoolGame === 'function') resetPoolGame(false);
    if (typeof switchTab === 'function') switchTab('simulador', false);
  }

  // Iniciar en onCreate() como primer estado natural del Ciclo de Vida
  if (typeof setScenario === 'function') {
    setScenario('create', false, false);
  }

  // Iniciar automáticamente la secuencia temporizada: onCreate -> (3s) -> onStart -> (4s) -> onPause
  setTimeout(() => {
    if (typeof startAutoLifecycleSequence === 'function') {
      startAutoLifecycleSequence();
    }
  }, 300);

  // Registrar detector de actividad en el simulador por si el usuario interactúa antes
  const simSection = document.getElementById('view-simulador');
  if (simSection) {
    const onUserActivity = () => {
      if (typeof notifySimulatorUserActivity === 'function') {
        notifySimulatorUserActivity();
      }
    };
    simSection.addEventListener('pointerdown', onUserActivity, { passive: true });
    simSection.addEventListener('click', onUserActivity, { passive: true });
    simSection.addEventListener('touchstart', onUserActivity, { passive: true });
  }
});
