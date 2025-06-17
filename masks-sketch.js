(function() {
    let mic, fft, sensitivitySlider, maskLabel;
    let smoothedVolume = 0;
    let scenes = {};
    let currentScene;
    
    const maskNames = {
        1: 'Robot',
        2: 'Dragon',
        3: 'Skull',
        4: 'Agitated Orb',
        5: 'Forest Spirit'
    };

    window.setup = function() {
        const canvasWrapper = document.getElementById('canvas-wrapper');
        const canvas = createCanvas(800, 700); // FIX: Canvas a dimensione fissa
        canvas.parent(canvasWrapper);
        
        mic = new p5.AudioIn();
        mic.start();
        fft = new p5.FFT(0.8, 128);
        fft.setInput(mic);

        maskLabel = select('#current-mask-label');
        sensitivitySlider = createSlider(1, 15, 5, 0.1);
        sensitivitySlider.parent('sensitivity-slider-container');
        sensitivitySlider.style('width', '100%');
        
        // Inizializza tutte le scene
        scenes = {
            1: new RobotScene(),
            2: new DragonScene(),
            3: new SkullScene(),
            4: new AgitatedOrbScene(),
            5: new ForestSpiritScene()
        };
        
        // Imposta la scena iniziale
        switchScene(1);
    }

    window.draw = function() {
        let sensitivity = sensitivitySlider.value();
        let rawVolume = mic.getLevel() * sensitivity;
        smoothedVolume = lerp(smoothedVolume, constrain(rawVolume, 0, 1.0), 0.1);
        
        // Esegui il draw della scena corrente
        if (currentScene && typeof currentScene.draw === 'function') {
            currentScene.draw(smoothedVolume);
        }
    }

    function switchScene(sceneId) {
        currentScene = scenes[sceneId];
        if (currentScene && typeof currentScene.setup === 'function') {
            currentScene.setup(); // Esegui il setup specifico della scena, se esiste
        }
        maskLabel.html(`Current: ${maskNames[sceneId]}`);
    }

    // --- SCENA ROBOT (TUA CREAZIONE, CORRETTA) ---
    function RobotScene() {
        this.draw = function(vol) {
            background(0);
            translate(width / 2, height / 2);

            let eyeHeight = map(vol, 0, 0.5, 4, 60, true);
            let visorScaleX = map(vol, 0, 0.5, 1, 1.2, true);
            let visorWidth = 280 * visorScaleX;

            // Visor
            noStroke();
            fill(255);
            rect(0, -80, visorWidth, eyeHeight, 3);
            if (eyeHeight > 10) {
                let pupilSize = 60;
                let pupilXOffset = map(vol, 0.1, 0.5, 0, visorWidth / 2 - 40, true);
                fill(0);
                ellipse(-pupilXOffset, -80, pupilSize, pupilSize);
                ellipse(pupilXOffset, -80, pupilSize, pupilSize);
            }
            noFill();
            stroke(255);
            strokeWeight(8);
            rect(0, -80, visorWidth, eyeHeight, 3);
            
            // Mouth with FFT
            push();
            translate(0, 100);
            let mouthWidth = 280, mouthHeight = 90;
            noFill();
            stroke(255);
            strokeWeight(6);
            rect(0, 0, mouthWidth, mouthHeight, 10);
            
            let spectrum = fft.analyze();
            if (spectrum && spectrum.length) { // FIX: Controllo di sicurezza
                noStroke();
                fill(255);
                let barWidth = mouthWidth / spectrum.length;
                for (let i = 0; i < spectrum.length; i++) {
                    let x = map(i, 0, spectrum.length, -mouthWidth / 2, mouthWidth / 2);
                    let barHeight = map(spectrum[i], 0, 255, 0, mouthHeight - 10);
                    rect(x + barWidth / 2, mouthHeight/2 - barHeight/2, barWidth * 0.8, barHeight);
                }
            }
            pop();
        }
    }

    // --- SCENA DRAGO (TUA CREAZIONE, CORRETTA) ---
    function DragonScene() {
        this.n = 1;
        this.increment = 1;

        this.draw = function(vol) {
            background(220);
            let anger = map(vol, 0, 0.8, 20, 100, true);
            
            this.n += this.increment;
            if (this.n >= 30 || this.n <= 0) this.increment *= -1;

            if (anger > 80) {
                push();
                stroke(255, this.n * 5, 0);
                strokeWeight(this.n);
                noFill();
                line(210, 270, 400 + this.n * 5, 270);
                pop();
            }

            let pp = map(vol, 0, 0.5, 40, 5, true);
            let arc1 = map(vol, 0, 0.5, -90, 80, true);

            fill(0); noStroke();
            rect(100, 180, 180, 50);
            arc(150, 225, 100, 100, 0, 180);
            push(); fill(255, 0, 0); ellipse(150, 225, 70, 70); pop();
            ellipse(150, 225, pp, pp);
            push(); fill(255); ellipse(135, 210, 10, 10); ellipse(260, 195, 5 + vol * 80, 5 + vol * 80); pop();
            arc(150, 225, 80, 80, 240, arc1, CHORD);
            triangle(100, 155, 100, 180, 130, 180);
            triangle(200, 170, 200, 180, 220, 180);
            triangle(220, 170, 220, 180, 240, 180);
            triangle(240, 170, 240, 180, 260, 180);
            if (anger > 50) triangle(130, 155, 130, 180, 160, 180);
            if (anger > 80) triangle(160, 155, 160, 180, 190, 180);
            triangle(280, 230, 260, 245, 260, 230);
            triangle(250, 230, 230, 245, 230, 230);
            triangle(220, 230, 200, 245, 200, 230);

            push();
            translate(150, 235);
            stroke(0); strokeWeight(1.5);
            if (anger > 20) rotate(vol * 80);
            rect(0, 40, 80, 49);
            arc(80, 40, 100, 98, 0, 90);
            arc(0, 90, 100, 100, 180, 270);
            triangle(130, 40, 130, 25, 110, 40);
            triangle(100, 40, 100, 25, 80, 40);
            triangle(70, 40, 70, 25, 50, 40);
            pop();
        }
    }
    
    // --- SCENA TESCHIO (TUA CREAZIONE, CORRETTA) ---
    function SkullScene() {
        this.particles = [];
        this.rageFlash = 0;
        
        this.draw = function(vol) {
            background(255);
            let angerLevel = map(vol, 0.1, 0.7, 0, 1, true);

            if (angerLevel > 0.95 && this.rageFlash <= 0) this.rageFlash = 15;
            
            translate(width / 2, height / 2);
            let shakeAmount = map(angerLevel, 0.7, 1, 0, 40, true);
            translate(random(-shakeAmount, shakeAmount), random(-shakeAmount, shakeAmount));
            if (this.rageFlash > 0) { filter(INVERT); this.rageFlash--; }

            if (angerLevel > 0.6) {
                let pCount = map(angerLevel, 0.6, 1, 0, 5, true);
                for (let i = 0; i < pCount; i++) this.particles.push(new FlameParticle(-60, -20));
            }
            this.drawAngrySkull(angerLevel);
            for (let p of this.particles) { p.update(); p.show(); }
            this.particles = this.particles.filter(p => !p.isFinished());
        }

        this.drawAngrySkull = function(angerLevel) {
            // ... (il codice di disegno del teschio è complesso e rimane qui dentro)
            fill(0); noStroke();
            let jawDrop = map(angerLevel, 0, 1, 0, 140);
            let eyeSlant = map(angerLevel, 0, 1, 0, 40);
            let cheekFlareX = map(angerLevel, 0, 1, 0, 30);
            let crownSpike = map(angerLevel, 0, 1, 0, 40);
            beginShape(); vertex(0,-165-crownSpike); bezierVertex(-80,-170-crownSpike,-130,-120,-140-cheekFlareX,-60); bezierVertex(-150-cheekFlareX,0,-100,80,-70,110); vertex(70,110); bezierVertex(100,80,150+cheekFlareX,0,140+cheekFlareX,-60); bezierVertex(130,-120,80,-170-crownSpike,0,-165-crownSpike); endShape(CLOSE);
            this.drawLowerJaw(jawDrop, angerLevel);
            fill(255); this.carveTopTeeth();
            fill(0); let eyePinch = map(angerLevel,0.5,1,0,20,true);
            beginShape(); vertex(-40,-80); bezierVertex(-80,-70-eyeSlant,-95-cheekFlareX,-20+eyePinch,-75,10+eyePinch); bezierVertex(-60,15+eyePinch,-45,0,-40,-20); endShape(CLOSE);
            beginShape(); vertex(40,-80); bezierVertex(80,-70-eyeSlant,95+cheekFlareX,-20+eyePinch,75,10+eyePinch); bezierVertex(60,15+eyePinch,45,0,40,-20); endShape(CLOSE);
            if (angerLevel>0.6) { let s=map(angerLevel,0.6,1,10,45,true); for(let i=5;i>0;i--) { fill(0,map(i/5,1,0,10,80)); ellipse(-60,-20,s*i/5); ellipse(60,-20,s*i/5); } }
        }
        this.drawLowerJaw = function(yOffset, angerLevel) {
            push();
            if (angerLevel < 0.95) translate(0, yOffset);
            else { let r=180+sin(frameCount*5)*10; translate(cos(frameCount*10)*r, sin(frameCount*10)*r); rotate(frameCount*30); }
            fill(0); noStroke();
            beginShape(); vertex(-75,100); bezierVertex(-85,105,-105,140,-90,190); bezierVertex(-60,205,60,205,90,190); bezierVertex(105,140,85,105,75,100); endShape(CLOSE);
            fill(255); this.carveLowerTeeth(); pop();
        }
        this.carveTopTeeth = function() { for(let i=0;i<8;i++){ let t=i/7,x=lerp(-70,70,t),w=140/8*.9,h=15-pow(abs(t-.5)*2,2)*8; beginShape(); vertex(x-w/2,110); vertex(x+w/2,110); vertex(x,110-h); endShape(CLOSE); } }
        this.carveLowerTeeth = function() { for(let i=0;i<7;i++){ let t=i/6,x=lerp(-60,60,t),w=120/7*.9,h=15-pow(abs(t-.5)*2,2)*10; beginShape(); vertex(x-w/2,100); vertex(x+w/2,100); vertex(x,100+h); endShape(CLOSE); } }
    }

    // --- MIE MASCHERE (REATTIVITÀ CORRETTA) ---
    function AgitatedOrbScene() {
        this.draw = function(vol) {
            background(24,24,24);
            translate(width/2, height/2);
            let agitation = map(vol, 0, 1, 0, 150, true);
            stroke(255); strokeWeight(2); noFill();
            for(let i=1; i < 10; i++) {
                beginShape();
                for(let a=0; a < TWO_PI; a+=0.1) { let r=(i*30)+noise(a*5,frameCount*0.01+i)*agitation; vertex(cos(a)*r,sin(a)*r); }
                endShape(CLOSE);
            }
        }
    }
    
    function ForestSpiritScene() {
        this.draw = function(vol) {
            background(24,24,24);
            translate(width/2, height/2);
            let headTilt = map(vol, 0, 1, 0, 20, true);
            let leafGrow = map(vol, 0, 1, 0, 80, true);
            stroke(255); strokeWeight(4); fill(24, 24, 24);
            push();
            rotate(sin(frameCount*2)*2 - headTilt);
            ellipse(0, 0, 200, 250);
            fill(255);
            ellipse(-50, -30, 50, 70);
            ellipse(50, -30, 50, 70);
            noFill();
            beginShape(); vertex(-100,0); bezierVertex(-150,-50,-150-leafGrow,-100,-100,-150); endShape();
            beginShape(); vertex(100,0); bezierVertex(150,-50,150+leafGrow,-100,100,-150); endShape();
            pop();
        }
    }
    
    // Helper per il teschio
    class FlameParticle {
        constructor(x, y) { this.pos = createVector(x,y); this.vel = p5.Vector.random2D().mult(random(2,5)); this.lifespan = 255; }
        isFinished() { return this.lifespan <= 0; }
        update() { this.pos.add(this.vel); this.lifespan -= 5; }
        show() { noStroke(); fill(255, this.lifespan); ellipse(this.pos.x, this.pos.y, 8); }
    }

    window.keyPressed = function() {
        if (key >= '1' && key <= '5') switchScene(parseInt(key));
        if (key.toLowerCase() === 's') saveCanvas('my-mask', 'png');
    }
})();
