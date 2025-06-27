(function() {
    // Array di punti per la lettera
    const xyPoint = [
        257.2, 386.8, 258.1, 382.9, 258.7, 379.0, 259.1, 375.0, 259.2, 371.0, 259.0, 367.0, 258.5, 363.0, 257.8, 359.1, 256.8, 355.2, 255.6, 351.4, 254.1, 347.7, 252.3, 344.1, 250.3, 340.6, 248.1, 337.3, 245.7, 334.2, 243.0, 331.2, 240.2, 328.4, 237.1, 325.7, 233.9, 323.4, 230.6, 321.2, 227.1, 319.3, 223.5, 317.6, 219.7, 316.1, 215.9, 314.9, 212.0, 314.0, 208.1, 313.4, 204.1, 313.0, 200.1, 312.8, 196.1, 313.0, 192.1, 313.4, 188.2, 314.1, 184.3, 315.1, 180.5, 316.3, 176.8, 317.8, 173.2, 319.5, 169.7, 321.5, 166.4, 323.7, 163.2, 326.1, 160.2, 328.8, 157.3, 331.6, 154.7, 334.6, 152.3, 337.8, 150.1, 341.2, 148.2, 344.7, 146.5, 348.3, 145.0, 352.0, 143.8, 355.8, 142.9, 359.7, 142.2, 363.6, 141.8, 367.6, 141.6, 371.6, 141.8, 375.6, 142.2, 379.6, 142.8, 383.5, 143.8, 387.4, 145.0, 391.2, 146.5, 395.0, 148.2, 398.6, 150.1, 402.1, 152.3, 405.4, 154.7, 408.6, 157.4, 411.6, 160.2, 414.5, 163.2, 417.1, 166.3, 419.5, 169.7, 421.7, 173.2, 423.7, 176.8, 425.4, 180.5, 426.9, 184.3, 428.1, 188.2, 429.1, 192.1, 430.0, 196.0, 430.7, 200.0, 431.3, 203.9, 431.8, 207.9, 432.1, 211.9, 432.3, 215.9, 432.4, 219.9, 432.3, 223.9, 432.1, 227.9, 431.8, 231.9, 431.3, 235.8, 430.7, 239.7, 429.9, 243.6, 429.0, 247.5, 428.0, 251.3, 426.8, 255.1, 425.5, 258.9, 424.1, 262.6, 422.6, 266.2, 420.9, 269.8, 419.1, 273.3, 417.2, 276.7, 415.2, 280.1, 413.1, 283.4, 410.8, 286.7, 408.5, 289.8, 406.0, 292.9, 403.4, 295.8, 400.8, 298.7, 398.0, 301.5, 395.1, 304.2, 392.1, 306.8, 389.1, 309.2, 385.9, 311.6, 382.7, 313.9, 379.4, 316.0, 376.0, 318.0, 372.6, 319.9, 369.0, 321.7, 365.5, 323.3, 361.8, 324.9, 358.1, 326.3, 354.4, 327.6, 350.6, 328.7, 346.8, 329.7, 342.9, 330.8, 339.0, 331.8, 335.2, 332.9, 331.3, 333.9, 327.4, 334.9, 323.6, 336.0, 319.7, 337.0, 315.9, 338.0, 312.0, 339.1, 308.1, 340.1, 304.3, 341.1, 300.4, 342.2, 296.5, 343.2, 292.7, 344.2, 288.8, 345.3, 284.9, 346.3, 281.1, 347.3, 277.2, 348.4, 273.4, 349.4, 269.5, 350.5, 265.6, 351.5, 261.8, 352.5, 257.9, 353.6, 254.0, 354.6, 250.2, 355.6, 246.3, 356.7, 242.4, 357.7, 238.6, 358.7, 234.7, 359.8, 230.9, 360.8, 227.0, 361.8, 223.1, 362.9, 219.3, 363.9, 215.4, 364.9, 211.5, 366.0, 207.7, 367.0, 203.8, 368.1, 199.9, 369.1, 196.1, 370.1, 192.2, 371.2, 188.4, 372.2, 184.5, 373.2, 180.6, 374.3, 176.8, 375.3, 172.9, 376.3, 169.0, 377.4, 165.2, 378.4, 161.3, 379.4, 157.4, 380.5, 153.6, 381.5, 149.7, 382.5, 145.9, 383.6, 142.0, 384.6, 138.1, 385.7, 134.3, 386.7, 130.4, 387.7, 126.5, 388.8, 122.7, 389.8, 118.8, 390.8, 114.9, 391.9, 111.1, 392.9, 107.2, 393.9, 103.3, 395.0, 99.5, 396.0, 95.6, 397.0, 91.8, 398.1, 87.9, 395.1, 87.1, 391.1, 87.1, 387.1, 87.1, 383.1, 87.1, 379.1, 87.1, 375.1, 87.1, 371.1, 87.1, 367.1, 87.1, 363.1, 87.1, 359.1, 87.1, 355.1, 87.1, 351.1, 87.1, 347.1, 87.1, 343.1, 87.1, 339.1, 87.1, 335.1, 87.1, 331.1, 87.1, 327.1, 87.1, 323.1, 87.1, 319.1, 87.1, 315.1, 87.1, 311.1, 87.1, 307.1, 87.1, 303.1, 87.1, 299.1, 87.1, 295.1, 87.1, 291.1, 87.1, 287.1, 87.1, 283.1, 87.1, 279.1, 87.1, 275.1, 87.1, 271.1, 87.1, 267.1, 87.1, 263.1, 87.1, 259.1, 87.1
    ];

    // Variabili globali
    let sW, sH, r, sAnim, sOpacity, fillCol, fillCol2, strokeCol, sStrokeWeight, cStrokeToggle;
    let s2Complex, s3Complex, s4Complex, s5Complex;
    let currentStyle = 1;
    let cometTails = [];
    let primaryDot, secondaryDot, strokeDot;

    window.setup = function() {
        const canvasWrapper = document.getElementById('canvas-wrapper');
        const canvas = createCanvas(540, 540);
        canvas.parent(canvasWrapper);
        
        angleMode(DEGREES);
        pixelDensity(1);

        // Color dots
        primaryDot = document.getElementById('primary-color-dot');
        secondaryDot = document.getElementById('secondary-color-dot');
        strokeDot = document.getElementById('stroke-color-dot');

        // Inizializza i controlli
        sW = createSlider(10, 150, 80, 1).parent('sW-container');
        sH = createSlider(10, 150, 40, 1).parent('sH-container');
        r = createSlider(0, 360, 0, 1).parent('r-container');
        sAnim = createSlider(0, 5, 1, 0.1).parent('sAnim-container');
        sOpacity = createSlider(0, 255, 180, 1).parent('sOpacity-container');
        
        fillCol = createColorPicker(color(230, 50, 120)).parent('fillCol-container');
        fillCol2 = createColorPicker(color(40, 150, 255)).parent('fillCol2-container');
        strokeCol = createColorPicker(color(0)).parent('strokeCol-container');
        
        sStrokeWeight = createSlider(0.5, 15, 2, 0.1).parent('strokeWeight-container');
        cStrokeToggle = createCheckbox('Show Stroke', true).parent('strokeToggle-container');
        
        s2Complex = createSlider(1, 25, 5, 1).parent('s2-complex-container');
        s3Complex = createSlider(1, 5, 3, 1).parent('s3-complex-container');
        s4Complex = createSlider(5, 50, 15, 1).parent('s4-complex-container');
        s5Complex = createSlider(5, 50, 20, 1).parent('s5-complex-container');
        
        // Stile uniforme per tutti gli slider
        sW.style('width', '100%');
        sH.style('width', '100%');
        r.style('width', '100%');
        sAnim.style('width', '100%');
        sOpacity.style('width', '100%');
        sStrokeWeight.style('width', '100%');
        s2Complex.style('width', '100%');
        s3Complex.style('width', '100%');
        s4Complex.style('width', '100%');
        s5Complex.style('width', '100%');

        // Update color dots
        fillCol.input(() => primaryDot.style.backgroundColor = fillCol.value());
        fillCol2.input(() => secondaryDot.style.backgroundColor = fillCol2.value());
        strokeCol.input(() => strokeDot.style.backgroundColor = strokeCol.value());
        
        primaryDot.style.backgroundColor = fillCol.value();
        secondaryDot.style.backgroundColor = fillCol2.value();
        strokeDot.style.backgroundColor = strokeCol.value();

        // Inizializza le code delle comete
        for (let i = 0; i < xyPoint.length / 2; i++) { 
            cometTails.push([]); 
        }
        
        updateControlsVisibility();
    }

    window.draw = function() {
        background(255);
        translate(width / 2, height / 2);

        let w = sW.value();
        let h = sH.value();
        let rot = r.value();
        let animSpeed = sAnim.value();
        let opacity = sOpacity.value();
        let mainColor = fillCol.color();
        let secondaryColor = fillCol2.color();
        let strokeColor = strokeCol.color();
        let showStroke = cStrokeToggle.checked();
        let strokeWeightValue = sStrokeWeight.value();

        for (let i = 0; i < xyPoint.length; i += 2) {
            push();
            translate(xyPoint[i] - 270, xyPoint[i + 1] - 270);
            rotate(rot);
            switch (currentStyle) {
                case 1: 
                    stileOrbitePulsanti(w, h, animSpeed, mainColor, secondaryColor, strokeColor, opacity, showStroke, strokeWeightValue); 
                    break;
                case 2: 
                    stileAghiRotanti(w, s2Complex.value(), animSpeed, mainColor, secondaryColor, opacity); 
                    break;
                case 3: 
                    stileCristalliCoordinati(w, s3Complex.value(), animSpeed, mainColor, secondaryColor, strokeColor, opacity, showStroke, strokeWeightValue); 
                    break;
                case 4: 
                    stileNastroBicolore(w, h, s4Complex.value(), animSpeed, mainColor, secondaryColor, opacity); 
                    break;
                case 5: 
                    stileCometaScintillante(w, s5Complex.value(), animSpeed, mainColor, secondaryColor, opacity, i/2); 
                    break;
            }
            pop();
        }
    }
    
    function gestisciTraccia(show, sCol, sWeight, alpha) { 
        if (show) { 
            let c = color(sCol); 
            c.setAlpha(alpha); 
            stroke(c); 
            strokeWeight(sWeight); 
        } else { 
            noStroke(); 
        } 
    }
    
    function stileOrbitePulsanti(w, h, speed, c1, c2, sCol, alpha, showStroke, sWeight) { 
        gestisciTraccia(showStroke, sCol, sWeight, alpha); 
        for (let i = 0; i < 3; i++) { 
            let col = (i % 2 === 0) ? c1 : c2; 
            col.setAlpha(alpha); 
            fill(col); 
            let pulse = sin(frameCount * speed + i * 120); 
            let size = map(pulse, -1, 1, 5, h); 
            let angle = frameCount * speed * 0.5 + i * 120; 
            let radius = w / 2 * sin(frameCount * speed * 0.2 + i * 120); 
            ellipse(cos(angle) * radius, sin(angle) * radius, size, size); 
        } 
    }
    
    function stileAghiRotanti(w, numLines, speed, c1, c2, alpha) { 
        noFill(); 
        strokeWeight(3); 
        for (let i = 0; i < numLines; i++) { 
            let col = (i % 2 === 0) ? c1 : c2; 
            col.setAlpha(alpha); 
            stroke(col); 
            push(); 
            rotate(i * (360 / numLines) + frameCount * speed); 
            line(0, 0, w, 0); 
            pop(); 
        } 
    }
    
    function stileCristalliCoordinati(w, crystalCount, speed, c1, c2, sCol, alpha, showStroke, sWeight) { 
        gestisciTraccia(showStroke, sCol, sWeight, alpha); 
        let time = frameCount * speed; 
        rotate(time * 0.5); 
        let sizePulse = sin(time * 0.8); 
        let raggioBase = map(sizePulse, -1, 1, w * 0.1, w * 0.4); 
        
        for (let i = 0; i < crystalCount; i++) { 
            push(); 
            let raggio = raggioBase; 
            if (i === 0) { 
                raggio *= 1.5; 
                c1.setAlpha(alpha); 
                fill(c1); 
            } else { 
                let orbitRadius = w * 0.4; 
                let orbitAngle = time * -1 + (i * 360 / (crystalCount - 1)); 
                translate(orbitRadius * cos(orbitAngle), orbitRadius * sin(orbitAngle)); 
                rotate(time * 1.5); 
                c2.setAlpha(alpha * 0.9); 
                fill(c2); 
            } 
            disegnaTriangoloEquilatero(0, 0, raggio); 
            pop(); 
        } 
    }
    
    function stileNastroBicolore(w, h, complexity, speed, c1, c2, alpha) { 
        noStroke(); 
        c1.setAlpha(alpha); 
        c2.setAlpha(alpha); 
        beginShape(TRIANGLE_STRIP); 
        for (let i = -w / 2; i < w / 2; i += 5) { 
            let waveOffset = sin(i * (complexity / 100) + frameCount * speed); 
            let y1 = waveOffset * h; 
            let y2 = (waveOffset + 0.5) * h; 
            fill(c1); 
            vertex(i, y1); 
            fill(c2); 
            vertex(i, y2); 
        } 
        endShape(); 
    }
    
    function stileCometaScintillante(w, tailLength, speed, c1, c2, alpha, pointIndex) { 
        let angle = frameCount * speed; 
        let radius = w / 2; 
        let headPos = createVector(cos(angle) * radius, sin(angle) * radius); 
        let tail = cometTails[pointIndex]; 
        tail.unshift(headPos); 
        while (tail.length > tailLength) { 
            tail.pop(); 
        } 
        noStroke(); 
        for (let i = 0; i < tail.length; i++) { 
            let pos = tail[i]; 
            let size = map(i, 0, tail.length, 8, 1); 
            let pAlpha = map(i, 0, tail.length, alpha, 0); 
            c2.setAlpha(pAlpha); 
            fill(c2); 
            ellipse(pos.x, pos.y, size, size); 
        } 
        c1.setAlpha(alpha); 
        fill(c1); 
        ellipse(headPos.x, headPos.y, 12, 12); 
    }
    
    function disegnaTriangoloEquilatero(x, y, raggio) { 
        let a1 = -90, a2 = 30, a3 = 150; 
        let x1 = x + raggio * cos(a1); 
        let y1 = y + raggio * sin(a1); 
        let x2 = x + raggio * cos(a2); 
        let y2 = y + raggio * sin(a2); 
        let x3 = x + raggio * cos(a3); 
        let y3 = y + raggio * sin(a3); 
        triangle(x1, y1, x2, y2, x3, y3); 
    }

    window.keyPressed = function() {
        if (key >= '1' && key <= '5') {
            currentStyle = parseInt(key);
            updateControlsVisibility();
        }
        if (key.toLowerCase() === 's') {
            saveCanvas('letter-artwork', 'png');
        }
    }

    function updateControlsVisibility() {
        // Hide all style-specific controls
        select('#sH-container').parent().hide();
        select('#s2-complex-container').parent().hide();
        select('#s3-complex-container').parent().hide();
        select('#s4-complex-container').parent().hide();
        select('#s5-complex-container').parent().hide();
        select('#group-stroke-options').hide();
        
        // Show controls based on current style
        switch (currentStyle) {
            case 1: 
                select('#sH-container').parent().show();
                select('#group-stroke-options').show();
                break;
            case 2: 
                select('#s2-complex-container').parent().show();
                break;
            case 3: 
                select('#s3-complex-container').parent().show();
                select('#group-stroke-options').show();
                break;
            case 4: 
                select('#sH-container').parent().show();
                select('#s4-complex-container').parent().show();
                break;
            case 5: 
                select('#s5-complex-container').parent().show();
                break;
        }
    }
})();




