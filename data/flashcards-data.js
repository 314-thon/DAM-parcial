/* ============================================================
   DATA: TARJETAS 3D Y TABLAS COMPARATIVAS
   ============================================================ */
    const flashcardsData = [
      {
        tag: "Unidad 1 • Dispositivos",
        q: "¿Cuál es la diferencia entre un dispositivo embebido y uno montado?",
        isTable: true,
        headers: ["Criterio", "Embebido", "Montado (Ej: Android Auto)"],
        rows: [
          ["Integración", "Interno e inamovible (placa/chips)", "Se acopla al tablero del vehículo"],
          ["Dependencia", "Opera de forma autónoma (ABS)", "Depende del anfitrión para operar"],
          ["Ejemplo", "Microcontrolador de frenos ABS", "Android Auto integrado en el auto"]
        ]
      },
      {
        tag: "Unidad 1 • Kotlin",
        q: "¿Cuál es la diferencia de visibilidad entre private y protected?",
        isTable: true,
        headers: ["Modificador", "Ámbito en la misma clase", "Ámbito en clases hijas (Herencia)"],
        rows: [
          ["private", "✅ Visible únicamente aquí", "❌ Oculto para las subclases"],
          ["protected", "✅ Visible en la clase", "✅ Visible en todas sus subclases"]
        ]
      },
      {
        tag: "Unidad 2 • Paradigmas UI",
        q: "XML (Imperativo) vs. Jetpack Compose (Declarativo)",
        isTable: true,
        headers: ["Característica", "XML Tradicional", "Jetpack Compose Moderno"],
        rows: [
          ["Paradigma", "Imperativo (instrucción paso a paso)", "Declarativo (reflejo del estado)"],
          ["Búsqueda de Vistas", "Requiere findViewById o ViewBinding", "No busca vistas, define composables"],
          ["Actualización", "Manual (ej. setText, setVisibility)", "Automática por recomposición"]
        ]
      },
      {
        tag: "Unidad 2 • UX en Móviles",
        q: "Ley de Hick vs. Ley de Fitts",
        isTable: true,
        headers: ["Ley", "Principio Central", "Solución en Móviles"],
        rows: [
          ["Ley de Hick", "Más opciones = mayor tiempo de decisión", "Dividir formularios largos en etapas cortas"],
          ["Ley de Fitts", "Tiempo depende del tamaño y distancia", "Botones grandes en la Zona del Pulgar"]
        ]
      },
      {
        tag: "Unidad 3 • Ciclo de Vida",
        q: "onPause() vs. onStop()",
        isTable: true,
        headers: ["Estado", "Visibilidad de la Pantalla", "Riesgo de Liquidación por el SO"],
        rows: [
          ["onPause()", "Pierde el foco (puede verse parcialmente)", "Último momento seguro garantizado"],
          ["onStop()", "Totalmente oculta (segundo plano)", "El SO puede matarla sin aviso antes"]
        ]
      },
      {
        tag: "Unidad 3 • Persistencia",
        q: "SharedPreferences vs. Archivos JSON",
        isTable: true,
        headers: ["Mecanismo", "Estructura de Datos", "Caso de Uso Típico"],
        rows: [
          ["SharedPreferences", "Clave-Valor (XML privado)", "Ajustes simples (isDarkMode = true)"],
          ["Archivos JSON", "Colección estructurada de objetos", "Banco de preguntas, historial de partidas"]
        ]
      },
      {
        tag: "Unidad 1 • Herencia",
        q: "¿Por qué en Kotlin es obligatorio usar 'open' en la clase padre?",
        isTable: false,
        textAnswer: "Por diseño de seguridad del lenguaje, en Kotlin todas las clases son <strong>final por defecto</strong>. Para que otra clase pueda heredar de ella mediante sintaxis de dos puntos (<code>class Suculenta : Planta()</code>), es requisito obligatorio anteponer la palabra <strong>open</strong> en la clase base (<code>open class Planta</code>)."
      },
      {
        tag: "Unidad 3 • Arquitectura",
        q: "¿Por qué el ViewModel sobrevive a la rotación de pantalla?",
        isTable: false,
        textAnswer: "Porque su ciclo de vida está <strong>desacoplado del ciclo de vida de la Activity</strong>. Mientras la Activity se destruye y se recrea por el cambio de configuración (vertical a horizontal), el ViewModel permanece intacto en memoria RAM conservando los puntajes y el estado actual."
      },
      {
        tag: "Unidad 3 • Concurrencia",
        q: "¿Qué función cumple el Main Thread y por qué usamos Corrutinas?",
        isTable: false,
        textAnswer: "El <strong>Main/UI Thread</strong> actúa como el 'mozo del restaurante': solo debe atender los toques y el dibujo de la pantalla. Si se ejecuta una tarea pesada en él, la app se congela y salta el error ANR. Las <strong>Corrutinas</strong> son hilos ligeros que corren en segundo plano (para temporizadores, música o persistencia) sin bloquear la pantalla."
      },
      {
        tag: "Unidad 1 • Entorno",
        q: "Si disponés de 8 GB de RAM, ¿cuál es la mejor práctica en Android Studio?",
        isTable: false,
        textAnswer: "Evitar el uso del emulador virtual (AVD), ya que consume varios gigabytes de memoria compartida con el IDE. La recomendación técnica del curso es conectar un <strong>dispositivo físico real mediante cable USB</strong> con la depuración USB habilitada."
      },
      {
        tag: "Unidad 2 • UX/UI",
        q: "Niveles de Fidelidad: Boceto vs. Wireframe vs. Mockup vs. Prototipo",
        isTable: true,
        headers: ["Nivel", "Fidelidad", "Propósito en el Proceso UX"],
        rows: [
          ["Boceto (Sketch)", "Baja (Papel y lápiz)", "Lluvia de ideas e ideación preliminar rápida"],
          ["Wireframe", "Baja (Estructural / Grises)", "Define jerarquía y disposición funcional sin diseño"],
          ["Mockup", "Media/Alta (Estático)", "Diseño visual final con tipografía, colores e íconos"],
          ["Prototipo", "Alta (Interactivo / Clickeable)", "Validación de flujos y navegación con usuarios reales"]
        ]
      },
      {
        tag: "Unidad 1 • Arquitectura SO",
        q: "Las 5 Capas de la Arquitectura del SO Android (Stack Oficial)",
        isTable: true,
        headers: ["Capa del Stack", "Componentes Principales", "Función Esencial"],
        rows: [
          ["5. System Apps", "Teléfono, Contactos, Apps instaladas", "Capa orientada directamente al usuario final"],
          ["4. Java API Framework", "ActivityManager, ViewSystem, Providers", "APIs de alto nivel utilizadas por los desarrolladores"],
          ["3. Runtime (ART) & Libs", "ART (bytecode DEX AOT/JIT) + C/C++", "Ejecución optimizada de código y librerías nativas"],
          ["2. HAL", "Módulos de abstracción de hardware", "Estandariza el acceso a periféricos sin importar el chip"],
          ["1. Linux Kernel", "Drivers, procesos, memoria y seguridad", "Capa base de gestión física de recursos y energía"]
        ]
      },
      {
        tag: "Unidad 1 • Kotlin",
        q: "Tipos de Clases: data class vs. sealed class vs. enum class",
        isTable: true,
        headers: ["Tipo de Clase", "Propósito Principal", "Caso de Uso en Android"],
        rows: [
          ["data class", "Almacenar datos (autogenera equals, copy, toString)", "Modelos y DTOs (ej. Pregunta, Usuario, Puntaje)"],
          ["sealed class", "Jerarquía cerrada y finita de subtipos en compilación", "Estados seguros de UI (UiState.Loading, Success, Error)"],
          ["enum class", "Conjunto fijo y cerrado de constantes tipadas", "Valores estáticos discretos (ej. Dificultad, Rol)"]
        ]
      },
      {
        tag: "Unidad 2 • Heurísticas UX",
        q: "Heurísticas de Jakob Nielsen aplicadas a Móviles",
        isTable: true,
        headers: ["Heurística", "Principio de Usabilidad", "Ejemplo Práctico en la App"],
        rows: [
          ["1. Visibilidad del estado", "Mantener al usuario informado de lo que ocurre", "Spinners de carga, barras de progreso y temporizador"],
          ["3. Control y libertad", "Permitir deshacer o cancelar fácilmente", "Botón volver, cancelar acción o deshacer respuesta"],
          ["4. Consistencia", "Mismos patrones e íconos en toda la interfaz", "Mismo color verde para aciertos en toda la app"],
          ["5. Prevención de errores", "Evitar el error antes de que el usuario lo cometa", "Doble clic para confirmar o deshabilitar botón vacío"]
        ]
      },
      {
        tag: "Unidad 1 • Anatomía Android",
        q: "AndroidManifest.xml vs. build.gradle.kts",
        isTable: true,
        headers: ["Criterio", "AndroidManifest.xml", "build.gradle.kts"],
        rows: [
          ["Rol", "Registro oficial de la aplicación ante el SO", "Gestor de compilación y dependencias externas"],
          ["Contenido", "Activities, permisos (&lt;uses-permission&gt;), ícono", "minSdk, targetSdk, compileSdk, librerías"],
          ["Tiempo de uso", "Inspeccionado en instalación y ejecución", "Ejecutado al construir y empaquetar el APK"]
        ]
      },
      {
        tag: "Unidad 1 • Kotlin",
        q: "¿Cómo funciona el sistema de Null Safety en Kotlin?",
        isTable: true,
        headers: ["Sintaxis", "Denominación", "Efecto en Ejecución"],
        rows: [
          ["String vs. String?", "No-Nulo vs. Anulable", "Por defecto no admite null; el signo '?' lo permite"],
          ["variable?.metodo()", "Llamada Segura (Safe Call)", "Si es null, retorna null sin lanzar NullPointerException"],
          ["val x = a ?: b", "Operador Elvis", "Si 'a' es null, asigna el valor de respaldo 'b'"],
          ["variable!!.metodo()", "Not-Null Assertion", "Fuerza el valor; si resulta null arroja NullPointerException"]
        ]
      },
      {
        tag: "Unidad 1 • Runtime",
        q: "Android Runtime (ART) vs. Máquina Virtual Dalvik",
        isTable: true,
        headers: ["Característica", "Dalvik (Versiones Anteriores)", "ART (Android Moderno)"],
        rows: [
          ["Compilación", "JIT (Just-In-Time) cada vez que se abre la app", "AOT (Ahead-Of-Time) en instalación + JIT híbrido"],
          ["Rendimiento", "Mayor demora y uso de CPU en runtime", "Arranque veloz y ejecución directa nativa"],
          ["Batería & RAM", "Mayor consumo energético continuo", "Optimización notable de batería y recolector de basura (GC)"]
        ]
      },
      {
        tag: "Unidad 2 • Flujos UX",
        q: "¿Qué es un Flujo de Pantallas (Screen Flow) y por qué se testea?",
        isTable: false,
        textAnswer: "Un <strong>Flujo de Pantallas (User/Screen Flow)</strong> es un diagrama visual que traza el camino paso a paso que realiza un usuario desde el punto de entrada (ej: Splash o Login) hasta alcanzar su objetivo final (ej: Responder trivia y ver puntaje). Permite identificar pantallas intermedias, estados vacíos, manejo de errores de conexión y botones de retorno. <strong>Se testea con prototipos interactivos</strong> antes del desarrollo para corregir cuellos de botella y fricción cognitiva sin desperdiciar horas de programación."
      },
      {
        tag: "Unidad 1 • Fundamentos Móviles",
        q: "Computación Móvil vs. Computación de Escritorio Tradicional",
        isTable: true,
        headers: ["Aspecto", "Computación de Escritorio", "Computación Móvil"],
        rows: [
          ["Energía & Autonomía", "Conectado a la red eléctrica continua", "Batería finita (requiere optimización de CPU/sensores)"],
          ["Conectividad", "Ethernet/Wi-Fi estable de alta velocidad", "Redes móviles intermitentes (4G/5G, zonas sin señal)"],
          ["Interacción", "Mouse de alta precisión y teclado físico", "Pantalla táctil (zona del pulgar, toques imprecisos)"],
          ["Ciclo de Vida", "El software corre hasta que el usuario lo cierra", "El SO puede destruir la app en segundo plano por memoria"]
        ]
      },
      {
        tag: "Unidad 1 • Anatomía Android",
        q: "Estructura del directorio de Recursos (res/)",
        isTable: true,
        headers: ["Subdirectorio", "Tipo de Contenido", "Ejemplo de Uso"],
        rows: [
          ["res/layout/", "Archivos XML de diseño de interfaz de usuario", "activity_main.xml, item_pregunta.xml"],
          ["res/values/", "Constantes: textos (strings), colores y temas", "strings.xml (internacionalización), colors.xml"],
          ["res/drawable/", "Gráficos vectoriales XML e imágenes bitmap", "ic_launcher_foreground.xml, fondo_tarjeta.png"],
          ["res/mipmap/", "Íconos de lanzamiento de la aplicación (Launcher)", "ic_launcher en distintas densidades (mdpi, hdpi, xxhdpi)"]
        ]
      },
      {
        tag: "Unidad 1 • Kotlin",
        q: "companion object en Kotlin vs. static en Java",
        isTable: true,
        headers: ["Criterio", "static (Java)", "companion object (Kotlin)"],
        rows: [
          ["Naturaleza", "Palabra clave para miembros a nivel de clase", "Objeto real singleton vinculado a la clase"],
          ["Herencia / Interfaces", "No puede implementar interfaces", "Sí puede implementar interfaces y extender clases"],
          ["Acceso", "Clase.miembroStatic", "Clase.miembro (o Clase.Companion.miembro)"],
          ["Caso típico", "Constantes globales o métodos de utilidad", "Constantes TAG para logs, factory methods (newInstance)"]
        ]
      },
      {
        tag: "Unidad 1 • POO en Kotlin",
        q: "Constructores en Kotlin: Primario, init y Secundario",
        isTable: true,
        headers: ["Elemento", "Ubicación en el Código", "Propósito y Características"],
        rows: [
          ["Constructor Primario", "En el encabezado de la clase (class Persona(val nombre: String))", "Declara e inicializa propiedades directamente de forma concisa"],
          ["Bloque init { }", "En el cuerpo de la clase", "Ejecuta lógica de validación o inicialización tras el primario"],
          ["Constructor Secundario", "En el cuerpo con palabra clave 'constructor'", "Sobrecarga con constructores alternativos; delega al primario con this()"]
        ]
      },
      {
        tag: "Unidad 2 • UX/UI",
        q: "Las 10 Heurísticas de Usabilidad de Jakob Nielsen",
        isTable: true,
        headers: ["N° Heurística", "Principio Clave", "Ejemplo en Apps Móviles"],
        rows: [
          ["1. Visibilidad del estado", "Informar siempre qué pasa en tiempo real", "Barras de progreso, spinners de carga, estados de envío"],
          ["2. Relación con el mundo real", "Usar lenguaje y conceptos familiares al usuario", "Metáforas como ícono de lupa para buscar o tacho para borrar"],
          ["3. Control y libertad", "Salidas de emergencia claras ante errores", "Botón deshacer (Undo), confirmación antes de salir"],
          ["4. Consistencia y estándares", "Mismos patrones en toda la app y la plataforma", "Pautas de diseño Material Design y convenciones táctiles"],
          ["5. Prevención de errores", "Diseñar para evitar fallas antes de que ocurran", "Botones de confirmación en dos pasos, validación en vivo"]
        ]
      },
      {
        tag: "Unidad 3 • Arquitectura & Estado",
        q: "ViewModel vs. onSaveInstanceState(Bundle)",
        isTable: true,
        headers: ["Criterio", "ViewModel (Jetpack Architecture)", "onSaveInstanceState (Bundle)"],
        rows: [
          ["Ubicación de almacenamiento", "Memoria RAM del proceso de la app", "Serializado en memoria del sistema operativo (disco/IPC)"],
          ["Sobrevive a cambios de config.", "✅ Sí (rotación de pantalla, modo oscuro)", "✅ Sí (rotación de pantalla)"],
          ["Sobrevive a muerte del proceso", "❌ No (si el SO mata la app por memoria, se pierde)", "✅ Sí (se restaura al reabrir la app recreada)"],
          ["Tipo y tamaño de datos", "Objetos complejos, listas, corrutinas, flows", "Primitivas livianas (&lt; 50 KB, ej. IDs, texto de input)"]
        ]
      }
    ];


if (typeof window !== "undefined") {
  window.flashcardsData = flashcardsData;
}
