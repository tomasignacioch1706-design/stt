/**
 * CHRONO-NYC: Mapa de Selección de Niveles Retro (HTML5 Canvas)
 * Motor de juego procedural con estética pixel-art neoyorquina y viajes en el tiempo.
 */

// ==========================================
// 1. AUDIO SYNTHESIZER (Web Audio API)
// ==========================================
class RetroAudio {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.bgmPlaying = false;
    this.bgmTimer = null;
    this.stepCounter = 0;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    if (!this.enabled && this.bgmTimer) {
      clearInterval(this.bgmTimer);
      this.bgmPlaying = false;
    }
    return this.enabled;
  }

  // Sonido de paso / movimiento
  playFootstep() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'triangle';
    const freq = this.stepCounter % 2 === 0 ? 160 : 190;
    this.stepCounter++;
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(70, now + 0.08);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  // Sonido de error al intentar entrar a un nivel con candado
  playLockedError() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    
    // Tono grave bajo doble estilo arcade "bzz-bzz"
    [0, 0.1].forEach((delay, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(idx === 0 ? 110 : 95, now + delay);
      osc.frequency.setValueAtTime(80, now + delay + 0.08);

      gain.gain.setValueAtTime(0.15, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.09);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + 0.09);
    });
  }

  // Sonido de llegada a un nodo
  playArrive() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(330, now);
    osc.frequency.setValueAtTime(440, now + 0.06);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  // Sonido de salto temporal al presionar Espacio
  playTimeWarp() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // Arpegio cósmico ascendente
    const freqs = [220, 330, 440, 554, 659, 880, 1108, 1318];
    freqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = now + idx * 0.04;

      osc.type = idx % 2 === 0 ? 'sine' : 'sawtooth';
      osc.frequency.setValueAtTime(freq, startTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, startTime + 0.15);

      gain.gain.setValueAtTime(0.12, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.18);
    });
  }

  // Sonido de salto en el nivel
  playJump() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(420, now + 0.12);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  // Sonido de recolección de crono-cristal
  playCollect() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = now + idx * 0.045;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.14);
    });
  }

  // Fanfarria triunfal de victoria al restaurar la época
  playVictory() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [
      { f: 523, d: 0.12 },
      { f: 659, d: 0.12 },
      { f: 783, d: 0.12 },
      { f: 1046, d: 0.4 }
    ];

    let t = now;
    notes.forEach(n => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.f, t);

      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + n.d);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + n.d);
      t += n.d * 0.9;
    });
  }
}

const audio = new RetroAudio();


// ==========================================
// 2. DATOS DE LOS NIVELES Y ÉPOCAS HISTÓRICAS
// ==========================================
const LEVELS = [
  {
    id: 1,
    year: 1920,
    title: "1920: ERA DEL JAZZ",
    sub: "Prohibición & Speakeasy",
    district: "Lower Manhattan & DUMBO",
    x: 120,
    y: 390,
    unlocked: true,
    themeColor: "#f59e0b", // Ámbar cálido Art Déco
    badgeColor: "#d97706",
    mission: "Encontrar la bobina cuántica escondida en el club subterráneo 'The Cotton Vault'.",
    danger: "Contrabandistas armados y agentes de la Ley Seca.",
    details: "El viajero llega a la vibrante Nueva York de los años 20. El jazz resuena en las aceras mojadas mientras los primeros rascacielos desafían las nubes.",
    connections: [2] // Conectado al nivel 2
  },
  {
    id: 2,
    year: 1880,
    title: "1880: ERA DORADA & VAPOR",
    sub: "Gilded Age & Carbón",
    district: "Brooklyn Bridge & Fundiciones",
    x: 260,
    y: 240,
    unlocked: false,
    themeColor: "#e67e22", // Bronce industrial
    badgeColor: "#b45309",
    mission: "Reparar el regulador de vapor en la torre en construcción del Puente de Brooklyn.",
    danger: "Vapor a alta presión, engranajes gigantes y magnates rivales.",
    details: "Adoquines, carruajes de caballos y la silueta del Puente de Brooklyn creciendo sobre el East River iluminado por farolas de gas tenue.",
    connections: [1, 3] // Conectado a 1 y 3
  },
  {
    id: 3,
    year: 1970,
    title: "1970: METRO & GRAFFITI",
    sub: "Bronx & Movimiento Disco",
    district: "The Bronx / Línea 6 del Metro",
    x: 410,
    y: 400,
    unlocked: false,
    themeColor: "#ec4899", // Rosa neón / pintura aerosol
    badgeColor: "#be185d",
    mission: "Interceptar el cassette con la señal temporal en el vagón de metro grafiteado.",
    danger: "Pandillas urbanas, apagón en el túnel subterráneo y detectives.",
    details: "La Nueva York analógica y rebelde de los 70. Los vagones de metro metálicos cubiertos de arte aerosol y pistas de baile con bolas de espejos.",
    connections: [2, 4] // Conectado a 2 y 4
  },
  {
    id: 4,
    year: 1990,
    title: "1990: TIMES SQUARE NEÓN",
    sub: "Grunge & Salas Arcade",
    district: "Midtown Manhattan / Calle 42",
    x: 560,
    y: 230,
    unlocked: false,
    themeColor: "#06b6d4", // Cian 90s
    badgeColor: "#0e7490",
    mission: "Descargar el código temporal desde un cibercafé antes del reinicio del sistema.",
    danger: "Virus informáticos primitivos y agentes corporativos.",
    details: "Times Square en su auge de carteles de neón, salas de máquinas recreativas arcade de 16-bits, cabinas telefónicas y asfalto reflectante.",
    connections: [3, 5] // Conectado a 3 y 5
  },
  {
    id: 5,
    year: 2026,
    title: "2026: MANHATTAN ACTUAL",
    sub: "Día Soleado & Rascacielos de Cristal",
    district: "5th Avenue & Central Park South",
    x: 710,
    y: 390,
    unlocked: false,
    themeColor: "#0284c7", // Azul eléctrico / cielo diurno
    badgeColor: "#0369a1",
    mission: "Sincronizar el smartphone cuántico en la antena de la 5ª Avenida.",
    danger: "Tráfico denso de patinetes eléctricos y drones de reparto comercial.",
    details: "Nueva York en pleno siglo XXI bajo la radiante luz del sol. Rascacielos de cristal azul, cafeterías modernas, carritos de hot dogs y taxis híbridos.",
    connections: [4, 6] // Conectado a 4 y 6
  },
  {
    id: 6,
    year: 2150,
    title: "2150: NEO-MANHATTAN",
    sub: "Cyberpunk & Taxis Voladores",
    district: "Central Park Quantum Spire",
    x: 860,
    y: 240,
    unlocked: false,
    themeColor: "#a855f7", // Violeta holográfico
    badgeColor: "#7e22ce",
    mission: "Sellar la grieta temporal en la cúspide de la torre holográfica cuántica.",
    danger: "Drones centinela de seguridad temporal y micro-agujeros de gusano.",
    details: "El futuro de la Gran Manzana. Rascacielos kilométricos con pasarelas aéreas y formas geométricas audaces, autopistas de luz y taxis voladores.",
    connections: [5] // Conectado a 5
  }
];

// Rutas detalladas entre nodos para que el avatar camine siguiendo calles/curvas
const PATH_WAYPOINTS = {
  "1-2": [
    { x: 120, y: 390 },
    { x: 170, y: 370 },
    { x: 210, y: 290 },
    { x: 260, y: 240 }
  ],
  "2-3": [
    { x: 260, y: 240 },
    { x: 310, y: 270 },
    { x: 360, y: 360 },
    { x: 410, y: 400 }
  ],
  "3-4": [
    { x: 410, y: 400 },
    { x: 460, y: 370 },
    { x: 510, y: 270 },
    { x: 560, y: 230 }
  ],
  "4-5": [
    { x: 560, y: 230 },
    { x: 610, y: 260 },
    { x: 660, y: 350 },
    { x: 710, y: 390 }
  ],
  "5-6": [
    { x: 710, y: 390 },
    { x: 760, y: 370 },
    { x: 810, y: 280 },
    { x: 860, y: 240 }
  ]
};

// Generador de clave de ruta bidireccional
function getPathPoints(fromId, toId) {
  const directKey = `${fromId}-${toId}`;
  if (PATH_WAYPOINTS[directKey]) {
    return PATH_WAYPOINTS[directKey];
  }
  const reverseKey = `${toId}-${fromId}`;
  if (PATH_WAYPOINTS[reverseKey]) {
    return [...PATH_WAYPOINTS[reverseKey]].reverse();
  }
  // Fallback línea recta
  const fromNode = LEVELS.find(n => n.id === fromId);
  const toNode = LEVELS.find(n => n.id === toId);
  return [{ x: fromNode.x, y: fromNode.y }, { x: toNode.x, y: toNode.y }];
}


// ==========================================
// 3. ESTADO DEL JUEGO
// ==========================================
const canvas = document.getElementById('mapCanvas');
const ctx = canvas.getContext('2d');

const state = {
  currentScene: 'MAP',    // 'MAP' | 'TRANSITION' | 'LEVEL' | 'VICTORY'
  currentLevelId: 1,      // Nivel donde está parado el jugador actualmente
  targetLevelId: 1,       // Nivel hacia el que se está desplazando
  isMoving: false,        // ¿El avatar está caminando entre nodos?
  movePath: [],           // Puntos actuales de la trayectoria
  moveSegmentIdx: 0,      // Índice del segmento actual
  moveProgress: 0,        // 0 a 1 en el segmento actual
  moveSpeed: 0.05,        // Velocidad de avance
  playerX: 120,
  playerY: 390,
  facingLeft: false,
  walkCycle: 0,           // Para animación de piernas y reloj
  
  // Teclas y controles
  keysDown: {},

  // Estado del nivel jugable de la época
  levelData: null,
  transitionTimer: 0,
  transitionDuration: 40,
  transitionTarget: 'LEVEL',
  sparkleParticles: [],
  victoryFireworks: [],

  // Efectos visuales del mapa
  lockShakeTimer: 0,      // Animación de sacudida al rebotar en candado
  lockShakeNodeId: null,  // Qué candado se sacude
  timeWarpActive: false,  // Animación del vórtice de salto temporal
  timeWarpProgress: 0,
  timeWarpOrigin: { x: 120, y: 390 },
  
  // Partículas y vapor de alcantarillas
  steamParticles: [],
  stars: [],
  neonBlinkTimer: 0,
  roadPulseOffset: 0
};

// Generar estrellas fijas de fondo
for (let i = 0; i < 70; i++) {
  state.stars.push({
    x: Math.random() * 960,
    y: Math.random() * 220,
    size: Math.random() > 0.8 ? 2 : 1,
    twinkleSpeed: 0.02 + Math.random() * 0.05,
    alpha: Math.random()
  });
}

// Inicializar fuentes de vapor de alcantarillas estilo NYC
const STEAM_VENTS = [
  { x: 190, y: 440 },
  { x: 420, y: 450 },
  { x: 670, y: 430 }
];


// ==========================================
// 4. SISTEMA DE MOVIMIENTO Y VALIDACIÓN
// ==========================================
function moveTowardsNode(targetId) {
  if (state.isMoving || state.timeWarpActive) return;

  const currentNode = LEVELS.find(l => l.id === state.currentLevelId);
  const targetNode = LEVELS.find(l => l.id === targetId);

  if (!currentNode || !targetNode) return;

  // Verificar si hay conexión directa entre los nodos
  if (!currentNode.connections.includes(targetId)) {
    // Si no es conexión inmediata, buscar si hay camino a través de vecinos
    return;
  }

  // Comprobar si el nodo objetivo está desbloqueado
  if (!targetNode.unlocked) {
    // ¡BLOQUEADO! Disparar feedback sonoro y animación de rebote en el candado
    triggerLockFeedback(targetNode);
    return;
  }

  // Iniciar viaje fluido a lo largo del camino
  state.isMoving = true;
  state.targetLevelId = targetId;
  state.movePath = getPathPoints(currentNode.id, targetId);
  state.moveSegmentIdx = 0;
  state.moveProgress = 0;

  // Orientar al personaje
  state.facingLeft = targetNode.x < currentNode.x;

  updateHUD();
}

// Disparar animación y sonido de candado bloqueado
function triggerLockFeedback(node) {
  state.lockShakeNodeId = node.id;
  state.lockShakeTimer = 25; // frames de sacudida
  audio.playLockedError();
  showToast(`🔒 ¡NIVEL BLOQUEADO! Completa el Nivel ${node.id - 1} (${LEVELS[node.id - 2]?.year || ''}) primero`);
}

// Procesar entrada direccional (Flechas / WASD)
function handleDirectionalInput(direction) {
  if (state.isMoving || state.timeWarpActive) return;

  const current = LEVELS.find(l => l.id === state.currentLevelId);
  if (!current) return;

  let chosenTarget = null;

  // Lógica inteligente según la posición del grafo neoyorquino
  if (direction === 'right' || direction === 'up') {
    // Intenta avanzar al siguiente nivel hacia la derecha
    const nextHigher = current.connections.find(id => id > current.id);
    if (nextHigher) {
      chosenTarget = nextHigher;
    }
  } else if (direction === 'left' || direction === 'down') {
    // Intenta retroceder al nivel anterior hacia la izquierda
    const prevLower = current.connections.find(id => id < current.id);
    if (prevLower) {
      chosenTarget = prevLower;
    }
  }

  if (chosenTarget) {
    moveTowardsNode(chosenTarget);
  }
}

// Activar el nivel actual con la barra espaciadora
function activateCurrentLevel() {
  if (state.isMoving || state.timeWarpActive) return;

  const current = LEVELS.find(l => l.id === state.currentLevelId);
  if (!current) return;

  if (!current.unlocked) {
    triggerLockFeedback(current);
    return;
  }

  // Iniciar efecto de distorsión temporal (Time Warp)
  state.timeWarpActive = true;
  state.timeWarpProgress = 0;
  state.timeWarpOrigin = { x: state.playerX, y: state.playerY };
  audio.playTimeWarp();

  // Abrir modal informativo tras la animación
  setTimeout(() => {
    openLevelModal(current);
    state.timeWarpActive = false;
  }, 650);
}


// ==========================================
// 5. RENDERIZADO GRÁFICO PROCEDURAL (CANVAS 2D)
// ==========================================

// Dibujar el cielo nocturno y luna de Nueva York
function drawSky() {
  // Gradiente crepuscular
  const skyGrad = ctx.createLinearGradient(0, 0, 0, 360);
  skyGrad.addColorStop(0, '#060714');
  skyGrad.addColorStop(0.5, '#12122b');
  skyGrad.addColorStop(0.85, '#2b1b46');
  skyGrad.addColorStop(1, '#441d40');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, 960, 540);

  // Estrellas parpadeantes
  state.stars.forEach(star => {
    star.alpha += star.twinkleSpeed;
    const a = 0.3 + Math.sin(star.alpha) * 0.4;
    ctx.fillStyle = `rgba(220, 230, 255, ${Math.max(0.1, a)})`;
    ctx.fillRect(star.x, star.y, star.size, star.size);
  });

  // Luna pixel-art vintage sobre el East River
  ctx.fillStyle = '#fffae0';
  ctx.beginPath();
  ctx.arc(830, 75, 26, 0, Math.PI * 2);
  ctx.fill();

  // Sombra de la luna para efecto creciente
  ctx.fillStyle = '#0f1124';
  ctx.beginPath();
  ctx.arc(820, 72, 23, 0, Math.PI * 2);
  ctx.fill();

  // Brillo suave lunar
  ctx.strokeStyle = 'rgba(255, 250, 224, 0.15)';
  ctx.lineWidth = 6;
  ctx.stroke();
}

// Dibujar siluetas del Skyline de Manhattan (capas de paralaje)
function drawManhattanSkyline() {
  // Capa 1: Rascacielos lejanos (azules oscuros y púrpuras)
  ctx.fillStyle = '#171a33';
  const distantBuildings = [
    { x: 30, w: 55, h: 220 },
    { x: 95, w: 40, h: 260 },
    { x: 145, w: 70, h: 320, antenna: true }, // Estilo Empire State
    { x: 225, w: 50, h: 240 },
    { x: 285, w: 60, h: 290, artDeco: true }, // Estilo Chrysler
    { x: 355, w: 45, h: 210 },
    { x: 410, w: 65, h: 270 },
    { x: 485, w: 50, h: 230 },
    { x: 545, w: 75, h: 310, antenna: true },
    { x: 630, w: 45, h: 250 },
    { x: 685, w: 80, h: 330, artDeco: true },
    { x: 775, w: 60, h: 260 },
    { x: 845, w: 50, h: 220 },
    { x: 905, w: 55, h: 270 }
  ];

  distantBuildings.forEach(b => {
    const top = 380 - b.h;
    ctx.fillRect(b.x, top, b.w, b.h);

    // Aguja Art Déco
    if (b.artDeco) {
      ctx.beginPath();
      ctx.moveTo(b.x + b.w / 2, top - 35);
      ctx.lineTo(b.x + b.w * 0.8, top);
      ctx.lineTo(b.x + b.w * 0.2, top);
      ctx.closePath();
      ctx.fill();

      // Luz parpadeante en la punta
      ctx.fillStyle = (Math.floor(Date.now() / 400) % 2 === 0) ? '#ff3366' : '#ffffff';
      ctx.fillRect(b.x + b.w / 2 - 2, top - 38, 4, 4);
      ctx.fillStyle = '#171a33';
    }

    // Antena con luz de advertencia para aeronaves
    if (b.antenna) {
      ctx.fillRect(b.x + b.w / 2 - 2, top - 45, 4, 45);
      ctx.fillStyle = (Math.floor(Date.now() / 300) % 2 === 0) ? '#ff2222' : '#aa0000';
      ctx.fillRect(b.x + b.w / 2 - 3, top - 48, 6, 6);
      ctx.fillStyle = '#171a33';
    }

    // Ventanas lejanas iluminadas al azar
    ctx.fillStyle = 'rgba(255, 235, 140, 0.4)';
    for (let wy = top + 20; wy < 360; wy += 14) {
      for (let wx = b.x + 8; wx < b.x + b.w - 10; wx += 10) {
        if ((wx * 17 + wy * 31) % 5 === 0) {
          ctx.fillRect(wx, wy, 4, 6);
        }
      }
    }
    ctx.fillStyle = '#171a33';
  });

  // Capa 2: Edificios medianos de ladrillo tipo Brownstone y torres de agua (Water Tanks)
  ctx.fillStyle = '#0f1224';
  const midBuildings = [
    { x: 0, w: 110, h: 170, tank: true },
    { x: 120, w: 90, h: 140 },
    { x: 220, w: 100, h: 190, tank: true },
    { x: 330, w: 85, h: 130 },
    { x: 425, w: 95, h: 180, tank: true },
    { x: 530, w: 105, h: 150 },
    { x: 645, w: 80, h: 175, tank: true },
    { x: 735, w: 110, h: 140 },
    { x: 855, w: 105, h: 180, tank: true }
  ];

  midBuildings.forEach(b => {
    const top = 410 - b.h;
    ctx.fillStyle = '#0c0f1e';
    ctx.fillRect(b.x, top, b.w, b.h);

    // Escaleras de incendios emblemáticas de Nueva York (Fire Escapes)
    ctx.strokeStyle = '#1e2640';
    ctx.lineWidth = 2;
    for (let fy = top + 25; fy < 410; fy += 28) {
      ctx.strokeRect(b.x + 6, fy, b.w - 12, 12);
      ctx.beginPath();
      ctx.moveTo(b.x + 12, fy + 12);
      ctx.lineTo(b.x + b.w - 18, fy + 28);
      ctx.stroke();
    }

    // Depósito de agua icónico de madera (Water Tank) en el tejado
    if (b.tank) {
      const tankX = b.x + 20;
      const tankY = top - 32;
      // Patas de metal
      ctx.strokeStyle = '#1a2238';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(tankX + 4, top);
      ctx.lineTo(tankX + 10, tankY + 20);
      ctx.moveTo(tankX + 26, top);
      ctx.lineTo(tankX + 20, tankY + 20);
      ctx.stroke();

      // Barril cilíndrico
      ctx.fillStyle = '#3a2518';
      ctx.fillRect(tankX + 5, tankY, 20, 20);
      // Techo cónico
      ctx.fillStyle = '#533422';
      ctx.beginPath();
      ctx.moveTo(tankX + 15, tankY - 10);
      ctx.lineTo(tankX + 30, tankY);
      ctx.lineTo(tankX, tankY);
      ctx.closePath();
      ctx.fill();
    }
  });

  // Letreros de Neón parpadeantes en la ciudad
  drawNeonSigns();
}

// Dibujar carteles de neón retro (Broadway / Subway / Hotel)
function drawNeonSigns() {
  const t = Math.floor(Date.now() / 250);

  // Cartel 1: "SUBWAY"
  ctx.font = 'bold 9px monospace';
  ctx.fillStyle = (t % 7 === 0) ? '#444' : '#00f3ff';
  ctx.shadowColor = '#00f3ff';
  ctx.shadowBlur = 8;
  ctx.fillText('● SUBWAY NYC', 60, 220);

  // Cartel 2: "RADIO"
  ctx.fillStyle = (t % 5 === 0) ? '#444' : '#ff2a85';
  ctx.shadowColor = '#ff2a85';
  ctx.shadowBlur = 8;
  ctx.fillText('RADIO CITY', 430, 160);

  // Cartel 3: "TIME LEAP TAXI"
  ctx.fillStyle = (t % 9 === 0) ? '#444' : '#ffb830';
  ctx.shadowColor = '#ffb830';
  ctx.shadowBlur = 8;
  ctx.fillText('CHRONO CAB 24/7', 710, 140);

  ctx.shadowBlur = 0; // reset
}

// Dibujar las calles, puentes y vías que interconectan los 5 niveles
function drawInterconnectedPaths() {
  state.roadPulseOffset = (state.roadPulseOffset + 0.4) % 24;

  const paths = [
    { from: 1, to: 2, unlocked: LEVELS[1].unlocked },
    { from: 2, to: 3, unlocked: LEVELS[2].unlocked },
    { from: 3, to: 4, unlocked: LEVELS[3].unlocked },
    { from: 4, to: 5, unlocked: LEVELS[4].unlocked },
    { from: 5, to: 6, unlocked: LEVELS[5].unlocked }
  ];

  paths.forEach(p => {
    const points = getPathPoints(p.from, p.to);
    if (!points || points.length < 2) return;

    // 1. Base ancha de asfalto / carretera retro
    ctx.lineWidth = 18;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#090c18';
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();

    // 2. Bordes de acera iluminados
    ctx.lineWidth = 14;
    ctx.strokeStyle = p.unlocked ? '#1b264a' : '#141724';
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();

    // 3. Vía central / rieles de metro
    ctx.lineWidth = 6;
    ctx.strokeStyle = p.unlocked ? '#00f3ff' : '#2d3748';
    if (p.unlocked) {
      ctx.shadowColor = '#00f3ff';
      ctx.shadowBlur = 10;
    }
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // 4. Luces cuánticas secuenciales a lo largo del camino desbloqueado
    if (p.unlocked) {
      ctx.save();
      ctx.lineWidth = 3;
      ctx.setLineDash([6, 12]);
      ctx.lineDashOffset = -state.roadPulseOffset;
      ctx.strokeStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.stroke();
      ctx.restore();
    } else {
      // Línea punteada roja/bloqueada tenue
      ctx.save();
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 10]);
      ctx.strokeStyle = '#471c26';
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.stroke();
      ctx.restore();
    }
  });
}

// Dibujar los 5 nodos de nivel (estaciones temporales)
function drawLevelNodes() {
  LEVELS.forEach(node => {
    const isCurrent = (state.currentLevelId === node.id && !state.isMoving);
    const isShaking = (state.lockShakeNodeId === node.id && state.lockShakeTimer > 0);
    
    let drawX = node.x;
    let drawY = node.y;

    if (isShaking) {
      drawX += (Math.random() - 0.5) * 8;
      drawY += (Math.random() - 0.5) * 8;
    }

    // Halo palpitante si el jugador está parado en este nodo
    if (isCurrent) {
      const pulse = Math.sin(Date.now() / 180) * 6;
      ctx.beginPath();
      ctx.arc(drawX, drawY, 34 + pulse, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 243, 255, 0.2)';
      ctx.fill();
      ctx.strokeStyle = '#00f3ff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Base del nodo circular
    ctx.save();
    ctx.beginPath();
    ctx.arc(drawX, drawY, 26, 0, Math.PI * 2);
    ctx.fillStyle = node.unlocked ? '#0b1120' : '#11131a';
    ctx.fill();

    // Anillo exterior de neón
    ctx.lineWidth = node.unlocked ? 4 : 2;
    ctx.strokeStyle = node.unlocked ? node.themeColor : '#334155';
    if (node.unlocked) {
      ctx.shadowColor = node.themeColor;
      ctx.shadowBlur = 12;
    }
    ctx.stroke();
    ctx.restore();

    // Contenido interno del nodo:
    if (node.unlocked) {
      // ICONO DE ÉPOCA DESBLOQUEADA
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.id.toString(), drawX, drawY - 1);

      // Badge superior de año con fondo oscuro de alto contraste
      ctx.save();
      ctx.font = 'bold 9px "Press Start 2P", monospace';
      const yearStr = `${node.year}`;
      const yearW = ctx.measureText(yearStr).width;
      ctx.fillStyle = 'rgba(10, 13, 26, 0.9)';
      ctx.fillRect(drawX - yearW / 2 - 5, drawY - 48, yearW + 10, 16);
      ctx.strokeStyle = node.themeColor;
      ctx.lineWidth = 1;
      ctx.strokeRect(drawX - yearW / 2 - 5, drawY - 48, yearW + 10, 16);
      ctx.fillStyle = node.themeColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(yearStr, drawX, drawY - 39);
      ctx.restore();

      // Título y subtexto en badge inferior
      ctx.save();
      ctx.font = '10px "Share Tech Mono", monospace';
      const subW = ctx.measureText(node.sub).width;
      ctx.fillStyle = 'rgba(10, 13, 26, 0.85)';
      ctx.fillRect(drawX - subW / 2 - 4, drawY + 34, subW + 8, 16);
      ctx.fillStyle = '#e2e8f0';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.sub, drawX, drawY + 42);
      ctx.restore();

      // Pequeño indicador de "LISTO [ESPACIO]" si el jugador está en este nodo
      if (isCurrent) {
        ctx.font = '8px "Press Start 2P", monospace';
        ctx.fillStyle = '#39ff14';
        const blink = Math.floor(Date.now() / 300) % 2 === 0;
        if (blink) {
          ctx.fillText('▶ ESPACIO', drawX, drawY + 58);
        }
      }
    } else {
      // ICONO DE CANDADO RETRO (PIXEL ART)
      drawRetroPadlock(drawX, drawY, isShaking);

      // Badge de año atenuado
      ctx.save();
      ctx.font = 'bold 9px "Press Start 2P", monospace';
      const yearStr = `${node.year}`;
      const yearW = ctx.measureText(yearStr).width;
      ctx.fillStyle = 'rgba(10, 13, 26, 0.9)';
      ctx.fillRect(drawX - yearW / 2 - 5, drawY - 48, yearW + 10, 16);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.strokeRect(drawX - yearW / 2 - 5, drawY - 48, yearW + 10, 16);
      ctx.fillStyle = '#94a3b8';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(yearStr, drawX, drawY - 39);
      ctx.restore();

      // Etiqueta "BLOQUEADO"
      ctx.save();
      ctx.font = '8px "Press Start 2P", monospace';
      const lockText = 'BLOQUEADO';
      const lockW = ctx.measureText(lockText).width;
      ctx.fillStyle = 'rgba(10, 13, 26, 0.85)';
      ctx.fillRect(drawX - lockW / 2 - 4, drawY + 34, lockW + 8, 15);
      ctx.fillStyle = isShaking ? '#ff4444' : '#ef4444';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(lockText, drawX, drawY + 42);
      ctx.restore();
    }
  });
}

// Dibujar candado pixel-art detallado
function drawRetroPadlock(x, y, isRedAlert) {
  ctx.save();
  ctx.translate(x, y - 2);

  const shackleColor = isRedAlert ? '#ff6666' : '#cbd5e1';
  const bodyColor = isRedAlert ? '#dc2626' : '#eab308';
  const keyholeColor = '#1e1b18';

  // Arco metálico del candado (Shackle)
  ctx.strokeStyle = shackleColor;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.arc(0, -5, 7, Math.PI, 0, false);
  ctx.lineTo(7, 2);
  ctx.moveTo(-7, -5);
  ctx.lineTo(-7, 2);
  ctx.stroke();

  // Cuerpo del candado (dorado o alerta roja si vibra)
  ctx.fillStyle = bodyColor;
  ctx.fillRect(-10, 0, 20, 15);
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(-10, 0, 20, 15);

  // Ojo de la cerradura (Keyhole)
  ctx.fillStyle = keyholeColor;
  ctx.beginPath();
  ctx.arc(0, 5, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(-1.5, 5, 3, 5);

  ctx.restore();
}

// Dibujar el avatar del hombre viajero en el tiempo (Pixel Art)
function drawTimeTraveler() {
  const x = state.playerX;
  const y = state.playerY - 14;

  ctx.save();
  ctx.translate(x, y);

  if (state.facingLeft) {
    ctx.scale(-1, 1);
  }

  // Bobbing de caminado
  const bob = state.isMoving ? Math.sin(state.walkCycle) * 3 : Math.sin(Date.now() / 300) * 1.5;
  const legSwing = state.isMoving ? Math.cos(state.walkCycle) * 6 : 0;

  // Sombra proyectada en el suelo
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.beginPath();
  ctx.ellipse(0, 18, 12, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // 1. Piernas / Zapatos negros retro
  ctx.fillStyle = '#0f172a';
  // Pierna trasera
  ctx.fillRect(-5 - legSwing * 0.5, 10 + bob, 4, 8);
  // Pierna delantera
  ctx.fillRect(2 + legSwing * 0.5, 10 + bob, 4, 8);

  // 2. Gabardina / Abrigo largo (Trench Coat marrón clásico)
  ctx.fillStyle = '#78350f'; // Marrón cuero
  ctx.fillRect(-7, -8 + bob, 14, 18);
  // Pliegues y solapas
  ctx.fillStyle = '#92400e';
  ctx.fillRect(-4, -6 + bob, 8, 14);
  ctx.fillStyle = '#451a03';
  ctx.fillRect(-1, -6 + bob, 2, 14);

  // 3. Cabeza y bufanda
  // Cuello / bufanda azul cuántica
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(-5, -11 + bob, 10, 3);

  // Cara / piel
  ctx.fillStyle = '#fed7aa';
  ctx.fillRect(-4, -18 + bob, 8, 7);

  // Ojo / mirada
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(1, -16 + bob, 2, 2);

  // 4. Sombrero Fedora clásico
  ctx.fillStyle = '#451a03'; // Ala del sombrero
  ctx.fillRect(-9, -20 + bob, 18, 3);
  ctx.fillStyle = '#78350f'; // Copa del sombrero
  ctx.fillRect(-6, -26 + bob, 12, 6);
  // Cinta del sombrero azul
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(-6, -21 + bob, 12, 2);

  // 5. Reloj Cuántico de Bolsillo / Crono-dispositivo (emitiendo pulsos de luz)
  const watchPulse = Math.sin(Date.now() / 150) * 0.5 + 0.5;
  ctx.fillStyle = '#00f3ff';
  ctx.shadowColor = '#00f3ff';
  ctx.shadowBlur = 8 + watchPulse * 6;
  ctx.beginPath();
  ctx.arc(6, -2 + bob, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0; // reset

  ctx.restore();
}

// Efecto visual de salto en el tiempo (Vórtice Temporal / Time Warp)
function drawTimeWarpEffect() {
  if (!state.timeWarpActive) return;

  const origin = state.timeWarpOrigin;
  const radius = state.timeWarpProgress * 550;

  ctx.save();
  
  // Anillos concéntricos de distorsión temporal
  for (let r = radius; r > 10; r -= 35) {
    ctx.beginPath();
    ctx.arc(origin.x, origin.y, r, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(0, 243, 255, ${0.7 - (r / 600)})`;
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(origin.x, origin.y, r * 0.7, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255, 42, 133, ${0.5 - (r / 600)})`;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // Resplandor de pantalla
  ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(0.6, state.timeWarpProgress * 0.9)})`;
  ctx.fillRect(0, 0, 960, 540);

  ctx.restore();
}

// Partículas de vapor de alcantarillas neoyorquinas
function updateAndDrawSteam() {
  // Añadir partículas periódicamente
  if (Math.random() < 0.3) {
    const vent = STEAM_VENTS[Math.floor(Math.random() * STEAM_VENTS.length)];
    state.steamParticles.push({
      x: vent.x + (Math.random() - 0.5) * 10,
      y: vent.y,
      vx: (Math.random() - 0.5) * 0.5,
      vy: -0.8 - Math.random() * 0.8,
      size: 4 + Math.random() * 6,
      life: 1,
      decay: 0.015 + Math.random() * 0.01
    });
  }

  // Actualizar y dibujar partículas
  ctx.fillStyle = 'rgba(230, 235, 250, 0.25)';
  for (let i = state.steamParticles.length - 1; i >= 0; i--) {
    const p = state.steamParticles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.size += 0.2;
    p.life -= p.decay;

    if (p.life <= 0) {
      state.steamParticles.splice(i, 1);
      continue;
    }

    ctx.fillStyle = `rgba(200, 215, 240, ${p.life * 0.18})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Taxi amarillo clásico retro cruzando en primer plano
let taxiX = -120;
function drawYellowCab() {
  taxiX += 0.7;
  if (taxiX > 1050) taxiX = -150;

  const y = 475;
  ctx.save();
  // Sombra
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(taxiX, y + 16, 50, 6);

  // Carrocería amarilla NYC TAXI
  ctx.fillStyle = '#facc15';
  ctx.fillRect(taxiX, y, 48, 14);
  // Cabina
  ctx.fillRect(taxiX + 12, y - 8, 24, 9);
  // Ventanillas
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(taxiX + 14, y - 6, 9, 6);
  ctx.fillRect(taxiX + 25, y - 6, 9, 6);
  // Letrero taxi techo
  ctx.fillStyle = '#fffae0';
  ctx.fillRect(taxiX + 20, y - 11, 8, 3);
  // Tablero ajedrezado negro taxi
  ctx.fillStyle = '#000000';
  for (let cx = taxiX + 2; cx < taxiX + 46; cx += 6) {
    ctx.fillRect(cx, y + 5, 3, 3);
  }
  // Ruedas
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(taxiX + 6, y + 10, 8, 8);
  ctx.fillRect(taxiX + 34, y + 10, 8, 8);
  // Luces delanteras
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(taxiX + 46, y + 3, 3, 4);

  ctx.restore();
}


// ==========================================
// 6. MOTOR DE NIVELES JUGABLES POR ÉPOCA
// ==========================================
function initLevelWorld(level) {
  state.levelData = {
    id: level.id,
    year: level.year,
    title: level.title,
    sub: level.sub,
    themeColor: level.themeColor,
    worldWidth: 2200,
    worldHeight: 540,
    playerX: 100,
    playerY: 416,
    vx: 0,
    vy: 0,
    isGrounded: true,
    cameraX: 0,
    walkCycle: 0,
    facingLeft: false,
    crystalsCollected: 0,
    totalCrystals: 3,
    crystals: [
      { x: 480, y: 320, collected: false, pulse: 0 },
      { x: 1020, y: 240, collected: false, pulse: 1.5 },
      { x: 1560, y: 290, collected: false, pulse: 3.0 }
    ],
    portal: {
      x: 1980,
      y: 395,
      radius: 36,
      angle: 0
    },
    // Plataformas elevadas en la calle
    platforms: [
      { x: 400, y: 370, w: 160, h: 18, type: 'crates' },
      { x: 680, y: 320, w: 180, h: 18, type: 'fire_escape' },
      { x: 940, y: 280, w: 170, h: 18, type: 'canopy' },
      { x: 1220, y: 340, w: 160, h: 18, type: 'scaffold' },
      { x: 1480, y: 330, w: 160, h: 18, type: 'fire_escape' },
      { x: 1740, y: 370, w: 140, h: 18, type: 'crates' }
    ]
  };

  state.sparkleParticles = [];
  updateHUD();
}

function startLevel(levelId) {
  const level = LEVELS.find(l => l.id === levelId);
  if (!level) return;

  closeLevelModal();
  initLevelWorld(level);

  state.currentScene = 'TRANSITION';
  state.transitionTimer = 0;
  state.transitionDuration = 40;
  state.transitionTarget = 'LEVEL';
  audio.playTimeWarp();
}

function returnToMap(completedNewLevelId = null) {
  state.currentScene = 'MAP';
  state.keysDown = {};

  if (completedNewLevelId) {
    state.currentLevelId = completedNewLevelId;
    const node = LEVELS.find(l => l.id === completedNewLevelId);
    if (node) {
      state.playerX = node.x;
      state.playerY = node.y;
    }
  }

  // Ocultar botón volver al mapa
  const btnReturn = document.getElementById('btnReturnToMap');
  if (btnReturn) btnReturn.style.display = 'none';

  // Restaurar tips
  const tipMove = document.getElementById('controlTipMove');
  const tipAction = document.getElementById('controlTipAction');
  if (tipMove) tipMove.innerHTML = '<span class="key-tag">←</span> <span class="key-tag">→</span> <span class="key-tag">↑</span> <span class="key-tag">↓</span> / <span class="key-tag">WASD</span> Mover';
  if (tipAction) tipAction.innerHTML = '<span class="key-tag">ESPACIO</span> Iniciar Nivel';

  const btnTouchSpace = document.getElementById('btnTouchSpace');
  if (btnTouchSpace) btnTouchSpace.innerHTML = '⚡ VIAJAR [ESPACIO]';

  audio.playArrive();
  updateHUD();
}

function winLevel() {
  state.currentScene = 'VICTORY';
  audio.playVictory();

  // Desbloquear automáticamente la siguiente época
  const nextLevel = LEVELS.find(l => l.id === state.levelData.id + 1);
  if (nextLevel && !nextLevel.unlocked) {
    nextLevel.unlocked = true;
    state.unlockedNextId = nextLevel.id;
  } else {
    state.unlockedNextId = null;
  }

  // Generar fuegos artificiales de celebración
  state.victoryFireworks = [];
  for (let i = 0; i < 60; i++) {
    state.victoryFireworks.push({
      x: 480 + (Math.random() - 0.5) * 400,
      y: 200 + (Math.random() - 0.5) * 150,
      vx: (Math.random() - 0.5) * 6,
      vy: (Math.random() - 0.5) * 6,
      color: ['#00f3ff', '#ffb830', '#ff2a85', '#39ff14', '#ffffff'][Math.floor(Math.random() * 5)],
      life: 1,
      decay: 0.015 + Math.random() * 0.02
    });
  }
}


// ==========================================
// 7. BUCLE PRINCIPAL MULTI-ESCENA (GAME LOOP)
// ==========================================
function update() {
  if (state.currentScene === 'MAP') {
    updateMap();
  } else if (state.currentScene === 'LEVEL') {
    updateLevel();
  } else if (state.currentScene === 'TRANSITION') {
    updateTransition();
  } else if (state.currentScene === 'VICTORY') {
    updateVictory();
  }
}

function render() {
  ctx.clearRect(0, 0, 960, 540);

  if (state.currentScene === 'MAP') {
    renderMap();
  } else if (state.currentScene === 'LEVEL') {
    renderLevel();
  } else if (state.currentScene === 'TRANSITION') {
    renderTransition();
  } else if (state.currentScene === 'VICTORY') {
    renderVictory();
  }
}

function gameLoop() {
  update();
  render();
  requestAnimationFrame(gameLoop);
}


// ------------------------------------------
// Lógica de Mapa
// ------------------------------------------
function updateMap() {
  if (state.isMoving) {
    state.moveProgress += state.moveSpeed;
    state.walkCycle += 0.35;

    if (Math.floor(state.walkCycle) % 4 === 0) {
      audio.playFootstep();
    }

    const p0 = state.movePath[state.moveSegmentIdx];
    const p1 = state.movePath[state.moveSegmentIdx + 1];

    if (p0 && p1) {
      state.playerX = p0.x + (p1.x - p0.x) * state.moveProgress;
      state.playerY = p0.y + (p1.y - p0.y) * state.moveProgress;
    }

    if (state.moveProgress >= 1) {
      state.moveSegmentIdx++;
      state.moveProgress = 0;

      if (state.moveSegmentIdx >= state.movePath.length - 1) {
        state.isMoving = false;
        state.currentLevelId = state.targetLevelId;
        const finalNode = LEVELS.find(l => l.id === state.currentLevelId);
        state.playerX = finalNode.x;
        state.playerY = finalNode.y;
        audio.playArrive();
        updateHUD();
      }
    }
  }

  if (state.lockShakeTimer > 0) {
    state.lockShakeTimer--;
    if (state.lockShakeTimer === 0) {
      state.lockShakeNodeId = null;
    }
  }

  if (state.timeWarpActive) {
    state.timeWarpProgress += 0.035;
  }
}

function renderMap() {
  drawSky();
  drawManhattanSkyline();
  drawYellowCab();
  updateAndDrawSteam();
  drawInterconnectedPaths();
  drawLevelNodes();
  drawTimeTraveler();
  drawTimeWarpEffect();
}


// ------------------------------------------
// Lógica de Nivel Jugable
// ------------------------------------------
function updateLevel() {
  const lvl = state.levelData;
  if (!lvl) return;

  // 1. Controles de Movimiento Horizontal: Flechas o A/D para correr
  const leftHeld = state.keysDown['ArrowLeft'] || state.keysDown['KeyA'];
  const rightHeld = state.keysDown['ArrowRight'] || state.keysDown['KeyD'];

  if (leftHeld && !rightHeld) {
    lvl.vx = -5.2; // Correr hacia la izquierda
    lvl.facingLeft = true;
  } else if (rightHeld && !leftHeld) {
    lvl.vx = 5.2;  // Correr hacia la derecha
    lvl.facingLeft = false;
  } else {
    lvl.vx *= 0.78; // Inercia y fricción al soltar teclas
    if (Math.abs(lvl.vx) < 0.2) lvl.vx = 0;
  }

  // Animación de caminado
  if (Math.abs(lvl.vx) > 0.5 && lvl.isGrounded) {
    lvl.walkCycle += 0.38;
    if (Math.floor(lvl.walkCycle) % 5 === 0) {
      audio.playFootstep();
    }
  }

  // 2. Controles de Salto: Tecla Arriba (ArrowUp / W) o Barra Espaciadora (Space)
  // REGLA ESTRICTA DE GRAVEDAD: Solo salta si está físicamente apoyado en el suelo o plataforma.
  // NO PUEDE SALTAR DE NUEVO EN EL AIRE hasta que aterriza.
  const jumpInput = state.keysDown['Space'] || state.keysDown['ArrowUp'] || state.keysDown['KeyW'];
  if (jumpInput) {
    if (lvl.isGrounded && !lvl.jumpKeyHeld) {
      lvl.vy = -13.2; // Impulso inicial de salto
      lvl.isGrounded = false; // Deja de estar en el suelo inmediatamente
      lvl.jumpKeyHeld = true; // Bloquea la tecla para evitar rebotes continuos involuntarios
      audio.playJump();
    }
  } else {
    // Al soltar la tecla de salto, se libera para permitir el siguiente salto tras aterrizar
    lvl.jumpKeyHeld = false;
  }

  // 3. Físicas Reales de Gravedad: Aceleración gravitacional constante hacia abajo
  const gravity = 0.65;
  lvl.vy += gravity;
  if (lvl.vy > 14) lvl.vy = 14; // Velocidad terminal de caída

  // Aplicar movimiento
  lvl.playerX += lvl.vx;
  lvl.playerY += lvl.vy;

  // Límites del mundo del nivel
  lvl.playerX = Math.max(30, Math.min(lvl.worldWidth - 50, lvl.playerX));

  // 4. Detección física de suelo y plataformas
  let onSolidSurface = false;

  // Colisión con el suelo base (y = 416)
  if (lvl.playerY >= 416) {
    lvl.playerY = 416;
    lvl.vy = 0;
    onSolidSurface = true;
  }

  // Colisión con plataformas elevadas (solo si cae desde arriba)
  if (!onSolidSurface && lvl.vy >= 0) {
    lvl.platforms.forEach(p => {
      // Comprobar rango horizontal
      if (lvl.playerX + 12 >= p.x && lvl.playerX - 12 <= p.x + p.w) {
        // Altura de aterrizaje en la superficie superior de la plataforma
        if (lvl.playerY >= p.y - 25 && lvl.playerY <= p.y - 8) {
          lvl.playerY = p.y - 22;
          lvl.vy = 0;
          onSolidSurface = true;
        }
      }
    });
  }

  // Actualizar estado de aterrizaje: si está en el aire, isGrounded es false
  lvl.isGrounded = onSolidSurface;

  // 5. Cámara suave que sigue al jugador
  const targetCam = lvl.playerX - 350;
  const clampedCam = Math.max(0, Math.min(lvl.worldWidth - 960, targetCam));
  lvl.cameraX += (clampedCam - lvl.cameraX) * 0.12;

  // 7. Recolección de Crono-Cristales
  lvl.crystals.forEach(c => {
    if (!c.collected) {
      c.pulse += 0.05;
      const dist = Math.hypot(lvl.playerX - c.x, (lvl.playerY - 14) - c.y);
      if (dist < 34) {
        c.collected = true;
        lvl.crystalsCollected++;
        audio.playCollect();

        // Spawn chispas
        for (let i = 0; i < 15; i++) {
          state.sparkleParticles.push({
            x: c.x,
            y: c.y,
            vx: (Math.random() - 0.5) * 5,
            vy: (Math.random() - 0.5) * 5,
            color: lvl.themeColor,
            life: 1,
            decay: 0.03
          });
        }

        updateHUD();

        if (lvl.crystalsCollected === lvl.totalCrystals) {
          showToast('⚡ ¡LOS 3 CRISTALES REUNIDOS! El Portal al final de la calle está abierto.');
        } else {
          showToast(`✦ ¡CRISTAL OBTENIDO! (${lvl.crystalsCollected}/${lvl.totalCrystals})`);
        }
      }
    }
  });

  // 8. Colisión con el Portal de Salto Temporal
  lvl.portal.angle += 0.04;
  const distPortal = Math.hypot(lvl.playerX - lvl.portal.x, lvl.playerY - lvl.portal.y);
  if (distPortal < 42) {
    if (lvl.crystalsCollected < lvl.totalCrystals) {
      showToast(`🔒 ¡El portal está inestable! Consigue los ${lvl.totalCrystals - lvl.crystalsCollected} cristales restantes.`);
      audio.playLockedError();
      lvl.vx = -6; // rebote
    } else {
      winLevel();
    }
  }

  // Actualizar partículas de chispas
  for (let i = state.sparkleParticles.length - 1; i >= 0; i--) {
    const p = state.sparkleParticles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life -= p.decay;
    if (p.life <= 0) state.sparkleParticles.splice(i, 1);
  }
}


// ------------------------------------------
// Renderizado de Escenario y Paralaje por Época
// ------------------------------------------
function drawEraSkyAndParallax(lvl, camX) {
  const year = lvl.year;

  // 1. Cielo crepuscular con paleta específica de la época
  const skyGrad = ctx.createLinearGradient(0, 0, 0, 380);
  if (year === 1880) {
    // 1880: Atardecer sepia con bruma de carbón (SIN EDIFICIOS ALTOS)
    skyGrad.addColorStop(0, '#141018');
    skyGrad.addColorStop(0.5, '#2b1b14');
    skyGrad.addColorStop(1, '#422516');
  } else if (year === 1920) {
    // 1920: Noche industrial de fábricas de ladrillo y licores
    skyGrad.addColorStop(0, '#070a14');
    skyGrad.addColorStop(0.6, '#14192b');
    skyGrad.addColorStop(1, '#241c2c');
  } else if (year === 1970) {
    // 1970: Atardecer setentero cargado de smog naranja y púrpura
    skyGrad.addColorStop(0, '#160d22');
    skyGrad.addColorStop(0.5, '#3d162d');
    skyGrad.addColorStop(1, '#521d38');
  } else if (year === 1990) {
    // 1990: Noche lluviosa de Times Square con resplandor neón magenta y cian
    skyGrad.addColorStop(0, '#090a18');
    skyGrad.addColorStop(0.5, '#1b1236');
    skyGrad.addColorStop(1, '#321442');
  } else if (year === 2026) {
    // 2026: Pleno día radiante sobre Manhattan con cielo azul y bruma dorada
    skyGrad.addColorStop(0, '#0284c7');
    skyGrad.addColorStop(0.35, '#38bdf8');
    skyGrad.addColorStop(0.75, '#bae6fd');
    skyGrad.addColorStop(1, '#fef08a');
  } else {
    // 2150: Noche ultravioleta con rejilla digital cyberpunk
    skyGrad.addColorStop(0, '#08051a');
    skyGrad.addColorStop(0.6, '#180a34');
    skyGrad.addColorStop(1, '#340a4e');
  }

  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, 960, 540);

  // Estrellas (solo visibles de noche en épocas no diurnas)
  if (year !== 2026) {
    state.stars.forEach(star => {
      ctx.fillStyle = (year === 1880) ? 'rgba(255, 235, 180, 0.35)' : 'rgba(255, 255, 255, 0.4)';
      const sx = (star.x - camX * 0.05) % 960;
      ctx.fillRect(sx < 0 ? sx + 960 : sx, star.y, star.size, star.size);
    });
  }

  // Luna visible en 1920 y 1880
  if (year === 1920 || year === 1880) {
    ctx.fillStyle = (year === 1880) ? '#fed7aa' : '#fffae0';
    ctx.beginPath();
    ctx.arc(820, 75, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = (year === 1880) ? '#161118' : '#070a14';
    ctx.beginPath();
    ctx.arc(812, 72, 19, 0, Math.PI * 2);
    ctx.fill();
  }

  // Sol brillante y nubes diurnas pixel-art en la Actualidad (2026)
  if (year === 2026) {
    // Resplandor cálido del sol diurno
    const sunGrad = ctx.createRadialGradient(260, 75, 4, 260, 75, 60);
    sunGrad.addColorStop(0, '#ffffff');
    sunGrad.addColorStop(0.3, '#fde047');
    sunGrad.addColorStop(0.7, 'rgba(250, 204, 21, 0.35)');
    sunGrad.addColorStop(1, 'rgba(250, 204, 21, 0)');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(260, 75, 60, 0, Math.PI * 2);
    ctx.fill();

    // Disco solar brillante
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(260, 75, 16, 0, Math.PI * 2);
    ctx.fill();

    // Nubes blancas diurnas que se desplazan con suavidad
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    const dayClouds = [
      { x: 70, y: 50, w: 90, h: 22 },
      { x: 360, y: 70, w: 130, h: 26 },
      { x: 710, y: 40, w: 105, h: 24 },
      { x: 1100, y: 65, w: 120, h: 25 },
      { x: 1520, y: 45, w: 95, h: 22 },
      { x: 1900, y: 60, w: 125, h: 26 }
    ];
    dayClouds.forEach(c => {
      const cx = (c.x - camX * 0.08) % (lvl.worldWidth + 200);
      const clx = cx < -130 ? cx + lvl.worldWidth + 200 : cx;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(clx, c.y, c.w, c.h, 11) : ctx.rect(clx, c.y, c.w, c.h);
      ctx.roundRect ? ctx.roundRect(clx + 18, c.y - 12, c.w - 36, c.h, 10) : ctx.rect(clx + 18, c.y - 12, c.w - 36, c.h);
      ctx.fill();
    });
  }

  // 2. Capa de Paralaje Lejano Auténtica de la Época
  ctx.save();
  ctx.translate(-camX * 0.22, 0);

  if (year === 1880) {
    // 1880: REGLA ESTRICTA -> CERO EDIFICIOS ALTOS
    // Solo colinas bajas, mástiles de barcos veleros de madera en el río y chimeneas bajas
    ctx.fillStyle = '#1e1411';
    for (let bx = 0; bx < lvl.worldWidth + 400; bx += 90) {
      // Almacenes portuarios bajos de solo 1 y 2 plantas (altura max 60-95px)
      const bh = 55 + ((bx * 13) % 40);
      ctx.fillRect(bx, 440 - bh, 65, bh);

      // Tejado a dos aguas de madera
      ctx.beginPath();
      ctx.moveTo(bx - 4, 440 - bh);
      ctx.lineTo(bx + 32, 440 - bh - 14);
      ctx.lineTo(bx + 69, 440 - bh);
      ctx.closePath();
      ctx.fill();

      // Mástiles altos de veleros atracados en el East River
      if (bx % 180 === 0) {
        ctx.strokeStyle = '#2b1b16';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(bx + 30, 440);
        ctx.lineTo(bx + 30, 260); // Mástil principal
        ctx.moveTo(bx + 10, 310);
        ctx.lineTo(bx + 50, 310); // Verga horizontal
        ctx.moveTo(bx + 15, 345);
        ctx.lineTo(bx + 45, 345);
        ctx.stroke();
      }

      // Chimenea baja de ladrillo echando humo de carbón
      if (bx % 270 === 0) {
        ctx.fillStyle = '#261713';
        ctx.fillRect(bx + 50, 440 - bh - 35, 12, 35);
        // Humo de carbón oscuro
        ctx.fillStyle = 'rgba(40, 30, 25, 0.4)';
        ctx.beginPath();
        ctx.arc(bx + 56, 440 - bh - 42, 10, 0, Math.PI * 2);
        ctx.arc(bx + 62, 440 - bh - 55, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#1e1411';
      }
    }
  } else if (year === 1920) {
    // 1920: REGLA -> MÁS FÁBRICAS, CHIMENEAS Y EDIFICIOS DE 3-4 PLANTAS (SIN RASCACIELOS GIGANTES)
    ctx.fillStyle = '#14182b';
    for (let bx = 0; bx < lvl.worldWidth + 400; bx += 105) {
      const isFactory = (bx % 210 === 0);
      const bh = isFactory ? 115 : 140; // Edificios industriales de mediana altura
      ctx.fillRect(bx, 440 - bh, 85, bh);

      // Techo en diente de sierra característico de fábricas industriales de los 20s
      if (isFactory) {
        ctx.beginPath();
        for (let sx = bx; sx < bx + 85; sx += 28) {
          ctx.moveTo(sx, 440 - bh);
          ctx.lineTo(sx + 20, 440 - bh - 16);
          ctx.lineTo(sx + 28, 440 - bh);
        }
        ctx.fill();

        // Chimenea industrial humeante
        ctx.fillStyle = '#1e243d';
        ctx.fillRect(bx + 60, 440 - bh - 50, 15, 50);
        // Humo de fábrica
        ctx.fillStyle = 'rgba(80, 90, 115, 0.35)';
        ctx.beginPath();
        ctx.arc(bx + 67, 440 - bh - 60, 12, 0, Math.PI * 2);
        ctx.arc(bx + 75, 440 - bh - 78, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#14182b';
      } else {
        // Ventanitas tenues de fábrica / almacén
        ctx.fillStyle = 'rgba(255, 220, 130, 0.25)';
        for (let wy = 440 - bh + 20; wy < 420; wy += 22) {
          ctx.fillRect(bx + 12, wy, 8, 10);
          ctx.fillRect(bx + 35, wy, 8, 10);
          ctx.fillRect(bx + 58, wy, 8, 10);
        }
        ctx.fillStyle = '#14182b';
      }
    }
  } else if (year === 1970) {
    // 1970: Brownstones con escaleras de incendios y tren elevado al fondo
    ctx.fillStyle = '#20162a';
    for (let bx = 0; bx < lvl.worldWidth + 400; bx += 100) {
      const bh = 155 + ((bx * 17) % 60);
      ctx.fillRect(bx, 440 - bh, 80, bh);

      // Escaleras de incendios exteriores en zigzag
      ctx.strokeStyle = '#322240';
      ctx.lineWidth = 1.5;
      for (let fy = 440 - bh + 25; fy < 420; fy += 26) {
        ctx.strokeRect(bx + 15, fy, 50, 12);
        ctx.beginPath();
        ctx.moveTo(bx + 20, fy + 12);
        ctx.lineTo(bx + 60, fy + 26);
        ctx.stroke();
      }

      // Antenas analógicas de TV en la azotea
      if (bx % 200 === 0) {
        ctx.strokeStyle = '#48335b';
        ctx.beginPath();
        ctx.moveTo(bx + 40, 440 - bh);
        ctx.lineTo(bx + 40, 440 - bh - 25);
        ctx.moveTo(bx + 28, 440 - bh - 18);
        ctx.lineTo(bx + 52, 440 - bh - 18);
        ctx.stroke();
      }
    }
  } else if (year === 1990) {
    // 1990: Edificios comerciales de Times Square repletos de vallas publicitarias
    ctx.fillStyle = '#141528';
    for (let bx = 0; bx < lvl.worldWidth + 400; bx += 110) {
      const bh = 175 + ((bx * 23) % 90);
      ctx.fillRect(bx, 440 - bh, 90, bh);

      // Valla publicitaria de los 90s iluminada en la fachada
      if (bx % 220 === 0) {
        ctx.fillStyle = '#ff2a85';
        ctx.fillRect(bx + 10, 440 - bh + 15, 70, 30);
        ctx.font = 'bold 7px "Press Start 2P", monospace';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('16-BIT', bx + 18, 440 - bh + 32);
      } else if (bx % 330 === 0) {
        ctx.fillStyle = '#00f3ff';
        ctx.fillRect(bx + 10, 440 - bh + 20, 70, 26);
        ctx.font = 'bold 7px "Press Start 2P", monospace';
        ctx.fillStyle = '#0f172a';
        ctx.fillText('CYBER95', bx + 14, 440 - bh + 37);
      }
      ctx.fillStyle = '#141528';
    }
  } else if (year === 2026) {
    // 2026: Rascacielos contemporáneos de cristal y acero bajo la brillante luz del día
    for (let bx = 0; bx < lvl.worldWidth + 400; bx += 105) {
      const bType = (bx / 105) % 4;
      let bh = 220 + ((bx * 31) % 150);

      // Variantes de rascacielos modernos diurnos
      if (bType === 0) {
        // Torre estilo One World Trade Center con aguja
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(bx, 440 - bh, 85, bh);
        // Franja de cristal reflectante
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(bx + 15, 440 - bh, 55, bh);
        // Aguja / Spire de telecomunicaciones en la cima
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(bx + 42, 440 - bh);
        ctx.lineTo(bx + 42, 440 - bh - 42);
        ctx.stroke();
      } else if (bType === 1) {
        // Torre estilo Hudson Yards con tejado angular de cristal
        ctx.fillStyle = '#0369a1';
        ctx.fillRect(bx, 440 - bh, 90, bh);
        ctx.fillStyle = '#7dd3fc';
        ctx.beginPath();
        ctx.moveTo(bx, 440 - bh);
        ctx.lineTo(bx + 90, 440 - bh - 28);
        ctx.lineTo(bx + 90, 440 - bh);
        ctx.closePath();
        ctx.fill();
      } else if (bType === 2) {
        // Rascacielos esbelto 'Pencil Tower' de Billionaires' Row
        bh = Math.min(380, bh + 70); // Muy alto y delgado
        ctx.fillStyle = '#075985';
        ctx.fillRect(bx + 20, 440 - bh, 45, bh);
        ctx.fillStyle = '#bae6fd';
        for (let wy = 440 - bh + 15; wy < 430; wy += 20) {
          ctx.fillRect(bx + 28, wy, 28, 8);
        }
      } else {
        // Rascacielos clásico de oficinas con fachada metálica
        ctx.fillStyle = '#0c4a6e';
        ctx.fillRect(bx, 440 - bh, 80, bh);
        ctx.fillStyle = '#67e8f9';
        for (let wy = 440 - bh + 12; wy < 430; wy += 22) {
          ctx.fillRect(bx + 10, wy, 60, 9);
        }
      }

      // Reflejos solares en las ventanas de vidrio
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.fillRect(bx + 4, 440 - bh + 25, 6, bh - 50);
    }
  } else {
    // 2150: FUTURO NEO-MANHATTAN -> RASCACIELOS CON MÚLTIPLES FORMAS GEOMÉTRICAS Y ALTURAS DIVERSAS
    for (let bx = 0; bx < lvl.worldWidth + 400; bx += 130) {
      const shapeIdx = Math.floor(bx / 130) % 5;
      // Gran diversidad de alturas (desde 210px hasta 425px que rozan la cima de la pantalla)
      const heights = [320, 425, 260, 390, 350];
      const bh = heights[shapeIdx] + ((bx * 7) % 30);

      if (shapeIdx === 0) {
        // Forma 1: Megatorre con corte diagonal a 45° y faceta solar ultravioleta
        ctx.fillStyle = '#170c32';
        ctx.fillRect(bx, 440 - bh, 95, bh);
        // Tejado en bisel angular
        ctx.fillStyle = '#a855f7';
        ctx.beginPath();
        ctx.moveTo(bx, 440 - bh);
        ctx.lineTo(bx + 95, 440 - bh - 40);
        ctx.lineTo(bx + 95, 440 - bh);
        ctx.closePath();
        ctx.fill();
        // Haz de datos vertical neón
        ctx.strokeStyle = '#00f3ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(bx + 45, 440 - bh);
        ctx.lineTo(bx + 45, 440);
        ctx.stroke();

      } else if (shapeIdx === 1) {
        // Forma 2: Obelisco cuántico monumental escalonado con pararrayos de energía (Cima altísima)
        ctx.fillStyle = '#0f0a28';
        ctx.fillRect(bx, 440 - bh, 100, bh);
        // Escalonamiento superior
        ctx.fillStyle = '#1e1040';
        ctx.fillRect(bx + 18, 440 - bh - 30, 64, 30);
        ctx.fillRect(bx + 34, 440 - bh - 55, 32, 25);
        // Aguja de plasma brillante
        ctx.strokeStyle = '#ff007f';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(bx + 50, 440 - bh - 55);
        ctx.lineTo(bx + 50, 440 - bh - 85);
        ctx.stroke();
        // Anillo holográfico flotante en la cúspide
        ctx.strokeStyle = '#00f3ff';
        ctx.beginPath();
        ctx.ellipse(bx + 50, 440 - bh - 65, 22, 6, 0, 0, Math.PI * 2);
        ctx.stroke();

      } else if (shapeIdx === 2) {
        // Forma 3: Torre con módulos y terrazas en voladizo (Cantilever decks)
        ctx.fillStyle = '#1a0b36';
        ctx.fillRect(bx + 20, 440 - bh, 65, bh);
        // Módulos que sobresalen a media altura
        ctx.fillStyle = '#3b0764';
        ctx.fillRect(bx - 10, 440 - bh + 60, 60, 24);
        ctx.strokeStyle = '#00f3ff';
        ctx.strokeRect(bx - 10, 440 - bh + 60, 60, 24);
        ctx.fillStyle = '#2e1065';
        ctx.fillRect(bx + 45, 440 - bh + 120, 60, 24);
        ctx.strokeStyle = '#ff007f';
        ctx.strokeRect(bx + 45, 440 - bh + 120, 60, 24);

      } else if (shapeIdx === 3) {
        // Forma 4: Torres gemelas conectadas por pasarela aérea (Skybridge) a gran altura
        ctx.fillStyle = '#130d2d';
        ctx.fillRect(bx, 440 - bh, 40, bh);
        ctx.fillRect(bx + 65, 440 - bh, 40, bh);
        // Skybridge horizontal transparente luminoso a 200px de altura
        ctx.fillStyle = 'rgba(0, 243, 255, 0.35)';
        ctx.fillRect(bx + 35, 440 - bh + 70, 35, 14);
        ctx.strokeStyle = '#00f3ff';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(bx + 35, 440 - bh + 70, 35, 14);
        // Segundo skybridge inferior
        ctx.fillStyle = 'rgba(168, 85, 247, 0.35)';
        ctx.fillRect(bx + 35, 440 - bh + 150, 35, 14);
        ctx.strokeStyle = '#a855f7';
        ctx.strokeRect(bx + 35, 440 - bh + 150, 35, 14);

      } else {
        // Forma 5: Torre cilíndrica con ascensor cuántico transparente exterior iluminado
        ctx.fillStyle = '#1e1145';
        ctx.fillRect(bx + 10, 440 - bh, 80, bh);
        // Tubo de ascensor de cristal
        ctx.fillStyle = 'rgba(0, 243, 255, 0.2)';
        ctx.fillRect(bx + 40, 440 - bh, 20, bh);
        ctx.strokeStyle = '#00f3ff';
        ctx.strokeRect(bx + 40, 440 - bh, 20, bh);
        // Cabina del ascensor ascendiendo
        const podY = (Date.now() / 15 + bx * 3) % (bh - 40);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(bx + 43, 440 - podY - 20, 14, 12);
      }
    }
  }

  ctx.restore();
}

// ------------------------------------------
// Suelo Auténtico de la Época
// ------------------------------------------
function drawEraGround(lvl) {
  const year = lvl.year;

  if (year === 1880) {
    // 1880: Pavimento de ADOQUINES (Cobblestones)
    ctx.fillStyle = '#261c18';
    ctx.fillRect(0, 440, lvl.worldWidth, 100);

    // Textura de adoquines individuales redondeados
    ctx.fillStyle = '#382a24';
    ctx.strokeStyle = '#18120f';
    ctx.lineWidth = 1;
    for (let gy = 440; gy < 540; gy += 14) {
      const offset = (gy % 28 === 0) ? 0 : 12;
      for (let gx = offset; gx < lvl.worldWidth; gx += 24) {
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(gx, gy + 2, 20, 10, 3) : ctx.rect(gx, gy + 2, 20, 10);
        ctx.fill();
        ctx.stroke();
      }
    }
  } else if (year === 1920) {
    // 1920: Pavimento de ladrillo industrial con bordillo de granito
    ctx.fillStyle = '#1a1922';
    ctx.fillRect(0, 440, lvl.worldWidth, 100);

    ctx.fillStyle = '#26222b';
    for (let gy = 440; gy < 540; gy += 10) {
      const offset = (gy % 20 === 0) ? 0 : 10;
      for (let gx = offset; gx < lvl.worldWidth; gx += 20) {
        ctx.fillRect(gx, gy + 1, 18, 8);
      }
    }

    // Bordillo de granito
    ctx.fillStyle = '#3f3d4d';
    ctx.fillRect(0, 440, lvl.worldWidth, 6);
  } else if (year === 1970) {
    // 1970: Asfalto de la ciudad con grietas y marcas de desgaste
    ctx.fillStyle = '#11121a';
    ctx.fillRect(0, 440, lvl.worldWidth, 100);

    // Bordillo urbano desgastado
    ctx.fillStyle = '#272a38';
    ctx.fillRect(0, 440, lvl.worldWidth, 8);

    // Línea de carril discontinua amarilla clásica
    ctx.save();
    ctx.strokeStyle = 'rgba(234, 179, 8, 0.45)';
    ctx.lineWidth = 3;
    ctx.setLineDash([16, 22]);
    ctx.beginPath();
    ctx.moveTo(0, 485);
    ctx.lineTo(lvl.worldWidth, 485);
    ctx.stroke();
    ctx.restore();
  } else if (year === 1990) {
    // 1990: Asfalto mojado de Times Square con charcos y reflejos neón
    ctx.fillStyle = '#090a12';
    ctx.fillRect(0, 440, lvl.worldWidth, 100);

    // Charcos reflectantes de lluvia
    ctx.fillStyle = 'rgba(0, 243, 255, 0.12)';
    ctx.beginPath();
    ctx.ellipse(320, 475, 70, 10, 0, 0, Math.PI * 2);
    ctx.ellipse(880, 485, 90, 12, 0, 0, Math.PI * 2);
    ctx.ellipse(1450, 470, 80, 11, 0, 0, Math.PI * 2);
    ctx.fill();

    // Bordillo de acera de neón
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 440, lvl.worldWidth, 8);
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 440, lvl.worldWidth, 8);
  } else if (year === 2026) {
    // 2026: Acera moderna de granito claro, asfalto contemporáneo y cruce de peatones tipo cebra
    ctx.fillStyle = '#1e293b'; // Asfalto gris oscuro
    ctx.fillRect(0, 440, lvl.worldWidth, 100);

    // Bordillo y acera de granito claro contemporáneo
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(0, 440, lvl.worldWidth, 12);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 440, lvl.worldWidth, 12);

    // Losas de la acera
    for (let gx = 0; gx < lvl.worldWidth; gx += 40) {
      ctx.beginPath();
      ctx.moveTo(gx, 440);
      ctx.lineTo(gx, 452);
      ctx.stroke();
    }

    // Pasos de cebra peatonales blancos en la calle
    ctx.fillStyle = '#ffffff';
    for (let zw = 600; zw < 760; zw += 24) {
      ctx.fillRect(zw, 458, 14, 62);
    }
    for (let zw = 1400; zw < 1560; zw += 24) {
      ctx.fillRect(zw, 458, 14, 62);
    }

    // Línea de carril blanca moderna reflectante
    ctx.save();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.setLineDash([22, 22]);
    ctx.beginPath();
    ctx.moveTo(0, 492);
    ctx.lineTo(lvl.worldWidth, 492);
    ctx.stroke();
    ctx.restore();
  } else {
    // 2150: Carretera compuesta oscura con pistas de energía luminiscente
    ctx.fillStyle = '#060714';
    ctx.fillRect(0, 440, lvl.worldWidth, 100);

    // Guías de fibra óptica en el suelo
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 455);
    ctx.lineTo(lvl.worldWidth, 455);
    ctx.moveTo(0, 495);
    ctx.lineTo(lvl.worldWidth, 495);
    ctx.stroke();
  }
}

// ------------------------------------------
// Portal Cuántico de Salto Temporal
// ------------------------------------------
function renderTimePortal(portal, isOpen, themeColor) {
  if (!portal) return;
  ctx.save();
  ctx.translate(portal.x, portal.y);

  const rad = portal.radius || 36;
  const pulse = Math.sin(portal.angle * 2) * 4;

  // Resplandor del portal
  ctx.shadowBlur = isOpen ? 25 : 8;
  ctx.shadowColor = isOpen ? '#00f3ff' : '#475569';

  // Anillo exterior base
  ctx.lineWidth = 4;
  ctx.strokeStyle = isOpen ? '#00f3ff' : '#475569';
  ctx.beginPath();
  ctx.arc(0, 0, rad + pulse, 0, Math.PI * 2);
  ctx.stroke();

  // Vórtice interior
  ctx.fillStyle = isOpen ? 'rgba(0, 243, 255, 0.22)' : 'rgba(30, 41, 59, 0.4)';
  ctx.beginPath();
  ctx.arc(0, 0, rad - 2, 0, Math.PI * 2);
  ctx.fill();

  // Rayos y arcos giratorios
  ctx.save();
  ctx.rotate(portal.angle);
  ctx.strokeStyle = isOpen ? '#ff007f' : '#334155';
  ctx.lineWidth = 3;
  for (let i = 0; i < 4; i++) {
    ctx.rotate(Math.PI / 2);
    ctx.beginPath();
    ctx.arc(0, 0, rad * 0.65, 0, Math.PI * 0.6);
    ctx.stroke();
  }
  ctx.restore();

  // Núcleo cuántico pulsante
  ctx.fillStyle = isOpen ? '#ffffff' : '#1e293b';
  ctx.beginPath();
  ctx.arc(0, 0, 8 + Math.sin(portal.angle * 3) * 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 0;

  // Indicador de estado del portal
  ctx.font = '8px "Press Start 2P", monospace';
  ctx.fillStyle = isOpen ? '#39ff14' : '#94a3b8';
  ctx.textAlign = 'center';
  ctx.fillText(isOpen ? 'PORTAL ACTIVO' : 'PORTAL INESTABLE', 0, -rad - 12);

  ctx.restore();
}

// ------------------------------------------
// Render Principal del Nivel
// ------------------------------------------
function renderLevel() {
  const lvl = state.levelData;
  if (!lvl) return;

  const camX = lvl.cameraX;

  // 1. Cielo y Paralaje Auténtico de la Época
  drawEraSkyAndParallax(lvl, camX);

  // 2. Capa del Mundo del Nivel (con coordenadas de cámara)
  ctx.save();
  ctx.translate(-camX, 0);

  // A. Edificios y Fachadas temáticas
  renderEraStreetScenery(lvl);

  // B. Suelo de la época (Adoquines 1880, Fábrica 1920, Asfalto 1970, Mojado 1990, Cyber 2150)
  drawEraGround(lvl);

  // C. Plataformas temáticas
  lvl.platforms.forEach(p => {
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(p.x, p.y, p.w, p.h);

    // Borde de neón / textura según la época
    ctx.strokeStyle = lvl.themeColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(p.x, p.y, p.w, p.h);

    // Detalle de soporte / vigas
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(p.x + 8, p.y + p.h, 6, 25);
    ctx.fillRect(p.x + p.w - 14, p.y + p.h, 6, 25);
  });

  // D. Crono-Cristales Cuánticos Flotantes
  lvl.crystals.forEach((c, idx) => {
    if (!c.collected) {
      const bob = Math.sin(c.pulse) * 6;
      ctx.save();
      ctx.translate(c.x, c.y + bob);

      ctx.fillStyle = lvl.themeColor;
      ctx.shadowColor = lvl.themeColor;
      ctx.shadowBlur = 15;

      ctx.beginPath();
      ctx.moveTo(0, -14);
      ctx.lineTo(11, 0);
      ctx.lineTo(0, 14);
      ctx.lineTo(-11, 0);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(0, -7);
      ctx.lineTo(5, 0);
      ctx.lineTo(0, 7);
      ctx.lineTo(-5, 0);
      ctx.closePath();
      ctx.fill();

      ctx.shadowBlur = 0;

      ctx.font = '8px "Press Start 2P", monospace';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText(`[♦${idx + 1}]`, 0, -20);

      ctx.restore();
    }
  });

  // E. Partículas de chispas
  state.sparkleParticles.forEach(p => {
    ctx.fillStyle = p.color;
    ctx.globalAlpha = p.life;
    ctx.fillRect(p.x, p.y, 3, 3);
  });
  ctx.globalAlpha = 1;

  // F. Portal Temporal Cuántico
  renderTimePortal(lvl.portal, lvl.crystalsCollected >= lvl.totalCrystals, lvl.themeColor);

  // G. Dibujar al Personaje con Atuendo Auténtico de la Época
  drawTimeTravelerInLevel(lvl);

  ctx.restore(); // Fin de coordenadas de cámara

  // 3. HUD Superior del Nivel
  renderLevelHUD(lvl);
}

// ------------------------------------------
// Escenografía y Atrezo Específico por Época
// ------------------------------------------
function renderEraStreetScenery(lvl) {
  const year = lvl.year;

  if (year === 1880) {
    // ------------------------------------------
    // 1880: LOS 1800s (Sin rascacielos, farolas de gas, carruajes y vapor)
    // ------------------------------------------
    // Farolas de gas victorianas de hierro negro
    for (let lx = 140; lx < lvl.worldWidth; lx += 260) {
      // Poste negro de hierro fundido
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(lx - 2, 345, 5, 95);
      // Linterna cuadrada de vidrio
      ctx.strokeStyle = '#44403c';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(lx - 7, 332, 14, 14);
      // Llama de gas amarilla parpadeante
      const flicker = (Math.sin(Date.now() / 80 + lx) * 2);
      ctx.fillStyle = '#fde047';
      ctx.fillRect(lx - 2 + flicker * 0.5, 336, 4, 7);
      // Resplandor cálido
      ctx.fillStyle = 'rgba(253, 224, 71, 0.08)';
      ctx.beginPath();
      ctx.arc(lx, 339, 25, 0, Math.PI * 2);
      ctx.fill();
    }

    // Almacén portuario y fundición de ladrillo bajo (2 plantas)
    ctx.fillStyle = '#291812';
    ctx.fillRect(520, 260, 260, 180);
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 2;
    ctx.strokeRect(520, 260, 260, 180);

    ctx.font = 'bold 10px "Press Start 2P", monospace';
    ctx.fillStyle = '#d97706';
    ctx.fillText('BROOKLYN DOCKS & FOUNDRY', 530, 290);
    ctx.font = '9px "Share Tech Mono", monospace';
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText('EST. 1880 // FUNDICIÓN DE VAPOR', 560, 310);

    // Ventanas victorianas con marcos de madera
    ctx.fillStyle = 'rgba(253, 224, 71, 0.4)';
    ctx.fillRect(545, 340, 24, 30);
    ctx.fillRect(605, 340, 24, 30);
    ctx.fillRect(720, 340, 24, 30);
    ctx.fillStyle = '#451a03';
    ctx.fillRect(655, 370, 34, 70); // portón de madera

    // Tuberías de vapor industriales con válvulas expulsando vapor
    ctx.fillStyle = '#57534e';
    ctx.fillRect(490, 375, 30, 10);
    ctx.fillRect(780, 375, 30, 10);
    // Vapor blanco
    ctx.fillStyle = 'rgba(240, 240, 250, 0.35)';
    ctx.beginPath();
    ctx.arc(485, 370, 12, 0, Math.PI * 2);
    ctx.arc(815, 370, 15, 0, Math.PI * 2);
    ctx.fill();

    // Carruaje victoriano tirado por caballos aparcado (x: 240)
    drawVictorianCarriage(240, 405);
    drawVictorianCarriage(1300, 405);

    // Barriles de madera apilados
    drawWoodenBarrel(410, 420);
    drawWoodenBarrel(428, 420);
    drawWoodenBarrel(419, 404);

  } else if (year === 1920) {
    // ------------------------------------------
    // 1920: LOS LOCOS 20s (Más fábricas, speakeasy, coches Ford T, sin rascacielos gigantes)
    // ------------------------------------------
    // Farolas eléctricas de hierro fundido con luz cálida
    for (let lx = 140; lx < lvl.worldWidth; lx += 280) {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(lx - 2, 340, 5, 100);
      ctx.fillRect(lx - 8, 336, 17, 5);
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(lx, 332, 6, 0, Math.PI * 2);
      ctx.fill();
    }

    // Speakeasy y Club de Jazz clandestino
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(480, 220, 250, 220);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.strokeRect(480, 220, 250, 220);

    // Letrero Neón Art Déco dorado
    ctx.font = 'bold 11px "Press Start 2P", monospace';
    ctx.fillStyle = '#f59e0b';
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 10;
    ctx.fillText('THE COTTON VAULT', 495, 255);
    ctx.font = '9px "Press Start 2P", monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('SPEAKEASY & JAZZ CLUB', 505, 275);
    ctx.shadowBlur = 0;

    // Puerta secreta de mirilla
    ctx.fillStyle = '#78350f';
    ctx.fillRect(580, 365, 36, 75);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(592, 385, 12, 6); // mirilla

    // Fábrica textil / licores al fondo
    ctx.fillStyle = '#261713';
    ctx.fillRect(1150, 210, 240, 230);
    ctx.font = 'bold 10px "Press Start 2P", monospace';
    ctx.fillStyle = '#f59e0b';
    ctx.fillText('HUDSON BREWING CO.', 1165, 245);

    // Chimenea de fábrica
    ctx.fillStyle = '#3b1d11';
    ctx.fillRect(1330, 130, 26, 80);

    // Coche Ford Modelo T negro de los años 20
    drawVintageFordCar(240, 408);
    drawVintageFordCar(1440, 408);

    // Cajas de madera de contrabando de la Ley Seca
    ctx.fillStyle = '#78350f';
    ctx.fillRect(430, 415, 24, 25);
    ctx.fillRect(455, 415, 24, 25);

  } else if (year === 1970) {
    // ------------------------------------------
    // 1970: EL BRONX, METRO Y DISCO (Vagón con graffiti, boombox y Studio 77)
    // ------------------------------------------
    // Estructura de vigas elevadas de acero del metro cruzando por arriba
    ctx.fillStyle = '#1e293b';
    for (let tx = 0; tx < lvl.worldWidth; tx += 200) {
      ctx.fillRect(tx + 20, 160, 16, 280); // pilar vertical con remaches
      ctx.strokeStyle = '#475569';
      ctx.strokeRect(tx + 20, 160, 16, 280);
    }
    ctx.fillRect(0, 150, lvl.worldWidth, 20); // viga horizontal superior

    // Vagón de Metro plateado cubierto de GRAFFITI COLORIDO
    ctx.fillStyle = '#64748b';
    ctx.fillRect(500, 260, 280, 95);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.strokeRect(500, 260, 280, 95);

    // Graffitis estilo salvaje (Wild Style) en el vagón de metro
    ctx.font = 'bold 16px "Press Start 2P", monospace';
    ctx.fillStyle = '#ec4899';
    ctx.fillText('BRONX 77', 520, 310);
    ctx.fillStyle = '#39ff14';
    ctx.fillText('WILD STYLE', 535, 338);

    // Club Disco "STUDIO 77"
    ctx.fillStyle = '#181024';
    ctx.fillRect(1150, 230, 250, 210);
    ctx.strokeStyle = '#ec4899';
    ctx.lineWidth = 2;
    ctx.strokeRect(1150, 230, 250, 210);

    ctx.font = 'bold 12px "Press Start 2P", monospace';
    ctx.fillStyle = '#ec4899';
    ctx.shadowColor = '#ec4899';
    ctx.shadowBlur = 10;
    ctx.fillText('STUDIO 77 DISCO', 1170, 265);
    ctx.shadowBlur = 0;

    // Radiocassette Boombox retro de los 70s gigante en la calle
    drawRetroBoombox(430, 412);

    // Canasta de baloncesto callejera
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(320, 340, 35, 25);
    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.arc(337, 365, 8, 0, Math.PI);
    ctx.stroke();

    // Taxi Checker clásico amarillo y negro con franja de ajedrez
    drawCheckerTaxi(1440, 408);

  } else if (year === 1990) {
    // ------------------------------------------
    // 1990: TIMES SQUARE (Salones Arcade, Pandillas y Carteles Neón)
    // ------------------------------------------
    // Salón Recreativo "TIMES SQ. 90s ARCADE"
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(490, 200, 260, 240);
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 2;
    ctx.strokeRect(490, 200, 260, 240);

    ctx.font = 'bold 12px "Press Start 2P", monospace';
    ctx.fillStyle = '#06b6d4';
    ctx.shadowColor = '#06b6d4';
    ctx.shadowBlur = 10;
    ctx.fillText('TIMES SQ. ARCADE', 510, 235);
    ctx.fillStyle = '#f43f5e';
    ctx.fillText('16-BIT RETRO ZONE', 510, 258);
    ctx.shadowBlur = 0;

    // MÁQUINAS ARCADE CALLEJERAS CON PANTALLAS CRT ACTIVAS
    drawArcadeCabinet(520, 360, '#1e1b4b', '#00f3ff', 'FIGHT');
    drawArcadeCabinet(555, 360, '#831843', '#ff2a85', 'RACE');
    drawArcadeCabinet(590, 360, '#14532d', '#39ff14', 'SPACE');

    // PANDILLAS CALLEJERAS DE LOS 90S (Siluetas pixel art reunidas en la esquina)
    draw90sGangMembers(850, 395);

    // Tags de graffiti de pandillas de los 90 en la pared
    ctx.font = 'bold 9px "Press Start 2P", monospace';
    ctx.fillStyle = '#f43f5e';
    ctx.fillText('★ 90s STREET POSSE ★', 780, 350);
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('TIMES SQ KINGS', 800, 368);

    // Cabina telefónica de monedas clásica de NYC con guía amarilla
    drawPayphoneBooth(340, 360);

    // Taxi Crown Victoria amarillo de los 90
    drawCrownVicTaxi(1320, 410);

  } else if (year === 2026) {
    // ------------------------------------------
    // 2026: MANHATTAN ACTUAL (DÍA SOLEADO) -> Rascacielos de cristal, cafetería, hot dogs, taxi híbrido
    // ------------------------------------------
    // Cafetería moderna de cristal "MANHATTAN ROAST CO."
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(490, 200, 270, 240);
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2;
    ctx.strokeRect(490, 200, 270, 240);

    // Letrero moderno minimalista iluminado
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(505, 215, 240, 36);
    ctx.font = 'bold 9px "Press Start 2P", monospace';
    ctx.fillStyle = '#0f172a';
    ctx.fillText('☕ MANHATTAN ROAST', 515, 238);

    // Gran ventanal de cristal reflectante de día con reflejos solares
    ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
    ctx.fillRect(510, 265, 140, 100);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(510, 265, 140, 100);
    // Destello de luz diagonal de sol en el ventanal
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.moveTo(530, 265);
    ctx.lineTo(550, 265);
    ctx.lineTo(515, 365);
    ctx.lineTo(495, 365);
    ctx.closePath();
    ctx.fill();

    // Puerta de cristal automática
    ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
    ctx.fillRect(665, 280, 45, 160);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(695, 360, 4, 18); // tirador metálico

    // Mesitas de terraza y sillas exteriores de cafetería
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(435, 410); ctx.lineTo(465, 410); // mesa
    ctx.moveTo(450, 410); ctx.lineTo(450, 440);
    ctx.stroke();
    ctx.fillStyle = '#f8fafc'; // taza de café para llevar
    ctx.fillRect(446, 404, 6, 6);

    // Puesto clásico callejero de HOT DOGS & PRETZELS de Nueva York con sombrilla
    drawHotDogCart(330, 405);

    // Estación de bicicletas compartidas Citi Bike (Azules)
    drawCitiBikeStation(800, 418);

    // Peatones modernos con smartphones y mochilas en la acera
    drawModernPedestrians(910, 395);

    // Taxi contemporáneo híbrido amarillo de Nueva York (SUV / Sedán)
    drawModernHybridTaxi(1320, 410);

  } else {
    // ------------------------------------------
    // 2150: NEO-MANHATTAN CYBERPUNK (Múltiples formas geométricas, pasarelas aéreas y alturas extremas)
    // ------------------------------------------
    // Complejo Megatorre Cuántica Central con alas angulares y terrazas
    // 1. Ala izquierda con fachada angular inclinada
    ctx.fillStyle = '#09081a';
    ctx.beginPath();
    ctx.moveTo(440, 440);
    ctx.lineTo(440, 230);
    ctx.lineTo(510, 160); // Inclinación a 45 grados
    ctx.lineTo(510, 440);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#00f3ff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Paneles solares hexagonales en el ala inclinada
    ctx.fillStyle = 'rgba(0, 243, 255, 0.25)';
    ctx.fillRect(455, 260, 40, 70);

    // 2. Torre Central Monumental (Altísima, alcanza y = 70)
    ctx.fillStyle = '#120b29';
    ctx.fillRect(510, 70, 180, 370);
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 2;
    ctx.strokeRect(510, 70, 180, 370);

    // Letrero holográfico pulsante
    ctx.font = 'bold 12px "Press Start 2P", monospace';
    ctx.fillStyle = '#a855f7';
    ctx.shadowColor = '#a855f7';
    ctx.shadowBlur = 12;
    ctx.fillText('QUANTUM SPIRE', 525, 110);
    ctx.fillStyle = '#00f3ff';
    ctx.fillText('NEO-MANHATTAN 2150', 515, 135);
    ctx.shadowBlur = 0;

    // Núcleo cuántico vertical brillante en la torre
    ctx.fillStyle = '#ff007f';
    ctx.shadowColor = '#ff007f';
    ctx.shadowBlur = 10;
    ctx.fillRect(595, 150, 10, 240);
    ctx.shadowBlur = 0;

    // 3. Ala derecha con terraza en voladizo (Cantilever sky-deck)
    ctx.fillStyle = '#180f33';
    ctx.fillRect(690, 180, 95, 260);
    ctx.strokeStyle = '#a855f7';
    ctx.strokeRect(690, 180, 95, 260);

    // Terraza en voladizo que sobresale suspendida en el aire hacia la calle
    ctx.fillStyle = 'rgba(0, 243, 255, 0.3)';
    ctx.fillRect(720, 230, 80, 16);
    ctx.strokeStyle = '#00f3ff';
    ctx.strokeRect(720, 230, 80, 16);

    // Pasarela aérea (Skybridge) a 200px de altura conectando con la torre adyacente
    ctx.fillStyle = 'rgba(168, 85, 247, 0.35)';
    ctx.fillRect(785, 140, 90, 18);
    ctx.strokeStyle = '#a855f7';
    ctx.strokeRect(785, 140, 90, 18);

    // Anillo holográfico giratorio flotando en la cúspide de la torre central
    const ringAngle = Date.now() / 400;
    ctx.save();
    ctx.translate(600, 55);
    ctx.strokeStyle = '#00f3ff';
    ctx.shadowColor = '#00f3ff';
    ctx.shadowBlur = 15;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(0, 0, 36, 10 + Math.sin(ringAngle) * 4, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.restore();

    // Torre secundaria futurista con escalonamiento (x: 1100)
    ctx.fillStyle = '#110b26';
    ctx.fillRect(1100, 120, 160, 320);
    ctx.strokeStyle = '#38bdf8';
    ctx.strokeRect(1100, 120, 160, 320);
    ctx.fillStyle = '#1e1b4b';
    ctx.fillRect(1130, 70, 100, 50); // Cima escalonada
    ctx.strokeStyle = '#ff007f';
    ctx.strokeRect(1130, 70, 100, 50);

    // Taxis voladores en autopistas aéreas a diferentes alturas
    const flyX1 = ((Date.now() / 7) % 1800);
    const flyX2 = ((Date.now() / 5 + 600) % 1800);
    drawHoverTaxi(flyX1, 85);
    drawHoverTaxi(flyX2, 145);

    // Dron centinela flotante con foco de escaneo
    drawSecurityDrone(830, 270);
    drawSecurityDrone(1320, 220);
  }
}

// ------------------------------------------
// Objetos y Atrezo Pixel Art Específico
// ------------------------------------------

// Puesto callejero clásico de Hot Dogs & Pretzels de NYC (2026)
function drawHotDogCart(x, y) {
  ctx.save();
  // Carro rectangular metálico de acero inoxidable
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(x, y - 10, 48, 26);
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x, y - 10, 48, 26);

  // Ruedas del carrito
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(x + 10, y + 18, 7, 0, Math.PI * 2);
  ctx.arc(x + 38, y + 18, 7, 0, Math.PI * 2);
  ctx.fill();

  // Botes de condimentos (Ketchup rojo y Mostaza amarilla)
  ctx.fillStyle = '#ef4444'; // ketchup
  ctx.fillRect(x + 8, y - 18, 4, 8);
  ctx.fillStyle = '#eab308'; // mostaza
  ctx.fillRect(x + 14, y - 18, 4, 8);

  // Vitrina de pretzels y perritos
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.fillRect(x + 22, y - 18, 20, 8);

  // Poste de la sombrilla
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(x + 24, y - 10);
  ctx.lineTo(x + 24, y - 48);
  ctx.stroke();

  // Sombrilla icónica a rayas amarillas y rojas
  for (let s = 0; s < 6; s++) {
    ctx.fillStyle = (s % 2 === 0) ? '#eab308' : '#dc2626';
    ctx.beginPath();
    ctx.moveTo(x + 24, y - 48);
    ctx.lineTo(x - 6 + s * 10, y - 36);
    ctx.lineTo(x + 4 + s * 10, y - 36);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

// Estación de bicicletas compartidas Citi Bike (2026)
function drawCitiBikeStation(x, y) {
  ctx.save();
  // Base de anclaje de metal
  ctx.fillStyle = '#334155';
  ctx.fillRect(x, y + 10, 50, 8);

  // Bicicleta 1 (Azul Citi Bike)
  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 2;
  // Ruedas
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(x + 8, y + 12, 6, 0, Math.PI * 2);
  ctx.arc(x + 24, y + 12, 6, 0, Math.PI * 2);
  ctx.fill();
  // Cuadro azul
  ctx.beginPath();
  ctx.moveTo(x + 8, y + 12);
  ctx.lineTo(x + 16, y + 6);
  ctx.lineTo(x + 24, y + 12);
  ctx.moveTo(x + 16, y + 6);
  ctx.lineTo(x + 20, y + 2); // manillar
  ctx.stroke();

  // Bicicleta 2
  ctx.beginPath();
  ctx.arc(x + 32, y + 12, 6, 0, Math.PI * 2);
  ctx.arc(x + 44, y + 12, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + 32, y + 12);
  ctx.lineTo(x + 38, y + 6);
  ctx.lineTo(x + 44, y + 12);
  ctx.stroke();
  ctx.restore();
}

// Taxi contemporáneo híbrido amarillo de Nueva York (2026)
function drawModernHybridTaxi(x, y) {
  ctx.save();
  // Carrocería moderna amarilla brillante con líneas aerodinámicas
  ctx.fillStyle = '#eab308';
  ctx.fillRect(x, y - 4, 62, 17);
  ctx.fillRect(x + 14, y - 14, 34, 11);

  // Parabrisas aerodinámico tintado oscuro
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(x + 16, y - 12, 10, 8);
  ctx.fillRect(x + 30, y - 12, 14, 8);

  // Anuncio publicitario digital en el techo (pantalla LED brillante)
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(x + 22, y - 19, 18, 5);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x + 24, y - 18, 14, 3);

  // Faros LED modernos blancos y pilotos traseros rojos
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x + 58, y - 1, 4, 4); // faro delantero
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(x, y - 1, 3, 4); // piloto trasero

  // Ruedas de aleación modernas
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(x + 12, y + 13, 8, 0, Math.PI * 2);
  ctx.arc(x + 48, y + 13, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#94a3b8'; // llanta
  ctx.beginPath();
  ctx.arc(x + 12, y + 13, 4, 0, Math.PI * 2);
  ctx.arc(x + 48, y + 13, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// Peatones contemporáneos con smartphones y mochilas (2026)
function drawModernPedestrians(x, y) {
  ctx.save();
  // Peatón 1: Con sudadera verde y mirando la pantalla del smartphone
  ctx.fillStyle = '#0f766e'; // sudadera
  ctx.fillRect(x, y, 10, 16);
  ctx.fillStyle = '#fed7aa'; // rostro
  ctx.fillRect(x + 2, y - 7, 7, 7);
  ctx.fillStyle = '#451a03'; // pelo corto
  ctx.fillRect(x + 2, y - 9, 7, 3);
  ctx.fillStyle = '#1e293b'; // vaqueros
  ctx.fillRect(x + 1, y + 16, 8, 14);
  // Smartphone con pantalla táctil encendida azul
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(x + 10, y + 4, 4, 5);

  // Peatón 2: Con chaqueta plumas roja y mochila
  ctx.fillStyle = '#dc2626'; // plumas rojo
  ctx.fillRect(x + 22, y - 2, 12, 18);
  ctx.fillStyle = '#7f1d1d'; // mochila en la espalda
  ctx.fillRect(x + 18, y + 1, 4, 12);
  ctx.fillStyle = '#fed7aa'; // rostro
  ctx.fillRect(x + 25, y - 9, 7, 7);
  ctx.fillStyle = '#ffffff'; // auriculares inalámbricos en la oreja
  ctx.fillRect(x + 24, y - 6, 2, 3);
  ctx.fillStyle = '#334155'; // pantalones
  ctx.fillRect(x + 23, y + 16, 9, 14);

  ctx.restore();
}

// Coche clásico Ford Modelo T de los años 20
function drawVintageFordCar(x, y) {
  ctx.save();
  // Carrocería negra cuadrada clásica
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(x, y - 5, 54, 18);
  ctx.fillRect(x + 12, y - 22, 28, 18); // cabina alta con techo
  // Parabrisas vertical
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.fillRect(x + 14, y - 19, 8, 12);
  ctx.fillRect(x + 25, y - 19, 12, 12);
  // Capó alargado del motor
  ctx.fillStyle = '#18181b';
  ctx.fillRect(x + 40, y - 10, 14, 10);
  // Faros redondos de latón amarillo al frente
  ctx.fillStyle = '#fde047';
  ctx.beginPath();
  ctx.arc(x + 55, y - 3, 4, 0, Math.PI * 2);
  ctx.fill();
  // Ruedas grandes de radios finos estilo años 20
  ctx.strokeStyle = '#020617';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(x + 10, y + 13, 9, 0, Math.PI * 2);
  ctx.arc(x + 44, y + 13, 9, 0, Math.PI * 2);
  ctx.stroke();
  // Tapacubos central de latón
  ctx.fillStyle = '#d97706';
  ctx.beginPath();
  ctx.arc(x + 10, y + 13, 3, 0, Math.PI * 2);
  ctx.arc(x + 44, y + 13, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// Carruaje tirado por caballos de los 1800s
function drawVictorianCarriage(x, y) {
  ctx.save();
  // Carruaje negro
  ctx.fillStyle = '#1c1917';
  ctx.fillRect(x, y - 20, 50, 25);
  ctx.fillRect(x + 10, y - 35, 30, 16);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.fillRect(x + 14, y - 31, 10, 10); // ventanilla
  // Grandes ruedas de madera
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x + 10, y + 10, 11, 0, Math.PI * 2);
  ctx.arc(x + 40, y + 10, 11, 0, Math.PI * 2);
  ctx.stroke();
  // Silueta del caballo enganchado al frente
  ctx.fillStyle = '#292524';
  ctx.fillRect(x + 55, y - 16, 26, 18); // lomo
  ctx.fillRect(x + 72, y - 30, 10, 18); // cuello
  ctx.fillRect(x + 76, y - 34, 12, 10); // cabeza
  ctx.fillRect(x + 57, y + 2, 4, 16);   // patas
  ctx.fillRect(x + 74, y + 2, 4, 16);
  ctx.restore();
}

// Barril de madera
function drawWoodenBarrel(x, y) {
  ctx.fillStyle = '#78350f';
  ctx.fillRect(x, y, 16, 20);
  ctx.fillStyle = '#292524';
  ctx.fillRect(x, y + 4, 16, 2);
  ctx.fillRect(x, y + 14, 16, 2);
}

// Cabina arcade recreativa de los 90s
function drawArcadeCabinet(x, y, bodyColor, neonColor, gameTitle) {
  ctx.save();
  ctx.fillStyle = bodyColor;
  ctx.fillRect(x, y, 28, 55);
  // Marquesina superior iluminada
  ctx.fillStyle = neonColor;
  ctx.fillRect(x + 2, y + 3, 24, 9);
  // Pantalla CRT con juego pixel art
  ctx.fillStyle = '#000000';
  ctx.fillRect(x + 3, y + 15, 22, 18);
  ctx.fillStyle = (Math.floor(Date.now() / 200) % 2 === 0) ? '#39ff14' : '#f59e0b';
  ctx.fillRect(x + 6, y + 18, 6, 8); // personajito en pantalla
  ctx.fillStyle = '#ff2a85';
  ctx.fillRect(x + 15, y + 20, 6, 6);
  // Panel de control con joystick y botones
  ctx.fillStyle = '#334155';
  ctx.fillRect(x + 2, y + 35, 24, 7);
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(x + 6, y + 36, 3, 3); // palanca
  ctx.fillStyle = '#3b82f6';
  ctx.fillRect(x + 14, y + 37, 2, 2);
  ctx.fillRect(x + 18, y + 37, 2, 2);
  ctx.restore();
}

// Pandilla callejera de los 90s reunida en la acera
function draw90sGangMembers(x, y) {
  ctx.save();
  // Miembro 1: Chaqueta bomber azul y gorra ladeada
  ctx.fillStyle = '#1e3a8a';
  ctx.fillRect(x, y, 12, 18); // chaqueta bomber
  ctx.fillStyle = '#fde047';
  ctx.fillRect(x + 3, y + 4, 6, 2); // cadena de oro
  ctx.fillStyle = '#fed7aa';
  ctx.fillRect(x + 2, y - 8, 8, 8); // cabeza
  ctx.fillStyle = '#dc2626';
  ctx.fillRect(x, y - 12, 12, 5); // gorra roja ladeada
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(x + 1, y + 18, 10, 16); // vaqueros anchos

  // Miembro 2: Chaqueta bomber negra y bandana
  ctx.fillStyle = '#18181b';
  ctx.fillRect(x + 20, y - 2, 14, 20);
  ctx.fillStyle = '#fed7aa';
  ctx.fillRect(x + 23, y - 10, 8, 8);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x + 22, y - 8, 10, 3); // bandana
  ctx.fillStyle = '#475569';
  ctx.fillRect(x + 22, y + 18, 10, 16);

  // Miembro 3: Sudadera con capucha
  ctx.fillStyle = '#7f1d1d';
  ctx.fillRect(x + 40, y + 1, 13, 18);
  ctx.fillStyle = '#991b1b';
  ctx.beginPath();
  ctx.arc(x + 46, y - 4, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(x + 41, y + 19, 11, 15);
  ctx.restore();
}

// Cabina telefónica de monedas clásica de NYC
function drawPayphoneBooth(x, y) {
  ctx.save();
  ctx.fillStyle = '#334155';
  ctx.fillRect(x, y, 25, 55);
  ctx.strokeStyle = '#00f3ff';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x, y, 25, 55);
  // Cristalera
  ctx.fillStyle = 'rgba(0, 243, 255, 0.2)';
  ctx.fillRect(x + 2, y + 4, 21, 35);
  // Teléfono de monedas
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(x + 7, y + 10, 11, 16);
  // Listín telefónico amarillo colgando
  ctx.fillStyle = '#facc15';
  ctx.fillRect(x + 6, y + 30, 8, 10);
  ctx.restore();
}

// Boombox radio cassette de los 70s
function drawRetroBoombox(x, y) {
  ctx.save();
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(x, y, 35, 20);
  ctx.strokeStyle = '#475569';
  ctx.strokeRect(x, y, 35, 20);
  // Asa superior
  ctx.strokeRect(x + 8, y - 5, 19, 5);
  // Altavoces circulares
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(x + 8, y + 11, 6, 0, Math.PI * 2);
  ctx.arc(x + 27, y + 11, 6, 0, Math.PI * 2);
  ctx.fill();
  // Doble pletina de cassette
  ctx.fillStyle = '#334155';
  ctx.fillRect(x + 15, y + 6, 6, 9);
  ctx.restore();
}

// Taxi Checker clásico amarillo con tablero ajedrezado (1970)
function drawCheckerTaxi(x, y) {
  ctx.save();
  ctx.fillStyle = '#facc15';
  ctx.fillRect(x, y, 56, 18);
  ctx.fillRect(x + 14, y - 10, 28, 11);
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(x + 16, y - 8, 10, 7);
  ctx.fillRect(x + 29, y - 8, 10, 7);
  // Franja ajedrezada negra y blanca
  for (let cx = x + 2; cx < x + 54; cx += 6) {
    ctx.fillStyle = '#000000';
    ctx.fillRect(cx, y + 6, 3, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(cx + 3, y + 6, 3, 3);
  }
  // Ruedas
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(x + 8, y + 12, 10, 10);
  ctx.fillRect(x + 38, y + 12, 10, 10);
  ctx.restore();
}

// Taxi Crown Victoria de los 90s
function drawCrownVicTaxi(x, y) {
  ctx.save();
  ctx.fillStyle = '#eab308';
  ctx.fillRect(x, y, 60, 16);
  ctx.fillRect(x + 16, y - 9, 28, 10);
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(x + 18, y - 7, 11, 6);
  ctx.fillRect(x + 31, y - 7, 11, 6);
  // Anuncio publicitario en el techo
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x + 22, y - 14, 16, 5);
  // Ruedas
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(x + 10, y + 10, 10, 9);
  ctx.fillRect(x + 42, y + 10, 10, 9);
  ctx.restore();
}

// Taxi volador cyberpunk (2150)
function drawHoverTaxi(x, y) {
  ctx.save();
  ctx.fillStyle = '#facc15';
  ctx.fillRect(x, y, 48, 14);
  ctx.fillRect(x + 12, y - 8, 24, 9);
  ctx.fillStyle = '#00f3ff';
  ctx.fillRect(x + 14, y - 6, 20, 6); // cristalera holográfica
  // Propulsores iónicos inferiores
  ctx.fillStyle = '#00f3ff';
  ctx.shadowColor = '#00f3ff';
  ctx.shadowBlur = 10;
  ctx.fillRect(x + 6, y + 14, 10, 3);
  ctx.fillRect(x + 32, y + 14, 10, 3);
  ctx.shadowBlur = 0;
  ctx.restore();
}

// Dron centinela flotante (2150)
function drawSecurityDrone(x, y) {
  ctx.save();
  ctx.fillStyle = '#475569';
  ctx.beginPath();
  ctx.arc(x, y, 12, 0, Math.PI * 2);
  ctx.fill();
  // Ojo rojo de escaneo
  ctx.fillStyle = '#ef4444';
  ctx.shadowColor = '#ef4444';
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.arc(x, y, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  // Cono de luz roja de escaneo hacia el suelo
  ctx.fillStyle = 'rgba(239, 68, 68, 0.08)';
  ctx.beginPath();
  ctx.moveTo(x, y + 6);
  ctx.lineTo(x - 35, 440);
  ctx.lineTo(x + 35, 440);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// ------------------------------------------
// PERSONAJE PIXEL ART CON ATUENDO AUTÉNTICO POR ÉPOCA
// ------------------------------------------
function drawTimeTravelerInLevel(lvl) {
  const x = lvl.playerX;
  const y = lvl.playerY - 2;
  const year = lvl.year;

  ctx.save();
  ctx.translate(x, y);

  if (lvl.facingLeft) {
    ctx.scale(-1, 1);
  }

  const bob = (lvl.isGrounded && Math.abs(lvl.vx) > 0.5) ? Math.sin(lvl.walkCycle) * 3 : 0;
  const legSwing = (lvl.isGrounded && Math.abs(lvl.vx) > 0.5) ? Math.cos(lvl.walkCycle) * 6 : (lvl.isGrounded ? 0 : 4);

  // Sombra en el suelo (solo si está en el suelo o muy cerca)
  if (lvl.isGrounded) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(0, 20, 12, 4, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // ==========================================
  // ATUENDO SEGÚN LA ÉPOCA
  // ==========================================

  if (year === 1880) {
    // ------------------------------------------
    // 1880: CABALLERO VICTORIANO / INVENTOR A VAPOR
    // ------------------------------------------
    // 1. Botas victorianas y pantalones grises
    ctx.fillStyle = '#0f172a'; // Botas altas negras
    ctx.fillRect(-5 - legSwing * 0.5, 12 + bob, 4, 8);
    ctx.fillRect(2 + legSwing * 0.5, 12 + bob, 4, 8);
    ctx.fillStyle = '#475569'; // Pantalón formal gris
    ctx.fillRect(-6, 4 + bob, 12, 9);

    // 2. Frac negro victoriano y chaleco de tweed
    ctx.fillStyle = '#18181b'; // Frac negro con cola
    ctx.fillRect(-7, -8 + bob, 14, 17);
    ctx.fillStyle = '#78350f'; // Chaleco de tweed marrón
    ctx.fillRect(-4, -6 + bob, 8, 12);
    ctx.fillStyle = '#d97706'; // Cadena dorada de reloj de bolsillo
    ctx.fillRect(-3, -2 + bob, 6, 2);

    // 3. Cuello alto victoriano y corbatón
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-5, -11 + bob, 10, 3);
    ctx.fillStyle = '#b91c1c'; // Corbatón granate
    ctx.fillRect(-2, -9 + bob, 4, 4);

    // 4. Rostro victoriano con patillas
    ctx.fillStyle = '#fed7aa';
    ctx.fillRect(-4, -17 + bob, 8, 7);
    ctx.fillStyle = '#451a03'; // Patillas victorianas
    ctx.fillRect(-5, -16 + bob, 2, 5);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(1, -15 + bob, 2, 2); // ojo

    // 5. CHISTERA VICTORIANA ALTA (Top Hat)
    ctx.fillStyle = '#09090b'; // Ala rígida
    ctx.fillRect(-10, -19 + bob, 20, 3);
    ctx.fillStyle = '#18181b'; // Copa alta victoriana
    ctx.fillRect(-7, -33 + bob, 14, 15);
    ctx.fillStyle = '#d97706'; // Cinta cobriza de la chistera
    ctx.fillRect(-7, -21 + bob, 14, 2);

    // 6. Reloj de bolsillo de latón
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(6, -1 + bob, 3, 0, Math.PI * 2);
    ctx.fill();

  } else if (year === 1920) {
    // ------------------------------------------
    // 1920: DETECTIVE / MOBSTER SPEAKEASY
    // ------------------------------------------
    // 1. Zapatos Oxford y pantalones de raya diplomática
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-5 - legSwing * 0.5, 12 + bob, 4, 8);
    ctx.fillRect(2 + legSwing * 0.5, 12 + bob, 4, 8);
    ctx.fillStyle = '#334155';
    ctx.fillRect(-6, 5 + bob, 12, 8);

    // 2. Gabardina clásica cruzada marrón tabaco
    ctx.fillStyle = '#854d0e';
    ctx.fillRect(-7, -7 + bob, 14, 18);
    ctx.fillStyle = '#a16207'; // Solapas anchas
    ctx.fillRect(-4, -5 + bob, 8, 14);

    // 3. Camisa blanca y corbata de seda roja
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-4, -9 + bob, 8, 3);
    ctx.fillStyle = '#dc2626'; // Corbata roja
    ctx.fillRect(-1, -7 + bob, 2, 9);

    // 4. Rostro y sombrero Fedora clásico
    ctx.fillStyle = '#fed7aa';
    ctx.fillRect(-4, -17 + bob, 8, 7);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(1, -15 + bob, 2, 2); // ojo

    // Sombrero Fedora gris oscuro con cinta negra
    ctx.fillStyle = '#334155'; // Ala del sombrero
    ctx.fillRect(-9, -19 + bob, 18, 3);
    ctx.fillStyle = '#475569'; // Copa
    ctx.fillRect(-6, -26 + bob, 12, 7);
    ctx.fillStyle = '#0f172a'; // Cinta negra
    ctx.fillRect(-6, -21 + bob, 12, 2);

    // Reloj cuántico
    ctx.fillStyle = '#00f3ff';
    ctx.beginPath();
    ctx.arc(6, -1 + bob, 3, 0, Math.PI * 2);
    ctx.fill();

  } else if (year === 1970) {
    // ------------------------------------------
    // 1970: DISCO FUNK / BRONX 70s
    // ------------------------------------------
    // 1. Zapatos de plataforma y PANTALONES ACAMPANADOS (Bell-bottoms)
    ctx.fillStyle = '#78350f'; // Plataformas de cuero
    ctx.fillRect(-6 - legSwing * 0.5, 13 + bob, 6, 7);
    ctx.fillRect(2 + legSwing * 0.5, 13 + bob, 6, 7);
    // Vaqueros acampanados en campana ancha
    ctx.fillStyle = '#1d4ed8';
    ctx.beginPath();
    ctx.moveTo(-5, 4 + bob);
    ctx.lineTo(5, 4 + bob);
    ctx.lineTo(8 + legSwing * 0.4, 14 + bob);
    ctx.lineTo(-8 - legSwing * 0.4, 14 + bob);
    ctx.closePath();
    ctx.fill();

    // 2. Camisa disco abierta naranja brillante con solapas en pico
    ctx.fillStyle = '#f97316';
    ctx.fillRect(-7, -7 + bob, 14, 14);
    ctx.fillStyle = '#fed7aa'; // Pecho al descubierto
    ctx.fillRect(-2, -7 + bob, 4, 8);
    ctx.fillStyle = '#eab308'; // Medallón de oro disco
    ctx.fillRect(-1, -1 + bob, 3, 3);

    // 3. Gafas de aviador y rostro
    ctx.fillStyle = '#fed7aa';
    ctx.fillRect(-4, -16 + bob, 8, 8);
    // Gafas de aviador doradas
    ctx.fillStyle = '#ca8a04';
    ctx.fillRect(0, -14 + bob, 4, 3);

    // 4. PEINADO AFRO VOLUMINOSO REDONDEADO
    ctx.fillStyle = '#171717';
    ctx.beginPath();
    ctx.arc(0, -18 + bob, 11, 0, Math.PI * 2);
    ctx.fill();
    // Cinta roja disco en la frente
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(-6, -17 + bob, 12, 2);

    // Reloj
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(6, 0 + bob, 3, 0, Math.PI * 2);
    ctx.fill();

  } else if (year === 1990) {
    // ------------------------------------------
    // 1990: GRUNGE SKATER / ARCADE 90s
    // ------------------------------------------
    // 1. Zapatillas de skate altas estilo Converse y Baggy Jeans caídos
    ctx.fillStyle = '#0f172a'; // Zapatilla negra
    ctx.fillRect(-5 - legSwing * 0.5, 13 + bob, 5, 7);
    ctx.fillRect(2 + legSwing * 0.5, 13 + bob, 5, 7);
    ctx.fillStyle = '#ffffff'; // Puntera de goma blanca
    ctx.fillRect(-2 - legSwing * 0.5, 16 + bob, 3, 4);
    ctx.fillRect(5 + legSwing * 0.5, 16 + bob, 3, 4);

    // Vaqueros anchos holgados desgastados (Baggy Jeans)
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(-7, 4 + bob, 14, 10);
    // Cadena metálica de cartera
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(-7, 6 + bob, 2, 6);

    // 2. Camisa de franela a cuadros grunge abierta sobre camiseta negra
    ctx.fillStyle = '#09090b'; // Camiseta interior negra
    ctx.fillRect(-6, -7 + bob, 12, 13);
    // Franela a cuadros roja y negra (patrón ajedrezado)
    ctx.fillStyle = '#b91c1c';
    ctx.fillRect(-8, -7 + bob, 3, 14); // lateral izquierdo
    ctx.fillRect(5, -7 + bob, 3, 14);  // lateral derecho
    ctx.fillStyle = '#450a0a';
    ctx.fillRect(-8, -4 + bob, 3, 3);
    ctx.fillRect(5, -4 + bob, 3, 3);

    // 3. Rostro y flequillo grunge
    ctx.fillStyle = '#fed7aa';
    ctx.fillRect(-4, -16 + bob, 8, 8);
    ctx.fillStyle = '#78350f'; // Mechones de pelo despeinado
    ctx.fillRect(-5, -14 + bob, 2, 4);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(1, -14 + bob, 2, 2); // ojo

    // 4. GORRA DE BÉISBOL HACIA ATRÁS (Backwards Cap)
    ctx.fillStyle = '#dc2626'; // Gorra roja
    ctx.fillRect(-6, -20 + bob, 12, 5);
    ctx.fillStyle = '#ffffff'; // Visera hacia atrás
    ctx.fillRect(-9, -17 + bob, 4, 2);

    // Reloj digital verde neón
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(5, -1 + bob, 3, 3);

  } else if (year === 2026) {
    // ------------------------------------------
    // 2026: MANHATTAN ACTUAL (URBAN TECH / CASUAL)
    // ------------------------------------------
    // 1. Zapatillas deportivas blancas modernas (con suela de goma)
    ctx.fillStyle = '#ffffff'; // Zapatillas blancas modernas
    ctx.fillRect(-5 - legSwing * 0.5, 13 + bob, 5, 7);
    ctx.fillRect(2 + legSwing * 0.5, 13 + bob, 5, 7);
    ctx.fillStyle = '#94a3b8'; // Detalle de suela gris
    ctx.fillRect(-5 - legSwing * 0.5, 18 + bob, 5, 2);
    ctx.fillRect(2 + legSwing * 0.5, 18 + bob, 5, 2);

    // 2. Pantalones vaqueros slim oscuros
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-6, 4 + bob, 12, 10);

    // 3. Sudadera streetwear moderna con capucha azul marino
    ctx.fillStyle = '#1e3a8a'; // Sudadera azul marino moderna
    ctx.fillRect(-7, -7 + bob, 14, 13);
    // Dobladillo de camiseta blanca asomando abajo
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-6, 5 + bob, 12, 2);
    // Cordones blancos de la capucha en el pecho
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-2, -5 + bob, 1, 6);
    ctx.fillRect(1, -5 + bob, 1, 6);

    // 4. Rostro y corte de pelo moderno con fade
    ctx.fillStyle = '#fed7aa';
    ctx.fillRect(-4, -16 + bob, 8, 8);
    // Pelo corto moderno castaño con degradado
    ctx.fillStyle = '#3e2723';
    ctx.fillRect(-4, -20 + bob, 8, 4);
    ctx.fillRect(-5, -18 + bob, 2, 4);
    // Auricular inalámbrico blanco tipo AirPod en la oreja
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-5, -14 + bob, 2, 3);
    // Ojo
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(1, -14 + bob, 2, 2);

    // 5. SMARTPHONE MODERNO EN LA MANO CON PANTALLA BRILLANTE AZUL
    ctx.fillStyle = '#0f172a'; // Teléfono negro
    ctx.fillRect(5, -2 + bob, 4, 7);
    ctx.fillStyle = '#38bdf8'; // Pantalla táctil iluminada
    ctx.fillRect(5, -1 + bob, 3, 5);

  } else {
    // ------------------------------------------
    // 2150: CYBERPUNK NEO-MANHATTAN OPERATIVE
    // ------------------------------------------
    // 1. Botas exoesqueleto cibernéticas
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-5 - legSwing * 0.5, 12 + bob, 5, 8);
    ctx.fillRect(2 + legSwing * 0.5, 12 + bob, 5, 8);
    // Placas de rodilla blindadas
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(-6, 7 + bob, 4, 4);
    ctx.fillRect(2, 7 + bob, 4, 4);

    // ¡Propulsores de plasma en los pies al saltar en el aire!
    if (!lvl.isGrounded) {
      ctx.fillStyle = '#00f3ff';
      ctx.shadowColor = '#00f3ff';
      ctx.shadowBlur = 8;
      ctx.fillRect(-5, 20, 3, 5 + Math.random() * 4);
      ctx.fillRect(3, 20, 3, 5 + Math.random() * 4);
      ctx.shadowBlur = 0;
    }

    // 2. Traje táctico de fibra de carbono negro con líneas de circuito neón
    ctx.fillStyle = '#09090b';
    ctx.fillRect(-7, -7 + bob, 14, 18);
    ctx.fillStyle = '#00f3ff'; // Líneas de circuito cian
    ctx.fillRect(-5, -5 + bob, 2, 12);
    ctx.fillRect(3, -5 + bob, 2, 12);
    ctx.fillStyle = '#ff2a85'; // Núcleo cuántico en el pecho
    ctx.fillRect(-1, -3 + bob, 3, 3);

    // 3. Rostro y VISOR CIBERNÉTICO LED CIAN ILUMINADO
    ctx.fillStyle = '#fed7aa';
    ctx.fillRect(-4, -16 + bob, 8, 8);
    // Visor LED que brilla
    ctx.fillStyle = '#00f3ff';
    ctx.shadowColor = '#00f3ff';
    ctx.shadowBlur = 10;
    ctx.fillRect(-2, -15 + bob, 8, 4);
    ctx.shadowBlur = 0;

    // Auricular neuronal en la sien
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(-5, -15 + bob, 2, 3);
    // Casco cibernético elegante
    ctx.fillStyle = '#1e1b4b';
    ctx.fillRect(-6, -21 + bob, 12, 6);

    // Guantelete cuántico
    ctx.fillStyle = '#a855f7';
    ctx.beginPath();
    ctx.arc(6, -1 + bob, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

// HUD Superpuesto en el Nivel
function renderLevelHUD(lvl) {
  // Barra Superior Translúcida
  ctx.fillStyle = 'rgba(8, 12, 24, 0.88)';
  ctx.fillRect(16, 16, 928, 44);
  ctx.strokeStyle = lvl.themeColor;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(16, 16, 928, 44);

  // Badge Época
  ctx.font = 'bold 11px "Press Start 2P", monospace';
  ctx.fillStyle = lvl.themeColor;
  ctx.textAlign = 'left';
  ctx.fillText(`ÉPOCA: ${lvl.title}`, 32, 42);

  // Contador de Cristales
  ctx.font = '10px "Press Start 2P", monospace';
  ctx.fillStyle = '#ffffff';
  let crystalsIcons = '';
  for (let i = 0; i < lvl.totalCrystals; i++) {
    crystalsIcons += (i < lvl.crystalsCollected) ? '◆ ' : '◇ ';
  }
  ctx.fillText(`CRISTALES: ${crystalsIcons}(${lvl.crystalsCollected}/${lvl.totalCrystals})`, 480, 42);

  // Barra de progreso de la calle
  const progressRatio = Math.min(1, Math.max(0, lvl.playerX / lvl.worldWidth));
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(800, 32, 120, 12);
  ctx.fillStyle = (lvl.crystalsCollected === lvl.totalCrystals) ? '#39ff14' : lvl.themeColor;
  ctx.fillRect(800, 32, 120 * progressRatio, 12);
  ctx.strokeStyle = '#475569';
  ctx.strokeRect(800, 32, 120, 12);
}


// ------------------------------------------
// Lógica de Transición (Salto Cuántico)
// ------------------------------------------
function updateTransition() {
  state.transitionTimer++;
  if (state.transitionTimer >= state.transitionDuration) {
    if (state.transitionTarget === 'LEVEL') {
      state.currentScene = 'LEVEL';
      // Mostrar botón volver al mapa
      const btnReturn = document.getElementById('btnReturnToMap');
      if (btnReturn) btnReturn.style.display = 'inline-flex';

      // Actualizar tips
      const tipMove = document.getElementById('controlTipMove');
      const tipAction = document.getElementById('controlTipAction');
      if (tipMove) tipMove.innerHTML = '<span class="key-tag">←</span> <span class="key-tag">→</span> Mover';
      if (tipAction) tipAction.innerHTML = '<span class="key-tag">ESPACIO</span> / <span class="key-tag">↑</span> Saltar';

      const btnTouchSpace = document.getElementById('btnTouchSpace');
      if (btnTouchSpace) btnTouchSpace.innerHTML = '▲ SALTAR';

      showToast(`⚡ ¡LLEGASTE A ${state.levelData.year}! Recoge los 3 crono-cristales y cruza el portal.`);
    } else {
      state.currentScene = 'MAP';
    }
  }
}

function renderTransition() {
  // Pantalla de vórtice de salto temporal a pantalla completa
  const progress = state.transitionTimer / state.transitionDuration;
  ctx.fillStyle = '#060814';
  ctx.fillRect(0, 0, 960, 540);

  const cx = 480;
  const cy = 270;
  const maxR = progress * 600;

  for (let r = maxR; r > 10; r -= 28) {
    ctx.strokeStyle = (r % 2 === 0) ? '#00f3ff' : '#ff2a85';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Flash blanco
  ctx.fillStyle = `rgba(255, 255, 255, ${Math.sin(progress * Math.PI) * 0.8})`;
  ctx.fillRect(0, 0, 960, 540);

  // Texto de salto cuántico
  ctx.font = 'bold 16px "Press Start 2P", monospace';
  ctx.fillStyle = '#ffb830';
  ctx.textAlign = 'center';
  ctx.fillText('VIAJANDO EN EL TIEMPO...', cx, cy);
}


// ------------------------------------------
// Lógica de Victoria
// ------------------------------------------
function updateVictory() {
  // Actualizar fuegos artificiales
  state.victoryFireworks.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    p.life -= p.decay;
  });
}

function renderVictory() {
  // Fondo oscuro con partículas de celebración
  ctx.fillStyle = 'rgba(5, 7, 18, 0.92)';
  ctx.fillRect(0, 0, 960, 540);

  // Fuegos artificiales
  state.victoryFireworks.forEach(p => {
    if (p.life > 0) {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.life;
      ctx.fillRect(p.x, p.y, 4, 4);
    }
  });
  ctx.globalAlpha = 1;

  // Tarjeta de Victoria
  ctx.save();
  const cardX = 180;
  const cardY = 90;
  const cardW = 600;
  const cardH = 360;

  ctx.fillStyle = '#0f1428';
  ctx.fillRect(cardX, cardY, cardW, cardH);
  ctx.strokeStyle = '#39ff14';
  ctx.lineWidth = 3;
  ctx.shadowColor = '#39ff14';
  ctx.shadowBlur = 20;
  ctx.strokeRect(cardX, cardY, cardW, cardH);
  ctx.shadowBlur = 0;

  ctx.textAlign = 'center';

  // Título
  ctx.font = 'bold 16px "Press Start 2P", monospace';
  ctx.fillStyle = '#39ff14';
  ctx.fillText('★ ¡ÉPOCA ESTABILIZADA! ★', 480, 150);

  // Año completado
  ctx.font = 'bold 22px "Press Start 2P", monospace';
  ctx.fillStyle = '#ffb830';
  ctx.fillText(`AÑO ${state.levelData.year}`, 480, 195);

  ctx.font = '11px "Share Tech Mono", monospace';
  ctx.fillStyle = '#e2e8f0';
  ctx.fillText('Has recuperado los 3 crono-cristales y sellado la brecha temporal.', 480, 230);

  // Desbloqueo del siguiente nivel
  if (state.unlockedNextId) {
    const nextLvl = LEVELS.find(l => l.id === state.unlockedNextId);
    ctx.fillStyle = 'rgba(0, 243, 255, 0.15)';
    ctx.fillRect(220, 255, 520, 55);
    ctx.strokeStyle = '#00f3ff';
    ctx.lineWidth = 1;
    ctx.strokeRect(220, 255, 520, 55);

    ctx.font = 'bold 10px "Press Start 2P", monospace';
    ctx.fillStyle = '#00f3ff';
    ctx.fillText('¡NUEVA ÉPOCA DESBLOQUEADA EN EL MAPA!', 480, 280);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`NIVEL ${nextLvl.id}: ${nextLvl.year} (${nextLvl.sub})`, 480, 300);
  } else {
    ctx.font = 'bold 11px "Press Start 2P", monospace';
    ctx.fillStyle = '#00f3ff';
    ctx.fillText('¡TODAS LAS LÍNEAS TEMPORALES ESTÁN EN PAZ!', 480, 285);
  }

  // Botón para volver al mapa
  ctx.fillStyle = '#39ff14';
  ctx.fillRect(320, 345, 320, 45);
  ctx.font = 'bold 10px "Press Start 2P", monospace';
  ctx.fillStyle = '#052e16';
  ctx.fillText('VOLVER AL MAPA [ESPACIO]', 480, 372);

  ctx.restore();
}


// ==========================================
// 8. INTERACCIÓN DE USUARIO & HUD
// ==========================================
function updateHUD() {
  const hudYear = document.getElementById('hudCurrentYear');
  const hudStatus = document.getElementById('hudStatus');

  if (state.currentScene === 'LEVEL' && state.levelData) {
    if (hudYear) {
      hudYear.textContent = state.levelData.year;
      hudYear.style.color = state.levelData.themeColor;
    }
    if (hudStatus) {
      hudStatus.textContent = `CRISTALES: ${state.levelData.crystalsCollected}/${state.levelData.totalCrystals}`;
      hudStatus.style.color = (state.levelData.crystalsCollected === state.levelData.totalCrystals) ? '#39ff14' : '#00f3ff';
    }
  } else {
    const current = LEVELS.find(l => l.id === state.currentLevelId);
    if (hudYear && current) {
      hudYear.textContent = current.year;
      hudYear.style.color = current.themeColor;
    }
    if (hudStatus) {
      if (state.isMoving) {
        hudStatus.textContent = 'VIAJANDO...';
        hudStatus.style.color = 'var(--neon-amber)';
      } else {
        hudStatus.textContent = 'SINTONIZADO';
        hudStatus.style.color = 'var(--neon-cyan)';
      }
    }
  }
}

// Mostrar alerta tipo toast en pantalla
let toastTimeout = null;
function showToast(msg) {
  const toast = document.getElementById('screenToast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');

  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 2400);
}

// Modal informativo de la época
const modal = document.getElementById('timeModal');
const modalYear = document.getElementById('modalYear');
const modalTitle = document.getElementById('modalTitle');
const modalDesc = document.getElementById('modalDesc');
const modalLocation = document.getElementById('modalLocation');
const modalMission = document.getElementById('modalMission');
const modalDanger = document.getElementById('modalDanger');

function openLevelModal(level) {
  if (!modal) return;
  modalYear.textContent = level.year;
  modalYear.style.color = level.themeColor;
  modalTitle.textContent = level.title;
  modalDesc.textContent = level.details;
  modalLocation.textContent = level.district;
  modalMission.textContent = level.mission;
  modalDanger.textContent = level.danger;

  modal.classList.add('active');
}

function closeLevelModal() {
  if (modal) modal.classList.remove('active');
}


// ==========================================
// 9. EVENT LISTENERS (TECLADO, TOUCH Y CLIC)
// ==========================================

// Teclado: Keydown
window.addEventListener('keydown', (e) => {
  // Manejo según la escena actual
  if (state.currentScene === 'VICTORY') {
    if (e.code === 'Space' || e.code === 'Enter' || e.code === 'Escape') {
      returnToMap(state.unlockedNextId || state.currentLevelId);
      e.preventDefault();
    }
    return;
  }

  if (state.currentScene === 'LEVEL') {
    state.keysDown[e.code] = true;

    if (e.code === 'Escape') {
      returnToMap();
      e.preventDefault();
    }
    return;
  }

  // En MAPA:
  // Si el modal está abierto, Escape o Espacio lo cierran / inician
  if (modal.classList.contains('active')) {
    if (e.code === 'Escape') {
      closeLevelModal();
      e.preventDefault();
    } else if (e.code === 'Space' || e.code === 'Enter') {
      startLevel(state.currentLevelId);
      e.preventDefault();
    }
    return;
  }

  switch (e.code) {
    case 'ArrowUp':
    case 'KeyW':
      handleDirectionalInput('up');
      e.preventDefault();
      break;
    case 'ArrowDown':
    case 'KeyS':
      handleDirectionalInput('down');
      e.preventDefault();
      break;
    case 'ArrowLeft':
    case 'KeyA':
      handleDirectionalInput('left');
      e.preventDefault();
      break;
    case 'ArrowRight':
    case 'KeyD':
      handleDirectionalInput('right');
      e.preventDefault();
      break;
    case 'Space':
      activateCurrentLevel();
      e.preventDefault();
      break;
  }
});

// Teclado: Keyup
window.addEventListener('keyup', (e) => {
  state.keysDown[e.code] = false;
});

// Clic directo en el Canvas
canvas.addEventListener('click', (e) => {
  if (state.currentScene === 'VICTORY') {
    returnToMap(state.unlockedNextId || state.currentLevelId);
    return;
  }

  if (state.currentScene !== 'MAP') return;

  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  const clickX = (e.clientX - rect.left) * scaleX;
  const clickY = (e.clientY - rect.top) * scaleY;

  for (const node of LEVELS) {
    const dist = Math.hypot(clickX - node.x, clickY - node.y);
    if (dist <= 30) {
      if (node.id === state.currentLevelId) {
        activateCurrentLevel();
      } else {
        moveTowardsNode(node.id);
      }
      break;
    }
  }
});

// Botones del D-Pad en pantalla (Móvil / Ratón)
document.getElementById('btnUp')?.addEventListener('click', () => {
  if (state.currentScene === 'LEVEL') {
    state.keysDown['Space'] = true;
  } else {
    handleDirectionalInput('up');
  }
});

document.getElementById('btnDown')?.addEventListener('click', () => {
  if (state.currentScene === 'MAP') {
    handleDirectionalInput('down');
  }
});

// Soporte continuo para botones de izquierda y derecha en nivel
const btnLeft = document.getElementById('btnLeft');
btnLeft?.addEventListener('mousedown', () => { state.keysDown['ArrowLeft'] = true; });
btnLeft?.addEventListener('mouseup', () => { state.keysDown['ArrowLeft'] = false; });
btnLeft?.addEventListener('mouseleave', () => { state.keysDown['ArrowLeft'] = false; });
btnLeft?.addEventListener('touchstart', (e) => { state.keysDown['ArrowLeft'] = true; e.preventDefault(); });
btnLeft?.addEventListener('touchend', (e) => { state.keysDown['ArrowLeft'] = false; e.preventDefault(); });
btnLeft?.addEventListener('click', () => {
  if (state.currentScene === 'MAP') handleDirectionalInput('left');
});

const btnRight = document.getElementById('btnRight');
btnRight?.addEventListener('mousedown', () => { state.keysDown['ArrowRight'] = true; });
btnRight?.addEventListener('mouseup', () => { state.keysDown['ArrowRight'] = false; });
btnRight?.addEventListener('mouseleave', () => { state.keysDown['ArrowRight'] = false; });
btnRight?.addEventListener('touchstart', (e) => { state.keysDown['ArrowRight'] = true; e.preventDefault(); });
btnRight?.addEventListener('touchend', (e) => { state.keysDown['ArrowRight'] = false; e.preventDefault(); });
btnRight?.addEventListener('click', () => {
  if (state.currentScene === 'MAP') handleDirectionalInput('right');
});

// Botón de Acción Espacio / Salto
document.getElementById('btnTouchSpace')?.addEventListener('click', () => {
  if (state.currentScene === 'LEVEL') {
    state.keysDown['Space'] = true;
  } else if (state.currentScene === 'VICTORY') {
    returnToMap(state.unlockedNextId || state.currentLevelId);
  } else {
    activateCurrentLevel();
  }
});

// Botón para volver al mapa desde el nivel
document.getElementById('btnReturnToMap')?.addEventListener('click', () => {
  returnToMap();
});

// Botones de acción del Header/Footer
document.getElementById('btnAudioToggle')?.addEventListener('click', () => {
  const isEnabled = audio.toggle();
  const btn = document.getElementById('btnAudioToggle');
  const icon = document.getElementById('audioIcon');
  if (btn && icon) {
    btn.innerHTML = `<span id="audioIcon">${isEnabled ? '♪' : '✕'}</span> Audio: ${isEnabled ? 'ON' : 'OFF'}`;
  }
});

document.getElementById('btnCrtToggle')?.addEventListener('click', () => {
  const wrapper = document.getElementById('screenWrapper');
  const btn = document.getElementById('btnCrtToggle');
  if (wrapper && btn) {
    wrapper.classList.toggle('crt-off');
    const isCrt = !wrapper.classList.contains('crt-off');
    btn.textContent = `[CRT] Filtro: ${isCrt ? 'ON' : 'OFF'}`;
  }
});

// Botón de depuración: Desbloquear / Bloquear todos los niveles para pruebas
let allUnlocked = false;
document.getElementById('btnToggleAllLevels')?.addEventListener('click', () => {
  allUnlocked = !allUnlocked;
  const btn = document.getElementById('btnToggleAllLevels');

  LEVELS.forEach((node, index) => {
    if (index === 0) {
      node.unlocked = true;
    } else {
      node.unlocked = allUnlocked;
    }
  });

  if (allUnlocked) {
    btn.textContent = '↺ Bloquear 2-6';
    btn.classList.remove('primary');
    showToast('★ ¡TODAS LAS ÉPOCAS DESBLOQUEADAS (MODO PRUEBA)!');
    audio.playTimeWarp();
  } else {
    btn.textContent = '★ Desbloquear Todos';
    btn.classList.add('primary');
    if (state.currentLevelId > 1) {
      state.currentLevelId = 1;
      state.playerX = LEVELS[0].x;
      state.playerY = LEVELS[0].y;
      updateHUD();
    }
    showToast('⚠ Candados restaurados: solo Nivel 1 desbloqueado');
    audio.playLockedError();
  }
});

// Botones del Modal: Iniciar la época
document.getElementById('btnCloseModal')?.addEventListener('click', closeLevelModal);
document.getElementById('btnStartLevel')?.addEventListener('click', () => {
  startLevel(state.currentLevelId);
});

// Iniciar juego
updateHUD();
requestAnimationFrame(gameLoop);

// Soporte de inicio rápido por hash (para pruebas y vistas previas)
if (window.location.hash.includes('unlocked')) {
  document.getElementById('btnToggleAllLevels')?.click();
}
if (window.location.hash.includes('modal')) {
  openLevelModal(LEVELS[0]);
}
if (window.location.hash.includes('level')) {
  let targetLvl = LEVELS[0];
  const match = window.location.hash.match(/level(\d+)/i);
  if (match) {
    const requestedId = parseInt(match[1], 10);
    const found = LEVELS.find(l => l.id === requestedId);
    if (found) targetLvl = found;
  }
  initLevelWorld(targetLvl);
  state.currentScene = 'LEVEL';
  const btnReturn = document.getElementById('btnReturnToMap');
  if (btnReturn) btnReturn.style.display = 'inline-flex';
  const btnTouchSpace = document.getElementById('btnTouchSpace');
  if (btnTouchSpace) btnTouchSpace.innerHTML = '▲ SALTAR';
}
