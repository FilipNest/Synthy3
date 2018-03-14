const express = require('express');
const http = require('http');
const url = require('url');
const WebSocket = require('ws');
const crypto = require("crypto");

const app = express();

app.use(express.static('static'));

const server = http.createServer(app);
const wss = new WebSocket.Server({
  server
});

let connections = [];

let sendNote = (note, id) => {

  connections.filter((connection) => connection.channel === note.channel).forEach((receiver) => {

    if (receiver.id !== id) {

      try {

        note.id = id;

        receiver.send(JSON.stringify(note));

      } catch (e) {


      }

    }

  });

};

wss.on('connection', function connection(ws) {

  ws.id = crypto.randomBytes(16).toString("hex");

  connections.push(ws);

  ws.on('message', function incoming(rawMessage) {

    let message = JSON.parse(rawMessage);

    let type = message.type;

    if (type === "channelTune") {

      ws.channel = message.channel;

    } else if (type === "note") {

      sendNote(message, ws.id);

    }

  });

  ws.send('something');

});

server.listen(process.env.PORT || 80);
