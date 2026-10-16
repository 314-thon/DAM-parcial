/* ============================================================
   DAM Tutor Interactivo - Sistema de Estado y LocalStorage
   ============================================================ */

const STORAGE_KEY = 'DAM_TUTOR_STATE_V2';

function getSavedData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function saveAppData() {
  try {
    const state = {
      activeTab: typeof currentActiveTab !== 'undefined' ? currentActiveTab : 'simulador',
      quizAnswers: typeof userSelectedAnswers !== 'undefined' ? userSelectedAnswers : {},
      quizList: typeof currentQuizList !== 'undefined' ? currentQuizList : [],
      quizAnswers2: typeof userSelectedAnswers2 !== 'undefined' ? userSelectedAnswers2 : {},
      quizList2: typeof currentQuizList2 !== 'undefined' ? currentQuizList2 : [],
      flashcardIndex: typeof currentFcIdx !== 'undefined' ? currentFcIdx : 0,
      gameLocations: typeof gameItemLocations !== 'undefined' ? gameItemLocations : {}
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('No se pudo guardar en localStorage:', e);
  }
}

function clearAllUserData() {
  if (confirm('¿Querés reiniciar todo tu progreso guardado (respuestas del simulacro, tarjetas y juego de capas)?')) {
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
  }
}
