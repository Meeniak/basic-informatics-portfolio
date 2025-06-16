(function() {
    let currentMask = 1;
    let mic, fft;
    let smoothedVolume = 0;
    let sensitivitySlider;
    let maskLabel;

    const maskNames = {
        1: 'Dragon',
        2: 'Robot',
        3: 'Skull',
        4: 'Agitated Orb',
        5: 'Forest Spirit'
    };

    // --- Variabili specifiche ---
    let n_dragon = 1;
    let increment_dragon = 1;
    let particles_skull = [];
    let rageFlash_skull = 0;

    window.setup = function() {
        const canvasWrapper = document.getElementById('canvas-wrapper');
        // FIX: Usa una dimensione fissa per il canvas per rispettare le coordinate originali
        const canvas = createCanvas(1000, 800); 
        canvas.parent(canvasWrapper);
        
        mic = new p5.AudioIn();
        mic.start();

        fft = new p5.FFT(0.8, 128);
        fft.setInput(mic);

        maskLabel = select('#current-mask-label');
        maskLabel.html(`Current: ${maskNames[currentMask]}`);
        
        sensitivitySlider = createSlider(1, 10, 4, 0.1);
        sensitivitySlider.parent('sensitivity-slider-container');
        sensitivitySlider.style('width', '100%');
        
        rectMode(CENTER);
        strokeCap(ROUND);
        strokeJoin(ROUND);
        angleMode(DEGREES);
        textAlign(CENTER, CENTER);
    }

    window.draw = function() {
        background(24, 24, 24);
        
        let sensitivity = sensitivitySlider.value();
        let rawVolume = mic.getLevel() * sensitivity;
        let constrainedVolume = constrain(rawVolume, 0, 1.0); 
        smoothedVolume = lerp(smoothedVolume, constrainedVolume, 0.1);

        translate(width / 2, height / 2); // Centra tutto il disegno
        
        switch (currentMask) {
            case 1: drawUserDragon(smoothedVolume); break;
            case 2: drawUserRobot(smoothedVolume); break;
            case 3: drawUserSkull(smoothedVolume); break;
            case 4: drawAgitatedOrb(smoothedVolume); break;
            case 5: drawForestSpirit(smoothedVolume); break;
        }
    }

    // --- TUE MASCHERE INTEGRATE E CORRETTE ---

    function drawUserDragon(vol) {
        // FIX: Ricalibrato per un canvas 1000x800 e centrato
        push();
        
        let anger = map(vol, 0, 0.8, 20, 100, true);
        
        n_dragon += increment_dragon;
        if (n_dragon >= 30 || n_dragon <= 0) {
            increment_dragon *= -1;
        }

        if (anger > 80) {
            stroke(255, n_dragon * 5, 0);
            strokeWeight(n_dragon);
            noFill();
            line(-60, 55, -200 - n_dragon * 5, 55);
        }

        let pp = map(vol, 0, 0.5, 40, 5, true);
        let arc1 = map(vol, 0, 0.5, -90, 80, true);

        fill(0);
        stroke(255);
        strokeWeight(4);

        rect(-170, 0, 180, 50);
        arc(-220, 45, 100, 100, 0, 180);
        push(); fill(255, 0, 0); ellipse(-220, 45, 70, 70); pop();
        ellipse(-220, 45, pp, pp);
        push(); fill(255); ellipse(-235, 30, 10, 10); ellipse(-70, -15, (5 + vol * 80), (5 + vol * 80)); pop();
        arc(-220, 45, 80, 80, 240, arc1, CHORD);
        triangle(-170, -25, -170, 0, -140, 0);
        if (anger > 50) triangle(-140, -25, -140, 0, -110, 0);
        if (anger > 80) triangle(-110, -25, -110, 0, -80, 0);
        
        push();
        translate(-220, 45);
        if (anger > 20) rotate(vol * 50);
        rect(0, 40, 80, 49);
        triangle(50, 40, 50, 25, 30, 40);
        pop();

        pop();
    }
    
    function drawUserRobot(vol) {
        // FIX: Ricalibrato per essere sempre centrato
        push();
        
        let eyeHeight = map(vol, 0, 0.5, 4, 60, true);
        let visorScaleX = map(vol, 0, 0.5, 1, 1.2, true);
        let visorWidth = 280 * visorScaleX;
        let visorInfo = { y: -80, width: visorWidth, height: eyeHeight };

        noStroke();
        fill(255);
        rect(0, visorInfo.y, visorInfo.width, visorInfo.height, 3);

        if (eyeHeight > 10) {
            let pupilSize = 60;
            let pupilXOffset = map(vol, 0.1, 0.5, 0, visor.width / 2 - 40, true);
            fill(0);
            ellipse(-pupilXOffset, visor.y, pupilSize, pupilSize);
            ellipse(pupilXOffset, visor.y, pupilSize, pupilSize);
        }

        noFill();
        stroke(255);
        strokeWeight(8);
        rect(0, visorInfo.y, visorInfo.width, visorInfo.height, 3);
        
        push();
        translate(0, 100);
        let mouthWidth = 280;
        let mouthHeight = 90;
        noFill();
        stroke(255);
        strokeWeight(6);
        rect(0, 0, mouthWidth, mouthHeight, 10);
        
        // --- FIX: Aggiunto controllo di sicurezza per prevenire il crash ---
        let spectrum = fft.analyze();
        if (spectrum) {
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

        pop();
    }
    
    function drawUserSkull(vol) {
        // Questa maschera era già centrata e funzionante, ho solo aggiustato la reattività
        push();
        
        let angerLevel = map(vol, 0.1, 0.7, 0, 1, true);

        if (angerLevel > 0.95 && rageFlash_skull <= 0) {
            rageFlash_skull = 15;
        }
        
        let shakeAmount = map(angerLevel, 0.7, 1, 0, 40, true);
        translate(random(-shakeAmount, shakeAmount), random(-shakeAmount, shakeAmount));
        
        if (rageFlash_skull > 0) {
            filter(INVERT);
            rageFlash_skull--;
        }

        if (angerLevel > 0.6) {
            let particleCount = map(angerLevel, 0.6, 1, 0, 5, true);
            for (let i = 0; i < particleCount; i++) {
                particles_skull.push(new FlameParticle(-60, -20));
                particles_skull.push(new FlameParticle(60, -20));
            }
        }
        
        drawAngrySkull(angerLevel);
        for (let p of particles_skull) { p.update(); p.show(); }
        particles_skull = particles_skull.filter(p => !p.isFinished());
        
        pop();
    }

    // --- MIE MASCHERE (REATTIVITÀ CORRETTA) ---
    function drawAgitatedOrb(vol) {
        let agitation = map(vol, 0, 1, 0, 150, true);
        stroke(255); strokeWeight(2); noFill();
        for(let i=1; i < 10; i++) {
            beginShape();
            for(let a = 0; a < TWO_PI; a += 0.1) {
                let r = (i * 20) + noise(a * 5, frameCount * 0.01 + i) * agitation;
                vertex(cos(a) * r, sin(a) * r);
            }
            endShape(CLOSE);
        }
    }
    
    function drawForestSpirit(vol) {
        let headTilt = map(vol, 0, 1, 0, PI / 8, true);
        let leafGrow = map(vol, 0, 1, 0, 80, true);
        stroke(255); strokeWeight(4); fill(24, 24, 24);
        push();
        rotate(sin(frameCount*0.02)*0.1 - headTilt);
        ellipse(0, 0, 200, 250);
        fill(255);
        ellipse(-50, -30, 50, 70);
        ellipse(50, -30, 50, 70);
        noFill();
        beginShape(); vertex(-100, 0); bezierVertex(-150, -50, -150 - leafGrow, -100, -100, -150); endShape();
        beginShape(); vertex(100, 0); bezierVertex(150, -50, 150 + leafGrow, -100, 100, -150); endShape();
        pop();
    }

    // --- FUNZIONI HELPER (per la maschera teschio) ---
    function drawAngrySkull(angerLevel) {
        fill(255); noStroke();
        let jawDrop = map(angerLevel, 0, 1, 0, 140);
        let eyeSlant = map(angerLevel, 0, 1, 0, 40);
        let cheekFlareX = map(angerLevel, 0, 1, 0, 30);
        let crownSpike = map(angerLevel, 0, 1, 0, 40);

        beginShape();
        vertex(0, -165 - crownSpike);
        bezierVertex(-80, -170-crownSpike, -130, -120, -140-cheekFlareX, -60);
        bezierVertex(-150-cheekFlareX, 0, -100, 80, -70, 110);
        vertex(70, 110);
        bezierVertex(100, 80, 150+cheekFlareX, 0, 140+cheekFlareX, -60);
        bezierVertex(130, -120, 80, -170-crownSpike, 0, -165-crownSpike);
        endShape(CLOSE);
        
        drawLowerJaw(jawDrop, angerLevel);

        fill(24,24,24);
        let eyePinch = map(angerLevel, 0.5, 1, 0, 20, true);
        beginShape(); vertex(-40,-80); bezierVertex(-80,-70-eyeSlant,-95-cheekFlareX,-20+eyePinch,-75,10+eyePinch); bezierVertex(-60,15+eyePinch,-45,0,-40,-20); endShape(CLOSE);
        beginShape(); vertex(40,-80); bezierVertex(80,-70-eyeSlant,95+cheekFlareX,-20+eyePinch,75,10+eyePinch); bezierVertex(60,15+eyePinch,45,0,40,-20); endShape(CLOSE);
        
        if (angerLevel > 0.6) {
            let baseSize = map(angerLevel, 0.6, 1, 10, 45, true);
            for (let i = 5; i > 0; i--) { fill(255, map(i/5, 1, 0, 10, 80)); ellipse(-60, -20, baseSize*i/5); ellipse(60, -20, baseSize*i/5); }
        }
    }

    function drawLowerJaw(yOffset, angerLevel) {
        push();
        if (angerLevel < 0.95) {
            translate(0, yOffset);
        } else {
            let orbitRadius = 180 + sin(frameCount * 0.05) * 10;
            translate(cos(frameCount*0.1)*orbitRadius, sin(frameCount*0.1)*orbitRadius);
            rotate(frameCount*0.3);
        }
        fill(255); noStroke();
        beginShape();
        vertex(-75, 100); bezierVertex(-85, 105, -105, 140, -90, 190);
        bezierVertex(-60, 205, 60, 205, 90, 190);
        bezierVertex(105, 140, 85, 105, 75, 100);
        endShape(CLOSE);
        pop();
    }
    
    class FlameParticle {
        constructor(x, y) { this.pos = createVector(x, y); this.vel = p5.Vector.random2D().mult(random(2, 5)); this.lifespan = 255; }
        isFinished() { return this.lifespan <= 0; }
        update() { this.pos.add(this.vel); this.lifespan -= 5; }
        show() { noStroke(); fill(255, this.lifespan); ellipse(this.pos.x, this.pos.y, 8); }
    }

    window.keyPressed = function() {
        if (key >= '1' && key <= '5') {
            currentMask = parseInt(key);
            maskLabel.html(`Current: ${maskNames[currentMask]}`);
        }
        if (key.toLowerCase() === 's') saveCanvas('my-mask', 'png');
    }
    
    // Rimuovo la funzione windowResized perché ora usiamo un canvas a dimensione fissa
    // e lasciamo che sia il CSS a gestirne la visualizzazione responsive.
})();

