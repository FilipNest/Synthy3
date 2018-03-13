const socket = new WebSocket('ws://localhost:8080');

let ID;

socket.addEventListener('connected', function (event) {
  
  // Get unique ID from server
  
});

socket.addEventListener('noteOn', function (event) {
  
  
});

socket.addEventListener('noteOff', function (event) {
  
  
});

let midiNotetoFreq = (note) => Math.pow(2, (note - 69) / 12) * 440;

let context = new window.AudioContext();

let playNote = (element, send) => {

  element.osc = context.createOscillator();

  element.osc.frequency.value = midiNotetoFreq(document.getElementById("range").value);

  element.osc.connect(context.destination);

  element.osc.start(0);

  if (send) {

    sendNote(document.getElementById("range").value, document.getElementById("channel").channel, "on");

  }

};

let sendNote = (note, channel, status) => {

  let message = {
    "channel": channel,
    "note": note,
    "status": "on"
  };

  socket.send(JSON.stringify(message));

};

document.getElementById("tap").onmousedown = (e) => playNote(e.target, true);

document.getElementById("tap").onmouseup = (e) => {

  e.target.osc.stop();
  
  sendNote(null, null, "off");

};

document.getElementById("channel").onmousedown = (e) => {

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

document.getElementById("channel").onmouseup = function (e) {

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

    document.getElementById("currentChannel").innerHTML = channel;

    delete e.target.channelArray;

  }, 5000);

};
