// For node client

const http = require("http");

const requestSubmit = http.request({
  host: "localhost",
  port: "8000",
  method: "GET",
  path: "/stream",
});

requestSubmit.on("response", (response) => {
  response.on("data", (chunk) => {
    console.log("data: ", chunk.toString());
  });
});

requestSubmit.end();

// For browser

// const serverEvent = new EventSource("http://localhost:8000/stream");
// serverEvent.addEventListener("myEvent", (message) => {
//   console.log("Message: ", message);
// });

// serverEvent.addEventListener("error", (event) => {
//   if (event.eventPhase == EventSource.CLOSED) {
//     serverEvent.close();
//   }
//   if (event.target.readyState == EventSource.CLOSED) {
//     console.log("Disconnected");
//   } else if (event.target.readyState == EventSource.CONNECTING) {
//     console.log("Connecting...");
//   }
// });
