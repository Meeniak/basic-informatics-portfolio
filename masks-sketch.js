(function() {
    let mic, fft, sensitivitySlider, maskLabel;
    let scenes = {};
    let currentScene;
    
    const maskNames = {
        1: 'Robot',
        2: 'Dragon',
        3: 'Skull',
        4: 'The Watcher',
        5: 'Forest Spirit'
    };

    window.setup = function() {
        const canvasWrapper = document.getElementById('canvas-wrapper');
        const canvas = createCanvas(800, 800); // Canvas quadrato
        canvas.parent(canvasWrapper);
        
        mic = new p5.AudioIn();
        mic.start();
        fft = new p5.FFT(0.8, 128);
        fft.setInput(mic);

        maskLabel = select('#current-mask-label');
        sensitivitySlider = createSlider(1, 15, 7, 0.1);
        sensitivitySlider.parent('sensitivity-slider-container');
        sensitivitySlider.style('width', '100%');
        
        // Inizializza tutte le scene
        scenes = {
            1: new RobotScene(),
            2: new DragonScene(),
            3: new SkullScene(),
            4: new WatcherScene(),
            5: new ForestSpiritScene()
        };
        
        switchScene(1);
    }

    window.draw = function() {
        if (currentScene && typeof currentScene.draw === 'function') {
            currentScene.draw();
        }
    }

    function switchScene(sceneId) {
        currentScene = scenes[sceneId];
        maskLabel.html(`Current: ${maskNames[sceneId]}`);
    }

    // --- CLASSE BASE PER LE SCENE ---
    class Scene {
        constructor() {
            this.smoothedVolume = 0;
            this.easing = 0.1;
        }
        updateVolume() {
            let sensitivity = sensitivitySlider.value();
            let rawVolume = mic.getLevel() * sensitivity;
            let constrainedVolume = constrain(rawVolume, 0, 1.0); 
            this.smoothedVolume = lerp(this.smoothedVolume, constrainedVolume, this.easing);
            return this.smoothedVolume;
        }
    }
    
    // --- SCENA ROBOT ---
    class RobotScene extends Scene {
        draw() {
            let vol = this.updateVolume();
            background(0);
            translate(width / 2, height / 2);

            let eyeHeight = map(vol, 0, 0.5, 4, 60, true);
            let visorScaleX = map(vol, 0, 0.5, 1, 1.2, true);
            let visorWidth = 280 * visorScaleX;

            noStroke(); fill(255); rect(0, -80, visorWidth, eyeHeight, 3);
            if (eyeHeight > 10) {
                let pupilSize = 60; let pupilXOffset = map(vol, 0.1, 0.5, 0, visorWidth / 2 - 40, true);
                fill(0); ellipse(-pupilXOffset, -80, pupilSize, pupilSize); ellipse(pupilXOffset, -80, pupilSize, pupilSize);
            }
            noFill(); stroke(255); strokeWeight(8); rect(0, -80, visorWidth, eyeHeight, 3);
            
            push();
            translate(0, 100);
            let mouthWidth = 280, mouthHeight = 90;
            noFill(); stroke(255); strokeWeight(6); rect(0, 0, mouthWidth, mouthHeight, 10);
            
            let spectrum = fft.analyze();
            if (spectrum && spectrum.length) {
                noStroke(); fill(255);
                let barWidth = mouthWidth / spectrum.length;
                for (let i=0; i < spectrum.length; i++) {
                    let x = map(i, 0, spectrum.length, -mouthWidth/2, mouthWidth/2);
                    let h = map(spectrum[i], 0, 255, 0, mouthHeight - 10);
                    rect(x + barWidth/2, mouthHeight/2 - h/2, barWidth * 0.8, h);
                }
            }
            pop();
        }
    }

    // --- SCENA DRAGO ---
    class DragonScene extends Scene {
        constructor() { super(); this.n = 1; this.increment = 1; angleMode(DEGREES); }
        draw() {
            let vol = this.updateVolume();
            background(220);
            // Centra l'area di disegno originale (540x540) nel canvas 800x800
            translate(width / 2 - 270, height / 2 - 270);
            
            let anger = map(vol, 0, 0.8, 20, 100, true);
            this.n += this.increment;
            if (this.n >= 30 || this.n <= 0) this.increment *= -1;

            if (anger > 80) {
                push(); stroke(255, this.n * 5, 0); strokeWeight(this.n); noFill();
                line(210, 270, 400 + this.n * 5, 270); pop();
            }

            let pp = map(vol, 0, 0.5, 40, 5, true);
            let arc1 = map(vol, 0, 0.5, -90, 20, true);
            let jawRotation = map(vol, 0, 0.5, 0, 25, true);

            fill(0); noStroke();
            rect(100, 180, 180, 50); arc(150, 225, 100, 100, 0, 180);
            push(); fill(255, 0, 0); ellipse(150, 225, 70, 70); pop();
            ellipse(150, 225, pp, pp);
            push(); fill(255); ellipse(135, 210, 10, 10); ellipse(260, 195, 5 + vol * 40, 5 + vol * 40); pop();
            arc(150, 225, 80, 80, 240, arc1, CHORD);
            triangle(100, 155, 100, 180, 130, 180);
            triangle(200, 170, 200, 180, 220, 180); triangle(220, 170, 220, 180, 240, 180); triangle(240, 170, 240, 180, 260, 180);
            if (anger > 50) triangle(130, 155, 130, 180, 160, 180);
            if (anger > 80) triangle(160, 155, 160, 180, 190, 180);
            triangle(280, 230, 260, 245, 260, 230); triangle(250, 230, 230, 245, 230, 230); triangle(220, 230, 200, 245, 200, 230);
            
            push();
            translate(150, 235); stroke(0); strokeWeight(1.5);
            if (anger > 20) rotate(jawRotation);
            rect(0, 40, 80, 49); arc(80, 40, 100, 98, 0, 90); arc(0, 90, 100, 100, 180, 270);
            triangle(130, 40, 130, 25, 110, 40); triangle(100, 40, 100, 25, 80, 40); triangle(70, 40, 70, 25, 50, 40);
            pop();
        }
    }
    
    // --- SCENA TESCHIO ---
    class SkullScene extends Scene {
        constructor() { super(); this.particles = []; this.rageFlash = 0; }
        draw() {
            let vol = this.updateVolume();
            background(255);
            translate(width / 2, height / 2);
            let angerLevel = map(vol, 0.1, 0.7, 0, 1, true);

            if (angerLevel > 0.95 && this.rageFlash <= 0) this.rageFlash = 15;
            let shakeAmount = map(angerLevel, 0.7, 1, 0, 20, true);
            translate(random(-shakeAmount, shakeAmount), random(-shakeAmount, shakeAmount));
            if (this.rageFlash > 0) { filter(INVERT); this.rageFlash--; }

            if (angerLevel > 0.6) {
                let pCount = map(angerLevel, 0.6, 1, 0, 5, true);
                for(let i=0; i<pCount; i++) {
                    this.particles.push(new FlameParticle(-60, -20));
                    this.particles.push(new FlameParticle(60, -20));
                }
            }
            this.drawAngrySkull(angerLevel);
            for (let p of this.particles) { p.update(); p.show(); }
            this.particles = this.particles.filter(p => !p.isFinished());
        }
        drawAngrySkull(angerLevel) {
            fill(0); noStroke();
            let jawDrop = map(angerLevel, 0, 1, 0, 100); let eyeSlant = map(angerLevel, 0, 1, 0, 30);
            let cheekFlareX = map(angerLevel, 0, 1, 0, 20); let crownSpike = map(angerLevel, 0, 1, 0, 30);
            beginShape(); vertex(0,-165-crownSpike); bezierVertex(-80,-170-crownSpike,-130,-120,-140-cheekFlareX,-60); bezierVertex(-150-cheekFlareX,0,-100,80,-70,110); vertex(70,110); bezierVertex(100,80,150+cheekFlareX,0,140+cheekFlareX,-60); bezierVertex(130,-120,80,-170-crownSpike,0,-165-crownSpike); endShape(CLOSE);
            this.drawLowerJaw(jawDrop);
            fill(255); this.carveTopTeeth();
            fill(0); let eyePinch = map(angerLevel, 0.5, 1, 0, 20, true);
            beginShape(); vertex(-40,-80); bezierVertex(-80,-70-eyeSlant,-95-cheekFlareX,-20+eyePinch,-75,10+eyePinch); bezierVertex(-60,15+eyePinch,-45,0,-40,-20); endShape(CLOSE);
            beginShape(); vertex(40,-80); bezierVertex(80,-70-eyeSlant,95+cheekFlareX,-20+eyePinch,75,10+eyePinch); bezierVertex(60,15+eyePinch,45,0,40,-20); endShape(CLOSE);
            if(angerLevel>0.6){let s=map(angerLevel,0.6,1,10,45,true);for(let i=5;i>0;i--){fill(0,map(i/5,1,0,10,80));ellipse(-60,-20,s*i/5);ellipse(60,-20,s*i/5);}}
        }
        drawLowerJaw(yOffset) {
            push(); translate(0, yOffset);
            fill(0); noStroke();
            beginShape(); vertex(-75,100); bezierVertex(-85,105,-105,140,-90,190); bezierVertex(-60,205,60,205,90,190); bezierVertex(105,140,85,105,75,100); endShape(CLOSE);
            fill(255); this.carveLowerTeeth(); pop();
        }
        carveTopTeeth(){for(let i=0;i<8;i++){let t=i/7,x=lerp(-70,70,t),w=140/8*.9,h=15-pow(abs(t-.5)*2,2)*8;beginShape();vertex(x-w/2,110);vertex(x+w/2,110);vertex(x,110-h);endShape(CLOSE);}}
        carveLowerTeeth(){for(let i=0;i<7;i++){let t=i/6,x=lerp(-60,60,t),w=120/7*.9,h=15-pow(abs(t-.5)*2,2)*10;beginShape();vertex(x-w/2,100);vertex(x+w/2,100);vertex(x,100+h);endShape(CLOSE);}}
    }

    // --- NUOVA MASCHERA 4 ---
    class WatcherScene extends Scene {
        draw() {
            let vol = this.updateVolume();
            background(24,24,24); translate(width/2, height/2);
            let focus = map(vol, 0, 1, 0, 120, true);
            let coreBrightness = map(vol, 0, 1, 50, 255, true);
            stroke(255); noFill(); strokeWeight(3);
            ellipse(-150, 0, 150, 150 - focus); ellipse(150, 0, 150, 150 - focus);
            fill(255, coreBrightness); noStroke(); ellipse(0, 0, 80, 80);
            noFill(); stroke(255, 150); strokeWeight(2); line(-225, 0, -75, 0); line(225, 0, 75, 0); line(0, -40, 0, 40);
        }
    }
    
    // --- MASCHERA 5 ---
    class ForestSpiritScene extends Scene {
        draw() {
            let vol = this.updateVolume();
            background(24,24,24); translate(width/2, height/2);
            let headTilt = map(vol, 0, 1, 0, 20, true);
            let leafGrow = map(vol, 0, 1, 0, 80, true);
            stroke(255); strokeWeight(4); fill(24, 24, 24);
            push();
            rotate(-headTilt);
            ellipse(0, 0, 200, 250);
            fill(255); ellipse(-50, -30, 50, 70); ellipse(50, -30, 50, 70);
            noFill();
            beginShape();vertex(-100,0);bezierVertex(-150,-50,-150-leafGrow,-100,-100,-150);endShape();
            beginShape();vertex(100,0);bezierVertex(150,-50,150+leafGrow,-100,100,-150);endShape();
            pop();
        }
    }
    
    class FlameParticle {
        constructor(x,y){this.pos=createVector(x,y);this.vel=p5.Vector.random2D().mult(random(2,5));this.lifespan=255;}
        isFinished(){return this.lifespan<=0;}
        update(){this.pos.add(this.vel);this.lifespan-=5;}
        show(){noStroke();fill(255,this.lifespan);ellipse(this.pos.x,this.pos.y,8);}
    }

    window.keyPressed = function() {
        if (key >= '1' && key <= '5') switchScene(parseInt(key));
        if (key.toLowerCase() === 's') saveCanvas('my-mask', 'png');
    }
})();
