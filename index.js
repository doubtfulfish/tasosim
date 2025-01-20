const express = require("express");
const { execFile } = require("child_process");
const { Buffer } = require("node:buffer");

const PORT = 3000;
const serverName = "KBD Server";
const controllerName = "Some Controller";

const app = express();
app.use(express.static("public"));
const wss = require("express-ws")(app);

let gameClient;
let kbdClient;

app.ws("/", function (ws, req) {
    gameClient = ws;

    ws.on("error", console.error);
    ws.on("open", () => {
        console.log("LED connected.");
    });

    ws.on("message", function (data) {
        let type = data[1];
        let res;

        // SetLED
        if (type == 0x10) {
            res = {
                brightness: 100,
                land: [],
                border: [],
                air: [],
            };

            // land colours
            for (let i = 1; i < 47; i += 3) {
                res.land.push(data.toString("hex", 3 + i, 6 + i));
            }

            // border colours
            for (let i = 49; i < 92; i += 3) {
                res.border.push(data.toString("hex", 3 + i, 6 + i));
            }

            // // air colours
            for (let i = 94; i < 101; i += 3) {
                res.air.push(data.toString("hex", 3 + i, 6 + i));
            }

            // console.log(res);
            kbdClient.send(JSON.stringify(res));
        }
        // Initialise
        else if (type == 0x11) {
            console.log("Initialise");
            res = Buffer.allocUnsafe(3);
            res[0] = 0x01;
            res[1] = 0x19;
            res[2] = 0x00;

            gameClient.send(res);
        }
        // Ping
        else if (type == 0x12) {
            console.log("Ping");
            res = Buffer.allocUnsafe(9);
            res[0] = 0x01;
            res[1] = 0x1a;
            res[2] = 0x06;

            // copy any data from client
            for (let i = 3; i < 7; i++) res[i] = data[i];

            res[7] = 0x51;
            res[8] = 0xed;

            gameClient.send(res);
        }
        // RequestServerInfo
        else if (type == 0xd0) {
            console.log("RequestServerInfo");
            res = Buffer.alloc(47);
            res[0] = 0x01;
            res[1] = 0xd8;
            res[2] = 0x44;

            // server name
            for (let i = 0; i < (serverName.length <= 16 ? serverName.length : 16); i++) {
                res[3 + i] = serverName[i];
            }

            // major and minor version of server
            res[20] = 0x31;
            res[22] = 0x31;

            // connected hardware name
            for (let i = 0; i < (controllerName.length <= 16 ? controllerName.length : 16); i++) {
                res[25 + i] = controllerName[i];
            }

            // major and minor version of connected hardware
            res[42] = 0x31;
            res[44] = 0x31;

            gameClient.send(res);
        } else console.log(data);
    });
});

app.ws("/kbd", function (ws, req) {
    kbdClient = ws;
    ws.on("error", console.error);
    ws.on("open", () => {
        console.log("Client connected.");
    });

    ws.on("message", function (rawString) {
        let obj = JSON.parse(rawString);
        console.log(obj);
        execFile("./kbd/keystroke.exe", [obj.key, obj.activate], (error, stdout, stderr) => {
            if (error) {
                console.log(error);
            }
            if (stdout) {
                console.log(stdout);
            }
        });
    });
});

app.get("/", (req, res) => {
    res.sendFile("index.html");
});

app.listen(PORT, (error) => {
    if (error) {
        console.log(error);
    } else {
        console.log(`Server running on port ${PORT}`);
    }
});
