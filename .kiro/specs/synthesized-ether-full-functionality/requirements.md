# Requirements Document

## Introduction

Synthesized Ether AI es una aplicación React + Vite + Tailwind CSS con un design system propio (glassmorphism, Material You tokens). Actualmente toda la UI está construida con datos mock y sin lógica real. Este documento define los requisitos para hacer la aplicación 100% funcional, cubriendo: estado global, integración con APIs de IA reales (OpenAI/Groq), Settings y Help funcionales, autenticación con persistencia de sesión, suite de tests, gestión robusta de avatares y una ruta `/metrics` propia.

---

## Glossary

- **App**: La aplicación React "Synthesized Ether AI" en su conjunto.
- **AuthManager**: El módulo responsable de gestionar el ciclo de vida de la sesión de usuario (login, logout, persistencia).
- **AppStore**: El store de estado global (Zustand) que centraliza leads, métricas, sesión de usuario y preferencias.
- **Alex**: El agente de ventas IA que opera en la página `/chat`.
- **SalesChat**: La página `/chat` donde el usuario interactúa con Alex.
- **Sandbox**: La página `/sandbox` donde el usuario sube PDFs y chatea con Llama 3 vía Groq.
- **Dashboard**: La página `/dashboard` con métricas y estado del entrenamiento de IA.
- **MetricsPage**: La página `/metrics` dedicada a visualización de métricas detalladas.
- **SettingsPage**: La página `/settings` con cuatro secciones configurables.
- **HelpPage**: La página `/help` con cuatro secciones de soporte.
- **AIProvider**: El servicio externo de IA (OpenAI o Groq) al que se conecta la App.
- **Lead**: Un registro de contacto capturado durante una sesión de SalesChat.
- **AvatarManager**: El módulo que gestiona la carga y fallback de imágenes de avatar.
- **TestSuite**: El conjunto de tests configurado con Vitest y React Testing Library.
- **SupportTicket**: Un formulario de soporte enviado desde HelpPage.
- **APIKey**: Una clave de API almacenada de forma segura en SettingsPage.

---

## Requirements

### Requirement 1: Estado Global con Zustand

**User Story:** Como desarrollador, quiero un store de estado global centralizado, para que los datos de leads, métricas y sesión de usuario sean accesibles y consistentes en toda la aplicación sin prop drilling.

#### Acceptance Criteria

1. THE AppStore SHALL proveer estado compartido para: sesión de usuario autenticado, lista de leads capturados, métricas del dashboard y preferencias de modelo de IA.
2. WHEN un Lead es capturado en SalesChat, THE AppStore SHALL actualizar la lista de leads y el contador de métricas de forma inmediata.
3. WHEN el usuario cierra sesión, THE AppStore SHALL limpiar todos los datos de sesión y leads del estado en memoria.
4. THE AppStore SHALL persistir las preferencias de modelo de IA y los datos de sesión en `localStorage` para sobrevivir recargas de página.
5. WHILE la App está montada, THE AppStore SHALL exponer selectores individuales para cada slice de estado, evitando re-renders innecesarios.

---

### Requirement 2: Integración con API de IA — SalesChat (Alex)

**User Story:** Como usuario, quiero que Alex responda usando una API de IA real, para que las conversaciones de ventas sean genuinamente inteligentes y contextualmente relevantes.

#### Acceptance Criteria

1. WHEN el usuario envía un mensaje en SalesChat, THE SalesChat SHALL enviar el historial de conversación completo a la API de OpenAI o Groq con un system prompt de ventas predefinido.
2. WHEN la API de IA devuelve una respuesta, THE SalesChat SHALL mostrar el texto de respuesta de Alex en el chat con la animación de "typing" existente.
3. IF la llamada a la API de IA falla, THEN THE SalesChat SHALL mostrar un mensaje de error inline en el chat sin interrumpir la sesión.
4. WHILE una llamada a la API de IA está en curso, THE SalesChat SHALL deshabilitar el campo de entrada y el botón de envío para prevenir envíos duplicados.
5. THE SalesChat SHALL leer la API key del AIProvider desde el AppStore (configurada en SettingsPage) y nunca exponerla en el código fuente.
6. WHEN el usuario envía un mensaje que contiene palabras clave de alta intención de compra, THE SalesChat SHALL actualizar el score de "Purchase Intent" en el panel lateral de Lead Scoring.

---

### Requirement 3: Integración con API de IA — Sandbox (Llama 3 / Groq)

**User Story:** Como usuario, quiero subir un PDF real y chatear con Llama 3 sobre su contenido, para poder extraer información de mis documentos de forma inteligente.

#### Acceptance Criteria

1. WHEN el usuario selecciona un archivo PDF en Sandbox, THE Sandbox SHALL subir el archivo, extraer su texto y almacenarlo en el contexto de la sesión actual.
2. WHEN el usuario envía un mensaje en Sandbox con un PDF cargado, THE Sandbox SHALL enviar el texto del PDF como contexto junto con la pregunta a la API de Groq con el modelo Llama 3.
3. WHEN la API de Groq devuelve una respuesta, THE Sandbox SHALL mostrar la respuesta de Llama 3 en el chat con el formato de código existente cuando corresponda.
4. IF el usuario intenta enviar un mensaje sin haber cargado un PDF, THEN THE Sandbox SHALL mostrar un aviso indicando que se requiere un documento.
5. IF la llamada a la API de Groq falla, THEN THE Sandbox SHALL mostrar un mensaje de error descriptivo en el chat.
6. WHILE el PDF está siendo procesado (extracción de texto), THE Sandbox SHALL mostrar el estado "Vectorizing..." en el panel de proceso lateral.
7. THE Sandbox SHALL leer la Groq API key desde el AppStore y nunca exponerla en el código fuente.

---

### Requirement 4: Settings Funcional — Profile Account

**User Story:** Como usuario, quiero gestionar mi perfil de agencia desde Settings, para que mi identidad y credenciales estén actualizadas en toda la aplicación.

#### Acceptance Criteria

1. WHEN el usuario abre la sección "Profile Account" en SettingsPage, THE SettingsPage SHALL mostrar un formulario con campos: nombre de agencia, email, y URL de avatar.
2. WHEN el usuario guarda cambios en el formulario de perfil, THE SettingsPage SHALL actualizar el AppStore con los nuevos datos de perfil.
3. WHEN el AppStore actualiza los datos de perfil, THE Layout SHALL reflejar el nuevo nombre de agencia y avatar en el sidebar de forma inmediata.
4. IF el usuario introduce un email con formato inválido, THEN THE SettingsPage SHALL mostrar un mensaje de validación inline sin enviar el formulario.

---

### Requirement 5: Settings Funcional — AI Model Preferences

**User Story:** Como usuario, quiero configurar el modelo de IA y los parámetros de creatividad, para que Alex y el Sandbox usen la configuración que mejor se adapte a mis necesidades.

#### Acceptance Criteria

1. WHEN el usuario abre la sección "AI Model Preferences" en SettingsPage, THE SettingsPage SHALL mostrar controles para: selección de modelo (GPT-4o, GPT-3.5-turbo, Llama 3 70B), temperatura (0.0–1.0) y longitud máxima de respuesta (tokens).
2. WHEN el usuario guarda las preferencias de modelo, THE AppStore SHALL persistir la configuración en `localStorage`.
3. WHEN SalesChat o Sandbox realizan una llamada a la API de IA, THE AIProvider SHALL usar los parámetros de modelo almacenados en el AppStore.

---

### Requirement 6: Settings Funcional — Notifications

**User Story:** Como usuario, quiero configurar qué alertas recibo, para que solo me notifiquen los eventos que me importan.

#### Acceptance Criteria

1. WHEN el usuario abre la sección "Notifications" en SettingsPage, THE SettingsPage SHALL mostrar toggles para: nuevo lead capturado, cambio de estado de agente IA, y resumen semanal por email.
2. WHEN el usuario cambia el estado de un toggle de notificación, THE AppStore SHALL persistir la preferencia actualizada en `localStorage`.
3. WHILE la preferencia de "nuevo lead capturado" está activa, THE App SHALL mostrar una notificación visual en el navbar cuando un nuevo Lead sea añadido al AppStore.

---

### Requirement 7: Settings Funcional — Security & API Keys

**User Story:** Como usuario, quiero gestionar mis API keys de forma segura desde Settings, para que las integraciones con OpenAI y Groq funcionen sin exponer credenciales en el código.

#### Acceptance Criteria

1. WHEN el usuario abre la sección "Security & API Keys" en SettingsPage, THE SettingsPage SHALL mostrar campos de entrada enmascarados (tipo password) para: OpenAI API Key y Groq API Key.
2. WHEN el usuario guarda una API key, THE AppStore SHALL almacenarla en `localStorage` con el valor visible solo en el campo de entrada de SettingsPage.
3. THE SettingsPage SHALL proveer un botón "Reveal" por campo que alterna la visibilidad del valor de la API key.
4. IF el usuario intenta guardar una API key vacía, THEN THE SettingsPage SHALL mostrar un aviso de validación sin sobrescribir la clave existente.

---

### Requirement 8: Help Funcional — Documentation

**User Story:** Como usuario, quiero acceder a la documentación del producto desde Help, para poder aprender a usar las funcionalidades de la plataforma.

#### Acceptance Criteria

1. WHEN el usuario hace clic en "Documentation" en HelpPage, THE HelpPage SHALL expandir una sección con artículos de documentación organizados por categoría (Getting Started, API Integration, Sales Chat, Sandbox).
2. THE HelpPage SHALL mostrar al menos 3 artículos de documentación con título, descripción breve y un enlace "Read More" por cada categoría.

---

### Requirement 9: Help Funcional — Community Discord

**User Story:** Como usuario, quiero acceder al Discord de la comunidad desde Help, para conectar con otros usuarios de la plataforma.

#### Acceptance Criteria

1. WHEN el usuario hace clic en "Community Discord" en HelpPage, THE HelpPage SHALL abrir el enlace de Discord en una nueva pestaña del navegador.
2. THE HelpPage SHALL mostrar el número de miembros activos de la comunidad (valor configurable, puede ser estático inicialmente).

---

### Requirement 10: Help Funcional — API Reference

**User Story:** Como usuario, quiero consultar la referencia de la API desde Help, para poder integrar Synthesized Ether con mis propios sistemas.

#### Acceptance Criteria

1. WHEN el usuario hace clic en "API Reference" en HelpPage, THE HelpPage SHALL expandir una sección con los endpoints disponibles, sus parámetros y ejemplos de respuesta en formato de código.
2. THE HelpPage SHALL mostrar al menos los endpoints: `POST /api/chat`, `POST /api/sandbox/upload`, `GET /api/leads`.

---

### Requirement 11: Help Funcional — Direct Support (Ticket)

**User Story:** Como usuario, quiero enviar un ticket de soporte directamente desde Help, para recibir asistencia del equipo de ingeniería sin salir de la aplicación.

#### Acceptance Criteria

1. WHEN el usuario hace clic en "Direct Support" en HelpPage, THE HelpPage SHALL mostrar un formulario con campos: asunto, descripción del problema y nivel de prioridad (Low, Medium, High).
2. WHEN el usuario envía el formulario de soporte, THE HelpPage SHALL mostrar un mensaje de confirmación con un número de ticket generado.
3. IF el usuario intenta enviar el formulario con campos obligatorios vacíos, THEN THE HelpPage SHALL mostrar mensajes de validación inline por campo.
4. WHEN el formulario de SupportTicket es enviado, THE HelpPage SHALL deshabilitar el botón de envío durante el proceso para prevenir envíos duplicados.

---

### Requirement 12: Autenticación — Login y Persistencia de Sesión

**User Story:** Como usuario, quiero un flujo de login/logout real con persistencia de sesión, para que mi workspace esté protegido y mi sesión se mantenga entre recargas.

#### Acceptance Criteria

1. THE App SHALL mostrar una página de Login cuando el usuario no tenga una sesión activa, bloqueando el acceso a todas las rutas protegidas (`/dashboard`, `/chat`, `/sandbox`, `/settings`, `/help`, `/metrics`).
2. WHEN el usuario introduce credenciales válidas y hace clic en "Sign In", THE AuthManager SHALL crear una sesión y almacenar el token en `localStorage`.
3. WHEN el usuario recarga la página, THE AuthManager SHALL leer el token de `localStorage` y restaurar la sesión sin requerir nuevo login.
4. WHEN el usuario hace clic en "Sign Out" en el sidebar, THE AuthManager SHALL eliminar el token de `localStorage`, limpiar el AppStore y redirigir al usuario a la página de Login.
5. IF el usuario introduce credenciales inválidas, THEN THE AuthManager SHALL mostrar un mensaje de error en el formulario de Login sin revelar si el email o la contraseña son incorrectos.
6. THE App SHALL redirigir al usuario a la ruta que intentaba acceder originalmente después de un login exitoso.

---

### Requirement 13: Ruta /metrics — Página de Métricas Dedicada

**User Story:** Como usuario, quiero una página `/metrics` propia con visualizaciones detalladas, para analizar el rendimiento de mis agentes IA de forma independiente al dashboard principal.

#### Acceptance Criteria

1. THE App SHALL registrar la ruta `/metrics` como una página independiente en el router, distinta de `/dashboard`.
2. THE MetricsPage SHALL mostrar métricas detalladas incluyendo: total de interacciones, tasa de conversión, tiempo promedio de sesión, y distribución de sentimiento por período.
3. WHEN el usuario navega a `/metrics`, THE Layout SHALL marcar el ítem "Metrics" del sidebar como activo.
4. THE MetricsPage SHALL leer los datos de métricas desde el AppStore para mostrar valores actualizados en tiempo real.
5. THE MetricsPage SHALL incluir un selector de rango de fechas (Últimos 7 días, 30 días, 90 días) que filtre las métricas mostradas.

---

### Requirement 14: Gestión de Avatares — Assets Locales y Fallback

**User Story:** Como desarrollador, quiero que los avatares usen assets locales o placeholders robustos, para que la UI no se rompa cuando las URLs externas de Google no estén disponibles.

#### Acceptance Criteria

1. THE AvatarManager SHALL proveer un componente `<Avatar>` que intente cargar la imagen desde la URL configurada y muestre un placeholder generado con las iniciales del nombre si la carga falla.
2. WHEN una imagen de avatar falla al cargar (error de red o URL inválida), THE AvatarManager SHALL mostrar un placeholder con las iniciales del usuario sobre un fondo de color derivado del nombre, sin mostrar el ícono roto del navegador.
3. THE App SHALL reemplazar todas las etiquetas `<img>` de avatar existentes en Layout, SalesChat y Dashboard por el componente `<Avatar>`.
4. THE Avatar component SHALL aceptar las props: `src` (URL opcional), `name` (string para iniciales), `size` (número en píxeles), y `className` (string opcional).

---

### Requirement 15: Suite de Tests — Configuración y Tests de Componentes Clave

**User Story:** Como desarrollador, quiero una suite de tests configurada con Vitest y React Testing Library, para poder verificar el comportamiento de los componentes clave con confianza.

#### Acceptance Criteria

1. THE TestSuite SHALL estar configurada con Vitest y `@testing-library/react` como dependencias de desarrollo.
2. THE TestSuite SHALL incluir tests para el componente `<Avatar>`: renderizado con imagen válida, renderizado con fallback de iniciales, y renderizado con prop `name` vacío.
3. THE TestSuite SHALL incluir tests para el AppStore: inicialización del estado, adición de un Lead, limpieza de sesión al logout.
4. THE TestSuite SHALL incluir tests para el componente `<SalesChat>`: envío de mensaje actualiza la lista de mensajes, el campo de entrada se deshabilita mientras la API está en curso.
5. THE TestSuite SHALL incluir tests para el flujo de autenticación: redirección a Login cuando no hay sesión, restauración de sesión desde `localStorage`.
6. WHEN se ejecuta el comando `npm test`, THE TestSuite SHALL ejecutar todos los tests y reportar resultados sin modo watch.
7. THE TestSuite SHALL incluir una prueba de propiedad (property-based test) para el componente `<Avatar>`: para cualquier string `name` no vacío, el placeholder generado SHALL contener al menos una inicial visible.
