# 📱 Tutor Interactivo de Parcial - DAM (2026)

> Aplicación web interactiva de repaso y estudio para el examen parcial de **Desarrollo de Aplicaciones Móviles (DAM)** - Clases 1 a 12.

🌐 **Demo en vivo:** [https://314-thon.github.io/DAM-parcial/](https://314-thon.github.io/DAM-parcial/)

---

## 🎯 Módulos y Herramientas

1. **📱 Simulador de Smartphone & Ciclo de Vida:**
   - Visualización interactiva en tiempo real sobre la pantalla del teléfono.
   - Disparadores de sistema: Inicio, Llamada entrante (`onPause`), Rotación (`destrucción y recreación`), Home y Retorno.
   - Desglose por capas del sistema operativo Android (Linux Kernel, HAL, ART, Java API, System Apps).
2. **📝 Simulacro de Examen (Aleatorio 2x2):**
   - 10 preguntas clave de examen ordenadas según el temario oficial.
   - Opciones barajadas aleatoriamente en cada refresh.
   - Sistema de confirmación de respuesta (un clic para preseleccionar, otro para confirmar).
   - Puntaje en tiempo real y memoria local para no perder el avance.
3. **🃏 Tarjetas Didácticas 3D & Tablas Comparativas:**
   - 18 flashcards con animación 3D de giro (flip).
   - Tablas comparativas: `val` vs `var`, `open` vs `final`, Tipos de clases Kotlin (`data`, `sealed`, `enum`, `object`), y Heurísticas de Nielsen.
4. **🎮 Juego de Capas Libre:**
   - Drag & Drop para ordenar componentes y procesos en la capa correcta del stack de Android.
5. **📖 Resumen Oficial:**
   - Compendio exhaustivo de los 10 temas evaluados, con filtros rápidos por unidad y tags clave.

---

## 🚀 Despliegue en GitHub Pages

Esta aplicación es 100% estática (HTML5, CSS3 moderno, JavaScript vanilla y síntesis Web Audio API integrada, sin dependencias de servidor ni bundlers).

Para publicarla:
1. Subir a la rama `main`.
2. En GitHub: **Settings > Pages > Source: Deploy from a branch > Branch: main / (root)**.
3. ¡Listo! Accesible para cualquier dispositivo o compañero de cursada.
