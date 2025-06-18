(function() {
    let mic, fft, sensitivitySlider, maskLabel;
    let currentMask = 1;
    let smoothedVolume = 0;

    // Oggetti specifici per ogni scena per mantenere lo stato
    let sceneData = {
        dragon: { n: 1, increment: 1 },
        skull: { particles: [] },
        jester: {},
        gargoyle: {},
        robot: {}
    };
    
    const maskNames = {
        1: 'Robot',
        2: 'Dragon',
        3: 'Skull',
        4: 'Gargoyle',
        5: 'Jester'
    };

    window.setup = function() {
        const canvasWrapper = document.getElementById('canvas-wrapper');
        const canvas = createCanvas(700, 700);
        canvas.parent(canvasWrapper);
        
        mic = new p5.AudioIn();
        mic.start();
        fft = new p5.FFT(0.8, 128);
        fft.setInput(mic);

        maskLabel = select('#current-mask-label');
        sensitivitySlider = createSlider(1, 40, 15, 0.1);
        sensitivitySlider.parent('sensitivity-slider-container');
        sensitivitySlider.style('width', '100%');
        
        switchScene(1);
    }

    window.draw = function() {
        let sensitivity = sensitivitySlider.value();
        let rawVolume = mic.getLevel() * sensitivity;
        smoothedVolume = lerp(smoothedVolume, constrain(rawVolume, 0, 1.0), 0.1);

        switch (currentMask) {
            case 1: drawRobot(smoothedVolume); break;
            case 2: drawDragon(smoothedVolume); break;
            case 3: drawSkull(smoothedVolume); break;
            case 4: drawGargoyle(smoothedVolume); break;
            case 5: drawJester(smoothedVolume); break;
        }
    }

    function switchScene(sceneId) {
        currentMask = sceneId;
        maskLabel.html(`Current: ${maskNames[sceneId]}`);
    }

    // --- ROBOT ---
    function drawRobot(vol) {
        background(255);
        translate(width / 2, height / 2 + 30);
        rectMode(CENTER);

        let antennaWobble = sin(frameCount * 0.2) * vol * 40;
        stroke(0); strokeWeight(6); noFill();
        line(-80, -150, -120, -240 + antennaWobble);
        line(80, -150, 120, -240 - antennaWobble);
        fill(0); ellipse(-120, -240 + antennaWobble, 15, 15); ellipse(120, -240 - antennaWobble, 15, 15);
        let sideDetailSize = map(vol, 0.1, 0.6, 0, 40, true);
        rect(-180, 0, 20, sideDetailSize, 5);
        rect(180, 0, 20, sideDetailSize, 5);

        let eyeHeight = map(vol, 0, 0.5, 4, 60, true);
        let visorWidth = 280 * map(vol, 0, 0.5, 1, 1.2, true);
        noStroke(); fill(0);
        rect(0, -80, visorWidth, eyeHeight, 3);
        if (eyeHeight > 10) {
            let pupilSize = 60; let pupilXOffset = map(vol, 0.1, 0.5, 0, visorWidth / 2 - 40, true);
            fill(255); ellipse(-pupilXOffset, -80, pupilSize, pupilSize); ellipse(pupilXOffset, -80, pupilSize, pupilSize);
        }
        noFill(); stroke(0); strokeWeight(8); rect(0, -80, visorWidth, eyeHeight, 3);
        
        push();
        translate(0, 100);
        let mouthWidth = 280, mouthHeight = 90;
        noFill(); stroke(0); strokeWeight(6); rect(0, 0, mouthWidth, mouthHeight, 10);
        
        let spectrum = fft.analyze();
        if (spectrum?.length) {
            noStroke(); fill(0);
            let barCount = spectrum.length / 2;
            let barWidth = mouthWidth / barCount;
            for (let i=0; i < barCount; i++) {
                let h = map(spectrum[i], 0, 255, 0, mouthHeight - 10);
                let x = map(i, 0, barCount-1, -mouthWidth/2 + barWidth/2, mouthWidth/2 - barWidth/2);
                rect(x, 0, barWidth * 0.8, h);
            }
        }
        pop();
    }

    // --- DRAGO ---
    function drawDragon(vol) {
        let data = sceneData.dragon;
        background(0);
        angleMode(DEGREES);
        push();
        translate(width / 2, height / 2);
        scale(1.5);
        translate(-270, -270);
        
        let anger = map(vol, 0, 0.8, 20, 100, true);
        let pp = map(vol, 0, 0.5, 40, 5, true);
        let arc1 = map(vol, 0, 0.5, -90, 20, true);
        let jawRotation = map(vol, 0, 0.5, 0, 25, true);
        let nostrilSize = constrain(5 + vol * 40, 5, 15);

        fill(255); noStroke(); rectMode(CORNER);
        rect(100, 180, 180, 50); arc(150, 225, 100, 100, 0, 180);
        push(); fill(150); ellipse(150, 225, 70, 70); pop();
        ellipse(150, 225, pp, pp);
        push(); fill(0); ellipse(135, 210, 10, 10); ellipse(260, 195, nostrilSize, nostrilSize); pop();
        arc(150, 225, 80, 80, 240, arc1, CHORD);
        triangle(100, 155, 100, 180, 130, 180);
        triangle(200, 170, 200, 180, 220, 180); triangle(220, 170, 220, 180, 240, 180); triangle(240, 170, 240, 180, 260, 180);
        if (anger > 50) triangle(130, 155, 130, 180, 160, 180);
        if (anger > 80) triangle(160, 155, 160, 180, 190, 180);
        triangle(280, 230, 260, 245, 260, 230); triangle(250, 230, 230, 245, 230, 230); triangle(220, 230, 200, 245, 200, 230);
        
        push();
        translate(150, 235); stroke(255); strokeWeight(1.5);
        if (anger > 20) rotate(jawRotation);
        rect(0, 40, 80, 49); arc(80, 40, 100, 98, 0, 90); arc(0, 90, 100, 100, 180, 270);
        triangle(130, 40, 130, 25, 110, 40); triangle(100, 40, 100, 25, 80, 40); triangle(70, 40, 70, 25, 50, 40);
        pop();
        pop();
    }
    
    // --- TESCHIO ---
    function drawSkull(vol) {
        let data = sceneData.skull;
        background(0); translate(width / 2, height / 2);
        let anger = map(vol, 0.1, 0.9, 0, 1, true);
        let shake = constrain(map(anger, 0.6, 1, 0, 15, true), 0, 15);
        
        push();
        translate(random(-shake, shake), random(-shake, shake));
        
        let jawDrop = map(anger, 0.3, 1, 0, 80, true);
        let cheekFlare = map(anger, 0.2, 1, 0, 25, true);
        let crownSpike = map(anger, 0.4, 1, 0, 40, true);
        let eyePinch = map(anger, 0.5, 1, 0, 20, true);

        noStroke(); fill(255);
        
        // Cranio
        beginShape();
        vertex(0, -185 - crownSpike);
        bezierVertex(-80,-190-crownSpike, -150,-140, -160,-80-cheekFlare);
        bezierVertex(-170,-20, -145,50, -120,60);
        vertex(120, 60);
        bezierVertex(145,50, 170,-20, 160,-80-cheekFlare);
        bezierVertex(150,-140, 80,-190, 0,-185-crownSpike);
        endShape(CLOSE);
        
        // Mandibola
        push(); translate(0, jawDrop);
        beginShape();
        vertex(115,70); bezierVertex(125,75, 145+cheekFlare,110, 130,160);
        vertex(-130,160); bezierVertex(-145-cheekFlare,110, -125,75, -115,70);
        endShape(CLOSE);
        fill(0); rectMode(CENTER); for(let i=0; i<5; i++){ let x=lerp(-50,50,i/4); rect(x, 110, 14, 18, 3); }
        pop();
        
        // Cavità
        fill(0);
        beginShape(); vertex(-40,-100); bezierVertex(-100,-90 - eyePinch, -115,-40, -85,-10); bezierVertex(-70,-5, -45,-20, -40,-40); endShape(CLOSE);
        beginShape(); vertex(40,-100); bezierVertex(100,-90 - eyePinch, 115,-40, 85,-10); bezierVertex(70,-5, 45,-20, 40,-40); endShape(CLOSE);
        let noseFlare = map(anger, 0, 1, 0, 10);
        triangle(0, 20, -15 - noseFlare, 45, 15 + noseFlare, 45);
        
        pop();
    }

    // --- GARGOYLE ---
    function drawGargoyle(vol) {
        background(24,24,24); translate(width/2, height/2); angleMode(RADIANS);
        let energy = map(vol, 0, 1, 0, 1, true);

        let wingFlap = sin(frameCount*0.2)*20 + map(energy, 0, 1, 0, 40);
        stroke(100); strokeWeight(8); noFill();
        beginShape(); vertex(-150,-50); bezierVertex(-250, -150, -300, 0-wingFlap, -150, 100); endShape();
        beginShape(); vertex(150,-50); bezierVertex(250, -150, 300, 0-wingFlap, 150, 100); endShape();
        
        fill(120); noStroke(); rectMode(CENTER);
        rect(0,0,300,350,20);
        arc(-80, -170, 80, 120, PI, TWO_PI);
        arc(80, -170, 80, 120, PI, TWO_PI);

        let eyeGlow = map(energy, 0.3, 1, 50, 255, true);
        fill(255, 255, 0, eyeGlow);
        ellipse(-80, -50, 60, 60);
        ellipse(80, -50, 60, 60);

        let mouthOpen = map(energy, 0, 1, 10, 80);
        fill(0);
        rect(0, 80, 150, mouthOpen, 10);
    }
    
    // --- JESTER ---
    function drawJester(vol) {
        background(24, 24, 24); translate(width/2, height/2); angleMode(DEGREES);
        let energy = map(vol, 0.1, 0.8, 0, 1, true);
        
        push();
        translate(0, 50);

        fill(255); noStroke();
        beginShape();
        vertex(0, -150);
        bezierVertex(-250, -100, -200, 220, 0, 250);
        bezierVertex(200, 220, 250, -100, 0, -150);
        endShape(CLOSE);

        fill(0);
        let pupilY = lerp(0, -10, energy);
        let pupilSize = lerp(15, 25, energy);
        let tearLength = lerp(40, 100, energy);
        
        arc(-80, -30, 80, 100, 180, 360);
        arc(80, -30, 80, 100, 180, 360);
        fill(255);
        ellipse(-80, -25 + pupilY, pupilSize, pupilSize);
        ellipse(80, -25 + pupilY, pupilSize, pupilSize);

        fill(0);
        triangle(-90, 0, -70, 0, -80, tearLength);
        triangle(90, 0, 70, 0, 80, tearLength);
        
        let smileHeight = lerp(10, 100, energy);
        fill(255); noStroke();
        arc(0, 120, 150, smileHeight, 180, 360, CHORD);

        let bellWobble = energy * 25;
        noStroke(); fill(0);
        
        let hatBaseY = -140;
        rectMode(CENTER);
        rect(0, hatBaseY, 280, 40, 10);

        noFill(); stroke(0); strokeWeight(40);
        beginShape();
        vertex(0, hatBaseY);
        quadraticVertex(-100, -280, -250 + random(-bellWobble, bellWobble), -200);
        endShape();
        beginShape();
        vertex(0, hatBaseY);
        quadraticVertex(100, -280, 250 + random(-bellWobble, bellWobble), -200);
        endShape();
        triangle(-20, hatBaseY, 20, hatBaseY, random(-bellWobble, bellWobble), -250);
        
        stroke(0); strokeWeight(3); fill(255);
        ellipse(random(-bellWobble, bellWobble), -250, 40, 40);
        ellipse(-250 + random(-bellWobble, bellWobble), -200, 40, 40);
        ellipse(250 + random(-bellWobble, bellWobble), -120, 40, 40);
        pop();
    }

    window.keyPressed = function() {
        if (key >= '1' && key <= '5') {
            switchScene(parseInt(key));
        }
        if (key.toLowerCase() === 's') {
            saveCanvas('my-mask', 'png');
        }
    }
})();
