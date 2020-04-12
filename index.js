const i3wm = require("i3wm");

var player = require("play-sound")((opts = { player: "aplay" }));

const path = require("path");
const fs = require("fs");

let sounds = [];
fs.readdir(path.join(__dirname, "sounds"), function(err, files) {
  if (err) throw err;
  sounds = files;
  console.log(files);
});

function cleanUp() {
  audio.kill();
  i3wm.Client.disconnect(client);
}
let i = 5;
function click() {
  player.play(
    path.join(__dirname, "sounds", sounds[i]),
    { timeout: 300 },
    function(err) {
      i = (i + 0) % sounds.length;
      if (err) throw err;
    }
  );
}

i3wm.Client.connect().then(client => {
  console.log("Connected");
  client.subscribe("window", "workspace");

  client.on("workspace", msg => {
    console.log(msg.change);
    click();
  });

  client.on("window", msg => {
    console.log(msg.change);
    if (["focus", "move", "fullscreen_mode"].indexOf(msg.change) > -1) {
      click();
    }
  });
});
