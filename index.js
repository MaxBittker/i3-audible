const i3wm = require("i3wm");
var player = require("play-sound")((opts = { player: "aplay" }));
const path = require("path");
const fs = require("fs");

function hash(n) {
  return Math.floor((Math.sin(n) + 1.0) * 43758.5453123);
}

let sounds = [];
fs.readdir(path.join(__dirname, "sounds"), function(err, files) {
  if (err) throw err;
  sounds = files;
  console.log(files);
});

function click(x) {
  let i = hash(x) % sounds.length;
  player.play(
    path.join(__dirname, "sounds", sounds[i]),
    { timeout: 300 },
    function(err) {
      console.log(sounds[i]);
      if (err) throw err;
    }
  );
}

i3wm.Client.connect().then(client => {
  console.log("Connected to i3");
  client.subscribe("window", "workspace");

  client.on("workspace", msg => {
    let { width, height } = msg.current.rect;
    click(width * height * 3);
  });

  client.on("window", msg => {
    let { width, height } = msg.container.rect;
    if (["focus", "move", "fullscreen_mode"].indexOf(msg.change) > -1) {
      click(width * height);
    }
  });
});

/// Some cleanup stuff, maybe not needed:
function exitHandler(options, exitCode) {
  i3wm.Client.disconnect(client);

  if (options.cleanup) console.log("clean");
  if (exitCode || exitCode === 0) console.log(exitCode);
  if (options.exit) process.exit();
}

//do something when app is closing
process.on("exit", exitHandler.bind(null, { cleanup: true }));

//catches ctrl+c event
process.on("SIGINT", exitHandler.bind(null, { exit: true }));

// catches "kill pid" (for example: nodemon restart)
process.on("SIGUSR1", exitHandler.bind(null, { exit: true }));
process.on("SIGUSR2", exitHandler.bind(null, { exit: true }));

//catches uncaught exceptions
process.on("uncaughtException", exitHandler.bind(null, { exit: true }));
