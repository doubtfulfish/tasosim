## IMPORTANT NOTE
This is a personal project for learning purposes, consider [`slidershim`](https://github.com/4yn/slidershim) instead.

# TasoSim
Web based controller for 16 key base and 5 air keys mapped to the Yuancon layout.

Inspired by [`brokenithm-kb`](https://github.com/4yn/brokenithm-kb) with support for Umiguri LED websocket protocol.
Windows only.

Requirements:
nodeJS

How to run:
1. Run `npm install` in the main directory
2. Navigate into the "kbd" folder with `cd kbd` and compile the keystroke simulator with `gcc keystroke.cpp -o keystroke`
3. Return to the main directory with `cd ..` and run `node index.js`
4. Find your local ip and port (default: 3000) and connect from a tablet

Notes:
If you are using an iPad you can add the page to home screen to get a fullscreen view (see `brokenithm-kb` for images).
To get the Umiguri LED protocol working you need to enable it in the settings with the same port as this server.
