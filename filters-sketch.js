body {
    /* Impostazioni generali per il corpo della pagina */
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    margin: 0;
    background-color: #1a1a1a; /* Sfondo scuro */
    color: #f0f0f0;            /* Testo chiaro */
    text-align: center;
}

h1 {
    font-size: 2rem;
    color: #ffffff;
    margin-bottom: 0.5rem;
}

p {
    margin-top: 0;
    color: #cccccc;
}

/* Contenitore per il canvas di p5.js */
#canvas-wrapper {
    margin-top: 1rem;
    border-radius: 12px; /* Angoli arrotondati */
    overflow: hidden;    /* Nasconde ciò che esce dai bordi arrotondati */
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5); /* Ombra per effetto profondità */
    line-height: 0;      /* Rimuove spazi bianchi sotto il canvas */
}

/* Box che contiene i controlli */
#controls {
    margin-top: 1.5rem;
    padding: 1rem;
    background-color: #2c2c2c;
    border-radius: 12px;
    width: 90%;
    max-width: 640px; /* Larghezza massima uguale al canvas */
    box-sizing: border-box;
}

/* Etichetta che mostra il filtro corrente */
#current-filter-label {
    font-size: 1.1rem;
    font-weight: bold;
    margin-bottom: 0.5rem;
    min-height: 1.2em; /* Altezza minima per evitare "salti" del layout */
}

#slider-container {
    margin-bottom: 1rem;
}

#instructions {
    font-size: 0.9rem;
    color: #999;
}

/* Stili generici per lo slider */
input[type=range] {
    -webkit-appearance: none; /* Rimuove lo stile di default del browser */
    width: 100%;
    margin: 7px 0;
    background: transparent; /* Sfondo trasparente */
}

input[type=range]:focus {
    outline: none; /* Rimuove il bordo blu al focus */
}

/* Stili per la traccia dello slider (Chrome, Safari, Opera, Edge) */
input[type=range]::-webkit-slider-runnable-track {
    width: 100%;
    height: 10px;
    cursor: pointer;
    background: #4a4a4a;
    border-radius: 5px;
}

/* Stili per il cursore (pallino) dello slider (Chrome, Safari, Opera, Edge) */
input[type=range]::-webkit-slider-thumb {
    -webkit-appearance: none;
    height: 24px;
    width: 24px;
    border-radius: 50%;
    background: #007aff; /* Blu acceso */
    cursor: pointer;
    margin-top: -7px; /* Allinea il cursore verticalmente con la traccia */
    box-shadow: 0 0 5px rgba(0, 122, 255, 0.7);
}

/* Stili per la traccia dello slider (Firefox) */
input[type=range]::-moz-range-track {
    width: 100%;
    height: 10px;
    cursor: pointer;
    background: #4a4a4a;
    border-radius: 5px;
}

/* Stili per il cursore (pallino) dello slider (Firefox) */
input[type=range]::-moz-range-thumb {
    height: 24px;
    width: 24px;
    border-radius: 50%;
    background: #007aff;
    cursor: pointer;
    border: none;
}










