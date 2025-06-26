<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <title>Filtri Webcam Interattivi</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.4/p5.js"></script>
    <style>
        body {
            display: flex;
            flex-direction: column;
            align-items: center;
            font-family: sans-serif;
            background-color: #e9e9e9;
            margin: 0;
            padding-top: 2rem;
        }
        #canvas-wrapper {
            margin-bottom: 1rem;
            border: 4px solid #333;
            box-shadow: 0 8px 16px rgba(0,0,0,0.3);
        }
        #controls-window {
            padding: 1rem 1.5rem;
            background-color: #fff;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            width: 640px;
            box-sizing: border-box;
        }
        #current-filter-label {
            font-weight: bold;
            font-size: 1.2rem;
            margin-bottom: 1rem;
            text-align: center;
        }
    </style>
</head>
<body>
    <div id="canvas-wrapper"></div>
    <div id="controls-window">
        <div id="current-filter-label"></div>
        <div id="slider-container"></div>
    </div>
    <script src="sketch.js"></script>
</body>
</html>










