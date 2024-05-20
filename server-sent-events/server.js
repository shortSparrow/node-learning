const express = require("express");
const PORT = 8000;

const app = express();

// Server sent event - one request and very long response (server send many data and don't close the connection)
/**
 * Steps:
 * 1. Run the server file
 * 2. Open bower with path / and receive hello message
 * 3. In Console use EventSource to listen stream
 *
 * By default, if the connection between the client and server closes, the connection is restarted.
 * 
 * Or run client js for node js
 */
let i = 0;
const sendStream = (res) => {
  if (res.closed) return;
  i++;
  res.write("event: " + `myEvent\n`);
  res.write("data: " + `hello from server ---- [${i}]\n`);
  res.write("id: " + `myId\n\n`);

  if (i === 500) {
    return res.end();
  }

  setTimeout(() => {
    sendStream(res);
  }, 1000);
};

app.get("/", (req, res) => {
  return res.send("Hello");
});

app.get("/stream", (req, res) => {
  req.on("close", (req) => {
    i = 0;
  });
  res.setHeader("Content-Type", "text/event-stream");
  return sendStream(res);
});

app.listen(PORT, () => {
  console.log(`Listen on: ${PORT}`);
});
