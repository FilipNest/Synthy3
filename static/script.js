const socket = new WebSocket('ws://' + document.location.hostname);

let connections = {};

socket.addEventListener('message', function (event) {

  try {

    let message = JSON.parse(event.data);

    if (!connections[message.id]) {

      connections[message.id] = context.createOscillator();

    }

    let osc = connections[message.id];

    if (message.status === "on") {

      osc.frequency.value = midiNotetoFreq(message.note);

      osc.connect(gain);

      osc.start(0);

    } else {

      osc.stop();
      delete connections[message.id];

    }

  } catch (e) {


  }

});


let midiNotetoFreq = (note) => Math.pow(2, (note - 69) / 12) * 440;

let context = new window.AudioContext();
let gain = context.createGain();
gain.gain.value = 0.1;
gain.connect(context.destination);

let playNote = (element, send) => {

  element.osc = context.createOscillator();

  element.osc.frequency.value = midiNotetoFreq(document.getElementById("range").value);

  element.osc.connect(gain);

  element.osc.start(0);

  if (send) {

    sendNote("on");

  }

};

let sendNote = (status) => {

  let message = {
    "type": "note",
    "channel": document.getElementById("channel").channel,
    "note": document.getElementById("range").value,
    "status": status
  };

  socket.send(JSON.stringify(message));

};

document.getElementById("tap").onpointerdown = (e) => playNote(e.target, true);

document.getElementById("tap").onpointerup = (e) => {

  e.target.osc.stop();

  sendNote("off");

};

document.getElementById("channel").onpointerdown = (e) => {

  e.target.style.backgroundColor = "red";

  playNote(e.target);

  if (e.target.channel) {

    e.target.channel = null;

  }

  window.clearTimeout(e.target.timerLong);
  window.clearTimeout(e.target.timerShort);

  e.target.lastStep = 0;

  e.target.timerShort = window.setTimeout(function () {

    e.target.lastStep = 1;

  }, 500);

};

document.getElementById("channel").onpointerup = function (e) {

  window.clearTimeout(e.target.timerLong);
  window.clearTimeout(e.target.timerShort);

  e.target.style.backgroundColor = "black";

  e.target.osc.stop();

  if (!e.target.channelArray || !e.target.channelArray.length) {

    e.target.channelArray = [];

  }

  let step = e.target.lastStep;
  e.target.channelArray.push(step);

  e.target.timerLong = window.setTimeout(function () {

    // Convert to binary

    let channel = parseInt(e.target.channelArray.reverse().join(""), 2);

    e.target.channel = channel;

    socket.send(JSON.stringify({
      "type": "channelTune",
      "channel": channel
    }));

    document.getElementById("currentChannel").innerHTML = channel;

    delete e.target.channelArray;

  }, 5000);

};
