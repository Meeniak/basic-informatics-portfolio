(function() {
    let tipoPennello = 1;
    let colorePennello, coloreSfondo;
    let telaDisegno, layerAnteprima;
    let selettoreColore, selettoreSfondo;
    let sliderDimensione, sliderTrasparenza, sliderCustom;
    let etichettaPennello;
    let brushColorDot, bgColorDot;
    let mouseXPrecedente, mouseYPrecedente;
    let angolo = 0;
    let microfono;
    let puntiPrecedenti = [];
    const nomiPennelli = {
        1: 'Bubbles', 2: 'Random Letters', 3: 'Organic (sounds reactive)', 4: 'Orbiting Dots',
        5: 'Spray Paint', 6: 'Swellings', 7: 'Web', 8: 'Crystallize',
        9: 'Soft Eraser', 0: 'Shape Eraser'
    };
    window.setup = function() {
        const canvasWrapper = document.getElementById('canvas-wrapper');
        const canvas = createCanvas(canvasWrapper.offsetWidth, canvasWrapper.offsetHeight);
        canvas.parent(canvasWrapper);
        telaDisegno = createGraphics(width, height);
        layerAnteprima = createGraphics(width, height);
        coloreSfondo = color(24, 24, 24);
        telaDisegno.background(coloreSfondo);
        brushColorDot = document.getElementById('brush-color-dot');
        bgColorDot = document.getElementById('bg-color-dot');
        selettoreColore = createColorPicker('#FFFFFF');
        selettoreColore.parent('color-picker-container');
        selettoreColore.input(() => {
            colorePennello = selettoreColore.color();
            brushColorDot.style.backgroundColor = selettoreColore.value();
        });
        colorePennello = selettoreColore.color();
        brushColorDot.style.backgroundColor = selettoreColore.value();
        selettoreSfondo = createColorPicker(coloreSfondo);
        selettoreSfondo.parent('bg-color-picker-container');
        selettoreSfondo.input(() => {
            coloreSfondo = selettoreSfondo.color();
            telaDisegno.background(coloreSfondo);
            bgColorDot.style.backgroundColor = selettoreSfondo.value();
        });
        bgColorDot.style.backgroundColor = selettoreSfondo.value();
        sliderDimensione = createSlider(5, 200, 30);
        sliderDimensione.parent('size-slider-container');
        sliderDimensione.style('width', '100%');
        sliderTrasparenza = createSlider(10, 255, 200);
        sliderTrasparenza.parent('opacity-slider-container');
        sliderTrasparenza.style('width', '100%');
        sliderCustom = createSlider(1, 100, 50);
        sliderCustom.parent('custom-slider-container');
        sliderCustom.style('width', '100%');
        etichettaPennello = select('#current-brush-label');
        etichettaPennello.html(`Current: ${nomiPennelli[tipoPennello]}`);
        microfono = new p5.AudioIn();
        microfono.start();
    }
    // ... il resto del codice di brushes-sketch.js
})();
