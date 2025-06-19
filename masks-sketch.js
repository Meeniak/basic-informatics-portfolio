// audio-masks.js - Codice JavaScript per maschere reattive al suono

// Inizializzazione
let mic, fft, currentMask;
let canvas;
const masks = {};
const maskNames = {
  1: 'Robot',
  2: 'Dragon', 
  3: 'Skull',
  4: 'Celestial Guardian',
  5: 'Jester'
};

// Funzione principale di setup
function initMasks() {
  // Crea il canvas
  canvas = createCanvas(700, 700);
  canvas.parent('canvas-container');
  
  // Setup audio
  mic = new p5.AudioIn();
  mic.start();
  fft = new p5.FFT(0.8, 128);
  fft.setInput(mic);
  
  // Crea le maschere
  masks[1] = new RobotMask();
  masks[2] = new DragonMask();
  masks[3] = new SkullMask();
  masks[4] = new GuardianMask();
  masks[5] = new JesterMask();
  
  currentMask = masks[1];
  
  // Setup controlli UI
  setupControls();
}

function setupControls() {
  // Aggiungi controlli solo se non esistono già
  if (!document.getElementById('mask-controls')) {
    const controls = document.createElement('div');
    controls.id = 'mask-controls';
    controls.innerHTML = `
      <div id="mask-name">Current: Robot</div>
      <div>
        <button data-mask="1">Robot</button>
        <button data-mask="2">Dragon</button>
        <button data-mask="3">Skull</button>
        <button data-mask="4">Guardian</button>
        <button data-mask="5">Jester</button>
      </div>
      <div>
        <label for="sensitivity">Sensitivity:</label>
        <input type="range" id="sensitivity" min="1" max="40" value="15" step="0.1">
      </div>
    `;
    document.body.appendChild(controls);
    
    // Aggiungi event listeners
    document.querySelectorAll('[data-mask]').forEach(btn => {
      btn.addEventListener('click', () => switchMask(parseInt(btn.dataset.mask)));
    });
    
    document.getElementById('sensitivity').addEventListener('input', function() {
      sensitivity = parseFloat(this.value);
    });
  }
}

// Funzione per cambiare maschera
function switchMask(maskId) {
  if (masks[maskId]) {
    currentMask = masks[maskId];
    document.getElementById('mask-name').textContent = `Current: ${maskNames[maskId]}`;
  }
}

// Classe base per le maschere
class Mask {
  constructor() {
    this.smoothedVolume = 0;
    this.sensitivity = 15;
  }
  
  updateVolume() {
    const micVolume = mic.getLevel() * this.sensitivity;
    this.smoothedVolume = lerp(this.smoothedVolume, constrain(micVolume, 0, 1), 0.1);
    return this.smoothedVolume;
  }
}

// Implementazione delle maschere
class RobotMask extends Mask {
  constructor() {
    super();
    this.waveform = [];
  }
  
  draw() {
    const vol = this.updateVolume();
    background(255);
    translate(width/2, height/2 + 30);
    
    // Disegna robot...
    // ... [codice della maschera robot come prima]
  }
}

class DragonMask extends Mask {
  draw() {
    const vol = this.updateVolume();
    background(0);
    translate(width/2, height/2);
    scale(1.5);
    
    // Disegna drago...
    // ... [codice della maschera drago come prima]
  }
}

// ... [altre classi delle maschere]

// Setup iniziale quando p5.js è pronto
function setup() {
  initMasks();
}

function draw() {
  if (currentMask && currentMask.draw) {
    currentMask.draw();
  }
}

// Permetti di cambiare maschera con i tasti 1-5
function keyPressed() {
  if (key >= '1' && key <= '5') {
    switchMask(parseInt(key));
  }
}

// Esponi le funzioni necessarie all'esterno
window.initAudioMasks = initMasks;
window.switchMask = switchMask;
