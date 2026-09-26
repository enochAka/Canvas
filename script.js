
const generalContainer = document.getElementById("general-container");
const toolbarContainer = document.getElementById("toolbar-container");
const toolbar = document.getElementById("toolbar");
const dragIcon = document.getElementById("drag-icon");
const thicknessSlider = document.getElementById("pen-thickness-slider");
const thicknessDisplay = document.getElementById("pen-thickness-display");
const thicknessDisplayContainer = document.getElementById("pen-thickness-container")
const thicknessDisplayText = document.querySelectorAll(".pen-thickness-display-text");
const penIcon = document.getElementById("pen-icon");
const penSettings = document.getElementById("pen-settings");
const eraserIcon = document.getElementById("eraser-icon");
const eraserSettings = document.getElementById("eraser-settings");
const pixelEraser = document.getElementById("pixel-eraser");
const eraserSlider = document.getElementById("pixel-eraser-thickness-slider");
const eraserDisplay = document.getElementById("pixel-eraser-thickness");
const eraserDisplayText = document.getElementById("pixel-eraser-thickness-display-text");
const objectEraser = document.getElementById("object-eraser");
const moreSettings = document.getElementById("more-settings");
const tools = document.getElementsByClassName("tool");
const colorPreview = document.getElementById("color-preview");
let selectedTool = null;
const orbit = document.getElementById("orbit");
const strokeWidth = document.getElementById("stroke-width");
const colorPicker = document.getElementById("color-picker");
const colorPickerContainer = document.getElementById("color-picker-container");
const toolSettings = document.querySelectorAll(".tool-settings");
const recentColors = document.getElementById("recent-colors");
const hexColor = document.getElementById("color-hex");
const rgbColor = document.getElementById("color-rgb");
const hslColor = document.getElementById("color-hsl");
const colorTexts = document.querySelectorAll(".color-texts");
const colorTextsContainer = document.querySelectorAll(".color-texts-container");
const recentColorsFiller = document.getElementById("recent-colors-filler");
const favouriteButton = document.getElementById("favourite-button");
const favouriteIcon = document.getElementById("favourite-icon");
const favouritedIcon = document.getElementById("favourited-icon");
const removeFavouriteIcon = document.getElementById("remove-favourite-icon");
const favouriteColorsUl = document.getElementById("favourite-colors");
const penThicknessSettingsContainer = document.getElementById("pen-thickness-settings-container");

const colors = document.querySelectorAll(".color");


const colorPickerIro = new iro.ColorPicker("#color-picker", {
    width: 250,
    color: "#ff0000"
});


let isColorPickerShowing = false;
let isThicknessDisplayShowing = false;
let toolbarOpen = false;
let currentRing = document.querySelector(".ring.main");
let moved = false;
let dragging = false;
let activeColorInput = null;

let favouriteColors = JSON.parse(
    localStorage.getItem("favouriteColors")
) || [];

export function strokeThicknessValue() {
    return Number(strokeWidth.value);
}

let startX = 0;
let startY = 0;
let offsetX = 0;
let offsetY = 0;

dragIcon.addEventListener("mousedown", (e) => {

    e.preventDefault();

    dragging = true;
    moved = false;

    startX = e.clientX;
    startY = e.clientY;

    offsetX =
        e.clientX -
        toolbarContainer.offsetLeft;

    offsetY =
        e.clientY -
        toolbarContainer.offsetTop;

    dragIcon.style.cursor = "grabbing";
});


document.addEventListener("mousemove", (e) => {

    if (!dragging) return;

    if (
        Math.abs(e.clientX - startX) > 5 ||
        Math.abs(e.clientY - startY) > 5
    ) {
        moved = true;
    }

    if (!moved) return;

    const rect =
        generalContainer.getBoundingClientRect();

    let left =
        e.clientX - offsetX;

    let top =
        e.clientY - offsetY;

    const maxLeft =
        rect.width -
        toolbarContainer.offsetWidth;

    const maxTop =
        rect.height -
        toolbarContainer.offsetHeight;

    left =
        Math.max(
            0,
            Math.min(left, maxLeft)
        );

    top =
        Math.max(
            0,
            Math.min(top, maxTop)
        );

    toolbarContainer.style.left =
        `${left}px`;

    toolbarContainer.style.top =
        `${top}px`;
});


document.addEventListener("mouseup", () => {

    if (!dragging) return;

    dragging = false;

    dragIcon.style.cursor = "grab";
});




function getCentre() {

    return {
        x: orbit.clientWidth / 2,
        y: orbit.clientHeight / 2
    };

}

function layoutRing(ring, radius = 70) {

    if (!ring) return;

    const tools = Array.from(
        ring.querySelectorAll(".tool")
    );

    // Always use the original order
    tools.sort((a, b) => {
        return Number(a.dataset.order) - Number(b.dataset.order);
    });

    const {
        x: cx,
        y: cy
    } = getCentre();

    ring.classList.add("show");
    ring.style.pointerEvents = "auto";

    tools.forEach((tool, i) => {

        const angle =
            (Math.PI * 2 / tools.length) * i -
            Math.PI / 2;

        tool.style.left =
            `${cx + Math.cos(angle) * radius}px`;

        tool.style.top =
            `${cy + Math.sin(angle) * radius}px`;

        tool.style.transitionDelay =
            `${i * 40}ms`;

        tool.classList.add("show");
    });

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {

            tools.forEach(tool => {
                tool.style.transitionDelay = "0ms";
            });

        });
    });
}

function collapseRing(ring) {

    if (!ring) return;

    const {
        x: cx,
        y: cy
    } = getCentre();

    const tools =
        ring.querySelectorAll(".tool");

    tools.forEach((tool, i) => {

        tool.style.left =
            `${cx}px`;

        tool.style.top =
            `${cy}px`;

        tool.style.transitionDelay =
            `${i * 40}ms`;

        tool.classList.remove("show");

        setTimeout(() => {
            tool.style.transitionDelay = "0";
        }, 40)

    });

    setTimeout(() => {

        ring.classList.remove("show");
        ring.style.pointerEvents = "none";

    }, 450);
}


function openToolbar() {

    toolbarOpen = true;

    toolbar.style.zIndex = "22";

    const mainRing =
        document.querySelector(".ring.main");

    currentRing = mainRing;

    toolbar.classList.add("show");

    layoutRing(
        mainRing,
        70
    );
}


function closeToolbar() {

    toolbar.style.zIndex = "-1";

    const mainRing =
        document.querySelector(".ring.main");

    toolbarOpen = false;

    if (selectedTool) {

        const tool =
            selectedTool;

        tool.classList.remove("selected");

        mainRing.appendChild(tool);

        selectedTool = null;
    }

    if (currentRing) {

        collapseRing(currentRing);

    }

    if (currentRing !== mainRing) {

        collapseRing(mainRing);

    }

    currentRing = mainRing;

    toolbar.classList.add("show");

    toolbar.style.pointerEvents = "auto";
    toolbar.style.visibility = "visible";
}

function openTool(tool) {

    const ringName = tool.dataset.ring;

    if (!ringName) {
        console.warn("Tool has no data-ring:", tool);
        return;
    }

    const nextRing =
        document.querySelector(`.ring.${ringName}`);

    if (!nextRing) {
        console.warn(`No ring found for ${ringName}`);
        return;
    }

    const mainRing =
        document.querySelector(".ring.main");

    const {
        x: cx,
        y: cy
    } = getCentre();
    

    selectedTool = tool;

    tool.onclick = goBackFromSelectedTool;


    tool.style.zIndex = "100";
    tool.style.pointerEvents = "auto";
    tool.style.cursor = "pointer";

    


    mainRing.classList.add("show");
    mainRing.style.pointerEvents = "auto";


    tool.style.transitionDelay = "0ms";

    void tool.offsetWidth;


    tool.style.transition = `
        left 0.45s cubic-bezier(0.22, 1, 0.36, 1),
        top 0.45s cubic-bezier(0.22, 1, 0.36, 1),
        transform 0.3s ease,
        opacity 0.3s ease
    `;

    requestAnimationFrame(() => {

        tool.style.left = `${cx}px`;
        tool.style.top = `${cy}px`;

        tool.style.pointerEvents = "auto";
        tool.style.visibility = "visible";

    });



    toolbar.classList.remove("show");

    toolbar.style.pointerEvents = "none";
    toolbar.style.visibility = "hidden";
    toolbar.style.zIndex = "-1";

    mainRing
        .querySelectorAll(".tool")
        .forEach((otherTool, i) => {

            if (otherTool === tool) {
                return;
            }

            otherTool.style.transitionDelay =
                `${i * 40}ms`;

            otherTool.style.left =
                `${cx}px`;

            otherTool.style.top =
                `${cy}px`;

            otherTool.classList.remove("show");
        });



    setTimeout(() => {

        currentRing = nextRing;

        nextRing.style.zIndex = "20";

        layoutRing(
            nextRing,
            70
        );

        orbit.appendChild(tool);

        tool.classList.add("selected");

    }, 450);
}

function goBackFromSelectedTool(e) {

    e.stopPropagation();

    if (!selectedTool) return;

    goBack();
}

function goBack() {

    if (!selectedTool) return;

    const mainRing =
        document.querySelector(".ring.main");

    const tool =
        selectedTool;



    if (
        currentRing &&
        currentRing !== mainRing
    ) {
        collapseRing(currentRing);
    }


    toolbar.classList.add("show");

    toolbar.style.pointerEvents = "auto";
    toolbar.style.visibility = "visible";
    toolbar.style.zIndex = "21";

    mainRing.style.pointerEvents = "auto";


    mainRing.appendChild(tool);

    tool.classList.remove("selected");

    tool.style.zIndex = "";
    tool.style.pointerEvents = "";
    tool.style.cursor = "";
    tool.style.transition = "";

    tool.onclick = null;


    tool.classList.add("show");



    selectedTool = null;

    currentRing = mainRing;


    requestAnimationFrame(() => {

        layoutRing(
            mainRing,
            70
        );

    });
}

toolbar.addEventListener("click", (e) => {

    e.stopPropagation();

    if (moved) {

        moved = false;

        return;
    }

    if (!toolbarOpen) {

        openToolbar();

    } else {

        closeToolbar();

    }

});


orbit.addEventListener("click", (e) => {

    const tool =
        e.target.closest(".ring.main .tool");

    if (!tool) {
        return;
    }

    if (!toolbarOpen) {
        return;
    }

    if (selectedTool) {
        return;
    }

    e.stopPropagation();

    openTool(tool);
});

// COLOR PICKER
const colorPickers = document.querySelectorAll(".color-picker");
export function getCurrentColor() {
    return colorPickerIro.color.hexString;
}

penIcon.addEventListener("click", () => {
    currentTool = "pen";
})

colorPickerIro.on("color:change", (color) => {

    document.documentElement.style.setProperty(
        "--selected-color",
        color.hexString
    );

    const preview = document.querySelector("#color-preview");

    if (preview) {
        preview.style.backgroundColor = color.hexString;
    }

    hexColor.innerHTML = color.hexString;
    rgbColor.innerHTML = color.rgbString;
    hslColor.innerHTML = color.hslString;


    // Update the input currently being edited
    if (activeColorInput) {

        if (activeColorInput.dataset.type === "hex") {
            activeColorInput.value = color.hexString;
        }

        else if (activeColorInput.dataset.type === "rgb") {
            activeColorInput.value = color.rgbString;
        }

        else if (activeColorInput.dataset.type === "hsl") {
            activeColorInput.value = color.hslString;
        }

    }

    updateFavouriteButton();

});

toolSettings.forEach((setting) => {

    let isToolSettingShowing = false;

    const toolSource =
        document.getElementById(setting.dataset.sourceButton);

    if (!toolSource) {
        console.warn(
            "No source found for:",
            setting.dataset.sourceButton
        );
        return;
    }


    toolSource.addEventListener("click", (e) => {

        e.stopPropagation();

        isToolSettingShowing = !isToolSettingShowing;


        if (isToolSettingShowing) {

            const sourceRect =
                toolSource.getBoundingClientRect();


            // -------------------------
            // ANGLE
            // -------------------------

            const angle =
                Number(setting.dataset.angle);

            const radians =
                angle * Math.PI / 180;


            // 0° = top
            // 90° = right
            // 180° = bottom
            // 270° = left

            const dirX =
                Math.sin(radians);

            const dirY =
                -Math.cos(radians);


            // -------------------------
            // SOURCE CENTER
            // -------------------------

            const sourceX =
                sourceRect.left +
                sourceRect.width / 2;

            const sourceY =
                sourceRect.top +
                sourceRect.height / 2;


            // -------------------------
            // SETTING SIZE
            // -------------------------

            const width =
                setting.offsetWidth;

            const height =
                setting.offsetHeight;


            // -------------------------
            // GAP
            // -------------------------

            let gap = 30;

            
                        


            // -------------------------
            // FIND EDGE
            // -------------------------

            const scaleX =
                dirX === 0
                    ? Infinity
                    : (width / 2) /
                      Math.abs(dirX);

            const scaleY =
                dirY === 0
                    ? Infinity
                    : (height / 2) /
                      Math.abs(dirY);


            const distance =
                Math.min(scaleX, scaleY);


            // -------------------------
            // SETTING CENTER
            // -------------------------

            const settingCenterX =
                sourceX +
                dirX * (distance + gap);

            const settingCenterY =
                sourceY +
                dirY * (distance + gap);


            // -------------------------
            // POSITION
            // -------------------------

            setting.style.left =
                `${settingCenterX - width / 2}px`;

            setting.style.top =
                `${settingCenterY - height / 2}px`;


            // -------------------------
            // SHOW
            // -------------------------

            setting.style.opacity = "1";
            setting.style.pointerEvents = "all";
            setting.style.zIndex = "21";

            
                    

        } else {

            // -------------------------
            // HIDE
            // -------------------------

            setting.style.opacity = "0";
            setting.style.pointerEvents = "none";
        }

    });

    
    strokeWidth.addEventListener("input", () => {
        const value = Number(strokeWidth.value);

        console.log(value);

        thicknessDisplay.style.height = value + "px";
        thicknessDisplay.style.width = value + "px";

        const height = thicknessDisplayContainer.offsetHeight;

        if (height > 48) {
            thicknessDisplayContainer.style.width = height + "px";
        }
    });


    // Don't let clicking the slider
    // trigger the outside click

    setting.addEventListener("mousedown", (e) => {
        e.stopPropagation();
    });


    // -------------------------
    // CLICK OUTSIDE
    // -------------------------

    let firstClick = true;

    document.addEventListener("mousedown", () => {

        if (!isToolSettingShowing) return;

        setting.style.opacity = "0";
        setting.style.pointerEvents = "none";

        if (setting == colorPickerContainer) {

            const color = colorPickerIro.color.hexString;

            const previousColors =
                document.querySelectorAll(".recent-color");

            let existingColor = null;


            // Check if the color already exists
            previousColors.forEach((recentColor) => {

                if (recentColor.dataset.color === color) {

                    existingColor = recentColor;
                }

            });

            if (firstClick) {
                recentColorsFiller.parentElement.removeChild(recentColorsFiller);
                firstClick = false;
            }


            // If it already exists, move it to the front
            if (existingColor) {

                recentColors.prepend(existingColor);

                return;
            }

            


            // Otherwise create a new color
            

            const newColor =
                document.createElement("li");

            newColor.classList.add(
                "recent-color",
                "color"
            );

            newColor.setAttribute(
                "data-color",
                color
            );

            newColor.style.backgroundColor =
                color;



            newColor.addEventListener("click", () => {

                colorPickerIro.color.set(
                    newColor.dataset.color
                );

            });


            recentColors.prepend(newColor);

            setupColorTooltip(newColor);

            if (recentColors.children.length > 8) {
                recentColors.lastElementChild.remove();
            }
        }

                

        //isToolSettingShowing = false;

    });

});

function setupColorTooltip(color) {

    const hex = color.dataset.color;

    if (!hex) {
        return;
    }

    color.dataset.colorName = getColorName(hex);
}

function setUpColor(color) {

    color.style.backgroundColor = color.dataset.color;

    setupColorTooltip(color);

    color.addEventListener("click", () => {

        colorPickerIro.color.set(color.dataset.color);

        console.log(color + " clicked");

    });
}

strokeWidth.addEventListener("input", () => {
    console.log(strokeWidth.value);

    const value = Number(strokeWidth.value);

    document.querySelectorAll(".pen-thickness-display-text").forEach((text) => {text.textContent =
        value + "px";})
});

colors.forEach((color) => {
    setUpColor(color);
})

function formatColorInput(value, type) {

    value = value.trim();

    if (type === "hex") {

        // Add # if user forgot it
        if (!value.startsWith("#")) {
            value = "#" + value;
        }

        return value;
    }


    if (type === "rgb") {

        let clean = value
            .replace(/^rgb/i, "")
            .replace(/[()]/g, "")
            .replace(/,/g, " ")
            .trim();

        const numbers = clean
            .split(/\s+/)
            .filter(Boolean);

        if (numbers.length === 3) {

            const r = Number(numbers[0]);
            const g = Number(numbers[1]);
            const b = Number(numbers[2]);

            if (
                [r, g, b].every(
                    n => Number.isInteger(n) && n >= 0 && n <= 255
                )
            ) {
                return `rgb(${r}, ${g}, ${b})`;
            }
        }
    }


    if (type === "hsl") {

        let clean = value
            .replace(/^hsl/i, "")
            .replace(/[()]/g, "")
            .replace(/,/g, " ")
            .replace(/%/g, "")
            .trim();

        const numbers = clean
            .split(/\s+/)
            .filter(Boolean);

        if (numbers.length === 3) {

            const h = Number(numbers[0]);
            const s = Number(numbers[1]);
            const l = Number(numbers[2]);

            if (
                h >= 0 && h <= 360 &&
                s >= 0 && s <= 100 &&
                l >= 0 && l <= 100
            ) {
                return `hsl(${h}, ${s}%, ${l}%)`;
            }
        }
    }

    return value;
}

function updateColorTexts(color) {

    const hex = document.querySelector("#color-hex");
    const rgb = document.querySelector("#color-rgb");
    const hsl = document.querySelector("#color-hsl");


    if (activeColorInput !== hex) {
        hex.textContent = color.hexString;
    }

    if (activeColorInput !== rgb) {
        rgb.textContent = color.rgbString;
    }

    if (activeColorInput !== hsl) {
        hsl.textContent = color.hslString;
    }
}

colorPickerIro.on("color:change", (color) => {

    updateColorTexts(color);

});

function setupColorText(text) {

    text.addEventListener("click", () => {
        text.contentEditable = "true";
        activeColorInput = text;

        // Don't set the cursor position here!
        // The browser will place it where the user clicked.
    });


    text.addEventListener("keydown", (e) => {

        if (e.key !== "Enter") return;

        e.preventDefault();

        const value = text.textContent.trim();
        const type = text.dataset.type;

        const formattedColor = formatColorInput(value, type);

        colorPickerIro.color.set(formattedColor);

        text.contentEditable = "false";
        activeColorInput = null;
        text.blur();
    });


    text.addEventListener("blur", () => {
        text.contentEditable = "false";
        activeColorInput = null;
    });
}


colorTexts.forEach((text) => {
    setupColorText(text);
});


function showFavouriteIcon(type) {
    favouriteIcon.style.opacity = "0";
    favouritedIcon.style.opacity = "0";
    removeFavouriteIcon.style.opacity = "0";

    if (type === "favourite") {
        favouriteIcon.style.opacity = "1";
    }

    if (type === "favourited") {
        favouritedIcon.style.opacity = "1";
    }

    if (type === "remove") {
        removeFavouriteIcon.style.opacity = "1";
    }
}

function saveFavouriteColor(color) {
    if (!favouriteColors.includes(color)) {
        favouriteColors.push(color);

        localStorage.setItem(
            "favouriteColors",
            JSON.stringify(favouriteColors)
        );
    }
}

function removeFavouriteColor(color) {
    favouriteColors = favouriteColors.filter(
        savedColor => savedColor !== color
    );

    localStorage.setItem(
        "favouriteColors",
        JSON.stringify(favouriteColors)
    );

    const favouriteColorsList = document.querySelectorAll(".favourite-color");
        
        favouriteColorsList.forEach((color) => {
            if (color.dataset.color == colorPickerIro.color.hexString) {
                color.remove();
            }
        })

    if (favouriteColors.length == 0) {
        const favouriteColorsFiller = document.createElement("h4");
        favouriteColorsFiller.id = "favourite-colors-filler";
        favouriteColorsFiller.innerHTML = "NO FAVOURITE COLORS"

        favouriteColorsUl.appendChild(favouriteColorsFiller);
    }
}

function updateFavouriteButton() {
    const color = getCurrentColor();

    if (favouriteColors.includes(color)) {
        showFavouriteIcon("favourited");
    } else {
        showFavouriteIcon("favourite");
    }
}

function displayFavouriteColors() {

    // Remove all existing colour items
    favouriteColorsUl
        .querySelectorAll(".favourite-color")
        .forEach((color) => {
            color.remove
        });

    if (favouriteColors.length == 0) {
        const favouriteColorsFiller = document.createElement("h4");
        favouriteColorsFiller.id = "favourite-colors-filler";
        favouriteColorsFiller.innerHTML = "NO FAVOURITE COLORS"

        favouriteColorsUl.appendChild(favouriteColorsFiller);

        return;
    }

    if (document.querySelector("#favourite-colors-filler") !== null) {
        favouriteColorsFiller.remove();
    }

    // We have favourites


    favouriteColors.forEach(color => {

        const colour = document.createElement("li");

        colour.classList.add("favourite-color", "color");

        colour.style.backgroundColor = color;

        colour.dataset.color = color;

        setUpColor(colour);

        favouriteColorsUl.appendChild(colour);
    });
}

displayFavouriteColors();

favouriteButton.addEventListener("click", () => {
    const color = getCurrentColor();

    console.log(localStorage)

    if (favouriteColors.includes(color)) {
        removeFavouriteColor(color);
        showFavouriteIcon("favourite");
        

    } else {
        saveFavouriteColor(color);
        showFavouriteIcon("favourited");

        if (document.querySelector("#favourite-colors-filler") !== null) {
            document.querySelector("#favourite-colors-filler").remove();
        }

        const newFavouriteColor = document.createElement("li");
        newFavouriteColor.classList.add("color", "favourite-color");
        newFavouriteColor.dataset.color = color;
        setUpColor(newFavouriteColor);

        favouriteColorsUl.prepend(newFavouriteColor);
    }
});

favouriteButton.addEventListener("mouseenter", () => {
    const color = getCurrentColor();

    if (favouriteColors.includes(color)) {
        showFavouriteIcon("remove");
    }
});

favouriteButton.addEventListener("mouseleave", () => {
    const color = getCurrentColor();

    if (favouriteColors.includes(color)) {
        showFavouriteIcon("favourited");
    } else {
        showFavouriteIcon("favourite");
    }
});
function getColorName(hex) {

    const colors = [
        // Basic
        { name: "Black", hex: "#000000" },
        { name: "White", hex: "#fff" },
        { name: "Gray", hex: "#808080" },
        { name: "Red", hex: "#FF0000" },
        { name: "Orange", hex: "#FFA500" },
        { name: "Yellow", hex: "#FFFF00" },
        { name: "Green", hex: "#008000" },
        { name: "Lime", hex: "#00FF00" },
        { name: "Blue", hex: "#0000FF" },
        { name: "Cyan", hex: "#00FFFF" },
        { name: "Purple", hex: "#800080" },
        { name: "Pink", hex: "#FFC0CB" },

        // Reds
        { name: "Dark Red", hex: "#8B0000" },
        { name: "Maroon", hex: "#800000" },
        { name: "Crimson", hex: "#DC143C" },
        { name: "Coral", hex: "#FF7F50" },
        { name: "Salmon", hex: "#FA8072" },

        // Oranges / Yellows
        { name: "Gold", hex: "#FFD700" },
        { name: "Dark Orange", hex: "#FF8C00" },
        { name: "Peach", hex: "#FFDAB9" },

        // Greens
        { name: "Dark Green", hex: "#006400" },
        { name: "Forest Green", hex: "#228B22" },
        { name: "Lime Green", hex: "#32CD32" },
        { name: "Light Green", hex: "#90EE90" },
        { name: "Mint", hex: "#98FF98" },
        { name: "Olive", hex: "#808000" },
        { name: "Teal", hex: "#008080" },

        // Blues
        { name: "Dark Blue", hex: "#00008B" },
        { name: "Navy", hex: "#000080" },
        { name: "Sky Blue", hex: "#87CEEB" },
        { name: "Light Blue", hex: "#ADD8E6" },
        { name: "Royal Blue", hex: "#4169E1" },
        { name: "Ocean Blue", hex: "#0077BE" },

        // Purples
        { name: "Dark Purple", hex: "#4B0082" },
        { name: "Violet", hex: "#EE82EE" },
        { name: "Lavender", hex: "#E6E6FA" },
        { name: "Plum", hex: "#DDA0DD" },

        // Browns
        { name: "Brown", hex: "#A52A2A" },
        { name: "Dark Brown", hex: "#654321" },
        { name: "Tan", hex: "#D2B48C" },
        { name: "Beige", hex: "#F5F5DC" },

        // Grays
        { name: "Dark Gray", hex: "#404040" },
        { name: "Light Gray", hex: "#D3D3D3" },
        { name: "Silver", hex: "#C0C0C0" }
    ];

    const rgb = hexToRgb(hex);

    let closest = colors[0];
    let smallestDistance = Infinity;

    colors.forEach(color => {

        const rgb2 = hexToRgb(color.hex);

        const distance =
            Math.pow(rgb.r - rgb2.r, 2) +
            Math.pow(rgb.g - rgb2.g, 2) +
            Math.pow(rgb.b - rgb2.b, 2);

        if (distance < smallestDistance) {

            smallestDistance = distance;
            closest = color;

        }
    });

    return closest.name;
}

function hexToRgb(hex) {

    hex = hex.replace("#", "");

    return {
        r: parseInt(hex.substring(0, 2), 16),
        g: parseInt(hex.substring(2, 4), 16),
        b: parseInt(hex.substring(4, 6), 16)
    };
}

const strokeWidthValue = document.querySelector("#stroke-width-value");

strokeWidthValue.addEventListener("keydown", (e) => {
    // Allow numbers
    if (e.key >= "0" && e.key <= "9") {
        return;
    }

    // Allow useful editing/navigation keys
    const allowedKeys = [
        "Backspace",
        "Delete",
        "ArrowLeft",
        "ArrowRight",
        "Home",
        "End",
        "Enter"
    ];

    if (!allowedKeys.includes(e.key)) {
        e.preventDefault();
    }
});

strokeWidth.addEventListener("input", () => {
    strokeWidthValue.value = strokeWidth.value;
});

strokeWidthValue.addEventListener("change", () => {
    console.log(strokeWidthValue.value);

    let value = Number(strokeWidthValue.value);

    
    value = Math.max(1, Math.min(50, value));

    document.querySelectorAll(".pen-thickness-display-text").forEach((text) => {text.textContent =
        value + "px";})
    
    strokeWidth.value = value;
    strokeWidthValue.value = value;

    thicknessDisplay.style.height = value + "px";
    thicknessDisplay.style.width = value + "px";
});

strokeWidthValue.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        strokeWidthValue.blur();
    }
});