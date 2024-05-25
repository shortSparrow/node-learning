const http = require("http");
const WebSocket = require("websocket");
const PORT = 8000;
let connections = [];

const httpServer = http.createServer();

const websocket = new WebSocket.server({ httpServer: httpServer });

httpServer.listen(PORT, () => {
  console.log("Listen server on port: ", PORT);
});

websocket.on("request", (request) => {
  console.log("REQUEST: ", request.origin);
  const connection = request.accept(null, request.origin);
  connection.on("message", (message) => {
    console.log("message: ", message);
    connections.forEach((c) => {
      c.send(`User${connection.socket.remotePort} says: ${message.utf8Data}`);
    });
  });
  connection.on("close", () => {
    console.log("close");
    connections = connections.filter((c) => c != connection);
  });
  connections.push(connection);

  connections.forEach((c) => {
    c.send(`User${connection.socket.remotePort} just connected`);
  });
});


// CODE FOR BROWSER
// const ws = new WebSocket("ws://localhost:8000")
// ws.onmessage = message => console.log(`${message.data}`)
// ws.send('HI')
// ws.close()