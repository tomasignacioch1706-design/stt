# Chrono-NYC: El Viajero del Tiempo (HTML5 Canvas Retro Game) ⏳🗽

Juego retro de plataformas 2D y mapa interactivo de selección de épocas temporales ambientado en la ciudad de Nueva York a través de diferentes siglos. Desarrollado con **HTML5 Canvas puro**, JavaScript modular y Web Audio API procedural.

---

## 🎮 Demo y Cómo Jugar Online

Puedes jugar directamente desde tu navegador en **GitHub Pages**:
🔗 **[https://tomasignacioch1706-design.github.io/stt/](https://tomasignacioch1706-design.github.io/stt/)**

*(Para activarlo: ve a **Settings** > **Pages** > En **Source** selecciona rama `main` y guarda).*

También puedes abrir `index.html` o el archivo autónomo `juego_completo.html` en cualquier navegador moderno sin necesidad de instalar dependencias.

---

## ⏳ Las 6 Épocas Históricas de Nueva York

1. **Nivel 1 (1920) - Era del Jazz & Ley Seca**:
   - *Entorno*: Calles de adoquines, fábricas con chimeneas humeantes, farolas de gas, auto clásico Ford Modelo T y club clandestino Speakeasy.
   - *Atuendo*: Traje de detective clásico, corbata roja y sombrero Fedora.
2. **Nivel 2 (1880) - Era Victoriana & Revolución Industrial**:
   - *Entorno*: Muelles del East River, almacenes de ladrillo rojo, tuberías de vapor y carruaje victoriano de caballos (sin rascacielos modernos).
   - *Atuendo*: Levita victoriana oscura, chaleco elegante y sombrero de copa alto.
3. **Nivel 3 (1970) - Movimiento Disco & Metro del Bronx**:
   - *Entorno*: Estructuras de metro elevado con grafitis auténticos (*"Bronx 77"*), discoteca Studio 77 con luces estroboscópicas y radiocasete boombox.
   - *Atuendo*: Pantalones acampanados brillantes (bell-bottoms), camisa setentera y cabello estilo afro.
4. **Nivel 4 (1990) - Times Square Arcade & Culturas Callejeras**:
   - *Entorno*: Times Square de los 90, marquesinas luminosas, salas de máquinas recreativas Arcade y siluetas urbanas.
   - *Atuendo*: Camisa a cuadros de franela grunge, vaqueros anchos y gorra hacia atrás.
5. **Nivel 5 (2026) - Manhattan Actual de Día**:
   - *Entorno*: Día soleado con cielo azul celeste, nubes suaves, rascacielos contemporáneos de cristal, puesto de Hot Dogs callejero, cafetería con toldo, estación de bicicletas compartidas Citi Bike y taxi amarillo híbrido.
   - *Atuendo*: Sudadera hoodie moderna verde menta, zapatillas deportivas y smartphone en mano.
6. **Nivel 6 (2150) - Neo-Manhattan Cyberpunk**:
   - *Entorno*: Noche de neón futurista con rascacielos angulares de hasta 430px de altura, techos en chaflán a 45°, agujas oblicuas, plataformas voladizas, puentes aéreos y anillos holográficos rotatorios.
   - *Atuendo*: Traje exoesqueleto cibernético negro y visera de realidad aumentada cian brillante.

---

## 🕹️ Controles

### En el Mapa de Selección:
- **Mover el Avatar**: Flechas `←` `↑` `→` `↓` o teclas `W`, `A`, `S`, `D`.
- **Elegir Época**: Presiona `Espacio` o `Enter` sobre un nivel desbloqueado.
- **Ratón / Móvil**: Clic o toque directo sobre los nodos de la línea temporal.
- **Botón `★ Desbloquear Todos`**: Permite explorar todas las épocas instantáneamente.

### Dentro de cada Nivel (Plataformas 2D):
- **Caminar / Correr**: Flechas `←` `→` o teclas `A` / `D`.
- **Saltar**: Flecha `↑`, tecla `W` o barra `Espacio`.
- **Físicas reales**: Gravedad acelerada con detección de suelo y plataformas. **No se puede dar doble salto en el aire** hasta tocar tierra firme.
- **Completar Nivel**: Llega al **Portal Cuántico** al final del nivel para desbloquear la siguiente época.
- **Volver al Mapa**: Tecla `ESC` o botón *"◀ Volver al Mapa"*.

---

## 💻 Ejecución Local

Con Python 3:
```bash
python3 -m http.server 8000
```
Luego abre tu navegador en `http://localhost:8000`.

---

## 🛠️ Tecnologías Utilizadas
- **HTML5 Canvas** (Renderizado 2D de alta fidelidad pixel-art procedural).
- **JavaScript Moderno (ES6+)** (Físicas de partículas, animación por sprites y estados de juego).
- **Web Audio API** (Efectos de sonido sintetizados en tiempo real sin archivos MP3/WAV externos).
- **CSS3 CRT Shader** (Efecto opcional de pantalla retro de tubo catódico).
