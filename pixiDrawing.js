const app = new PIXI.Application();
import { getCurrentColor, strokeThicknessValue } from "./script.js";

await app.init({
    resizeTo: window,
    background: 0xffffff,
    antialias: true
});

const strokeWidth =
    document.getElementById("stroke-width");

const canvasContainer =
    document.getElementById("canvas-container");

canvasContainer.appendChild(app.canvas);


// DRAWING LAYER

const drawingLayer =
    new PIXI.Container();

app.stage.addChild(drawingLayer);


// DRAWING STATE

let isDrawing = false;

let currentStroke = null;


// COORDINATES

function getCanvasPosition(e) {

    const rect =
        app.canvas.getBoundingClientRect();

    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
}


// START

function startDrawing(e) {

    isDrawing = true;

    const position =
        getCanvasPosition(e);

    currentStroke =
        new PIXI.Graphics();

    currentStroke.moveTo(
        position.x,
        position.y
    );

    drawingLayer.addChild(
        currentStroke
    );
}


// DRAW
function draw(e) {

    if (!isDrawing) return;

    const position = getCanvasPosition(e);

    const width = Number(strokeThicknessValue());
    const color = getCurrentColor();

    currentStroke
        .lineTo(
            position.x,
            position.y
        )
        .stroke({
            width: width,
            color: color,
            cap: "round",
            join: "round"
        });
}

// STOP

function stopDrawing() {

    isDrawing = false;

    currentStroke = null;
}


// EVENTS

app.canvas.addEventListener(
    "pointerdown",
    startDrawing
);

app.canvas.addEventListener(
    "pointermove",
    draw
);

app.canvas.addEventListener(
    "pointerup",
    stopDrawing
);