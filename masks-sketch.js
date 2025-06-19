<!DOCTYPE html>
<html>
<head>
  <title>Interactive Audio Masks</title>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.0/p5.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.0/addons/p5.sound.min.js"></script>
  <style>
    body {
      margin: 0;
      padding: 20px;
      font-family: Arial, sans-serif;
      text-align: center;
      background-color: #f0f0f0;
    }
    #canvas-container {
      display: flex;
      justify-content: center;
      margin: 20px auto;
    }
    #controls {
      margin: 20px auto;
      max-width: 500px;
    }
    button {
      padding: 8px 15px;
      margin: 5px;
      cursor: pointer;
      background-color: #4CAF50;
      color: white;
      border: none;
      border-radius: 4px;
    }
    button:hover {
      background-color: #45a049;
    }
    #mask-name {
      font-size: 24px;
      margin: 15px 0;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <h1>Interactive Audio Masks</h1>
  <div id="controls">
    <div id="mask-name">Current: Robot</div>
    <div>
      <button onclick="switchMask(1)">Robot</button>
      <button onclick="switchMask(2)">Dragon</button>
      <button onclick="switchMask(3)">Skull</button>
      <button onclick="switchMask(4)">Guardian</button>
      <button onclick="switchMask(5)">Jester</button>
    </div>
    <div>
      <label for="sensitivity">Sensitivity:</label>
      <input type="range" id="sensitivity" min="1" max="40" value="15" step="0.1">
    </div>
    <p>Make noise to interact with the masks!</p>
  </div>
  <div id="canvas-container"></div>

<script>
// Variabili globali
let mic, fft, currentMask;
let sensitivity = 15;
const masks = {};

function setup() {
  const canvas = createCanvas(700, 700);
  canvas.parent('canvas-container');
  
  // Inizializza l'audio
  mic = new p5.AudioIn();
  mic.start();
  fft = new p5.FFT(0.8, 128);
  fft.setInput(mic);
  
  // Inizializza i controlli
  document.getElementById('sensitivity').addEventListener('input', function() {
    sensitivity = parseFloat(this.value);
  });
  
  // Crea tutte le maschere
  masks[1] = new RobotMask();
  masks[2] = new DragonMask();
  masks[3] = new SkullMask();
  masks[4] = new GuardianMask();
  masks[5] = new JesterMask();
  
  currentMask = masks[1];
}

function draw() {
  if (currentMask && currentMask.draw) {
    currentMask.draw();
  }
}

// Funzione per cambiare maschera
function switchMask(maskId) {
  if (masks[maskId]) {
    currentMask = masks[maskId];
    const maskNames = {
      1: 'Robot', 
      2: 'Dragon',
      3: 'Skull',
      4: 'Celestial Guardian',
      5: 'Jester'
    };
    document.getElementById('mask-name').textContent = `Current: ${maskNames[maskId]}`;
  }
}

// Classe base per tutte le maschere
class Mask {
  constructor() {
    this.smoothedVolume = 0;
  }
  
  updateVolume() {
    const micVolume = mic.getLevel() * sensitivity;
    this.smoothedVolume = lerp(this.smoothedVolume, constrain(micVolume, 0, 1), 0.1);
    return this.smoothedVolume;
  }
}

// Implementazione delle singole maschere
class RobotMask extends Mask {
  constructor() {
    super();
    this.waveform = [];
  }
  
  draw() {
    const vol = this.updateVolume();
    background(255);
    translate(width/2, height/2 + 30);
    
    // Testa e antenne
    stroke(0); strokeWeight(6);
    line(-80, -150, -120, -240 + sin(frameCount*0.2)*vol*40);
    line(80, -150, 120, -240 - sin(frameCount*0.2)*vol*40);
    fill(0); 
    ellipse(-120, -240 + sin(frameCount*0.2)*vol*40, 15, 15);
    ellipse(120, -240 - sin(frameCount*0.2)*vol*40, 15, 15);
    
    // Visore
    const eyeHeight = map(vol, 0, 0.5, 4, 60, true);
    noStroke(); fill(0);
    rect(0, -80, 280 * map(vol, 0, 0.5, 1, 1.2), eyeHeight, 3);
    if (eyeHeight > 10) {
      fill(255); 
      const pupilX = map(vol, 0.1, 0.5, 0, 100);
      ellipse(-pupilX, -80, 60, 60);
      ellipse(pupilX, -80, 60, 60);
    }
    
    // Bocca con oscilloscopio
    push();
    translate(0, 100);
    noFill(); stroke(0); strokeWeight(6); 
    rect(0, 0, 280, 90, 10);
    
    this.waveform = fft.waveform();
    noFill(); stroke(0); strokeWeight(3);
    beginShape();
    for (let i = 0; i < this.waveform.length; i++) {
      const x = map(i, 0, this.waveform.length, -140, 140);
      const y = map(this.waveform[i], -1, 1, -30, 30);
      vertex(x, y);
    }
    endShape();
    pop();
  }
}

class DragonMask extends Mask {
  draw() {
    const vol = this.updateVolume();
    background(0);
    translate(width/2, height/2);
    scale(1.5);
    
    // Testa
    fill(255); noStroke();
    rect(100, 180, 180, 50); 
    arc(150, 225, 100, 100, 0, 180);
    
    // Dettagli
    fill(150); ellipse(150, 225, 70, 70); 
    fill(0); ellipse(135, 210, 10, 10); 
    ellipse(260, 195, constrain(5 + vol * 40, 5, 15), constrain(5 + vol * 40, 5, 15));
    
    // Fiamme
    if (vol > 0.5) {
      fill(255, 100, 0, 150);
      for (let i = 0; i < 5; i++) {
        triangle(280, 230, 260 + random(-10,10), 245 + random(-5,5), 260 + random(-10,10), 230);
      }
    }
  }
}

class SkullMask extends Mask {
  draw() {
    const vol = this.updateVolume();
    background(255);
    translate(width/2, height/2);
    
    // Testa
    fill(0); noStroke();
    beginShape();
    vertex(0, -165);
    bezierVertex(-80, -170, -130, -120, -140, -60);
    bezierVertex(-150, 0, -125, 70, -100, 80);
    vertex(100, 80);
    bezierVertex(125, 70, 150, 0, 140, -60);
    bezierVertex(130, -120, 80, -170, 0, -165);
    endShape(CLOSE);
    
    // Occhi bianchi
    fill(255); stroke(0); strokeWeight(2);
    ellipse(-60, -20, 40, 25);
    ellipse(60, -20, 40, 25);
    
    // Pupille
    fill(0); noStroke();
    ellipse(-60, -20 + vol*5, 15, 15);
    ellipse(60, -20 + vol*5, 15, 15);
  }
}

class GuardianMask extends Mask {
  draw() {
    const vol = this.updateVolume();
    background(0);
    translate(width/2, height/2);
    
    // Aureola
    stroke(255, 150); strokeWeight(2); noFill();
    for(let i = 0; i < 10; i++) {
      push();
      rotate(i * TWO_PI/10 + frameCount*0.01);
      triangle(-15, -200, 15, -200, 0, -230);
      pop();
    }
    
    // Volto
    noFill(); stroke(255); strokeWeight(5);
    rect(0, 0, 250, 350, 20);
    
    // Occhi
    const eyeOpen = map(vol, 0, 1, 5, 50);
    fill(0); stroke(255); strokeWeight(5);
    ellipse(-80, -30, 70, eyeOpen);
    ellipse(80, -30, 70, eyeOpen);
  }
}

class JesterMask extends Mask {
  draw() {
    const vol = this.updateVolume();
    background(255);
    translate(width/2, height/2);
    
    // Cappello
    fill(255); noStroke();
    beginShape();
    vertex(0, -150);
    bezierVertex(-250, -100, -200, 220, 0, 250);
    bezierVertex(200, 220, 250, -100, 0, -150);
    endShape(CLOSE);
    
    // Campanelli
    const wobble = vol * 20;
    fill(255); stroke(0); strokeWeight(3);
    ellipse(0, -280, 40, 40);
    ellipse(-250, -200, 40, 40);
    ellipse(250, -200, 40, 40);
    
    // Faccia
    fill(0);
    arc(-80, -30, 80, 100, PI, TWO_PI);
    arc(80, -30, 80, 100, PI, TWO_PI);
    
    // Sorriso
    const smile = map(vol, 0, 1, 10, 100);
    arc(0, 120, 150, smile, PI, TWO_PI, CHORD);
  }
}

// Permetti di cambiare maschera con i tasti 1-5
function keyPressed() {
  if (key >= '1' && key <= '5') {
    switchMask(parseInt(key));
  }
}
</script>
</body>
</html>
