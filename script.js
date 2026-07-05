const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const toolbar = document.getElementById("toolbar-container");
const dragIcon = document.getElementById("drag-icon");
const thicknessSlider = document.getElementById("pen-thickness-slider");
const thicknessDisplay = document.getElementById("pen-thickness-display");
const thicknessDisplayText = document.getElementById("pen-thickness-display-text");
const penIcon = document.getElementById("pen-icon");
const penSettings = document.getElementById("pen-settings");
const eraserIcon = document.getElementById("eraser-icon");
const eraserSettings = document.getElementById("eraser-settings");
const pixelEraser = document.getElementById("pixel-eraser");
const eraserSlider = document.getElementById("pixel-eraser-thickness-slider");
const eraserDisplay = document.getElementById("pixel-eraser-thickness");
const eraserDisplayText = document.getElementById("pixel-eraser-thickness-display-text");

canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

let drawing = false;
let offsetX = 0;
let offsetY = 0;
let dragging = false;
let brushColor = "#000000"
let strokeSize = 1;
let isPenSettingsShowing = false;
let isEraserSettingsShowing = false;
let isErasing = false;
let isDrawing = true;
let eraserPreview = null;

function getPos(e) {
  if (e.touches) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.touches[0].clientX - rect.left,
      y: e.touches[0].clientY - rect.top,
    };
  } else {
    return {
      x: e.offsetX,
      y: e.offsetY,
    };
  }
}
function doubleClick(element, func) {
  let lastClick = 0;
  let longPressTimer;
  console.log("double click running")
  element.addEventListener("click", () => {
    const now = Date.now();
    if (now - lastClick < 250) {
      func();
      console.log("double clicked")
    }
    lastClick = now;
  });
  element.addEventListener("touchstart", () => {
   console.log("holding")
    longPressTimer = setTimeout(() => {
      func();
      console.log("held")
    }, 500);
  });
  element.addEventListener("touchend", () => clearTimeout(longPressTimer));
  element.addEventListener("touchmove", () => clearTimeout(longPressTimer));
  event.preventDefault();
  event.stopPropagation();
}

penSettings.style.position = "fixed";



canvas.addEventListener("mousedown", (e) => {
  drawing = true;
  ctx.beginPath();
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.moveTo(e.offsetX, e.offsetY);
  if (isErasing) {
    eraserPreview = document.createElement("div");
    eraserPreview.style.position = "absolute";
    eraserPreview.style.pointerEvents = "none";
    eraserPreview.style.border = "1px solid black";
    eraserPreview.style.borderRadius = "50%";
    document.body.appendChild(eraserPreview);
    eraserPreview.style.width = eraserSlider.value + "px";
    eraserPreview.style.height = eraserSlider.value + "px";
  }


});

canvas.addEventListener("mouseup", () => {
  drawing = false;
  eraserPreview.remove();
});

canvas.addEventListener("mousemove", (e) => {
  if (!drawing) return;
  if (isErasing && eraserPreview) {
    eraserPreview.style.width = eraserSlider.value + "px";
    eraserPreview.style.height = eraserSlider.value + "px";

    eraserPreview.style.left = (e.offsetX - eraserSlider.value/2) + "px";
    eraserPreview.style.top = (e.offsetY - eraserSlider.value/2) + "px";
    ctx.lineWidth = eraserSlider.value;

  } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.lineWidth = strokeSize;
  }
  ctx.strokeStyle = brushColor;
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();
});

canvas.addEventListener("touchstart", (e) => {
  drawing = true;
  const pos = getPos(e);
  ctx.beginPath();
  ctx.moveTo(pos.x, pos.y);
});

canvas.addEventListener("touchend", () => {
  drawing = false;
});

canvas.addEventListener("touchmove", (e) => {
  if (!drawing) return;
  e.preventDefault();
  const pos = getPos(e);
  ctx.lineTo(pos.x, pos.y);
  ctx.stroke();
});

dragIcon.addEventListener("mousedown", (e) => {
  dragging = true;

  const canvasRect = canvas.getBoundingClientRect();

  offsetX = e.clientX - canvasRect.left - toolbar.offsetLeft;
  offsetY = e.clientY - canvasRect.top - toolbar.offsetTop;

  dragIcon.style.cursor = "grabbing";
});

document.addEventListener("mouseup", () => {
  dragging = false;
  dragIcon.style.cursor = "grab";
});

document.addEventListener("mousemove", (e) => {
  if (!dragging) return;

  const canvasRect = canvas.getBoundingClientRect();

  let newLeft = e.clientX - canvasRect.left - offsetX;
  let newTop = e.clientY - canvasRect.top - offsetY;

  const maxLeft = canvasRect.width - toolbar.offsetWidth;
  const maxTop = canvasRect.height - toolbar.offsetHeight;

  if (newLeft < 0) newLeft = 0;
  if (newTop < 0) newTop = 0;
  if (newLeft > maxLeft) newLeft = maxLeft;
  if (newTop > maxTop) newTop = maxTop;

  toolbar.style.left = newLeft + "px";
  toolbar.style.top = newTop + "px";
});

const pickr = Pickr.create({
  el: "#color-picker",
  theme: "classic",

  default: "#000000",

  components: {
    preview: true,
    opacity: true,
    hue: true,

    interaction: {
      hex: true,
      rgba: true,
      input: true,
      save: true,
    },
  },
});

pickr.on('change', (color) => {
    const hex = color.toHEXA().toString();
    brushColor = hex;
    console.log(brushColor);
    thicknessDisplay.style.backgroundColor = brushColor;
});

thicknessSlider.addEventListener("input", () => {
  strokeSize = thicknessSlider.value;
  console.log(thicknessSlider.value)
  thicknessDisplay.style.height = thicknessSlider.value + "px";
  thicknessDisplay.style.borderRadius = thicknessSlider.value + "px";
  thicknessDisplayText.innerHTML = thicknessSlider.value + "px";
})

penIcon.addEventListener("click", () => {
  ctx.globalCompositeOperation = "source-over";
  if (eraserPreview) {
    eraserPreview.remove();
    eraserPreview = null;
  }

  isDrawing = true;
  isErasing = false;
})

doubleClick(penIcon, () => {
  isPenSettingsShowing = !isPenSettingsShowing;
  isEraserSettingsShowing = false;
  eraserSettings.classList.remove("show");

  console.log(isPenSettingsShowing);
  if (isPenSettingsShowing) {
    penSettings.style.position = "relative";
    penSettings.classList.add("show");
  } else {
    penSettings.classList.remove("show");
    penSettings.style.position = "fixed";
    
  }
  canvas.addEventListener("mousedown", () => {
    isPenSettingsShowing = false;
    penSettings.classList.remove("show");
  })
})

pixelEraser.addEventListener("click", () => { 
  isDrawing = false;
  ctx.globalCompositeOperation = "destination-out";
  isErasing = true;
  pixelEraser.classList.add("selected")
  eraserPreview = document.createElement("div");
  eraserPreview.style.position = "absolute";
  eraserPreview.style.pointerEvents = "none";
  eraserPreview.style.border = "1px solid black";
  eraserPreview.style.borderRadius = "50%";
  canvas.appendChild(eraserPreview);

})

doubleClick(eraserIcon, () => {
  isEraserSettingsShowing = !isEraserSettingsShowing;
  isPenSettingsShowing = false;
  penSettings.classList.remove("show");
  console.log("eraser setings showing: ", isEraserSettingsShowing);
  penSettings.style.position = "fixed";
  if (isEraserSettingsShowing) {
    eraserSettings.classList.add("show");
  } else {
    eraserSettings.classList.remove("show");
  }
})

eraserIcon.addEventListener("", () => {
  isEraserSettingsShowing = !isEraserSettingsShowing;
  isPenSettingsShowing = false;
  penSettings.classList.remove("show");
  console.log("eraser setings showing: ", isEraserSettingsShowing);
  penSettings.style.position = "fixed";
  if (isEraserSettingsShowing) {
    eraserSettings.classList.add("show");
  } else {
    eraserSettings.classList.remove("show");
  }
})

eraserSlider.addEventListener("input", () => {
  eraserDisplay.style.width = eraserSlider.value + "px";
  eraserDisplay.style.height = eraserSlider.value + "px";
  eraserDisplay.style.borderRadius = eraserSlider.value + "px";
  eraserDisplayText.innerHTML = eraserSlider.value + "px";
})

penSettings.addEventListener("contextmenu", (e) => e.preventDefault());
eraserSettings.addEventListener("contextmenu", (e) => e.preventDefault());

