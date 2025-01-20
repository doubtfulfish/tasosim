const buttons = 38;

let width = 0,
    midHeight = 0,
    active = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    touches = [];

function setScreenDimensions() {
    const box = document.getElementById("slider").getBoundingClientRect();
    width = box.right;
    midHeight = box.top;
    // console.log(width, midHeight);
}
setScreenDimensions();

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
        active[key] = 0;
        sendKey(key, 1);
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
    }
    active[key]--;
}

function handleTouch(e) {
    if (!connected) {
        connect();
        return;
    }
    [...e.changedTouches].forEach((touch) => {
        const key = getKey(touch.pageX, touch.pageY);

        if (touches[touch.identifier] != key) {
            deactivate(touches[touch.identifier]);
            touches[touch.identifier] = key;
            activate(key);
        }
    });
}

function endTouch(e) {
    if (!connected) return;

    [...e.changedTouches].forEach((touch) => {
        const key = getKey(touch.pageX, touch.pageY);
        touches[touch.identifier] = null;
        deactivate(key);
    });
}

let connected = false;
let ws;

function connect() {
    ws = new WebSocket("ws://" + location.host + "/kbd");
    ws.onopen = () => {
        connected = true;
        // console.log("ws open");
    };

    ws.onmessage = (e) => {
        let data = JSON.parse(e.data);

        for (let i = 1; i <= 16; i += 1) {
            document.getElementById(i * 2).style.backgroundColor = `#${data.land[i - 1]}`;
        }

        for (let i = 0; i < 3; i++) {
            document.getElementById(33 + i * 2).style.backgroundColor = `#${data.air[i]}`;
            document.getElementById(34 + i * 2).style.backgroundColor = `#${data.air[i]}`;
        }
    };

    ws.onclose = (e) => {
        connected = false;
        // console.log("ws closed");
    };
}
connect();

async function sendKey(keyPressed, activate) {
    ws.send(
        JSON.stringify({
            key: keyPressed,
            activate: activate,
        })
    );
}

window.addEventListener("resize", setScreenDimensions);

document.addEventListener("touchstart", handleTouch);

document.addEventListener("touchmove", handleTouch);

document.addEventListener("touchend", endTouch);

document.addEventListener("touchcancel", endTouch);
