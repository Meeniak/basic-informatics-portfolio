(function() {
    let currentMask = 1;
    let mic, fft;
    let smoothedVolume = 0;
    let easing = 0.1;
    let maskLabel;

    const maskNames = {
        1: 'Dragon', // Tua creazione
        2: 'Robot',  // Tua creazione
        3: 'Skull',    // Tua creazione
        4: 'Agitated Orb',
        5: 'Forest Spirit'
    };

    // --- Variabili specifiche per le tue maschere ---
    // Per Dragon (maschera 1)
    let n_dragon = 1;
    let increment_dragon = 1;
    // Per Skull (maschera 3)
    let particles_skull = [];
    let rageFlash_skull = 0;
    let rageHasTriggered_skull = false;

    window.setup = function() {
        const canvasWrapper = document.getElementById('canvas-wrapper');
        const canvas = createCanvas(canvasWrapper.offsetWidth, canvasWrapper.offsetHeight);
        canvas.parent(canvasWrapper);
        
        // Setup audio input per tutte le maschere
        mic = new p5.AudioIn();
        mic.start();

        // Setup FFT per la maschera Robot
        fft = new p5.FFT(0.8, 128);
        fft.setInput(mic);

        maskLabel = select('#current-mask-label');
        maskLabel.html(`Current: ${maskNames[currentMask]}`);
        
        rectMode(CENTER);
        strokeCap(ROUND);
        strokeJoin(ROUND);
        angleMode(DEGREES); // Per la tua maschera Drago
    }

    window.draw = function() {
        background(24, 24, 24);
        
        let rawVolume = mic.getLevel();
        smoothedVolume = lerp(smoothedVolume, rawVolume, easing);

        translate(width / 2, height / 2);
        
        switch (currentMask) {
            case 1: drawUserDragon(smoothedVolume); break;
            case 2: drawUserRobot(smoothedVolume); break;
            case 3: drawUserSkull(smoothedVolume); break;
            case 4: drawAgitatedOrb(smoothedVolume); break;
            case 5: drawForestSpirit(smoothedVolume); break;
        }
    }

    // --- TUE MASCHERE INTEGRATE ---

    function drawUserDragon(vol) {
        let anger = map(vol, 0, 0.4, 20, 100, true);
        
        n_dragon += increment_dragon;
        if (n_dragon >= 30 || n_dragon <= 0) {
            increment_dragon *= -1;
        }

        push();
        if (anger > 80) { // Sputa fuoco solo a volume alto
            stroke(255, n_dragon * 5, 0);
            strokeWeight(n_dragon);
            noFill();
            line(-120, 35, -300 - n_dragon * 5, 35);
        }
        pop();

        let pp = map(vol, 0, 0.3, 40, 5, true);
        let arc1 = map(vol, 0, 0.3, -90, 80, true);

        fill(0);
        stroke(255);
        strokeWeight(4);

        rect(-150, -20, 180, 50);
        arc(-100, 25, 100, 100, 0, 180);
        push();
        fill(255, 0, 0);
        ellipse(-100, 25, 70, 70);
        pop();
        ellipse(-100, 25, pp, pp);
        push();
        fill(255);
        ellipse(-115, 10, 10, 10);
        ellipse(10, -5, (5 + vol * 80) % 25, (5 + vol * 80) % 25);
        pop();
        arc(-100, 25, 80, 80, 240, arc1, CHORD);
        triangle(-150, -45, -150, -20, -120, -20);
        if (anger > 50) triangle(-120, -45, -120, -20, -90, -20);
        if (anger > 80) triangle(-90, -45, -90, -20, -60, -20);
        triangle(30, 25, 10, 40, 10, 25);

        push();
        translate(-100, 35);
        if (anger > 20) rotate(vol * 80);
        rect(0, 40, 80, 49);
        triangle(50, 40, 50, 25, 30, 40);
        pop();
    }
    
    function drawUserRobot(vol) {
        let eyeHeight = map(vol, 0, 0.25, 4, 60, true);
        let visorScaleX = map(vol, 0, 0.25, 1, 1.2, true);
        let visorWidth = 280 * visorScaleX;
        let visorInfo = { y: -80, width: visorWidth, height: eyeHeight };

        noStroke();
        fill(255);
        rect(0, visorInfo.y, visorInfo.width, visorInfo.height, 3);
        if (eyeHeight > 10) {
            let pupilSize = 60;
            let pupilXOffset = map(vol, 0.05, 0.25, 0, visor.width / 2 - 40, true);
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
        let spectrum = fft.analyze();
        noStroke();
        fill(255);
        let barWidth = mouthWidth / spectrum.length;
        for (let i = 0; i < spectrum.length; i++) {
            let x = map(i, 0, spectrum.length, -mouthWidth / 2, mouthWidth / 2);
            let barHeight = map(spectrum[i], 0, 255, 0, mouthHeight - 10);
            rect(x + barWidth / 2, mouthHeight/2 - barHeight/2, barWidth * 0.8, barHeight);
        }
        pop();
    }
    
    function drawUserSkull(vol) {
        let angerLevel = map(vol, 0.04, 0.35, 0, 1, true);

        if (angerLevel > 0.98 && !rageHasTriggered_skull) {
            rageFlash_skull = 15;
            rageHasTriggered_skull = true;
        }
        if (angerLevel < 0.9) rageHasTriggered_skull = false;
        
        let shakeAmount = map(angerLevel, 0.7, 1, 0, 60, true);
        translate(random(-shakeAmount, shakeAmount), random(-shakeAmount, shakeAmount));
        if (rageFlash_skull > 0) { filter(INVERT); rageFlash_skull--; }
        if (angerLevel > 0.8) {
            let particleCount = map(angerLevel, 0.8, 1, 1, 15);
            for (let i = 0; i < particleCount; i++) {
                particles_skull.push(new FlameParticle(-60, -20));
                particles_skull.push(new FlameParticle(60, -20));
            }
        }
        
        drawAngrySkull(angerLevel);
        for (let p of particles_skull) { p.update(); p.show(); }
        particles_skull = particles_skull.filter(p => !p.isFinished());
    }

    // --- MIE MASCHERE ---

    function drawAgitatedOrb(vol) {
        let agitation = map(vol, 0, 0.2, 0, 80, true);
        stroke(255); strokeWeight(2); noFill();
        for(let i=1; i < 10; i++) {
            beginShape();
            for(let a = 0; a < TWO_PI; a += 0.1) {
                let r = (i * 25) + noise(a * 5, frameCount * 0.01 + i) * agitation;
                vertex(cos(a) * r, sin(a) * r);
            }
            endShape(CLOSE);
        }
    }
    
    function drawForestSpirit(vol) {
        let headTilt = map(vol, 0, 0.2, 0, PI / 12, true);
        let leafGrow = map(vol, 0, 0.2, 0, 60, true);
        stroke(255); strokeWeight(4); fill(24, 24, 24);
        push();
        rotate(sin(frameCount*0.02)*0.1 + headTilt);
        ellipse(0, 0, 200, 250);
        fill(255);
        ellipse(-50, -30, 50, 70);
        ellipse(50, -30, 50, 70);
        noFill();
        beginShape(); vertex(-100, 0); bezierVertex(-150, -50, -150 - leafGrow, -100, -100, -150); endShape();
        beginShape(); vertex(100, 0); bezierVertex(150, -50, 150 + leafGrow, -100, 100, -150); endShape();
        pop();
    }

    // --- FUNZIONI HELPER PER LA TUA MASCHERA SKULL ---

    function drawAngrySkull(angerLevel) {
        fill(255); noStroke();
        let jawDrop = map(angerLevel, 0, 1, 0, 140);
        let eyeSlant = map(angerLevel, 0, 1, 0, 40);
        let browDrop = map(angerLevel, 0, 1, 0, 30);
        let noseFlare = map(angerLevel, 0, 1, 0, 15);
        let cheekFlareX = map(angerLevel, 0, 1, 0, 30);
        let crownSpike = map(angerLevel, 0, 1, 0, 40);
        let eyePinch = map(angerLevel, 0.5, 1, 0, 20, true);

        beginShape();
        vertex(0, -165 - crownSpike);
        bezierVertex(-80, -170 - crownSpike, -130, -120, -140 - cheekFlareX, -60);
        bezierVertex(-150 - cheekFlareX, 0, -100, 80, -70, 110);
        vertex(70, 110);
        bezierVertex(100, 80, 150 + cheekFlareX, 0, 140 + cheekFlareX, -60);
        bezierVertex(130, -120, 80, -170 - crownSpike, 0, -165 - crownSpike);
        endShape(CLOSE);
        
        drawLowerJaw(jawDrop, angerLevel);

        fill(24,24,24); // Carve
        beginShape(); vertex(-40,-80+browDrop); bezierVertex(-80,-70-eyeSlant,-95-cheekFlareX,-20+eyePinch,-75,10+eyePinch); bezierVertex(-60,15+eyePinch,-45,0,-40,-20); endShape(CLOSE);
        beginShape(); vertex(40,-80+browDrop); bezierVertex(80,-70-eyeSlant,95+cheekFlareX,-20+eyePinch,75,10+eyePinch); bezierVertex(60,15+eyePinch,45,0,40,-20); endShape(CLOSE);
        beginShape(); vertex(0,40); vertex(-12-noseFlare,75); vertex(12+noseFlare,75); endShape(CLOSE);
        if (angerLevel > 0.6) {
            let baseSize = map(angerLevel, 0.6, 1, 10, 45, true);
            noStroke();
            for (let i = 5; i > 0; i--) { fill(255, map(i/5, 1, 0, 10, 80)); ellipse(-60, -20, baseSize*i/5); ellipse(60, -20, baseSize*i/5); }
        }
    }

    function drawLowerJaw(yOffset, angerLevel) {
        push();
        if (angerLevel < 0.98) {
            translate(0, yOffset); rotate(map(yOffset, 0, 140, 0, 0.05));
        } else {
            let orbitRadius = 180 + sin(frameCount*0.05)*10;
            translate(cos(frameCount*0.1)*orbitRadius, sin(frameCount*0.1)*orbitRadius);
            rotate(frameCount*0.3);
        }
        let cheekFlareX = map(angerLevel, 0, 1, 0, 15);
        fill(255); noStroke();
        beginShape();
        vertex(-75-cheekFlareX, 100); bezierVertex(-85-cheekFlareX, 105, -105-cheekFlareX, 140, -90, 190);
        bezierVertex(-60, 205, 60, 205, 90, 190); bezierVertex(105+cheekFlareX, 140, 85+cheekFlareX, 105, 75+cheekFlareX, 100);
        vertex(70, 100); vertex(-70, 100);
        endShape(CLOSE);
        pop();
    }
    
    class FlameParticle {
        constructor(emitterX, emitterY) {
            this.pos = createVector(emitterX + random(-15, 15), emitterY + random(-15, 15));
            this.vel = createVector(random(-2, 2), random(-5, -12));
            this.lifespan = 1.0; this.decay = random(0.015, 0.04); this.size = random(10, 25);
        }
        isFinished() { return this.lifespan <= 0; }
        update() { this.pos.add(this.vel); this.vel.y *= 0.98; this.lifespan -= this.decay; this.size -= 0.3; }
        show() { noStroke(); fill(255, this.lifespan * 220); ellipse(this.pos.x, this.pos.y, max(0, this.size)); }
    }


    // --- KEYPRESS HANDLER ---

    window.keyPressed = function() {
        if (key >= '1' && key <= '5') {
            currentMask = parseInt(key);
            maskLabel.html(`Current: ${maskNames[currentMask]}`);
        }
        
        if (key.toLowerCase() === 's') {
            saveCanvas('my-mask', 'png');
        }
    }
})();
