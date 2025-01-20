let width = 0,
    midHeight = 0,
    active = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    touches = [];

let ws,
    connected = false,
    LEDconnected = false;

function debounce(callback, wait) {
    let timeoutId = null;
    return (...args) => {
        window.clearTimeout(timeoutId);
        timeoutId = window.setTimeout(() => {
            callback(...args);
        }, wait);
    };
}

const setScreenDimensions = debounce(() => {
    const box = document.getElementById("slider").getBoundingClientRect();
    width = box.right;
    midHeight = box.top;
    // console.log(width, midHeight);
}, 150);

// reset colours if no LED packets received
const resetLED = debounce(() => {
    LEDconnected = false;

    // document.getElementById("main").style.filter = "brightness(100)";

    // reset land and air colours
    for (let i = 2; i <= 32; i += 2) {
        document.getElementById(i).style.backgroundColor = "grey";
    }
    for (let i = 33; i <= 38; i++) {
        document.getElementById(i).style.backgroundColor = "grey";
        document.getElementById(i).style.filter = "brightness(1)";
    }
    // reset border colours
    for (let i = 0; i < 15; i++) {
        document.getElementById(`b${i + 1}`).style.backgroundColor = "black";
    }
}, 3000);

function getKey(x, y) {
    if (y < midHeight) {
        let id = 38 - ~~((y / midHeight) * 6);
        return id <= 38 ? id : 38;
    }

    let id = (~~((x / width) * 16) << 1) + 2;
    if (id < 2) {
        return 2;
    } else if (id > 32) {
        return 32;
    }
    return id;
}

function activate(key) {
    if (!active[key]) {
        sendKey(key, 1);
        document.getElementById(key).style.filter = "brightness(0.7)";
        if (!LEDconnected) {
            document.getElementById(key).style.backgroundColor = "yellow";
        }
    } else if (active[key] == 1 && key <= 32) {
        sendKey(key - 1, 1);
    }
    active[key]++;
}
function deactivate(key) {
    if (active[key] == 2 && key <= 32) {
        sendKey(key - 1, 0);
    } else if (active[key] == 1) {
        sendKey(key, 0);
        document.getElementById(key).style.filter = "brightness(1)";
        if (!LEDconnected) {
            document.getElementById(key).style.backgroundColor = "grey";
        }
    }
    active[key]--;
}

function handleTouch(e) {
    if (!connected) {
        connect();
    }
    [...e.changedTouches].forEach((touch) => {
        const key = getKey(touch.pageX, touch.pageY);

        if (touches[touch.identifier] != key) {
            if (touches[touch.identifier]) deactivate(touches[touch.identifier]);
            touches[touch.identifier] = key;
            activate(key);
        }
    });
}

function endTouch(e) {
    [...e.changedTouches].forEach((touch) => {
        const key = getKey(touch.pageX, touch.pageY);
        touches[touch.identifier] = null;
        deactivate(key);
    });
}

function connect() {
    connected = true;

    ws = new WebSocket("ws://" + location.host + "/kbd");
    ws.onopen = () => {
        console.log("ws open");
    };

    ws.onclose = (e) => {
        connected = false;
        console.log("ws closed");
    };

    ws.onmessage = (e) => {
        LEDconnected = true;
        let data = JSON.parse(e.data);

        // brightness
        // document.getElementById("main").style.filter = `brightness(${data.brightness})`;

        // land colours
        for (let i = 1; i <= 16; i += 1) {
            document.getElementById(i * 2).style.backgroundColor = `#${data.land[i - 1]}`;
        }

        // air colours
        for (let i = 0; i < 3; i++) {
            document.getElementById(33 + i * 2).style.backgroundColor = `#${data.air[i]}`;
            document.getElementById(34 + i * 2).style.backgroundColor = `#${data.air[i]}`;
        }

        // border colours
        for (let i = 0; i < 15; i++) {
            document.getElementById(`b${i + 1}`).style.backgroundColor = `#${data.border[i]}`;
        }

        resetLED();
    };
}

async function sendKey(keyPressed, activate) {
    if (!ws.readyState) {
        console.log("ws not connected");
        return;
    }
    ws.send(
        JSON.stringify({
            key: keyPressed,
            activate: activate,
        })
    );
}

setScreenDimensions();
connect();

window.addEventListener("resize", setScreenDimensions);

document.addEventListener("touchstart", handleTouch);

document.addEventListener("touchmove", handleTouch);

document.addEventListener("touchend", endTouch);

document.addEventListener("touchcancel", endTouch);
